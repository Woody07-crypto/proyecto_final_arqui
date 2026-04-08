"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { attendeeService } from "@/src/services/attendeeService";
import { eventService } from "@/src/services/eventService";
import { authStore } from "@/src/store/authStore";
import type { RegisterAttendeePayload, RegistrationViewModel } from "@/src/types/attendee.types";
import type { Event } from "@/src/types/event.types";

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

interface RegisterFormState {
	name: string;
	email: string;
	phone: string;
}

function getEventImage(eventId: number): string {
	return EVENT_IMAGES[eventId % EVENT_IMAGES.length];
}

function formatDate(dateInput: string): string {
	return new Intl.DateTimeFormat("es-PE", {
		dateStyle: "full",
		timeStyle: "short",
	}).format(new Date(dateInput));
}

function formatRegistrationDate(dateInput: string): string {
	return new Intl.DateTimeFormat("es-PE", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(dateInput));
}

const initialRegisterForm: RegisterFormState = {
	name: "",
	email: "",
	phone: "",
};

export default function EventDetailPage() {
	const router = useRouter();
	const params = useParams<{ eventId: string }>();
	const eventId = useMemo(() => Number(params.eventId), [params.eventId]);

	const [eventData, setEventData] = useState<Event | null>(null);
	const [registrations, setRegistrations] = useState<RegistrationViewModel[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formState, setFormState] = useState<RegisterFormState>(initialRegisterForm);
	const [formError, setFormError] = useState<string | null>(null);
	const [pageError, setPageError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [cancelingRegistrationId, setCancelingRegistrationId] = useState<number | null>(null);

	const loadData = useCallback(async () => {
		const token = authStore.getState().token;
		if (!token) {
			return;
		}

		setIsLoading(true);
		setPageError(null);
		try {
			const [eventResponse, registrationsResponse] = await Promise.all([
				eventService.getEventById(eventId, token),
				attendeeService.getEventAttendees(eventId, token),
			]);

			setEventData(eventResponse);
			setRegistrations(
				registrationsResponse.map((registration) => ({
					...registration,
					attendee_name: `Asistente #${registration.attendee_id}`,
					attendee_email: "No disponible",
				})),
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : "No se pudo cargar el evento";
			setPageError(message);
		} finally {
			setIsLoading(false);
		}
	}, [eventId]);

	useEffect(() => {
		let isMounted = true;

		const initialize = async () => {
			await authStore.hydrate();
			if (!isMounted) {
				return;
			}

			const { isAuthenticated, user } = authStore.getState();
			if (!isAuthenticated || !user) {
				router.replace("/login");
				return;
			}

			if (user.role === "ADMIN") {
				router.replace("/admin");
				return;
			}

			if (!Number.isFinite(eventId) || eventId <= 0) {
				router.replace("/organizador");
				return;
			}

			await loadData();
		};

		void initialize();

		return () => {
			isMounted = false;
		};
	}, [eventId, loadData, router]);

	const handleCancelEvent = async () => {
		if (!eventData) {
			return;
		}

		const token = authStore.getState().token;
		if (!token) {
			return;
		}

		const shouldCancel = window.confirm("El evento cambiara a estado CANCELADO. Deseas continuar?");
		if (!shouldCancel) {
			return;
		}

		setPageError(null);
		try {
			setEventData(await eventService.cancelEvent(eventData.id, token));
		} catch (error) {
			const message = error instanceof Error ? error.message : "No se pudo cancelar el evento";
			setPageError(message);
		}
	};

	const handleCancelRegistration = async (registrationId: number) => {
		const token = authStore.getState().token;
		if (!token) {
			return;
		}

		setPageError(null);
		setCancelingRegistrationId(registrationId);
		try {
			await attendeeService.cancelRegistration(registrationId, token);
			setRegistrations((prev) => prev.filter((item) => item.id !== registrationId));
		} catch (error) {
			const message = error instanceof Error ? error.message : "No se pudo cancelar la inscripcion";
			setPageError(message);
		} finally {
			setCancelingRegistrationId(null);
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

		const emailRegex = /^\S+@\S+\.\S+$/;
		if (!formState.name.trim() || !formState.email.trim()) {
			setFormError("Nombre y email son obligatorios");
			return;
		}

		if (!emailRegex.test(formState.email.trim())) {
			setFormError("Ingresa un email valido");
			return;
		}

		setFormError(null);
		setIsSaving(true);

		const payload: RegisterAttendeePayload = {
			name: formState.name.trim(),
			email: formState.email.trim(),
			phone: formState.phone.trim(),
		};

		try {
			const registration = await attendeeService.registerToEvent(eventData.id, payload, token);
			setRegistrations((prev) => [
				{
					...registration,
					attendee_name: payload.name,
					attendee_email: payload.email,
					attendee_phone: payload.phone,
				},
				...prev,
			]);
			setFormState(initialRegisterForm);
			setIsModalOpen(false);
		} catch (error) {
			const message = error instanceof Error ? error.message : "No se pudo registrar el asistente";
			setFormError(message);
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<main className="min-h-screen bg-transparent px-4 py-8 text-white md:px-8">
				<div className="mx-auto h-[30rem] w-full max-w-6xl animate-pulse rounded-3xl border border-white/20 bg-black/25 backdrop-blur-sm" />
			</main>
		);
	}

	if (!eventData) {
		return (
			<main className="min-h-screen bg-transparent px-4 py-8 text-white md:px-8">
				<div className="mx-auto w-full max-w-4xl rounded-2xl border border-[var(--color-primary)]/60 bg-[var(--color-primary)]/10 p-6">
					<p className="text-sm text-white">{pageError ?? "No encontramos el evento solicitado."}</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-transparent px-4 py-8 text-white md:px-8">
			<div className="mx-auto w-full max-w-6xl space-y-6">
				<section className="overflow-hidden rounded-3xl border border-white/20 bg-black/25 backdrop-blur-sm">
					<div className="relative h-64 w-full md:h-80">
						<Image src={getEventImage(eventData.id)} alt={eventData.title} fill className="object-cover" />
						<div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
						<div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
							<p className="text-xs uppercase tracking-[0.2em] text-white/70">Detalle del evento</p>
							<h1 className="mt-2 text-3xl font-bold md:text-4xl">{eventData.title}</h1>
							<p className="mt-3 max-w-3xl text-sm text-white/80 md:text-base">{eventData.description || "Sin descripcion"}</p>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-8">
						<div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
							<p className="text-xs uppercase tracking-[0.12em] text-white/55">Fecha</p>
							<p className="mt-2 text-sm text-white/90">{formatDate(eventData.date)}</p>
						</div>
						<div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
							<p className="text-xs uppercase tracking-[0.12em] text-white/55">Ubicacion</p>
							<p className="mt-2 text-sm text-white/90">{eventData.location}</p>
						</div>
						<div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
							<p className="text-xs uppercase tracking-[0.12em] text-white/55">Capacidad</p>
							<p className="mt-2 text-sm text-white/90">
								{registrations.length} / {eventData.max_capacity} asistentes
							</p>
						</div>
					</div>
				</section>

				<section className="flex flex-wrap gap-3 rounded-2xl border border-white/20 bg-black/25 p-4 backdrop-blur-sm">
					<Link
						href={`/organizador/eventos/${eventData.id}/editar`}
						className="rounded-xl border border-[var(--color-secondary)]/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-secondary)] transition-colors duration-300 hover:border-[var(--color-secondary)]"
					>
						Editar evento
					</Link>
					<button
						type="button"
						onClick={handleCancelEvent}
						className="rounded-xl border border-[var(--color-primary)]/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)] transition-colors duration-300 hover:border-[var(--color-primary)]"
					>
						Cancelar evento
					</button>
					<button
						type="button"
						onClick={() => setIsModalOpen(true)}
						className="rounded-xl bg-[var(--color-primary)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-black transition-all duration-300 hover:brightness-110"
					>
						Registrar asistente
					</button>
					<Link
						href="/organizador"
						className="rounded-xl border border-white/25 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/90 transition-colors duration-300 hover:border-white/45"
					>
						Volver
					</Link>
				</section>

				{pageError ? (
					<div className="rounded-xl border border-[var(--color-primary)]/60 bg-[var(--color-primary)]/10 px-4 py-3 text-sm text-white">
						{pageError}
					</div>
				) : null}

				<section className="rounded-2xl border border-white/20 bg-black/25 p-4 backdrop-blur-sm md:p-6">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-xl font-semibold text-white">Lista de asistentes</h2>
						<span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/75">
							{registrations.length} registros
						</span>
					</div>

					<div className="hidden overflow-x-auto md:block">
						<table className="min-w-full border-collapse text-left text-sm">
							<thead>
								<tr className="border-b border-white/12 text-white/65">
									<th className="px-3 py-3 font-medium">Nombre</th>
									<th className="px-3 py-3 font-medium">Email</th>
									<th className="px-3 py-3 font-medium">Fecha registro</th>
									<th className="px-3 py-3 font-medium">Estado</th>
									<th className="px-3 py-3 font-medium">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{registrations.map((registration) => (
									<tr key={registration.id} className="border-b border-white/8 text-white/90">
										<td className="px-3 py-3">{registration.attendee_name ?? `Asistente #${registration.attendee_id}`}</td>
										<td className="px-3 py-3">{registration.attendee_email ?? "No disponible"}</td>
										<td className="px-3 py-3">{formatRegistrationDate(registration.registration_date)}</td>
										<td className="px-3 py-3">
											<span className="rounded-full border border-[var(--color-accent)]/60 bg-[var(--color-accent)]/12 px-2 py-1 text-xs font-medium text-[var(--color-accent)]">
												{registration.status}
											</span>
										</td>
										<td className="px-3 py-3">
											<button
												type="button"
												onClick={() => void handleCancelRegistration(registration.id)}
												disabled={cancelingRegistrationId === registration.id}
												className="rounded-lg border border-[var(--color-primary)]/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)] transition-colors duration-300 hover:border-[var(--color-primary)] disabled:opacity-60"
											>
												{cancelingRegistrationId === registration.id ? "Procesando" : "Cancelar"}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="space-y-3 md:hidden">
						{registrations.map((registration) => (
							<div key={registration.id} className="rounded-xl border border-white/20 bg-black/20 p-4 backdrop-blur-sm">
								<p className="text-sm font-semibold text-white">{registration.attendee_name ?? `Asistente #${registration.attendee_id}`}</p>
								<p className="mt-1 text-xs text-white/70">{registration.attendee_email ?? "No disponible"}</p>
								<p className="mt-2 text-xs text-white/65">{formatRegistrationDate(registration.registration_date)}</p>
								<div className="mt-3 flex items-center justify-between">
									<span className="rounded-full border border-[var(--color-accent)]/60 bg-[var(--color-accent)]/12 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[var(--color-accent)]">
										{registration.status}
									</span>
									<button
										type="button"
										onClick={() => void handleCancelRegistration(registration.id)}
										disabled={cancelingRegistrationId === registration.id}
										className="rounded-lg border border-[var(--color-primary)]/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]"
									>
										Cancelar
									</button>
								</div>
							</div>
						))}
					</div>

					{registrations.length === 0 ? (
						<div className="rounded-xl border border-dashed border-white/25 bg-black/20 p-6 text-center text-sm text-white/70 backdrop-blur-sm">
							No hay asistentes registrados todavia.
						</div>
					) : null}
				</section>
			</div>

			{isModalOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-2xl border border-white/15 bg-black/25 p-5 shadow-2xl backdrop-blur-sm">
						<div className="mb-4 flex items-start justify-between">
							<div>
								<h3 className="text-xl font-semibold text-white">Registrar asistente</h3>
								<p className="mt-1 text-sm text-white/70">Completa los datos del nuevo asistente.</p>
							</div>
							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								className="rounded-lg border border-white/20 px-3 py-2 text-xs text-white/80"
							>
								Cerrar
							</button>
						</div>

						<form className="space-y-3" onSubmit={handleRegisterAttendee}>
							<input
								type="text"
								placeholder="Nombre completo"
								value={formState.name}
								onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
								className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none focus:border-[var(--color-accent)]"
							/>
							<input
								type="email"
								placeholder="Email"
								value={formState.email}
								onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
								className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none focus:border-[var(--color-accent)]"
							/>
							<input
								type="text"
								placeholder="Telefono (opcional)"
								value={formState.phone}
								onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
								className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none focus:border-[var(--color-accent)]"
							/>

							{formError ? (
								<div className="rounded-xl border border-[var(--color-primary)]/60 bg-[var(--color-primary)]/10 px-3 py-2 text-sm text-white">
									{formError}
								</div>
							) : null}

							<div className="flex items-center gap-3 pt-1">
								<button
									type="submit"
									disabled={isSaving}
									className="rounded-xl bg-[var(--color-primary)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-black disabled:opacity-60"
								>
									{isSaving ? "Guardando..." : "Registrar"}
								</button>
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="rounded-xl border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/85"
								>
									Cancelar
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}
		</main>
	);
}
