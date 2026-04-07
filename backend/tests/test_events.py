from .conftest import (
	auth_headers,
	cancel_event,
	change_event_status_admin,
	create_event,
	login,
	register_organizer,
	setup_admin_and_login,
	update_event,
)


def test_smoke_get_events_requires_jwt_unauthorized_returns_401(client):
	res = client.get("/api/events")
	assert res.status_code == 401


def test_smoke_get_events_success_returns_200(client):
	organizer = register_organizer(client)
	token = login(client, email=organizer["email"], password="organizador123")

	res = client.get("/api/events", headers=auth_headers(token))
	assert res.status_code == 200, res.get_json()


def test_unit_get_events_json_field_order(client):
	organizer = register_organizer(client)
	token = login(client, email=organizer["email"], password="organizador123")
	event = create_event(client, token=token, title="Orden 1", max_capacity=10)

	res = client.get("/api/events", headers=auth_headers(token))
	assert res.status_code == 200, res.get_json()
	events = res.get_json()["data"]
	assert isinstance(events, list)

	first = events[0]
	assert set(first.keys()) == {"id", "title", "description", "date", "location", "max_capacity", "status", "organizer_id", "created_at"}
	assert first["id"] == event["id"]


def test_unit_get_event_by_id_nonexistent_returns_404(client):
	organizer = register_organizer(client)
	token = login(client, email=organizer["email"], password="organizador123")

	res = client.get("/api/events/999999", headers=auth_headers(token))
	assert res.status_code == 404
	assert res.get_json()["message"] == "Evento no encontrado"


def test_feature_create_event_success_returns_201(client):
	organizer = register_organizer(client)
	token = login(client, email=organizer["email"], password="organizador123")

	event = create_event(
		client,
		token=token,
		title="Crear Evento",
		description="Prueba API",
		location="Auditorio Principal",
		max_capacity=50,
	)
	assert event["id"] is not None
	assert event["status"] == "ACTIVO"


def test_unit_create_event_missing_required_field_returns_400(client):
	organizer = register_organizer(client)
	token = login(client, email=organizer["email"], password="organizador123")

	res = client.post(
		"/api/events",
		headers=auth_headers(token),
		json={
			"title": "Incompleto",
			"description": "Desc",
			# Falta date
			"location": "Auditorio",
			"max_capacity": 10,
		},
	)
	assert res.status_code == 400


def test_feature_update_event_success_returns_200(client):
	organizer = register_organizer(client)
	token = login(client, email=organizer["email"], password="organizador123")
	event = create_event(client, token=token)

	res = update_event(
		client,
		token=token,
		event_id=event["id"],
		payload={"title": "Evento Actualizado", "max_capacity": 200},
	)
	assert res.status_code == 200, res.get_json()
	assert res.get_json()["data"]["title"] == "Evento Actualizado"


def test_unit_update_event_empty_body_succeeds_returns_200(client):
	organizer = register_organizer(client)
	token = login(client, email=organizer["email"], password="organizador123")
	event = create_event(client, token=token)

	res = update_event(client, token=token, event_id=event["id"], payload={})
	assert res.status_code == 200, res.get_json()


def test_feature_cancel_event_success_and_cancel_again_returns_400(client):
	organizer = register_organizer(client)
	token = login(client, email=organizer["email"], password="organizador123")
	event = create_event(client, token=token)

	res1 = cancel_event(client, token=token, event_id=event["id"])
	assert res1.status_code == 200, res1.get_json()
	assert res1.get_json()["data"]["status"] == "CANCELADO"

	# Segundo cancel -> ValueError -> 400 (en tu servicio, “ya está cancelado” lanza ValueError)
	res2 = cancel_event(client, token=token, event_id=event["id"])
	assert res2.status_code == 400


def test_unit_admin_change_event_status_requires_admin_role_returns_403_for_organizer(client):
	organizer = register_organizer(client)
	organizer_token = login(client, email=organizer["email"], password="organizador123")
	event = create_event(client, token=organizer_token)

	res = change_event_status_admin(client, token=organizer_token, event_id=event["id"], status="FINALIZADO")
	assert res.status_code == 403


def test_unit_admin_change_event_status_invalid_status_returns_400(client):
	admin_token = setup_admin_and_login(client, email="admin_invalid_status@mail.com")
	organizer = register_organizer(client, email="org_invalid_status@mail.com")
	organizer_token = login(client, email=organizer["email"], password="organizador123")
	event = create_event(client, token=organizer_token)

	res = change_event_status_admin(client, token=admin_token, event_id=event["id"], status="NO_EXISTE")
	assert res.status_code == 400


def test_unit_admin_change_event_status_missing_status_field_returns_400(client):
	admin_token = setup_admin_and_login(client, email="admin_missing_status@mail.com")
	organizer = register_organizer(client, email="org_missing_status@mail.com")
	organizer_token = login(client, email=organizer["email"], password="organizador123")
	event = create_event(client, token=organizer_token)

	res = client.patch(
		f"/api/events/{event['id']}/status",
		headers=auth_headers(admin_token),
		json={},
	)
	assert res.status_code == 400


def test_unit_admin_change_event_status_success_persists_for_organizer(client):
	admin_token = setup_admin_and_login(client, email="admin_success_status@mail.com")
	organizer = register_organizer(client, email="org_success_status@mail.com")
	organizer_token = login(client, email=organizer["email"], password="organizador123")
	event = create_event(client, token=organizer_token)

	res_change = change_event_status_admin(client, token=admin_token, event_id=event["id"], status="FINALIZADO")
	assert res_change.status_code == 200, res_change.get_json()
	assert res_change.get_json()["data"]["status"] == "FINALIZADO"

	res_get = client.get(f"/api/events/{event['id']}", headers=auth_headers(organizer_token))
	assert res_get.status_code == 200, res_get.get_json()
	assert res_get.get_json()["data"]["status"] == "FINALIZADO"


def test_integration_IT01_register_login_create_event_flow(client):
	org = register_organizer(client, email="it01_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")

	event = create_event(client, token=org_token, title="IT01 Evento")
	assert event["id"] is not None


def test_integration_IT02_login_create_list_event_flow(client):
	org = register_organizer(client, email="it02_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")

	created = create_event(client, token=org_token, title="IT02 Evento")
	res = client.get("/api/events", headers=auth_headers(org_token))
	assert res.status_code == 200
	events = res.get_json()["data"]
	assert any(e["id"] == created["id"] and e["title"] == "IT02 Evento" for e in events)


def test_integration_IT03_create_update_persists(client):
	org = register_organizer(client, email="it03_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")

	created = create_event(client, token=org_token, title="IT03 Original")
	res_upd = update_event(client, token=org_token, event_id=created["id"], payload={"title": "IT03 Actualizado"})
	assert res_upd.status_code == 200

	res_get = client.get(f"/api/events/{created['id']}", headers=auth_headers(org_token))
	assert res_get.status_code == 200
	assert res_get.get_json()["data"]["title"] == "IT03 Actualizado"


def test_integration_IT04_cancel_event_then_register_attendee_fails(client):
	org = register_organizer(client, email="it04_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")

	event = create_event(client, token=org_token, title="IT04 Evento", max_capacity=50)
	res_cancel = cancel_event(client, token=org_token, event_id=event["id"])
	assert res_cancel.status_code == 200

	res_register = client.post(
		f"/api/attendees/event/{event['id']}/register",
		headers=auth_headers(org_token),
		json={"name": "Asistente IT04", "email": "it04_att@mail.com", "phone": "3000000000"},
	)
	
	assert res_register.status_code == 400


def test_integration_IT05_admin_change_status_then_organizer_verifies(client):
	admin_token = setup_admin_and_login(client, email="it05_admin@mail.com")
	org = register_organizer(client, email="it05_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")

	event = create_event(client, token=org_token, title="IT05 Evento")

	res_change = change_event_status_admin(client, token=admin_token, event_id=event["id"], status="SOLD_OUT")
	assert res_change.status_code == 200

	res_get = client.get(f"/api/events/{event['id']}", headers=auth_headers(org_token))
	assert res_get.status_code == 200
	assert res_get.get_json()["data"]["status"] == "SOLD_OUT"


def test_integration_IT13_E2E_cancel_event_then_verify_admin_stats_totals(client):
	# Pre-creamos admin para que “users” sea determinista.
	admin_token = setup_admin_and_login(client, email="it13_admin@mail.com")
	org = register_organizer(client, email="it13_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")

	event = create_event(client, token=org_token, title="IT13 Evento", max_capacity=20)
	res_reg = client.post(
		f"/api/attendees/event/{event['id']}/register",
		headers=auth_headers(org_token),
		json={"name": "Asistente IT13", "email": "it13_att@mail.com", "phone": "3000000000"},
	)
	assert res_reg.status_code == 201

	res_cancel = cancel_event(client, token=org_token, event_id=event["id"])
	assert res_cancel.status_code == 200

	res_stats = client.get("/api/admin/stats", headers=auth_headers(admin_token))
	assert res_stats.status_code == 200, res_stats.get_json()
	stats = res_stats.get_json()["data"]
	assert stats["events"] == 1
	assert stats["registrations"] == 1
	# Users = admin + organizer (attendees no se cuentan aquí)
	assert stats["users"] == 2


def test_integration_IT14_admin_endpoints_without_jwt_return_401(client):
	# En el backend, los endpoints protegidos por token_required devuelven 401.
	res_users = client.get("/api/admin/users")
	assert res_users.status_code == 401

	res_stats = client.get("/api/admin/stats")
	assert res_stats.status_code == 401


def test_integration_IT15_organizer_cannot_perform_admin_actions(client):
	org = register_organizer(client, email="it15_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")

	# Crear evento con organizer sí se permite (no es admin_required)
	event = create_event(client, token=org_token)
	assert event["status"] == "ACTIVO"

	# Pero endpoints admin/protegidos por admin_required -> 403
	res_stats = client.get("/api/admin/stats", headers=auth_headers(org_token))
	assert res_stats.status_code == 403

	res_change_status = client.patch(
		f"/api/events/{event['id']}/status",
		headers=auth_headers(org_token),
		json={"status": "FINALIZADO"},
	)
	assert res_change_status.status_code == 403

