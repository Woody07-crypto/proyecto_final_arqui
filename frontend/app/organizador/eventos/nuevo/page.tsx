"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EventForm } from "@/src/components/events/EventForm";
import { eventService } from "@/src/services/eventService";
import { authStore } from "@/src/store/authStore";
import type { EventFormPayload } from "@/src/types/event.types";

export default function NewEventPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
			}
		};

		void initialize();

		return () => {
			isMounted = false;
		};
	}, [router]);

	const handleSubmit = async (payload: EventFormPayload) => {
		const token = authStore.getState().token;
		if (!token) {
			router.replace("/login");
			return;
		}

		setError(null);
		setIsSubmitting(true);
		try {
			const createdEvent = await eventService.createEvent(payload, token);
			router.replace(`/organizador/eventos/${createdEvent.id}`);
		} catch (createError) {
			const message = createError instanceof Error ? createError.message : "No se pudo crear el evento";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="min-h-screen bg-transparent px-4 py-8 text-white md:px-8">
			<EventForm
				mode="create"
				onSubmit={handleSubmit}
				onCancel={() => router.push("/organizador")}
				isSubmitting={isSubmitting}
				formError={error}
			/>
		</main>
	);
}
