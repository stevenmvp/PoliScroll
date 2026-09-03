"use client";

import { ProtectedRoute } from "@/app/components/auth-gate";
import { RoleNav } from "@/app/components/role-nav";

const metrics = [
  { label: "Usuarios activos", value: "1.240" },
  { label: "Sesiones hoy", value: "64" },
  { label: "Costo IA", value: "$1.8K" },
  { label: "Uptime", value: "99.94%" },
];

export default function AdminPage() {
  return (
    <ProtectedRoute allowed={["admin"]}>
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-10 pt-6 text-white">
        <RoleNav />

        <div className="mb-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Panel administrador</p>
          <h1 className="mt-3 text-3xl font-bold">Control de plataforma</h1>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-white/10 bg-zinc-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{metric.label}</p>
              <p className="mt-3 text-2xl font-bold text-white">{metric.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-5">
            <h2 className="mb-4 text-lg font-semibold">Gestión de usuarios</h2>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-center justify-between rounded-2xl bg-zinc-800/80 px-3 py-2"><span>Docentes activos</span><span className="text-cyan-300">88</span></li>
              <li className="flex items-center justify-between rounded-2xl bg-zinc-800/80 px-3 py-2"><span>Estudiantes activos</span><span className="text-cyan-300">1,152</span></li>
              <li className="flex items-center justify-between rounded-2xl bg-zinc-800/80 px-3 py-2"><span>Sesiones en vivo</span><span className="text-cyan-300">12</span></li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-5">
            <h2 className="mb-4 text-lg font-semibold">Configuración global</h2>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="rounded-2xl bg-zinc-800/80 px-3 py-2">Cognito: activo y validado</li>
              <li className="rounded-2xl bg-zinc-800/80 px-3 py-2">Rate limiting: habilitado</li>
              <li className="rounded-2xl bg-zinc-800/80 px-3 py-2">Roles sincronizados con backend</li>
            </ul>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
