"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authStore } from "@/src/store/authStore";

const NAV_ITEMS = [
	{ href: "/admin", label: "Dashboard", icon: "DB" },
	{ href: "/admin/eventos", label: "Eventos", icon: "EV" },
	{ href: "/admin/personas", label: "Personas", icon: "US" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const [isReady, setIsReady] = useState(false);

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

			if (user.role !== "ADMIN") {
				router.replace("/organizador");
				return;
			}

			setIsReady(true);
		};

		void initialize();

		return () => {
			isMounted = false;
		};
	}, [router]);

	if (!isReady) {
		return (
			<main className="min-h-screen bg-transparent px-4 py-8 text-white md:px-8">
				<div className="mx-auto h-96 w-full max-w-7xl animate-pulse rounded-3xl border border-white/20 bg-black/25 backdrop-blur-sm" />
			</main>
		);
	}

	return (
		<div className="min-h-screen bg-transparent text-white md:flex">
			<aside className="sticky top-[84px] z-20 border-b border-white/15 bg-white/5 px-4 py-4 backdrop-blur-sm md:h-[calc(100vh-84px)] md:w-72 md:border-b-0 md:border-r md:px-5 md:py-6">
				<div className="mb-5 flex items-center justify-between md:mb-8 md:block">
					<div>
						<p className="text-xs uppercase tracking-[0.22em] text-white/45">VINFINITE</p>
						<p className="mt-1 text-xl font-bold">Admin Console</p>
					</div>
					<button
						type="button"
						onClick={() => {
							authStore.logout();
							router.replace("/login");
						}}
						className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80 md:mt-6"
					>
						Salir
					</button>
				</div>

				<nav className="grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-1">
					{NAV_ITEMS.map((item) => {
						const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`relative rounded-xl border px-3 py-3 text-sm transition-colors duration-300 md:px-4 ${
									isActive
										? "border-white/20 bg-white/6 text-white"
										: "border-transparent text-white/70 hover:border-white/12 hover:text-white"
								}`}
							>
								{isActive ? <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-sm bg-[var(--color-secondary)]" /> : null}
								<div className="flex items-center gap-2">
									<span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/15 text-[10px] font-bold">
										{item.icon}
									</span>
									<span className="truncate">{item.label}</span>
								</div>
							</Link>
						);
					})}
				</nav>
			</aside>

			<section className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</section>
		</div>
	);
}
