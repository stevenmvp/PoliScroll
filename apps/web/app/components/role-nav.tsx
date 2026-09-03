"use client";

import Link from "next/link";
import { clearSession, getStoredSession, type Role } from "@/app/lib/auth";

const routes: Record<Role, { label: string; href: string }> = {
  admin: { label: "Administración", href: "/admin" },
  profesor: { label: "Profesor", href: "/profesor" },
  estudiante: { label: "Estudiante", href: "/estudiante" },
};

export function RoleNav() {
  const session = getStoredSession();
  const currentRole = session.role;

  if (!session.isAuthenticated || !currentRole) return null;

  return (
    <nav className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">
      <div className="flex gap-2">
        {Object.entries(routes).map(([role, item]) => (
          <Link
            key={role}
            href={item.href}
            className={`rounded-full px-3 py-1.5 ${currentRole === role ? "bg-cyan-500/20 text-cyan-200" : "bg-zinc-900/60 text-zinc-300"}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <button
        onClick={() => {
          clearSession();
          window.location.href = "/";
        }}
        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-200"
      >
        Cerrar sesión
      </button>
    </nav>
  );
}
