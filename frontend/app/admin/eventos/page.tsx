"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { adminService } from "@/src/services/adminService";
import { authStore } from "@/src/store/authStore";
import type { Event, EventStatus } from "@/src/types/event.types";
import type { User } from "@/src/types/user.types";

type FilterStatus = "ALL" | EventStatus;

const STATUS_OPTIONS: FilterStatus[] = ["ALL", "ACTIVO", "SOLD_OUT", "FINALIZADO", "CANCELADO"];

function formatDate(dateInput: string): string {
	return new Intl.DateTimeFormat("es-PE", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(dateInput));
}

export default function AdminEventsPage() {
	const [filter, setFilter] = useState<FilterStatus>("ALL");
	const [events, setEvents] = useState<Event[]>([]);
	const [usersById, setUsersById] = useState<Record<number, User>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [updatingEventId, setUpdatingEventId] = useState<number | null>(null);

	const loadData = useCallback(async () => {
		const token = authStore.getState().token;
		if (!token) {
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			const [eventData, users] = await Promise.all([
				adminService.getEvents(token, filter === "ALL" ? undefined : filter),
				adminService.getUsers(token),
			]);

			setEvents(eventData);
			setUsersById(Object.fromEntries(users.map((user) => [user.id, user])));
		} catch (loadError) {
			const message = loadError instanceof Error ? loadError.message : "No se pudieron cargar los eventos";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, [filter]);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const handleStatusChange = async (eventId: number, status: EventStatus) => {
		const token = authStore.getState().token;
		if (!token) {
			return;
		}

		setUpdatingEventId(eventId);
		setError(null);
		try {
			const updated = await adminService.changeEventStatus(eventId, status, token);
			setEvents((prev) => prev.map((event) => (event.id === eventId ? updated : event)));
		} catch (updateError) {
			const message = updateError instanceof Error ? updateError.message : "No se pudo cambiar el estado";
			setError(message);
		} finally {
			setUpdatingEventId(null);
		}
	};

	return (
		<main className="space-y-6">
			<header className="rounded-3xl border border-white/20 bg-black/25 p-6 backdrop-blur-md">
				<p className="text-xs uppercase tracking-[0.22em] text-white/45">Admin Central / Eventos</p>
				<h1 className="mt-2 text-3xl font-bold">Lista maestra de eventos</h1>
			</header>

			<section className="rounded-2xl border border-white/20 bg-black/25 p-4 backdrop-blur-sm">
				<div className="mb-4 flex flex-wrap items-center gap-3">
					<label className="text-sm text-white/75" htmlFor="status-filter">Filtrar por estado</label>
					<select
						id="status-filter"
						value={filter}
						onChange={(event) => setFilter(event.target.value as FilterStatus)}
						className="h-10 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none"
					>
						{STATUS_OPTIONS.map((status) => (
							<option key={status} value={status} className="bg-[#691A59] text-white">
								{status === "ALL" ? "Todos" : status.replace("_", " ")}
							</option>
						))}
					</select>
				</div>

				{error ? (
					<div className="mb-4 rounded-xl border border-[var(--color-primary)]/60 bg-[var(--color-primary)]/10 px-4 py-3 text-sm">
						{error}
					</div>
				) : null}

				{isLoading ? (
					<div className="h-72 animate-pulse rounded-xl bg-black/20" />
				) : events.length === 0 ? (
					<p className="py-8 text-center text-sm text-[#555555]">No hay eventos para este estado.</p>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full border-collapse text-left text-sm">
							<thead>
								<tr className="border-b border-white/10 text-white/60">
									<th className="px-3 py-3 font-medium">Evento</th>
									<th className="px-3 py-3 font-medium">Organizador</th>
									<th className="px-3 py-3 font-medium">Fecha</th>
									<th className="px-3 py-3 font-medium">Estado</th>
									<th className="px-3 py-3 font-medium">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{events.map((event) => (
									<tr key={event.id} className="border-b border-white/7 text-white/90">
										<td className="px-3 py-3">
											<p className="font-medium">{event.title}</p>
											<p className="text-xs text-white/55">{event.location}</p>
										</td>
										<td className="px-3 py-3">{usersById[event.organizer_id]?.name ?? `ID ${event.organizer_id}`}</td>
										<td className="px-3 py-3">{formatDate(event.date)}</td>
										<td className="px-3 py-3">
											<select
												value={event.status}
												onChange={(changeEvent) =>
													void handleStatusChange(event.id, changeEvent.target.value as EventStatus)
												}
												disabled={updatingEventId === event.id}
												className="h-9 rounded-lg border border-white/15 bg-white/5 px-2 text-xs text-white outline-none"
											>
												{STATUS_OPTIONS.filter((item) => item !== "ALL").map((status) => (
													<option key={status} value={status} className="bg-[#691A59] text-white">
														{status.replace("_", " ")}
													</option>
												))}
											</select>
										</td>
										<td className="px-3 py-3">
											<Link
												href={`/admin/eventos/${event.id}`}
												className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/90"
											>
												Ver detalle
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</main>
	);
}

