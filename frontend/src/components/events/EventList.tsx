import type { Event } from "@/src/types/event.types";

import { EventCard } from "./EventCard";

interface EventListProps {
	events: Event[];
	countsByEventId: Record<number, number>;
	onCancelEvent?: (eventId: number) => void;
}

export function EventList({ events, countsByEventId, onCancelEvent }: EventListProps) {
	if (events.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-white/25 bg-black/25 p-8 text-center backdrop-blur-sm">
				<h3 className="text-xl font-semibold text-white">Aun no has creado eventos</h3>
				<p className="mt-2 text-sm text-white/70">
					Crea tu primer evento para comenzar a gestionar asistentes y registros.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
			{events.map((event) => (
				<EventCard
					key={event.id}
					event={event}
					attendeeCount={countsByEventId[event.id] ?? 0}
					onCancel={onCancelEvent}
				/>
			))}
		</div>
	);
}
