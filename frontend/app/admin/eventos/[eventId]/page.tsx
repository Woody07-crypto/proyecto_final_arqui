"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { adminService } from "@/src/services/adminService";
import { attendeeService } from "@/src/services/attendeeService";
import { eventService } from "@/src/services/eventService";
import { authStore } from "@/src/store/authStore";
import type { Attendee, Registration } from "@/src/types/attendee.types";
import type { Event, EventStatus } from "@/src/types/event.types";

const EVENT_IMAGES = [
	"/assets/images/bootcamp_ventas.jpeg",
	"/assets/images/cena_gala_anual.jpeg",
	"/assets/images/conferencia_nacional_innovacion.jpeg",
	"/assets/images/cumbre_sostenibilidad_empresarial.jpeg",
	"/assets/images/feria_proveedores.jpeg",
	"/assets/images/lanzamiento_producto.jpeg",
	"/assets/images/networking.jpeg",
	"/assets/images/reunion_trimestral_ventas.jpeg",
	"/assets/images/taller_liderazgo_ejecutivo.jpeg",
	"/assets/images/webinar.jpeg",
	"/assets/images/workshop_marketing.jpeg",
];

function getEventImage(eventId: number) {
	return EVENT_IMAGES[eventId % EVENT_IMAGES.length];
}

function formatDate(dateInput: string): string {
	return new Intl.DateTimeFormat("es-PE", {
		dateStyle: "full",
		timeStyle: "short",
	}).format(new Date(dateInput));
}

export default function AdminEventDetailPage() {
	const params = useParams<{ eventId: string }>();
	const eventId = Number(params.eventId);

	const [eventData, setEventData] = useState<Event | null>(null);
	const [registrations, setRegistrations] = useState<Registration[]>([]);
	const [attendeesById, setAttendeesById] = useState<Record<number, Attendee>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSavingAttendee, setIsSavingAttendee] = useState(false);
	const [registerMode, setRegisterMode] = useState<"existing" | "new">("existing");
	const [attendeeSearch, setAttendeeSearch] = useState("");
	const [selectedExistingAttendeeId, setSelectedExistingAttendeeId] = useState<number | null>(null);
	const [registerForm, setRegisterForm] = useState({ name: "", email: "", phone: "" });

	const allAttendees = useMemo(() => Object.values(attendeesById), [attendeesById]);

	const availableExistingAttendees = useMemo(() => {
		const registeredIds = new Set(registrations.map((registration) => registration.attendee_id));
		const query = attendeeSearch.trim().toLowerCase();

		return allAttendees.filter((attendee) => {
			if (registeredIds.has(attendee.id)) {
				return false;
			}

			if (!query) {
				return true;
			}

			return (
				attendee.name.toLowerCase().includes(query) ||
				attendee.email.toLowerCase().includes(query) ||
				(attendee.phone ?? "").toLowerCase().includes(query)
			);
		});
	}, [allAttendees, attendeeSearch, registrations]);

	const loadData = useCallback(async () => {
		const token = authStore.getState().token;
		if (!token || !Number.isFinite(eventId) || eventId <= 0) {
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			const [eventResponse, registrationResponse, attendees] = await Promise.all([
				eventService.getEventById(eventId, token),
				adminService.getRegistrationsByEvent(eventId, token),
				attendeeService.getAllAttendees(token),
			]);

			setEventData(eventResponse);
			setRegistrations(registrationResponse);
			setAttendeesById(Object.fromEntries(attendees.map((attendee) => [attendee.id, attendee])));
		} catch (loadError) {
			const message = loadError instanceof Error ? loadError.message : "No se pudo cargar el detalle";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, [eventId]);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const handleStatusChange = async (nextStatus: EventStatus) => {
		if (!eventData) {
			return;
		}

		const token = authStore.getState().token;
		if (!token) {
			return;
		}

		setIsUpdatingStatus(true);
		setError(null);
		try {
			const updated = await adminService.changeEventStatus(eventData.id, nextStatus, token);
			setEventData(updated);
		} catch (updateError) {
			const message = updateError instanceof Error ? updateError.message : "No se pudo cambiar el estado";
			setError(message);
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	const handleCancelRegistration = async (registrationId: number) => {
		const token = authStore.getState().token;
		if (!token) {
			return;
		}

		setError(null);
		try {
			await attendeeService.cancelRegistration(registrationId, token);
			setRegistrations((prev) => prev.map((item) => (item.id === registrationId ? { ...item, status: "CANCELADO" } : item)));
		} catch (cancelError) {
			const message = cancelError instanceof Error ? cancelError.message : "No se pudo cancelar la inscripcion";
			setError(message);
		}
	};

	const handleRegisterAttendee = async (submitEvent: FormEvent<HTMLFormElement>) => {
		submitEvent.preventDefault();
		if (!eventData) {
			return;
		}

		const token = authStore.getState().token;
		if (!token) {
			return;
		}

		let payload: { name: string; email: string; phone: string };

		if (registerMode === "existing") {
			if (!selectedExistingAttendeeId) {
				setError("Selecciona un asistente existente");
				return;
			}

			const selected = attendeesById[selectedExistingAttendeeId];
			if (!selected) {
				setError("No se encontro el asistente seleccionado");
				return;
			}

			payload = {
				name: selected.name,
				email: selected.email,
				phone: selected.phone ?? "",
			};
		} else {
			if (!registerForm.name.trim() || !registerForm.email.trim()) {
				setError("Nombre y email son obligatorios para registrar un asistente");
				return;
			}

			payload = {
				name: registerForm.name.trim(),
				email: registerForm.email.trim(),
				phone: registerForm.phone.trim(),
			};
		}

		setError(null);
		setIsSavingAttendee(true);
		try {
			const registration = await attendeeService.registerToEvent(
				eventData.id,
				payload,
				token,
			);

			setRegistrations((prev) => [registration, ...prev]);
			setAttendeeSearch("");
			setSelectedExistingAttendeeId(null);
			setRegisterForm({ name: "", email: "", phone: "" });
			setIsModalOpen(false);
		} catch (registerError) {
			const message = registerError instanceof Error ? registerError.message : "No se pudo registrar el asistente";
			setError(message);
		} finally {
			setIsSavingAttendee(false);
		}
	};

	if (isLoading) {
		return <div className="h-96 animate-pulse rounded-3xl border border-white/20 bg-black/25 backdrop-blur-sm" />;
	}

	if (!eventData) {
		return (
			<div className="rounded-2xl border border-[var(--color-primary)]/60 bg-[var(--color-primary)]/10 px-4 py-3 text-sm">
				{error ?? "No se encontro el evento."}
			</div>
		);
	}

	return (
		<main className="space-y-6">
			<section className="overflow-hidden rounded-3xl border border-white/20 bg-black/25 backdrop-blur-sm">
				<div className="relative h-72 w-full">
					<Image src={getEventImage(eventData.id)} alt={eventData.title} fill className="object-cover" />
					<div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
					<div className="absolute bottom-0 left-0 right-0 p-6">
						<p className="text-xs uppercase tracking-[0.2em] text-white/65">Detalle de Evento (Supervisor)</p>
						<h1 className="mt-2 text-3xl font-bold">{eventData.title}</h1>
						<p className="mt-2 max-w-3xl text-sm text-white/80">{eventData.description || "Sin descripcion"}</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
					<div className="rounded-xl border border-white/20 bg-black/20 p-4">
						<p className="text-xs uppercase tracking-[0.12em] text-white/55">Fecha</p>
						<p className="mt-2 text-sm text-white/90">{formatDate(eventData.date)}</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-black/20 p-4">
						<p className="text-xs uppercase tracking-[0.12em] text-white/55">Ubicacion</p>
						<p className="mt-2 text-sm text-white/90">{eventData.location}</p>
					</div>
					<div className="rounded-xl border border-white/20 bg-black/20 p-4">
						<p className="text-xs uppercase tracking-[0.12em] text-white/55">Capacidad</p>
						<p className="mt-2 text-sm text-white/90">{eventData.max_capacity}</p>
					</div>
				</div>
			</section>

			<section className="rounded-2xl border border-white/20 bg-black/25 p-5 backdrop-blur-sm">
				<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.16em] text-white/55">Status Switcher</p>
						<p className="mt-1 text-sm text-white/70">Control total del estado operativo del evento.</p>
					</div>
					<div className="flex items-center gap-2">
						{(["ACTIVO", "SOLD_OUT", "FINALIZADO", "CANCELADO"] as EventStatus[]).map((status) => (
							<button
								key={status}
								type="button"
								disabled={isUpdatingStatus}
								onClick={() => void handleStatusChange(status)}
								className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-200 ${
									eventData.status === status
										? status === "CANCELADO"
											? "border-[var(--color-primary)] bg-[var(--color-primary)]/18 text-[var(--color-primary)]"
											: "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
										: "border-white/20 text-white/80 hover:border-white/35"
								}`}
							>
								{status.replace("_", " ")}
							</button>
						))}
					</div>
				</div>

				{error ? (
					<div className="mt-4 rounded-xl border border-[var(--color-primary)]/60 bg-[var(--color-primary)]/10 px-4 py-3 text-sm">
						{error}
					</div>
				) : null}

				<div className="mt-4 flex justify-end">
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => {
								setRegisterMode(allAttendees.length > 0 ? "existing" : "new");
								setAttendeeSearch("");
								setSelectedExistingAttendeeId(null);
								setRegisterForm({ name: "", email: "", phone: "" });
								setIsModalOpen(true);
							}}
							className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-black"
						>
							Registrar asistente
						</button>
						<Link href="/admin/eventos" className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/85">
							Volver a eventos
						</Link>
					</div>
				</div>
			</section>

			<section className="rounded-2xl border border-white/20 bg-black/25 p-5 backdrop-blur-sm">
				<h2 className="text-xl font-semibold">Inscripciones del evento</h2>
				{registrations.length === 0 ? (
					<p className="py-8 text-center text-sm text-[#555555]">No hay inscripciones para este evento.</p>
				) : (
					<div className="mt-4 overflow-x-auto">
						<table className="min-w-full border-collapse text-left text-sm">
							<thead>
								<tr className="border-b border-white/10 text-white/60">
									<th className="px-3 py-3 font-medium">Asistente</th>
									<th className="px-3 py-3 font-medium">Email</th>
									<th className="px-3 py-3 font-medium">Estado</th>
									<th className="px-3 py-3 font-medium">Accion</th>
								</tr>
							</thead>
							<tbody>
								{registrations.map((registration) => {
									const attendee = attendeesById[registration.attendee_id];
									return (
										<tr key={registration.id} className="border-b border-white/7 text-white/90">
											<td className="px-3 py-3">{attendee?.name ?? `Asistente #${registration.attendee_id}`}</td>
											<td className="px-3 py-3">{attendee?.email ?? "No disponible"}</td>
											<td className="px-3 py-3">{registration.status}</td>
											<td className="px-3 py-3">
												<button
													type="button"
													onClick={() => void handleCancelRegistration(registration.id)}
													disabled={registration.status === "CANCELADO"}
													className="rounded-lg border border-[var(--color-primary)]/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)] disabled:opacity-40"
												>
													Cancelar
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{isModalOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-2xl border border-white/12 bg-[#111111] p-5 shadow-2xl">
						<div className="mb-4 flex items-start justify-between">
							<div>
								<h3 className="text-xl font-semibold">Registrar asistente</h3>
								<p className="mt-1 text-sm text-white/70">Elige uno existente o crea uno nuevo.</p>
							</div>
							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								className="rounded-lg border border-white/20 px-3 py-2 text-xs text-white/85"
							>
								Cerrar
							</button>
						</div>

						<form className="space-y-3" onSubmit={handleRegisterAttendee}>
							<div className="grid grid-cols-2 gap-2">
								<button
									type="button"
									onClick={() => setRegisterMode("existing")}
									className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${
										registerMode === "existing"
											? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
											: "border-white/20 text-white/70"
									}`}
								>
									Usar existente
								</button>
								<button
									type="button"
									onClick={() => setRegisterMode("new")}
									className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${
										registerMode === "new"
											? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/12 text-[var(--color-secondary)]"
											: "border-white/20 text-white/70"
									}`}
								>
									Crear nuevo
								</button>
							</div>

							{registerMode === "existing" ? (
								<>
									<input
										type="text"
										placeholder="Buscar por nombre, email o telefono"
										value={attendeeSearch}
										onChange={(event) => setAttendeeSearch(event.target.value)}
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none"
									/>

									<div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-2">
										{availableExistingAttendees.length === 0 ? (
											<p className="px-2 py-3 text-xs text-[#555555]">No hay asistentes disponibles con ese filtro.</p>
										) : (
											availableExistingAttendees.slice(0, 20).map((attendee) => (
												<button
													key={attendee.id}
													type="button"
													onClick={() => setSelectedExistingAttendeeId(attendee.id)}
													className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
														selectedExistingAttendeeId === attendee.id
															? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white"
															: "border-white/10 text-white/75 hover:border-white/25"
													}`}
												>
													<p className="font-medium">{attendee.name}</p>
													<p className="mt-1 text-[11px] text-white/60">{attendee.email}</p>
												</button>
											))
										)}
									</div>
								</>
							) : (
								<>
									<input
										type="text"
										placeholder="Nombre"
										value={registerForm.name}
										onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none"
									/>
									<input
										type="email"
										placeholder="Email"
										value={registerForm.email}
										onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none"
									/>
									<input
										type="text"
										placeholder="Telefono"
										value={registerForm.phone}
										onChange={(event) => setRegisterForm((prev) => ({ ...prev, phone: event.target.value }))}
										className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none"
									/>
								</>
							)}

							<button
								type="submit"
								disabled={isSavingAttendee}
								className="rounded-xl bg-[var(--color-primary)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-black disabled:opacity-60"
							>
								{isSavingAttendee ? "Guardando..." : "Registrar"}
							</button>
						</form>
					</div>
				</div>
			) : null}
		</main>
	);
}
