import Image from "next/image";
import Link from "next/link";

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

const STATUS_STYLES: Record<EventStatus, string> = {
	ACTIVO: "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/15 text-[var(--color-accent)]",
	SOLD_OUT: "border-[var(--color-secondary)]/60 bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]",
	FINALIZADO: "border-white/30 bg-white/10 text-white/75",
	CANCELADO: "border-[var(--color-primary)]/60 bg-[var(--color-primary)]/15 text-[var(--color-primary)]",
};

function getEventImage(event: Event): string {
	return EVENT_IMAGES[event.id % EVENT_IMAGES.length];
}

function formatEventDate(dateInput: string): string {
	return new Intl.DateTimeFormat("es-PE", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(dateInput));
}

interface EventCardProps {
	event: Event;
	attendeeCount: number;
	onCancel?: (eventId: number) => void;
}

export function EventCard({ event, attendeeCount, onCancel }: EventCardProps) {
	const isActionable = event.status === "ACTIVO" || event.status === "SOLD_OUT";

	return (
		<article className="group overflow-hidden rounded-2xl border border-white/20 bg-black/25 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/60">
			<div className="relative h-40 w-full overflow-hidden">
				<Image
					src={getEventImage(event)}
					alt={event.title}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
				<span
					className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${STATUS_STYLES[event.status]}`}
				>
					{event.status.replace("_", " ")}
				</span>
			</div>

			<div className="space-y-4 p-5">
				<div>
					<h3 className="text-lg font-semibold text-white">{event.title}</h3>
					<p className="mt-1 line-clamp-2 text-sm text-white/70">{event.description || "Sin descripcion"}</p>
				</div>

				<div className="space-y-2 text-sm text-white/75">
					<p>{formatEventDate(event.date)}</p>
					<p>{event.location}</p>
					<p>
						{attendeeCount} / {event.max_capacity} asistentes
					</p>
				</div>

				<div className="flex flex-wrap gap-2 pt-1">
					<Link
						href={`/organizador/eventos/${event.id}`}
						className="rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/90 transition-colors duration-300 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
					>
						Ver detalle
					</Link>
					<Link
						href={`/organizador/eventos/${event.id}/editar`}
						className="rounded-xl border border-[var(--color-secondary)]/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-secondary)] transition-colors duration-300 hover:border-[var(--color-secondary)]"
					>
						Editar
					</Link>
					{isActionable && onCancel ? (
						<button
							type="button"
							onClick={() => onCancel(event.id)}
							className="rounded-xl border border-[var(--color-primary)]/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)] transition-colors duration-300 hover:border-[var(--color-primary)]"
						>
							Cancelar
						</button>
					) : null}
				</div>
			</div>
		</article>
	);
}
