import { apiRequest } from "@/src/services/api";
import type { Attendee, RegisterAttendeePayload, Registration } from "@/src/types/attendee.types";

export const attendeeService = {
	async getAllAttendees(token: string): Promise<Attendee[]> {
		const response = await apiRequest<Attendee[]>("/attendees", {
			method: "GET",
			token,
		});

		return response.data;
	},

	async getAttendeeById(attendeeId: number, token: string): Promise<Attendee> {
		const response = await apiRequest<Attendee>(`/attendees/${attendeeId}`, {
			method: "GET",
			token,
		});

		return response.data;
	},

	async getEventAttendees(eventId: number, token: string): Promise<Registration[]> {
		const response = await apiRequest<Registration[]>(`/attendees/event/${eventId}`, {
			method: "GET",
			token,
		});

		return response.data;
	},

	async registerToEvent(eventId: number, payload: RegisterAttendeePayload, token: string): Promise<Registration> {
		const response = await apiRequest<Registration>(`/attendees/event/${eventId}/register`, {
			method: "POST",
			body: payload,
			token,
		});

		return response.data;
	},

	async cancelRegistration(registrationId: number, token: string): Promise<Registration> {
		const response = await apiRequest<Registration>(`/attendees/registration/${registrationId}/cancel`, {
			method: "PATCH",
			token,
		});

		return response.data;
	},
};
