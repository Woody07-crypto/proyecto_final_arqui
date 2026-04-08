interface StatsCardProps {
	title: string;
	value: number;
	icon: string;
	accent: "primary" | "accent" | "warm" | "secondary";
}

const ACCENT_STYLES: Record<StatsCardProps["accent"], string> = {
	primary: "text-[var(--color-primary)] border-[var(--color-primary)]/30 bg-[linear-gradient(140deg,rgba(255,84,76,0.16),rgba(17,17,17,0.95))]",
	accent: "text-[var(--color-accent)] border-[var(--color-accent)]/30 bg-[linear-gradient(140deg,rgba(42,176,163,0.16),rgba(17,17,17,0.95))]",
	warm: "text-[var(--color-warm)] border-[var(--color-warm)]/30 bg-[linear-gradient(140deg,rgba(254,154,52,0.14),rgba(17,17,17,0.95))]",
	secondary: "text-[var(--color-secondary)] border-[var(--color-secondary)]/30 bg-[linear-gradient(140deg,rgba(255,228,88,0.12),rgba(17,17,17,0.95))]",
};

export function StatsCard({ title, value, icon, accent }: StatsCardProps) {
	return (
		<article className={`rounded-2xl border p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] ${ACCENT_STYLES[accent]}`}>
			<div className="flex items-center justify-between">
				<p className="text-xs uppercase tracking-[0.14em] text-white/70">{title}</p>
				<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-current/40 text-xs font-bold">
					{icon}
				</span>
			</div>
			<p className="mt-4 text-4xl font-bold text-white md:text-5xl">{value}</p>
		</article>
	);
}
