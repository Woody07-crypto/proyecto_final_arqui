from app.repositories.attendee_repository import AttendeeRepository
from app.repositories.registration_repository import RegistrationRepository
from app.repositories.event_repository import EventRepository
from app.models.attendee import Attendee
from app.models.registration import Registration, RegistrationStatusEnum
from app.models.event import EventStatusEnum
from app.models.user import RoleEnum
from app.exceptions import ResourceNotFound

attendee_repo = AttendeeRepository()
registration_repo = RegistrationRepository()
event_repo = EventRepository()

class AttendeeService:
    def get_all_attendees(self, user):
        if user.role != RoleEnum.ADMIN:
            raise PermissionError("Solo administrador puede ver asistentes")
        return attendee_repo.get_all()

    def get_attendee_by_id(self, attendee_id, user):
        if user.role != RoleEnum.ADMIN:
            raise PermissionError("Solo administrador puede ver asistentes")
        attendee = attendee_repo.get_by_id(attendee_id)
        if not attendee:
            raise ResourceNotFound("Asistente no encontrado")
        return attendee

    def get_attendee_registrations(self, attendee_id, user):
        if user.role != RoleEnum.ADMIN:
            raise PermissionError("Solo administrador puede ver inscripciones por asistente")
        attendee = attendee_repo.get_by_id(attendee_id)
        if not attendee:
            raise ResourceNotFound("Asistente no encontrado")
        return registration_repo.get_by_attendee(attendee_id)

    def register_to_event(self, event_id, data, user):
        event = event_repo.get_by_id(event_id)
        if not event:
            raise ResourceNotFound("Evento no encontrado")
        if user.role != RoleEnum.ADMIN and event.organizer_id != user.id:
            raise PermissionError("No tienes permiso para registrar asistentes en este evento")
        if event.status != EventStatusEnum.ACTIVO:
            raise ValueError("Solo se pueden registrar asistentes en eventos ACTIVOS")
        attendee = attendee_repo.get_by_email(data["email"])
        if not attendee:
            attendee = Attendee(name=data["name"], email=data["email"], phone=data.get("phone", ""))
            attendee_repo.save(attendee)
        existing = registration_repo.find_existing(event_id, attendee.id)
        if existing:
            raise ValueError("El asistente ya esta inscrito en este evento")
        registration = Registration(event_id=event_id, attendee_id=attendee.id)
        registration_repo.save(registration)
        event.check_sold_out()
        event_repo.commit()
        return registration

    def get_event_attendees(self, event_id, user):
        event = event_repo.get_by_id(event_id)
        if not event:
            raise ResourceNotFound("Evento no encontrado")
        if user.role != RoleEnum.ADMIN and event.organizer_id != user.id:
            raise PermissionError("No tienes permiso para ver los asistentes de este evento")
        return registration_repo.get_active_by_event(event_id)

    def cancel_registration(self, registration_id, user):
        registration = registration_repo.get_by_id(registration_id)
        if not registration:
            raise ResourceNotFound("Registro no encontrado")
        if registration.status == RegistrationStatusEnum.CANCELADO:
            raise ValueError("La inscripcion ya estaba cancelada")
        event = event_repo.get_by_id(registration.event_id)
        if user.role != RoleEnum.ADMIN and event.organizer_id != user.id:
            raise PermissionError("No tienes permiso para cancelar esta inscripcion")
        registration.cancel()
        registration_repo.commit()
        return registration