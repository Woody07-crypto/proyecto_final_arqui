from app.extensions import db
from datetime import datetime, timezone
import enum

class EventStatusEnum(str, enum.Enum):
    ACTIVO = "ACTIVO"
    SOLD_OUT = "SOLD_OUT"
    FINALIZADO = "FINALIZADO"
    CANCELADO = "CANCELADO"

class Event(db.Model):
    __tablename__ = "events"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.DateTime(timezone=True), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    max_capacity = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Enum(EventStatusEnum), nullable=False, default=EventStatusEnum.ACTIVO)
    organizer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    registrations = db.relationship("Registration", backref="event", lazy=True)

    def is_active(self):
        return self.status == EventStatusEnum.ACTIVO

    def check_sold_out(self):
        active = sum(1 for r in self.registrations if r.status == "ACTIVO")
        if active >= self.max_capacity:
            self.status = EventStatusEnum.SOLD_OUT

    def check_finished(self):
        if self.date < datetime.now(timezone.utc) and self.status == EventStatusEnum.ACTIVO:
            self.status = EventStatusEnum.FINALIZADO