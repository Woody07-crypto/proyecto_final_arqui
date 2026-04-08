import type { User, UserRole } from "@/src/types/user.types";

interface UserTableProps {
	users: User[];
}

function roleBadge(role: UserRole) {
	if (role === "ADMIN") {
		return "border-[rgba(255,228,88,0.35)] bg-[rgba(255,228,88,0.1)] text-[var(--color-secondary)]";
	}

	return "border-[rgba(42,176,163,0.35)] bg-[rgba(42,176,163,0.1)] text-[var(--color-accent)]";
}

function formatDate(dateInput: string): string {
	return new Intl.DateTimeFormat("es-PE", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(dateInput));
}

export function UserTable({ users }: UserTableProps) {
	if (users.length === 0) {
		return <p className="py-8 text-center text-sm text-[#555555]">No hay usuarios para mostrar con este filtro.</p>;
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full border-collapse text-left text-sm">
				<thead>
					<tr className="border-b border-white/10 text-white/60">
						<th className="px-3 py-3 font-medium">Nombre</th>
						<th className="px-3 py-3 font-medium">Email</th>
						<th className="px-3 py-3 font-medium">Rol</th>
						<th className="px-3 py-3 font-medium">Fecha registro</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.id} className="border-b border-white/6 text-white/90">
							<td className="px-3 py-3">{user.name}</td>
							<td className="px-3 py-3">{user.email}</td>
							<td className="px-3 py-3">
								<span className={`rounded-full border px-2 py-1 text-xs font-semibold ${roleBadge(user.role)}`}>
									{user.role}
								</span>
							</td>
							<td className="px-3 py-3">{formatDate(user.created_at)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
