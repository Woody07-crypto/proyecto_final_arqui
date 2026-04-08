export type UserRole = "ADMIN" | "ORGANIZADOR";

export interface User {
	id: number;
	name: string;
	email: string;
	role: UserRole;
	created_at: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
}

export interface LoginResponseData {
	token: string;
	user: User;
}

export interface ApiEnvelope<T> {
	message?: string;
	data: T;
}

export interface ApiFieldErrors {
	[key: string]: string[];
}

export class ApiClientError extends Error {
	status: number;
	fieldErrors?: ApiFieldErrors;

	constructor(message: string, status: number, fieldErrors?: ApiFieldErrors) {
		super(message);
		this.name = "ApiClientError";
		this.status = status;
		this.fieldErrors = fieldErrors;
	}
}

