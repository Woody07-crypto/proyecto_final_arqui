"use client";

import { useSyncExternalStore } from "react";

import { authService } from "@/src/services/authService";
import type { LoginRequest, RegisterRequest, User, UserRole } from "@/src/types/user.types";

const AUTH_STORAGE_KEY = "eventflow.auth.token";

export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	token: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
};

let state: AuthState = initialState;
const listeners = new Set<() => void>();

function setState(patch: Partial<AuthState>) {
	state = { ...state, ...patch };
	listeners.forEach((listener) => listener());
}

function getTokenFromStorage(): string | null {
	if (typeof window === "undefined") {
		return null;
	}

	return window.localStorage.getItem(AUTH_STORAGE_KEY);
}

function saveTokenToStorage(token: string) {
	if (typeof window !== "undefined") {
		window.localStorage.setItem(AUTH_STORAGE_KEY, token);
	}
}

function removeTokenFromStorage() {
	if (typeof window !== "undefined") {
		window.localStorage.removeItem(AUTH_STORAGE_KEY);
	}
}

async function login(payload: LoginRequest) {
	setState({ isLoading: true, error: null });

	try {
		const data = await authService.login(payload);
		saveTokenToStorage(data.token);

		setState({
			token: data.token,
			user: data.user,
			isAuthenticated: true,
			isLoading: false,
			error: null,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "No se pudo iniciar sesion";
		removeTokenFromStorage();
		setState({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,
			error: message,
		});
		throw error;
	}
}

async function register(payload: RegisterRequest) {
	setState({ isLoading: true, error: null });

	try {
		const user = await authService.register(payload);
		setState({ isLoading: false, error: null });
		return user;
	} catch (error) {
		const message = error instanceof Error ? error.message : "No se pudo registrar el usuario";
		setState({ isLoading: false, error: message });
		throw error;
	}
}

async function hydrate() {
	const token = getTokenFromStorage();

	if (!token) {
		setState({ ...initialState });
		return;
	}

	setState({ isLoading: true, token, error: null });

	try {
		const user = await authService.me(token);
		setState({
			token,
			user,
			isAuthenticated: true,
			isLoading: false,
			error: null,
		});
	} catch {
		removeTokenFromStorage();
		setState({ ...initialState });
	}
}

function logout() {
	removeTokenFromStorage();
	setState({ ...initialState });
}

function clearError() {
	setState({ error: null });
}

function getState() {
	return state;
}

function subscribe(listener: () => void) {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

export function useAuthStore<T>(selector: (currentState: AuthState) => T): T {
	return useSyncExternalStore(subscribe, () => selector(getState()), () => selector(initialState));
}

export function getPostLoginRoute(role: UserRole): string {
	if (role === "ADMIN") {
		return "/admin";
	}

	return "/organizador";
}

export const authStore = {
	getState,
	subscribe,
	login,
	register,
	hydrate,
	logout,
	clearError,
};

