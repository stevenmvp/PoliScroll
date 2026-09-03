"use client";

import { useEffect, useState } from "react";
import { clearSession, getStoredSession, type Role } from "@/app/lib/auth";

export function ProtectedRoute({
  allowed,
  children,
}: {
  allowed: Role[];
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    const allowedAccess = session.isAuthenticated && session.role && allowed.includes(session.role);
    setAuthorized(Boolean(allowedAccess));
    setReady(true);
  }, [allowed]);

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 text-center text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">Validando sesión…</div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 text-center text-white">
        <div className="w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-300">Acceso restringido</p>
          <h1 className="mt-4 text-2xl font-bold">Debes iniciar sesión con una cuenta válida</h1>
          <p className="mt-3 text-sm text-zinc-200">
            Esta sección solo está disponible para usuarios autenticados con Cognito y un rol autorizado.
          </p>
          <button
            className="mt-5 w-full rounded-2xl bg-white px-4 py-3 font-semibold text-zinc-900"
            onClick={() => {
              clearSession();
              window.location.href = "/";
            }}
          >
            Volver a inicio
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
