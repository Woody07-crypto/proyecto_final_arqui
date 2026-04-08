export type EventStatus = "ACTIVO" | "SOLD_OUT" | "FINALIZADO" | "CANCELADO";

export interface Event {
	id: number;
	title: string;
	description?: string | null;
	date: string;
	location: string;
	max_capacity: number;
	status: EventStatus;
	organizer_id: number;
	created_at: string;
}

export interface EventFormPayload {
	title: string;
	description: string;
	date: string;
	location: string;
	max_capacity: number;
}

export interface EventUpdatePayload {
	title?: string;
	description?: string;
	date?: string;
	location?: string;
	max_capacity?: number;
	status?: EventStatus;
}
