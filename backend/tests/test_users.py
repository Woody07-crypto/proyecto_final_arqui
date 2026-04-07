from .conftest import (
	auth_headers,
	login,
	register_organizer,
	setup_admin_and_login,
)


def test_smoke_register_organizer_success(client):
	user = register_organizer(client)
	assert set(user.keys()) == {"id", "name", "email", "role", "created_at"}


def test_smoke_login_success_returns_jwt(client):
	organizer = register_organizer(client)
	token = login(client, email=organizer["email"], password="organizador123")
	assert isinstance(token, str) and token


def test_unit_register_duplicate_email_returns_400(client):
	organizer = register_organizer(client, email="dup@mail.com")
	# Reintento con email igual -> ValueError -> error_handler -> 400
	res = client.post(
		"/api/auth/register",
		json={"name": "Otro", "email": organizer["email"], "password": "organizador123"},
	)
	assert res.status_code == 400


def test_unit_register_invalid_email_returns_400(client):
	res = client.post(
		"/api/auth/register",
		json={"name": "User", "email": "no-es-email", "password": "organizador123"},
	)
	assert res.status_code == 400


def test_unit_register_password_too_short_returns_400(client):
	res = client.post(
		"/api/auth/register",
		json={"name": "User", "email": "pwshort@mail.com", "password": "123"},
	)
	assert res.status_code == 400


def test_unit_login_invalid_credentials_returns_401(client):
	res = client.post(
		"/api/auth/login",
		json={"email": "notfound@mail.com", "password": "wrong"},
	)
	assert res.status_code == 401
	assert res.get_json()["message"] == "Credenciales invalidas"


def test_unit_admin_stats_requires_jwt_returns_401(client):
	res = client.get("/api/admin/stats")
	assert res.status_code == 401


def test_unit_admin_stats_forbidden_for_organizer_returns_403(client):
	organizer = register_organizer(client)
	organizer_token = login(client, email=organizer["email"], password="organizador123")

	res = client.get("/api/admin/stats", headers=auth_headers(organizer_token))
	assert res.status_code == 403


def test_unit_admin_stats_returns_expected_fields_order(client):
	admin_token = setup_admin_and_login(client, email="admin_stats@mail.com")
	organizer = register_organizer(client, email="user_stats@mail.com")
	organizer_token = login(client, email=organizer["email"], password="organizador123")

	# Creamos al menos 1 evento para que “events” no quede vacío.
	res_event = client.post(
		"/api/events",
		headers=auth_headers(organizer_token),
		json={
			"title": "Evento Stats",
			"description": "Desc",
			"date": "2026-12-15T10:00:00",
			"location": "Auditorio",
			"max_capacity": 10,
		},
	)
	assert res_event.status_code == 201, res_event.get_json()

	res = client.get("/api/admin/stats", headers=auth_headers(admin_token))
	assert res.status_code == 200, res.get_json()
	payload = res.get_json()["data"]
	assert set(payload.keys()) == {"events", "users", "registrations"}


def test_unit_admin_users_success_json_order(client):
	admin_token = setup_admin_and_login(client, email="admin_users@mail.com")
	organizer = register_organizer(client, email="user1@mail.com")
	_ = register_organizer(client, email="user2@mail.com")

	res = client.get("/api/admin/users", headers=auth_headers(admin_token))
	assert res.status_code == 200, res.get_json()
	users = res.get_json()["data"]
	assert isinstance(users, list)
	assert set(users[0].keys()) == {"id", "name", "email", "role", "created_at"}


def test_unit_missing_endpoints_return_404(client):
	# Logout no existe en el backend actual.
	res_logout = client.post("/api/auth/logout", json={})
	assert res_logout.status_code == 404

	# Dashboard no existe (stats existe).
	res_dashboard = client.get("/api/admin/dashboard")
	assert res_dashboard.status_code == 404

	# PUT/DELETE /api/admin/users/:id no existen.
	res_put = client.put("/api/admin/users/1", json={"name": "X"})
	assert res_put.status_code == 404

	res_del = client.delete("/api/admin/users/1")
	assert res_del.status_code == 404

