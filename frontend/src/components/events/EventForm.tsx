"use client";

import { type FormEvent, useMemo, useState } from "react";

import type { Event, EventFormPayload } from "@/src/types/event.types";

interface EventFormProps {
	mode: "create" | "edit";
	initialEvent?: Event;
	onSubmit: (payload: EventFormPayload) => Promise<void>;
	onDelete?: () => Promise<void>;
	onCancel: () => void;
	isSubmitting?: boolean;
	isDeleting?: boolean;
	formError?: string | null;
}

interface EventFormState {
	title: string;
	description: string;
	date: string;
	location: string;
	max_capacity: string;
}

type EventFormErrors = Partial<Record<keyof EventFormState, string>>;

function toLocalInputValue(dateIso: string): string {
	const date = new Date(dateIso);
	const offset = date.getTimezoneOffset();
	const localDate = new Date(date.getTime() - offset * 60000);
	return localDate.toISOString().slice(0, 16);
}

function buildInitialState(initialEvent?: Event): EventFormState {
	if (!initialEvent) {
		return {
			title: "",
			description: "",
			date: "",
			location: "",
			max_capacity: "",
		};
	}

	return {
		title: initialEvent.title,
		description: initialEvent.description ?? "",
		date: toLocalInputValue(initialEvent.date),
		location: initialEvent.location,
		max_capacity: String(initialEvent.max_capacity),
	};
}

function validate(state: EventFormState): EventFormErrors {
	const errors: EventFormErrors = {};

	if (!state.title.trim()) {
		errors.title = "El titulo es obligatorio";
	}

	if (!state.date) {
		errors.date = "La fecha y hora son obligatorias";
	}

	if (!state.location.trim()) {
		errors.location = "La ubicacion es obligatoria";
	}

	const capacity = Number(state.max_capacity);
	if (!state.max_capacity || Number.isNaN(capacity) || capacity < 1) {
		errors.max_capacity = "La capacidad debe ser mayor a 0";
	}

	return errors;
}

export function EventForm({
	mode,
	initialEvent,
	onSubmit,
	onDelete,
	onCancel,
	isSubmitting = false,
	isDeleting = false,
	formError,
}: EventFormProps) {
	const [state, setState] = useState<EventFormState>(() => buildInitialState(initialEvent));
	const [errors, setErrors] = useState<EventFormErrors>({});

	const title = useMemo(() => (mode === "create" ? "Crear nuevo evento" : "Editar evento"), [mode]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const nextErrors = validate(state);
		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		const payload: EventFormPayload = {
			title: state.title.trim(),
			description: state.description.trim(),
			date: new Date(state.date).toISOString(),
			location: state.location.trim(),
			max_capacity: Number(state.max_capacity),
		};

		await onSubmit(payload);
	};

	return (
		<section className="mx-auto w-full max-w-3xl rounded-3xl border border-white/20 bg-black/25 p-6 shadow-2xl backdrop-blur-sm md:p-8">
			<div>
				<p className="text-xs uppercase tracking-[0.22em] text-white/50">Organizador</p>
				<h1 className="mt-2 text-3xl font-bold text-white">{title}</h1>
				<p className="mt-2 text-sm text-white/70">Completa la informacion para publicar o actualizar tu evento.</p>
			</div>

			<form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
				<div>
					<label className="mb-2 block text-sm font-medium text-white/85" htmlFor="event-title">
						Titulo
					</label>
					<input
						id="event-title"
						type="text"
						className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none transition-colors duration-300 focus:border-[var(--color-accent)]"
						value={state.title}
						onChange={(inputEvent) => setState((prev) => ({ ...prev, title: inputEvent.target.value }))}
					/>
					{errors.title ? <p className="mt-2 text-xs text-[var(--color-primary)]">{errors.title}</p> : null}
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium text-white/85" htmlFor="event-description">
						Descripcion
					</label>
					<textarea
						id="event-description"
						rows={4}
						className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors duration-300 focus:border-[var(--color-accent)]"
						value={state.description}
						onChange={(inputEvent) => setState((prev) => ({ ...prev, description: inputEvent.target.value }))}
					/>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label className="mb-2 block text-sm font-medium text-white/85" htmlFor="event-date">
							Fecha y hora
						</label>
						<input
							id="event-date"
							type="datetime-local"
							className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none transition-colors duration-300 focus:border-[var(--color-accent)]"
							value={state.date}
							onChange={(inputEvent) => setState((prev) => ({ ...prev, date: inputEvent.target.value }))}
						/>
						{errors.date ? <p className="mt-2 text-xs text-[var(--color-primary)]">{errors.date}</p> : null}
					</div>

					<div>
						<label className="mb-2 block text-sm font-medium text-white/85" htmlFor="event-capacity">
							Capacidad maxima
						</label>
						<input
							id="event-capacity"
							type="number"
							min={1}
							className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none transition-colors duration-300 focus:border-[var(--color-accent)]"
							value={state.max_capacity}
							onChange={(inputEvent) =>
								setState((prev) => ({ ...prev, max_capacity: inputEvent.target.value }))
							}
						/>
						{errors.max_capacity ? <p className="mt-2 text-xs text-[var(--color-primary)]">{errors.max_capacity}</p> : null}
					</div>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium text-white/85" htmlFor="event-location">
						Ubicacion
					</label>
					<input
						id="event-location"
						type="text"
						className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none transition-colors duration-300 focus:border-[var(--color-accent)]"
						value={state.location}
						onChange={(inputEvent) => setState((prev) => ({ ...prev, location: inputEvent.target.value }))}
					/>
					{errors.location ? <p className="mt-2 text-xs text-[var(--color-primary)]">{errors.location}</p> : null}
				</div>

				{formError ? (
					<div className="rounded-xl border border-[var(--color-primary)]/70 bg-[var(--color-primary)]/10 px-4 py-3 text-sm text-white">
						{formError}
					</div>
				) : null}

				<div className="flex flex-wrap items-center gap-3 pt-2">
					<button
						type="submit"
						disabled={isSubmitting}
						className="rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-black transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? "Guardando..." : "Guardar"}
					</button>
					<button
						type="button"
						onClick={onCancel}
						className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white/90 transition-colors duration-300 hover:border-white/40"
					>
						Cancelar
					</button>
					{mode === "edit" && onDelete ? (
						<button
							type="button"
							onClick={() => void onDelete()}
							disabled={isDeleting}
							className="rounded-xl border border-[var(--color-primary)]/60 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)] transition-colors duration-300 hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isDeleting ? "Eliminando..." : "Eliminar"}
						</button>
					) : null}
				</div>
			</form>
		</section>
	);
}

