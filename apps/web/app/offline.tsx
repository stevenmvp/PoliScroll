export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-center shadow-xl shadow-amber-950/20">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Sin conexión</p>
        <h1 className="mt-4 text-2xl font-bold">Tu contenido sigue disponible</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-200">
          Tu perfil, progreso y actividades guardadas siguen disponibles localmente. Cuando la conexión vuelva, la app sincronizará automáticamente.
        </p>
      </div>
    </main>
  );
}
