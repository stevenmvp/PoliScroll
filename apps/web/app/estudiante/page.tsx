"use client";

import { ProtectedRoute } from "@/app/components/auth-gate";
import { RoleNav } from "@/app/components/role-nav";

const cards = [
  { title: "Reto de cálculo", type: "Matemáticas", progress: "72%" },
  { title: "Lógica rápida", type: "Pensamiento", progress: "48%" },
  { title: "Quiz de biología", type: "Ciencia", progress: "91%" },
];

export default function EstudiantePage() {
  return (
    <ProtectedRoute allowed={["estudiante"]}>
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-10 pt-6 text-white">
        <RoleNav />

        <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Panel estudiante</p>
          <h1 className="mt-3 text-3xl font-bold">Tu flujo de aprendizaje</h1>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="text-zinc-400">Racha</p>
            <p className="mt-3 text-3xl font-bold">12 días</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="text-zinc-400">Puntuación</p>
            <p className="mt-3 text-3xl font-bold">1.280</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="text-zinc-400">Nivel</p>
            <p className="mt-3 text-3xl font-bold">Bronce</p>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {cards.map((card) => (
            <div key={card.title} className="rounded-3xl border border-white/10 bg-zinc-900/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{card.type}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{card.title}</h2>
                </div>
                <span className="text-sm font-medium text-emerald-300">{card.progress}</span>
              </div>
              <div className="h-2.5 rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500" style={{ width: card.progress }} />
              </div>
            </div>
          ))}
        </section>
      </main>
    </ProtectedRoute>
  );
}
