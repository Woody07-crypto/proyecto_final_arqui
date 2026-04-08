"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EventList } from "@/src/components/events/EventList";
import { attendeeService } from "@/src/services/attendeeService";
import { eventService } from "@/src/services/eventService";
import { authStore } from "@/src/store/authStore";
import type { Event } from "@/src/types/event.types";

function sortByDate(events: Event[]) {
  return [...events].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
}

export default function OrganizadorPage() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [countsByEventId, setCountsByEventId] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const active = events.filter((event) => event.status === "ACTIVO").length;
    const soldOut = events.filter((event) => event.status === "SOLD_OUT").length;
    const totalAttendees = Object.values(countsByEventId).reduce((acc, value) => acc + value, 0);
    return { active, soldOut, totalAttendees };
  }, [countsByEventId, events]);

  const loadEvents = useCallback(async () => {
    const token = authStore.getState().token;
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedEvents = sortByDate(await eventService.getEvents(token));
      setEvents(fetchedEvents);

      const registrationResults = await Promise.allSettled(
        fetchedEvents.map(async (event) => {
          const registrations = await attendeeService.getEventAttendees(event.id, token);
          return { eventId: event.id, count: registrations.length };
        }),
      );

      const counts: Record<number, number> = {};
      for (const item of registrationResults) {
        if (item.status === "fulfilled") {
          counts[item.value.eventId] = item.value.count;
        }
      }

      setCountsByEventId(counts);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "No se pudieron cargar los eventos";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

      await loadEvents();
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [loadEvents, router]);

  const handleLogout = () => {
    authStore.logout();
    router.replace("/login");
  };

  const handleCancelEvent = async (eventId: number) => {
    const token = authStore.getState().token;
    if (!token) {
      return;
    }

    const shouldCancel = window.confirm("Esta accion cambiara el estado del evento a CANCELADO. Deseas continuar?");
    if (!shouldCancel) {
      return;
    }

    setIsCanceling(eventId);
    setError(null);

    try {
      const updated = await eventService.cancelEvent(eventId, token);
      setEvents((prev) => prev.map((event) => (event.id === eventId ? updated : event)));
    } catch (cancelError) {
      const message = cancelError instanceof Error ? cancelError.message : "No se pudo cancelar el evento";
      setError(message);
    } finally {
      setIsCanceling(null);
    }
  };

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 text-white md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/20 bg-black/25 p-6 backdrop-blur-md md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/55">Panel privado organizador</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">Mis eventos</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
                Crea, edita y controla tus eventos desde un solo lugar con una vista clara de asistentes y estados.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/organizador/eventos/nuevo"
                className="rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-black transition-all duration-300 hover:brightness-110"
              >
                Crear evento
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white/90 transition-colors duration-300 hover:border-white/45"
              >
                Cerrar sesion
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-white/55">Eventos activos</p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-accent)]">{summary.active}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-white/55">Eventos sold out</p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-secondary)]">{summary.soldOut}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-white/55">Asistentes registrados</p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-warm)]">{summary.totalAttendees}</p>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-[var(--color-primary)]/70 bg-[var(--color-primary)]/10 px-4 py-3 text-sm text-white">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl border border-white/20 bg-black/25 backdrop-blur-sm" />
            ))}
          </div>
        ) : (
          <EventList
            events={events}
            countsByEventId={countsByEventId}
            onCancelEvent={isCanceling ? undefined : handleCancelEvent}
          />
        )}
      </div>
    </main>
  );
}
