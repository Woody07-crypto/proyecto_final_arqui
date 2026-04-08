"use client";

import { useEffect, useState } from "react";

import { StatsCard } from "@/src/components/admin/StatsCard";
import { adminService, type AdminStats } from "@/src/services/adminService";
import { eventService } from "@/src/services/eventService";
import { authStore } from "@/src/store/authStore";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [monthlyGrowth, setMonthlyGrowth] = useState<number[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      const token = authStore.getState().token;
      if (!token) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [statsResponse, events] = await Promise.all([
          adminService.getStats(token),
          eventService.getEvents(token),
        ]);

        if (!isMounted) {
          return;
        }

        setStats(statsResponse);

        const monthBuckets = Array.from({ length: 6 }, () => 0);
        const now = new Date();
        for (const event of events) {
          const createdAt = new Date(event.created_at);
          const diffMonths = (now.getFullYear() - createdAt.getFullYear()) * 12 + (now.getMonth() - createdAt.getMonth());
          if (diffMonths >= 0 && diffMonths < monthBuckets.length) {
            monthBuckets[monthBuckets.length - 1 - diffMonths] += 1;
          }
        }
        setMonthlyGrowth(monthBuckets);

        const distribution: Record<string, number> = {
          ACTIVO: 0,
          SOLD_OUT: 0,
          FINALIZADO: 0,
          CANCELADO: 0,
        };

        for (const event of events) {
          distribution[event.status] = (distribution[event.status] ?? 0) + 1;
        }
        setStatusDistribution(distribution);
      } catch (dashboardError) {
        if (!isMounted) {
          return;
        }
        const message = dashboardError instanceof Error ? dashboardError.message : "No se pudo cargar el dashboard";
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const safeStats: AdminStats = stats ?? { events: 0, users: 0, registrations: 0 };
  const maxGrowth = Math.max(...monthlyGrowth, 1);

    return (
      <main className="space-y-6">
        <header className="rounded-3xl border border-white/20 bg-black/25 p-6 backdrop-blur-md md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-white/45">Panel Admin / Estadisticas</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Vision general del sistema</h1>
        <p className="mt-3 max-w-3xl text-sm text-white/70 md:text-base">
          Monitorea crecimiento, salud operativa y actividad de eventos desde un solo panel global.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-[var(--color-primary)]/60 bg-[var(--color-primary)]/10 px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatsCard title="Total eventos" value={safeStats.events} icon="EV" accent="accent" />
        <StatsCard title="Total usuarios" value={safeStats.users} icon="US" accent="secondary" />
        <StatsCard title="Total inscripciones" value={safeStats.registrations} icon="RG" accent="warm" />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <article className="rounded-2xl border border-white/20 bg-black/25 p-5 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Crecimiento de eventos (ultimos 6 meses)</h2>
          <p className="mt-1 text-sm text-white/65">Placeholder visual usando color warm para tendencia.</p>
          {isLoading ? (
              <div className="mt-6 h-44 animate-pulse rounded-xl bg-black/20" />
          ) : (
              <div className="mt-6 flex h-44 items-end gap-3 rounded-xl border border-white/10 bg-black/20 px-4 pb-4 pt-6">
              {(monthlyGrowth.length ? monthlyGrowth : [0, 0, 0, 0, 0, 0]).map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className="w-full rounded-t-md bg-[var(--color-warm)]/75"
                    style={{ height: `${Math.max(8, (value / maxGrowth) * 120)}px` }}
                  />
                  <span className="text-[10px] text-white/55">M{index + 1}</span>
                </div>
              ))}
            </div>
          )}
        </article>

          <article className="rounded-2xl border border-white/20 bg-black/25 p-5 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Distribucion por estado</h2>
          <p className="mt-1 text-sm text-white/65">Lectura rapida de estado operativo de los eventos.</p>
          <div className="mt-6 space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.1em] text-white/65">
                  <span>{status.replace("_", " ")}</span>
                  <span className="text-white/85">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-[var(--color-warm)]"
                    style={{ width: `${safeStats.events > 0 ? (count / safeStats.events) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
