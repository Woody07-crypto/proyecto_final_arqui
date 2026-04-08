"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { UserTable } from "@/src/components/admin/UserTable";
import { adminService } from "@/src/services/adminService";
import { attendeeService } from "@/src/services/attendeeService";
import { authStore } from "@/src/store/authStore";
import type { Attendee, Registration } from "@/src/types/attendee.types";
import type { Event } from "@/src/types/event.types";
import type { User, UserRole } from "@/src/types/user.types";

type UserFilter = "ALL" | UserRole;

function formatDate(dateInput: string): string {
	return new Intl.DateTimeFormat("es-PE", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(dateInput));
}

export default function AdminPeoplePage() {
	const [userFilter, setUserFilter] = useState<UserFilter>("ALL");
	const [users, setUsers] = useState<User[]>([]);
	const [attendees, setAttendees] = useState<Attendee[]>([]);
	const [eventsById, setEventsById] = useState<Record<number, Event>>({});
	const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
	const [selectedRegistrations, setSelectedRegistrations] = useState<Registration[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isModalLoading, setIsModalLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadData = useCallback(async () => {
		const token = authStore.getState().token;
		if (!token) {
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			const [usersData, attendeesData, eventsData] = await Promise.all([
				adminService.getUsers(token, userFilter === "ALL" ? undefined : userFilter),
				attendeeService.getAllAttendees(token),
				adminService.getEvents(token),
			]);
			setUsers(usersData);
			setAttendees(attendeesData);
			setEventsById(Object.fromEntries(eventsData.map((event) => [event.id, event])));
		} catch (loadError) {
			const message = loadError instanceof Error ? loadError.message : "No se pudo cargar la gestion de personas";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, [userFilter]);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const handleOpenAttendee = async (attendee: Attendee) => {
		const token = authStore.getState().token;
		if (!token) {
			return;
		}

		setIsModalLoading(true);
		setError(null);
		try {
			const [attendeeDetail, registrations] = await Promise.all([
				attendeeService.getAttendeeById(attendee.id, token),
				adminService.getRegistrationsByAttendee(attendee.id, token),
			]);
			setSelectedAttendee(attendeeDetail);
			setSelectedRegistrations(registrations);
		} catch (modalError) {
			const message = modalError instanceof Error ? modalError.message : "No se pudo cargar el detalle del asistente";
			setError(message);
		} finally {
			setIsModalLoading(false);
		}
	};

	const attendeeRows = useMemo(() => attendees, [attendees]);

	return (
		<main className="space-y-6">
			<header className="rounded-3xl border border-white/20 bg-black/25 p-6 backdrop-blur-md">
				<p className="text-xs uppercase tracking-[0.22em] text-white/45">Gestion de Personas</p>
				<h1 className="mt-2 text-3xl font-bold">Usuarios y Asistentes</h1>
			</header>

			{error ? (
				<div className="rounded-xl border border-[var(--color-primary)]/60 bg-[var(--color-primary)]/10 px-4 py-3 text-sm">{error}</div>
			) : null}

			<section className="rounded-2xl border border-white/20 bg-black/25 p-5 backdrop-blur-sm">
				<div className="mb-4 flex flex-wrap items-center gap-3">
					<h2 className="text-xl font-semibold">Usuarios</h2>
					<select
						value={userFilter}
						onChange={(event) => setUserFilter(event.target.value as UserFilter)}
						className="h-10 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
					>
						<option value="ALL" className="bg-[#691A59] text-white">Todos</option>
						<option value="ADMIN" className="bg-[#691A59] text-white">ADMIN</option>
						<option value="ORGANIZADOR" className="bg-[#691A59] text-white">ORGANIZADOR</option>
					</select>
				</div>

				{isLoading ? <div className="h-60 animate-pulse rounded-xl bg-black/20" /> : <UserTable users={users} />}
			</section>

			<section className="rounded-2xl border border-white/20 bg-black/25 p-5 backdrop-blur-sm">
				<h2 className="text-xl font-semibold">Asistentes</h2>
				{isLoading ? (
					<div className="mt-4 h-60 animate-pulse rounded-xl bg-black/20" />
				) : attendeeRows.length === 0 ? (
					<p className="py-8 text-center text-sm text-[#555555]">No hay asistentes registrados.</p>
				) : (
					<div className="mt-4 overflow-x-auto">
						<table className="min-w-full border-collapse text-left text-sm">
							<thead>
								<tr className="border-b border-white/10 text-white/60">
									<th className="px-3 py-3 font-medium">Nombre</th>
									<th className="px-3 py-3 font-medium">Email</th>
									<th className="px-3 py-3 font-medium">Telefono</th>
									<th className="px-3 py-3 font-medium">Accion</th>
								</tr>
							</thead>
							<tbody>
								{attendeeRows.map((attendee) => (
									<tr key={attendee.id} className="border-b border-white/7 text-white/90">
										<td className="px-3 py-3">{attendee.name}</td>
										<td className="px-3 py-3">{attendee.email}</td>
										<td className="px-3 py-3">{attendee.phone || "-"}</td>
										<td className="px-3 py-3">
											<button
												type="button"
												onClick={() => void handleOpenAttendee(attendee)}
												className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/90"
											>
												Ver detalle
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{selectedAttendee ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
					<div className="w-full max-w-3xl rounded-2xl border border-white/12 bg-[#111111] p-5 shadow-2xl">
						<div className="mb-4 flex items-start justify-between">
							<div>
								<h3 className="text-xl font-semibold">Detalle de asistente</h3>
								<p className="mt-1 text-sm text-white/70">Vista integrada sin cambiar de pantalla.</p>
							</div>
							<button
								type="button"
								onClick={() => {
									setSelectedAttendee(null);
									setSelectedRegistrations([]);
								}}
								className="rounded-lg border border-white/20 px-3 py-2 text-xs text-white/85"
							>
								Cerrar
							</button>
						</div>

						<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
							<div className="rounded-xl border border-white/10 bg-black/35 p-3">
								<p className="text-xs text-white/55">Nombre</p>
								<p className="mt-1 text-sm">{selectedAttendee.name}</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-black/35 p-3">
								<p className="text-xs text-white/55">Email</p>
								<p className="mt-1 text-sm">{selectedAttendee.email}</p>
							</div>
							<div className="rounded-xl border border-white/10 bg-black/35 p-3">
								<p className="text-xs text-white/55">Telefono</p>
								<p className="mt-1 text-sm">{selectedAttendee.phone || "No registrado"}</p>
							</div>
						</div>

						<h4 className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-white/70">Historial de inscripciones</h4>
						{isModalLoading ? (
							<div className="mt-3 h-32 animate-pulse rounded-xl bg-black/40" />
						) : selectedRegistrations.length === 0 ? (
							<p className="py-6 text-center text-sm text-[#555555]">Este asistente aun no tiene inscripciones.</p>
						) : (
							<div className="mt-3 overflow-x-auto">
								<table className="min-w-full border-collapse text-left text-sm">
									<thead>
										<tr className="border-b border-white/10 text-white/60">
											<th className="px-3 py-3 font-medium">Evento</th>
											<th className="px-3 py-3 font-medium">Fecha registro</th>
											<th className="px-3 py-3 font-medium">Estado</th>
										</tr>
									</thead>
									<tbody>
										{selectedRegistrations.map((registration) => (
											<tr key={registration.id} className="border-b border-white/7 text-white/90">
												<td className="px-3 py-3">{eventsById[registration.event_id]?.title ?? `Evento #${registration.event_id}`}</td>
												<td className="px-3 py-3">{formatDate(registration.registration_date)}</td>
												<td className="px-3 py-3">{registration.status}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			) : null}
		</main>
	);
}

