"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EventForm } from "@/src/components/events/EventForm";
import { eventService } from "@/src/services/eventService";
import { authStore } from "@/src/store/authStore";
import type { Event, EventFormPayload } from "@/src/types/event.types";

export default function EditEventPage() {
	const router = useRouter();
	const params = useParams<{ eventId: string }>();
	const eventId = useMemo(() => Number(params.eventId), [params.eventId]);

	const [eventData, setEventData] = useState<Event | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadEvent = useCallback(async () => {
		const token = authStore.getState().token;
		if (!token) {
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			setEventData(await eventService.getEventById(eventId, token));
		} catch (loadError) {
			const message = loadError instanceof Error ? loadError.message : "No se pudo cargar el evento";
			setError(message);
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

			await loadEvent();
		};

		void initialize();

		return () => {
			isMounted = false;
		};
	}, [eventId, loadEvent, router]);

	const handleSubmit = async (payload: EventFormPayload) => {
		if (eventData?.status === "CANCELADO") {
			setError("No se puede editar un evento cancelado");
			return;
		}

		const token = authStore.getState().token;
		if (!token) {
			router.replace("/login");
			return;
		}

		setError(null);
		setIsSubmitting(true);
		try {
			const updated = await eventService.updateEvent(eventId, payload, token);
			setEventData(updated);
			router.replace(`/organizador/eventos/${eventId}`);
		} catch (updateError) {
			const message = updateError instanceof Error ? updateError.message : "No se pudo actualizar el evento";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		const token = authStore.getState().token;
		if (!token) {
			router.replace("/login");
			return;
		}

		const shouldDelete = window.confirm("Este evento sera eliminado definitivamente. Deseas continuar?");
		if (!shouldDelete) {
			return;
		}

		setError(null);
		setIsDeleting(true);
		try {
			await eventService.deleteEvent(eventId, token);
			router.replace("/organizador");
		} catch (deleteError) {
			const message = deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el evento";
			setError(message);
		} finally {
			setIsDeleting(false);
		}
	};

	if (isLoading) {
		return (
			<main className="min-h-screen bg-transparent px-4 py-8 text-white md:px-8">
				<div className="mx-auto h-80 w-full max-w-3xl animate-pulse rounded-3xl border border-white/20 bg-black/25 backdrop-blur-sm" />
			</main>
		);
	}

	if (!eventData) {
		return (
			<main className="min-h-screen bg-transparent px-4 py-8 text-white md:px-8">
				<div className="mx-auto w-full max-w-3xl rounded-2xl border border-[var(--color-primary)]/60 bg-[var(--color-primary)]/10 p-6">
					<p className="text-sm text-white">{error ?? "No encontramos el evento solicitado."}</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-transparent px-4 py-8 text-white md:px-8">
			{eventData.status === "CANCELADO" ? (
				<div className="mx-auto mb-4 w-full max-w-3xl rounded-2xl border border-[var(--color-secondary)]/60 bg-[var(--color-secondary)]/10 px-4 py-3 text-sm text-white">
					Este evento esta cancelado y no admite ediciones. Puedes volver o eliminarlo.
				</div>
			) : null}

			<EventForm
				mode="edit"
				initialEvent={eventData}
				onSubmit={handleSubmit}
				onDelete={handleDelete}
				onCancel={() => router.push(`/organizador/eventos/${eventId}`)}
				isSubmitting={isSubmitting}
				isDeleting={isDeleting}
				formError={error}
			/>
		</main>
	);
}
