"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { authStore, useAuthStore } from "@/src/store/authStore";
import { ApiClientError } from "@/src/types/user.types";

interface RegisterFormState {
  name: string;
  email: string;
  password: string;
}

interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

const initialFormState: RegisterFormState = {
  name: "",
  email: "",
  password: "",
};

function validateForm(values: RegisterFormState): RegisterFormErrors {
  const nextErrors: RegisterFormErrors = {};

  const trimmedName = values.name.trim();
  if (!trimmedName) {
    nextErrors.name = "Ingresa tu nombre";
  } else if (trimmedName.length < 2 || trimmedName.length > 100) {
    nextErrors.name = "El nombre debe tener entre 2 y 100 caracteres";
  }

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

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuthStore((currentState) => currentState);

  const [formValues, setFormValues] = useState<RegisterFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await authStore.register({
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
      });

      router.push(`/login?registered=1&email=${encodeURIComponent(formValues.email.trim())}`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        const fieldErrors = error.fieldErrors;
        setFormErrors({
          name: fieldErrors?.name?.[0],
          email: fieldErrors?.email?.[0],
          password: fieldErrors?.password?.[0],
          general: error.message,
        });
      } else {
        setFormErrors({ general: "No se pudo crear la cuenta. Intentalo nuevamente." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8 text-white md:px-6">
      <Image
        src="/assets/images/fondo_login.jpeg"
        alt="Fondo decorativo"
        fill
        priority
        className="object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative w-full max-w-[30rem] rounded-2xl border border-white/10 bg-[#111111]/95 p-6 shadow-2xl transition-all duration-300 md:p-8">
        <div className="absolute left-[-4rem] top-[-4rem] h-36 w-36 rounded-full bg-[rgba(42,176,163,0.2)] blur-3xl" />

        <div className="relative">
          <div className="mb-6 flex items-center gap-5 text-left">
            <Image src="/assets/logo/logo_vinfinite.png" alt="Vinfinite" width={90} height={90} className="rounded-xl" />
            <div>
              <p className="text-[1.75rem] font-bold tracking-[0.06em]">VINFINITE</p>
              <p className="text-[0.95rem] text-white/75">Welcome to your event journey</p>
            </div>
          </div>

          <h1 className="text-[2rem] font-bold leading-tight">Sign up</h1>
          <h2 className="mt-2 text-[1rem] font-medium text-white/75">Crea tu cuenta y empieza a organizar</h2>

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <label className="block">
              <span className="mb-2 block text-[0.875rem] font-medium text-white/80">Username</span>
              <input
                className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-[0.95rem] text-white placeholder:text-white/45 outline-none transition-all duration-300 focus:border-[var(--color-accent)]"
                type="text"
                value={formValues.name}
                onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Tu nombre de usuario"
                autoComplete="name"
              />
              {formErrors.name && <p className="mt-2 text-[0.75rem] text-[var(--color-primary)]">{formErrors.name}</p>}
            </label>

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
                autoComplete="new-password"
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
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-[0.9rem] text-white/75">
            Already have an account?{" "}
            <Link className="font-semibold text-[var(--color-secondary)] underline underline-offset-2" href="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

