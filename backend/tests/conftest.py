import os
import secrets
import time
from datetime import datetime

import pytest

from app import create_app
from app.config import Config
from app.extensions import db


_test_runtime_secret = os.environ.get("TEST_JWT_SECRET_KEY") or secrets.token_hex(32)


class TestingConfig(Config):
	TESTING = True
	SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
	JWT_SECRET_KEY = _test_runtime_secret
	SECRET_KEY = _test_runtime_secret


@pytest.fixture()
def app():
	flask_app = create_app(TestingConfig)
	with flask_app.app_context():
		# Importa modelos para registrar tablas en SQLAlchemy.
		import app.models as _models  # noqa: F401

		db.create_all()

	yield flask_app

	with flask_app.app_context():
		db.session.remove()
		db.drop_all()


@pytest.fixture()
def client(app):
	return app.test_client()


def _iso_future_date():
	# Usamos una fecha futura para no depender de “finalizado” (no se ejecuta automáticamente en el backend).
	return datetime(2026, 12, 15, 10, 0, 0).isoformat()


def auth_headers(token: str) -> dict:
	return {"Authorization": f"Bearer {token}"}


def register_organizer(client, *, email: str | None = None, password: str = "organizador123", name: str = "Organizador Demo"):
	ts = int(time.time() * 1000)
	email = email or f"organizador_{ts}@mail.com"

	res = client.post(
		"/api/auth/register",
		json={"name": name, "email": email, "password": password},
	)
	assert res.status_code == 201, res.get_json()
	return res.get_json()["data"]


def login(client, *, email: str, password: str):
	res = client.post("/api/auth/login", json={"email": email, "password": password})
	assert res.status_code == 200, res.get_json()
	return res.get_json()["data"]["token"]


def setup_admin_and_login(client, *, email: str = "admin@local.com", password: str = "admin123", name: str = "Admin Demo"):
	# El backend expone un endpoint para crear el primer admin.
	res = client.post(
		"/api/admin/setup",
		json={"name": name, "email": email, "password": password},
	)
	assert res.status_code == 201, res.get_json()
	return login(client, email=email, password=password)


def create_event(client, *, token: str, title: str = "Evento de Arquitectura", description: str = "Prueba API", location: str = "Auditorio Principal", max_capacity: int = 150, date_iso: str | None = None):
	date_iso = date_iso or _iso_future_date()
	res = client.post(
		"/api/events",
		headers=auth_headers(token),
		json={
			"title": title,
			"description": description,
			"date": date_iso,
			"location": location,
			"max_capacity": max_capacity,
		},
	)
	assert res.status_code == 201, res.get_json()
	return res.get_json()["data"]


def update_event(client, *, token: str, event_id: int, payload: dict):
	res = client.put(f"/api/events/{event_id}", headers=auth_headers(token), json=payload)
	return res


def cancel_event(client, *, token: str, event_id: int):
	return client.patch(f"/api/events/{event_id}/cancel", headers=auth_headers(token))


def change_event_status_admin(client, *, token: str, event_id: int, status: str):
	return client.patch(
		f"/api/events/{event_id}/status",
		headers=auth_headers(token),
		json={"status": status},
	)


def register_attendee_to_event(client, *, token: str, event_id: int, name: str = "Asistente Demo", email: str = "", phone: str = "3000000000"):
	res = client.post(
		f"/api/attendees/event/{event_id}/register",
		headers=auth_headers(token),
		json={"name": name, "email": email, "phone": phone},
	)
	return res


def get_event_attendees(client, *, token: str, event_id: int):
	return client.get(f"/api/attendees/event/{event_id}", headers=auth_headers(token))


def cancel_registration(client, *, token: str, registration_id: int):
	return client.patch(f"/api/attendees/registration/{registration_id}/cancel", headers=auth_headers(token))

