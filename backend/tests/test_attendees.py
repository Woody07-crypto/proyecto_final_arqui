from .conftest import (
	auth_headers,
	create_event,
	get_event_attendees,
	login,
	register_attendee_to_event,
	register_organizer,
	setup_admin_and_login,
	cancel_registration,
)


def test_smoke_get_event_attendees_requires_jwt_returns_401(client):
	org = register_organizer(client, email="att_smoke_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")
	event = create_event(client, token=org_token)

	res = client.get(f"/api/attendees/event/{event['id']}")
	assert res.status_code == 401


def test_unit_register_attendee_success_returns_201_and_field_order(client):
	org = register_organizer(client, email="att_unit_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")
	event = create_event(client, token=org_token)

	res = register_attendee_to_event(
		client,
		token=org_token,
		event_id=event["id"],
		email="att_unit_email@mail.com",
	)
	assert res.status_code == 201, res.get_json()
	data = res.get_json()["data"]
	assert set(data.keys()) == {"id", "event_id", "attendee_id", "registration_date", "status"}
	assert data["status"] == "ACTIVO"


def test_unit_register_same_attendee_twice_returns_400(client):
	org = register_organizer(client, email="att_dup_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")
	event = create_event(client, token=org_token)

	email = "att_dup_email@mail.com"
	res1 = register_attendee_to_event(client, token=org_token, event_id=event["id"], email=email)
	assert res1.status_code == 201

	res2 = register_attendee_to_event(client, token=org_token, event_id=event["id"], email=email)
	# Backend lanza ValueError -> 400
	assert res2.status_code == 400


def test_unit_cancel_registration_success_then_not_listed_anymore(client):
	org = register_organizer(client, email="att_cancel_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")
	event = create_event(client, token=org_token)

	res_reg = register_attendee_to_event(client, token=org_token, event_id=event["id"], email="att_cancel_email@mail.com")
	reg_id = res_reg.get_json()["data"]["id"]

	res_cancel = cancel_registration(client, token=org_token, registration_id=reg_id)
	assert res_cancel.status_code == 200
	assert res_cancel.get_json()["data"]["status"] == "CANCELADO"

	res_list = get_event_attendees(client, token=org_token, event_id=event["id"])
	assert res_list.status_code == 200
	assert res_list.get_json()["data"] == []


def test_unit_cancel_nonexistent_registration_returns_404(client):
	org = register_organizer(client, email="att_cancel_missing_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")
	event = create_event(client, token=org_token)

	# No existe registration_id=999 en BD
	res_cancel = cancel_registration(client, token=org_token, registration_id=999)
	assert res_cancel.status_code == 404
	assert res_cancel.get_json()["message"] == "Registro no encontrado"


def test_unit_cancel_registration_twice_second_returns_400(client):
	org = register_organizer(client, email="att_cancel_twice_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")
	event = create_event(client, token=org_token)
	res_reg = register_attendee_to_event(client, token=org_token, event_id=event["id"], email="att_cancel_twice@mail.com")
	reg_id = res_reg.get_json()["data"]["id"]
	res1 = cancel_registration(client, token=org_token, registration_id=reg_id)
	assert res1.status_code == 200
	res2 = cancel_registration(client, token=org_token, registration_id=reg_id)
	assert res2.status_code == 400
	assert res2.get_json()["message"] == "La inscripcion ya estaba cancelada"


def test_feature_get_all_attendees_for_organizer_is_forbidden_returns_403(client):
	org = register_organizer(client, email="att_list_forbidden_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")

	res = client.get("/api/attendees", headers=auth_headers(org_token))
	assert res.status_code == 403


def test_integration_IT06_create_event_register_attendee_list_attendees(client):
	org = register_organizer(client, email="it06_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")
	event = create_event(client, token=org_token)

	res_reg = register_attendee_to_event(client, token=org_token, event_id=event["id"], email="it06_att@mail.com")
	assert res_reg.status_code == 201
	attendee_id = res_reg.get_json()["data"]["attendee_id"]

	res_list = get_event_attendees(client, token=org_token, event_id=event["id"])
	assert res_list.status_code == 200
	data = res_list.get_json()["data"]
	assert len(data) == 1
	assert data[0]["attendee_id"] == attendee_id


def test_integration_IT07_register_then_cancel_then_list_is_empty(client):
	org = register_organizer(client, email="it07_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")
	event = create_event(client, token=org_token)

	res_reg = register_attendee_to_event(client, token=org_token, event_id=event["id"], email="it07_att@mail.com")
	reg_id = res_reg.get_json()["data"]["id"]

	res_cancel = cancel_registration(client, token=org_token, registration_id=reg_id)
	assert res_cancel.status_code == 200

	res_list = get_event_attendees(client, token=org_token, event_id=event["id"])
	assert res_list.status_code == 200
	assert res_list.get_json()["data"] == []


def test_integration_IT08_double_registration_second_fails(client):
	org = register_organizer(client, email="it08_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")
	event = create_event(client, token=org_token, max_capacity=100)

	email = "it08_att@mail.com"
	res1 = register_attendee_to_event(client, token=org_token, event_id=event["id"], email=email)
	assert res1.status_code == 201
	res2 = register_attendee_to_event(client, token=org_token, event_id=event["id"], email=email)
	assert res2.status_code == 400


def test_integration_IT09_register_multiple_attendees_then_admin_stats_registrations_count(client):
	admin_token = setup_admin_and_login(client, email="it09_admin@mail.com")
	org = register_organizer(client, email="it09_org@mail.com")
	org_token = login(client, email=org["email"], password="organizador123")
	event = create_event(client, token=org_token, max_capacity=1000)

	N = 5
	for i in range(N):
		email = f"it09_att_{i}@mail.com"
		res_reg = register_attendee_to_event(client, token=org_token, event_id=event["id"], email=email)
		assert res_reg.status_code == 201

	res_stats = client.get("/api/admin/stats", headers=auth_headers(admin_token))
	assert res_stats.status_code == 200
	stats = res_stats.get_json()["data"]
	assert stats["registrations"] == N

