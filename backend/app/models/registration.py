from app.extensions import db
from datetime import datetime, timezone
import enum

class RegistrationStatusEnum(str, enum.Enum):
    ACTIVO = "ACTIVO"
    CANCELADO = "CANCELADO"

class Registration(db.Model):
    __tablename__ = "registrations"
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    attendee_id = db.Column(db.Integer, db.ForeignKey("attendees.id"), nullable=False)
    registration_date = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status = db.Column(db.Enum(RegistrationStatusEnum), nullable=False, default=RegistrationStatusEnum.ACTIVO)

    def cancel(self):
        self.status = RegistrationStatusEnum.CANCELADO

    def is_active(self):
        return self.status == RegistrationStatusEnum.ACTIVO