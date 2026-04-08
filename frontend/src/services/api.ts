import { ApiClientError, type ApiEnvelope, type ApiFieldErrors } from "@/src/types/user.types";

declare const process: {
	env: Record<string, string | undefined>;
};

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000/api";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestOptions {
	method?: RequestMethod;
	body?: unknown;
	token?: string | null;
}

function readErrorMessage(payload: unknown): string {
	if (typeof payload !== "object" || payload === null) {
		return "Error inesperado en la solicitud";
	}

	const maybeMessage = (payload as { message?: unknown }).message;
	if (typeof maybeMessage === "string" && maybeMessage.trim()) {
		return maybeMessage;
	}

	return "Error inesperado en la solicitud";
}

function readFieldErrors(payload: unknown): ApiFieldErrors | undefined {
	if (typeof payload !== "object" || payload === null) {
		return undefined;
	}

	const maybeErrors = (payload as { errors?: unknown }).errors;
	if (typeof maybeErrors !== "object" || maybeErrors === null) {
		return undefined;
	}

	return maybeErrors as ApiFieldErrors;
}

export async function apiRequest<T>(
	path: string,
	options: ApiRequestOptions = {},
): Promise<ApiEnvelope<T>> {
	const { method = "GET", body, token } = options;

	const headers = new Headers({
		"Content-Type": "application/json",
	});

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	const payload = (await response.json().catch(() => ({}))) as unknown;

	if (!response.ok) {
		throw new ApiClientError(readErrorMessage(payload), response.status, readFieldErrors(payload));
	}

	return payload as ApiEnvelope<T>;
}

