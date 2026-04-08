import { apiRequest } from "@/src/services/api";
import type { LoginRequest, LoginResponseData, RegisterRequest, User } from "@/src/types/user.types";

export const authService = {
	async register(payload: RegisterRequest): Promise<User> {
		const response = await apiRequest<User>("/auth/register", {
			method: "POST",
			body: payload,
		});

		return response.data;
	},

	async login(payload: LoginRequest): Promise<LoginResponseData> {
		const response = await apiRequest<LoginResponseData>("/auth/login", {
			method: "POST",
			body: payload,
		});

		return response.data;
	},

	async me(token: string): Promise<User> {
		const response = await apiRequest<User>("/auth/me", {
			method: "GET",
			token,
		});

		return response.data;
	},
};

