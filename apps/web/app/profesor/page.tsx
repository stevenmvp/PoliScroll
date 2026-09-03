"use client";

import { ProtectedRoute } from "@/app/components/auth-gate";
import { RoleNav } from "@/app/components/role-nav";

const groups = [
  { name: "Cálculo I", students: 28, status: "Activo" },
  { name: "Lógica 2", students: 19, status: "Pendiente" },
  { name: "Química General", students: 34, status: "Activo" },
];

export default function ProfesorPage() {
  return (
    <ProtectedRoute allowed={["profesor"]}>
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-10 pt-6 text-white">
        <RoleNav />

        <div className="mb-6 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-violet-300">Panel profesor</p>
          <h1 className="mt-3 text-3xl font-bold">Gestión de actividades</h1>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="text-zinc-400">Actividades</p>
            <p className="mt-3 text-3xl font-bold">24</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="text-zinc-400">Grupos</p>
            <p className="mt-3 text-3xl font-bold">7</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="text-zinc-400">Sesiones hoy</p>
            <p className="mt-3 text-3xl font-bold">9</p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-zinc-900/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Grupos</h2>
            <button className="rounded-full bg-violet-500/20 px-3 py-1.5 text-xs text-violet-200">Nueva sesión</button>
          </div>

          <div className="space-y-3">
            {groups.map((group) => (
              <div key={group.name} className="flex items-center justify-between rounded-2xl bg-zinc-800/80 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{group.name}</p>
                  <p className="text-sm text-zinc-400">{group.students} estudiantes</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs ${group.status === "Activo" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                  {group.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
