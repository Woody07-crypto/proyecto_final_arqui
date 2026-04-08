"use client";

import { useRouter } from "next/navigation";

import { authStore } from "@/src/store/authStore";

export default function OrganizadorPage() {
  const router = useRouter();

  const handleLogout = () => {
    authStore.logout();
    router.push("/login");
  };

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="glass-bar mx-auto max-w-3xl rounded-3xl p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-white/55">Organizador</p>
        <h1 className="mt-3 text-3xl font-extrabold">Panel en construccion</h1>
        <p className="mt-3 text-white/70">
          La autenticacion ya esta conectada. En esta vista puedes continuar con la implementacion del
          dashboard del organizador.
        </p>
        <button
          className="focus-outline mt-8 rounded-2xl bg-[var(--accent-coral)] px-5 py-3 text-sm font-bold text-black"
          onClick={handleLogout}
          type="button"
        >
          Cerrar sesion
        </button>
      </div>
    </main>
  )
}
