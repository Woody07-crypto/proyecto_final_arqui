"""
Seed de datos para desarrollo: usuarios organizadores y eventos empresariales variados.
Ejecutar: python seed_events.py
"""
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db, bcrypt
from app.models.user import User, RoleEnum
from app.models.event import Event, EventStatusEnum
from app.models.attendee import Attendee
from app.models.registration import Registration, RegistrationStatusEnum

app = create_app()

# Usuarios organizadores
USERS = [
    {"name": "Christian Odir Renderos Lainez", "email": "christian.renderos@empresa.com"},
    {"name": "Karla Daniela Contreras Rodas", "email": "karla.contreras@empresa.com"},
    {"name": "Gabriel Enrique Martínez Carballo", "email": "gabriel.martinez@empresa.com"},
    {"name": "Alejandro Javier Cruz Linares", "email": "alejandro.cruz@empresa.com"},
    {"name": "Lorena Alejandra Arriola González", "email": "lorena.arriola@empresa.com"},
]

# Eventos empresariales variados con diferentes estados
EVENTS = [
    # ACTIVO - Eventos futuros
    {
        "title": "Conferencia Nacional de Innovación 2026",
        "description": "Encuentro anual con líderes de industria, charlas sobre transformación digital y networking. Incluye desayuno y certificado.",
        "date": datetime.utcnow() + timedelta(days=45),
        "location": "Centro de Convenciones CIFCO, San Salvador",
        "max_capacity": 300,
        "status": EventStatusEnum.ACTIVO,
        "organizer_idx": 0,
    },
    {
        "title": "Taller de Liderazgo Ejecutivo",
        "description": "Desarrollo de habilidades blandas para directivos. Metodología práctica con casos reales.",
        "date": datetime.utcnow() + timedelta(days=21),
        "location": "Hotel Real Intercontinental, San Salvador",
        "max_capacity": 50,
        "status": EventStatusEnum.ACTIVO,
        "organizer_idx": 1,
    },
    {
        "title": "Feria de Proveedores B2B",
        "description": "Espacio de negocios para conectar empresas con proveedores certificados. Stands y ruedas de negocios.",
        "date": datetime.utcnow() + timedelta(days=60),
        "location": "Centro Internacional de Ferias y Convenciones (CIFCO)",
        "max_capacity": 150,
        "status": EventStatusEnum.ACTIVO,
        "organizer_idx": 2,
    },
    {
        "title": "Webinar: Gestión de Proyectos Ágiles",
        "description": "Sesión online sobre Scrum, Kanban y mejores prácticas. Incluye material descargable.",
        "date": datetime.utcnow() + timedelta(days=7),
        "location": "Plataforma virtual (Zoom)",
        "max_capacity": 200,
        "status": EventStatusEnum.ACTIVO,
        "organizer_idx": 3,
    },
    {
        "title": "Bootcamp de Ventas B2B",
        "description": "Formación intensiva de 2 días para equipos comerciales. Técnicas de cierre y negociación.",
        "date": datetime.utcnow() + timedelta(days=30),
        "location": "Campus Empresarial, Santa Ana",
        "max_capacity": 40,
        "status": EventStatusEnum.ACTIVO,
        "organizer_idx": 4,
    },
    # SOLD_OUT - Evento lleno
    {
        "title": "Cena de Gala Anual - Premiación Empresarial",
        "description": "Evento exclusivo de reconocimiento a colaboradores y partners. Cena de tres tiempos y ceremonia de premiación.",
        "date": datetime.utcnow() + timedelta(days=14),
        "location": "Salón Las Américas, Hotel Sheraton",
        "max_capacity": 80,
        "status": EventStatusEnum.SOLD_OUT,
        "organizer_idx": 0,
        "attendees_count": 80,
    },
    # FINALIZADO - Eventos pasados
    {
        "title": "Lanzamiento Producto Q1 2026",
        "description": "Presentación oficial del nuevo portafolio de soluciones. Demos en vivo y sesión de preguntas.",
        "date": datetime.utcnow() - timedelta(days=25),
        "location": "Auditorio Principal, Zona Rosa",
        "max_capacity": 120,
        "status": EventStatusEnum.FINALIZADO,
        "organizer_idx": 1,
    },
    {
        "title": "Workshop de Marketing Digital",
        "description": "Estrategias de redes sociales, SEO y publicidad online para equipos de marketing.",
        "date": datetime.utcnow() - timedelta(days=10),
        "location": "Coworking Impact Hub, San Salvador",
        "max_capacity": 35,
        "status": EventStatusEnum.FINALIZADO,
        "organizer_idx": 2,
    },
    {
        "title": "Reunión Trimestral de Ventas",
        "description": "Revisión de metas, presentación de resultados y planificación del próximo trimestre.",
        "date": datetime.utcnow() - timedelta(days=45),
        "location": "Sala de Juntas, Torre Roble",
        "max_capacity": 25,
        "status": EventStatusEnum.FINALIZADO,
        "organizer_idx": 3,
    },
    # CANCELADO
    {
        "title": "Cumbre de Sostenibilidad Empresarial",
        "description": "Evento pospuesto por motivos de fuerza mayor. Próxima fecha por confirmar.",
        "date": datetime.utcnow() + timedelta(days=90),
        "location": "Centro Cultural de España",
        "max_capacity": 100,
        "status": EventStatusEnum.CANCELADO,
        "organizer_idx": 4,
    },
    {
        "title": "Networking Fintech & Banking",
        "description": "Cancelado. Se reprogramará en fecha próxima.",
        "date": datetime.utcnow() - timedelta(days=5),
        "location": "Cámara de Comercio",
        "max_capacity": 60,
        "status": EventStatusEnum.CANCELADO,
        "organizer_idx": 0,
    },
]


def generate_attendee_email(event_id: int, index: int) -> str:
    """Genera un email único para cada asistente."""
    return f"asistente.evento{event_id}.{index}@correo.com"


def seed():
    with app.app_context():
        # Password común para todos los usuarios de desarrollo
        default_password = "Organizador123"
        hashed = bcrypt.generate_password_hash(default_password).decode("utf-8")

        # Crear usuarios
        created_users = []
        for u in USERS:
            existing = User.query.filter_by(email=u["email"]).first()
            if existing:
                print(f"Usuario ya existe: {u['email']}")
                created_users.append(existing)
            else:
                user = User(
                    name=u["name"],
                    email=u["email"],
                    password=hashed,
                    role=RoleEnum.ORGANIZADOR,
                )
                db.session.add(user)
                db.session.flush()
                created_users.append(user)
                print(f"Usuario creado: {u['name']} ({u['email']})")

        db.session.commit()

        # Crear eventos
        for ev in EVENTS:
            organizer = created_users[ev["organizer_idx"]]
            event = Event(
                title=ev["title"],
                description=ev["description"],
                date=ev["date"],
                location=ev["location"],
                max_capacity=ev["max_capacity"],
                status=ev["status"],
                organizer_id=organizer.id,
            )
            db.session.add(event)
            db.session.flush()

            # Para SOLD_OUT, crear asistentes e inscripciones
            count = ev.get("attendees_count", 0)
            for i in range(count):
                attendee = Attendee(
                    name=f"Asistente {i + 1}",
                    email=generate_attendee_email(event.id, i),
                    phone=f"+503 7{i % 10}{i % 10}-{i % 10}{i % 10}{i % 10}{i % 10}" if i < 10 else None,
                )
                db.session.add(attendee)
                db.session.flush()
                reg = Registration(
                    event_id=event.id,
                    attendee_id=attendee.id,
                    status=RegistrationStatusEnum.ACTIVO,
                )
                db.session.add(reg)

            print(f"Evento creado: {ev['title']} [{ev['status'].value}]")

        db.session.commit()
        print("\n--- Seed completado ---")
        print(f"Usuarios: {len(USERS)} organizadores")
        print(f"Eventos: {len(EVENTS)} (variedad de estados)")
        print(f"\nCredenciales de prueba (todos usan password: {default_password}):")
        for u in USERS:
            print(f"  - {u['email']}")


if __name__ == "__main__":
    seed()
