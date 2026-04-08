from app.extensions import db
from datetime import datetime, timezone

class Attendee(db.Model):
    __tablename__ = "attendees"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    registrations = db.relationship("Registration", backref="attendee", lazy=True)