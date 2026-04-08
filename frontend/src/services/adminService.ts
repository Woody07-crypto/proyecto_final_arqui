import { apiRequest } from "@/src/services/api";
import type { Registration } from "@/src/types/attendee.types";
import type { Event, EventStatus } from "@/src/types/event.types";
import type { User, UserRole } from "@/src/types/user.types";

export interface AdminStats {
	events: number;
	users: number;
	registrations: number;
}

export const adminService = {
	async getStats(token: string): Promise<AdminStats> {
		const response = await apiRequest<AdminStats>("/admin/stats", {
			method: "GET",
			token,
		});
		return response.data;
	},

	async getEvents(token: string, status?: EventStatus): Promise<Event[]> {
		const path = status ? `/admin/events/status/${status}` : "/admin/events";
		const response = await apiRequest<Event[]>(path, {
			method: "GET",
			token,
		});
		return response.data;
	},

	async getUsers(token: string, role?: UserRole): Promise<User[]> {
		const path = role ? `/admin/users/role/${role}` : "/admin/users";
		const response = await apiRequest<User[]>(path, {
			method: "GET",
			token,
		});
		return response.data;
	},

	async getRegistrations(token: string): Promise<Registration[]> {
		const response = await apiRequest<Registration[]>("/admin/registrations", {
			method: "GET",
			token,
		});
		return response.data;
	},

	async getRegistrationsByEvent(eventId: number, token: string): Promise<Registration[]> {
		const response = await apiRequest<Registration[]>(`/admin/registrations/event/${eventId}`, {
			method: "GET",
			token,
		});
		return response.data;
	},

	async getRegistrationsByAttendee(attendeeId: number, token: string): Promise<Registration[]> {
		const response = await apiRequest<Registration[]>(`/admin/registrations/attendee/${attendeeId}`, {
			method: "GET",
			token,
		});
		return response.data;
	},

	async changeEventStatus(eventId: number, status: EventStatus, token: string): Promise<Event> {
		const response = await apiRequest<Event>(`/events/${eventId}/status`, {
			method: "PATCH",
			body: { status },
			token,
		});
		return response.data;
	},
};
