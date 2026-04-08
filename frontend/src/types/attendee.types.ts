export type RegistrationStatus = "ACTIVO" | "CANCELADO";

export interface Attendee {
	id: number;
	name: string;
	email: string;
	phone?: string | null;
	created_at: string;
}

export interface Registration {
	id: number;
	event_id: number;
	attendee_id: number;
	registration_date: string;
	status: RegistrationStatus;
}

export interface RegisterAttendeePayload {
	name: string;
	email: string;
	phone?: string;
}

export interface RegistrationViewModel extends Registration {
	attendee_name?: string;
	attendee_email?: string;
	attendee_phone?: string;
}
