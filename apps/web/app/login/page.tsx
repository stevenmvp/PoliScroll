"use client";

import { useState } from "react";
import { saveSession, type Role } from "@/app/lib/auth";

const roles: Role[] = ["admin", "profesor", "estudiante"];

export default function LoginPage() {
  const [role, setRole] = useState<Role>("estudiante");
  const [name, setName] = useState("Ana García");
  const [email, setEmail] = useState("ana@poliscroll.app");

  const handleLogin = () => {
    saveSession({
      isAuthenticated: true,
      role,
      name,
      email,
    });

    window.location.href = `/${role}`;
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center bg-zinc-950 px-4 py-10 text-white">
      <div className="w-full rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Cognito access</p>
        <h1 className="mt-3 text-3xl font-bold">Inicia sesión</h1>
        <p className="mt-2 text-sm text-zinc-300">La app solo mostrará módulos cuando el usuario esté autenticado y validado.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-400">Nombre</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-900/70 px-3 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-400">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-900/70 px-3 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-400">Rol</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-900/70 px-3 py-3 outline-none"
            >
              {roles.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogin}
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-400"
          >
            Acceder con Cognito
          </button>
        </div>
      </div>
    </main>
  );
}
