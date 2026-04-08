import { apiRequest } from "@/src/services/api";
import type { Event, EventFormPayload, EventUpdatePayload } from "@/src/types/event.types";

export const eventService = {
	async getEvents(token: string): Promise<Event[]> {
		const response = await apiRequest<Event[]>("/events", {
			method: "GET",
			token,
		});

		return response.data;
	},

	async getEventById(eventId: number, token: string): Promise<Event> {
		const response = await apiRequest<Event>(`/events/${eventId}`, {
			method: "GET",
			token,
		});

		return response.data;
	},

	async createEvent(payload: EventFormPayload, token: string): Promise<Event> {
		const response = await apiRequest<Event>("/events", {
			method: "POST",
			body: payload,
			token,
		});

		return response.data;
	},

	async updateEvent(eventId: number, payload: EventUpdatePayload, token: string): Promise<Event> {
		const response = await apiRequest<Event>(`/events/${eventId}`, {
			method: "PUT",
			body: payload,
			token,
		});

		return response.data;
	},

	async cancelEvent(eventId: number, token: string): Promise<Event> {
		const response = await apiRequest<Event>(`/events/${eventId}/cancel`, {
			method: "PATCH",
			token,
		});

		return response.data;
	},

	async deleteEvent(eventId: number, token: string): Promise<void> {
		await apiRequest<null>(`/events/${eventId}`, {
			method: "DELETE",
			token,
		});
	},
};
