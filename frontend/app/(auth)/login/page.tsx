"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { authStore, getPostLoginRoute, useAuthStore } from "@/src/store/authStore";
import { ApiClientError } from "@/src/types/user.types";

interface LoginFormState {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const initialFormState: LoginFormState = {
  email: "",
  password: "",
};

function validateForm(values: LoginFormState): LoginFormErrors {
  const nextErrors: LoginFormErrors = {};

  if (!values.email.trim()) {
    nextErrors.email = "Ingresa tu email";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    nextErrors.email = "Ingresa un email valido";
  }

  if (!values.password.trim()) {
    nextErrors.password = "Ingresa tu password";
  } else if (values.password.length < 6) {
    nextErrors.password = "La password debe tener al menos 6 caracteres";
  }

  return nextErrors;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuthStore((currentState) => currentState);

  const [formValues, setFormValues] = useState<LoginFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void authStore.hydrate();
  }, []);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (!emailFromQuery) {
      return;
    }

    setFormValues((prev) => ({ ...prev, email: emailFromQuery }));
  }, [searchParams]);

  useEffect(() => {
    if (auth.user?.role) {
      router.replace(getPostLoginRoute(auth.user.role));
    }
  }, [auth.user, router]);

  const canSubmit = useMemo(() => {
    return !isSubmitting && !auth.isLoading;
  }, [auth.isLoading, isSubmitting]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const clientErrors = validateForm(formValues);
    setFormErrors(clientErrors);

    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authStore.login({
        email: formValues.email.trim(),
        password: formValues.password,
      });

      const { user } = authStore.getState();

      if (user?.role) {
        router.replace(getPostLoginRoute(user.role));
      }
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormErrors({ general: error.message });
      } else {
        setFormErrors({ general: "No se pudo iniciar sesion. Intentalo nuevamente." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8 text-white md:px-6">
      <Image
        src="/assets/images/fondo%20login%20ultimo.jpg"
        alt="Fondo decorativo"
        fill
        priority
        className="scale-105 object-cover blur-[2px]"
      />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative w-full max-w-[28rem] rounded-2xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-sm transition-all duration-300 md:p-8">
        <div className="absolute left-[-4rem] top-[-4rem] h-36 w-36 rounded-full bg-[rgba(255,84,76,0.2)] blur-3xl" />

        <div className="relative">
          <div className="mb-6 flex items-center gap-5 text-left">
            <Image src="/assets/logo/logo_vinfinite.png" alt="Vinfinite" width={90} height={90} className="rounded-xl" />
            <div>
              <p className="text-[1.75rem] font-bold tracking-[0.06em]">VINFINITE</p>
              <p className="text-[0.95rem] text-white/75">Welcome back</p>
            </div>
          </div>

          <h1 className="text-[2rem] font-bold leading-tight">Sign in</h1>
          <h2 className="mt-2 text-[1rem] font-medium text-white/75">Bienvenido a tu panel de eventos</h2>

          {searchParams.get("registered") === "1" && (
            <div className="mt-5 rounded-xl border border-[var(--color-accent)]/80 bg-[var(--color-accent)]/10 px-4 py-3 text-[0.85rem] font-medium">
              Cuenta creada con exito. Ahora inicia sesion.
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <label className="block">
              <span className="mb-2 block text-[0.875rem] font-medium text-white/80">Email Address</span>
              <input
                className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-[0.95rem] text-white placeholder:text-white/45 outline-none transition-all duration-300 focus:border-[var(--color-accent)]"
                type="email"
                value={formValues.email}
                onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {formErrors.email && <p className="mt-2 text-[0.75rem] text-[var(--color-primary)]">{formErrors.email}</p>}
            </label>

            <label className="block">
              <span className="mb-2 block text-[0.875rem] font-medium text-white/80">Password</span>
              <input
                className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-[0.95rem] text-white placeholder:text-white/45 outline-none transition-all duration-300 focus:border-[var(--color-accent)]"
                type="password"
                value={formValues.password}
                onChange={(event) => setFormValues((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Minimo 6 caracteres"
                autoComplete="current-password"
              />
              {formErrors.password && <p className="mt-2 text-[0.75rem] text-[var(--color-primary)]">{formErrors.password}</p>}
            </label>

            {(formErrors.general || auth.error) && (
              <div className="rounded-xl border border-[var(--color-primary)]/80 bg-[var(--color-primary)]/10 px-4 py-3 text-[0.85rem]">
                {formErrors.general ?? auth.error}
              </div>
            )}

            <button
              className="h-12 w-full rounded-xl bg-[var(--color-primary)] text-[1rem] font-semibold text-black transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={!canSubmit}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-[0.9rem] text-white/75">
            No account yet?{" "}
            <Link className="font-semibold text-[var(--color-secondary)] underline underline-offset-2" href="/register">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

