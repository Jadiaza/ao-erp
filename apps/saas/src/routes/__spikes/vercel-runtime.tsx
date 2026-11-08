import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { runVercelRuntimeProbe } from "@/server/spikes/vercel-runtime";

export const Route = createFileRoute("/__spikes/vercel-runtime")({
  component: VercelRuntimeSpikePage,
});

type ProbeResult = Awaited<ReturnType<typeof runVercelRuntimeProbe>>;

function VercelRuntimeSpikePage() {
  const [result, setResult] = useState<ProbeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function executeProbe() {
    setLoading(true);
    setError(null);

    try {
      const response = await runVercelRuntimeProbe();
      setResult(response);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible ejecutar la prueba.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          A&amp;O SaaS · Spike técnico 010
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Validación de ejecución server-side
        </h1>
        <p className="text-sm text-slate-600">
          Prueba temporal de TanStack Start. No autentica usuarios, no consulta
          datos de negocio y no reemplaza la validación de despliegue en Vercel.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Pruebas incluidas</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>Ejecución de una server function mediante POST.</li>
          <li>Lectura de cookie en la siguiente solicitud.</li>
          <li>Escritura de cookie HttpOnly, SameSite=Lax y Secure en producción.</li>
          <li>Lectura server-side de AO_SAAS_SPIKE_SECRET sin devolver su valor.</li>
          <li>Respuesta marcada como no-store.</li>
        </ul>

        <button
          type="button"
          onClick={executeProbe}
          disabled={loading}
          className="mt-5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Ejecutando..." : "Ejecutar prueba"}
        </button>
        <p className="mt-2 text-xs text-slate-500">
          Ejecuta el botón dos veces: la segunda solicitud debe recibir la cookie
          escrita por la primera.
        </p>
      </section>

      {error && (
        <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </section>
      )}

      {result && (
        <section className="rounded-xl border border-slate-200 bg-slate-950 p-5 text-slate-100">
          <h2 className="mb-3 font-semibold">Resultado devuelto por el servidor</h2>
          <pre className="overflow-x-auto text-xs leading-6">
            {JSON.stringify(result, null, 2)}
          </pre>
          <p className="mt-4 text-xs text-slate-400">
            cookieReceived debe pasar a true en la segunda ejecución. provider
            solo será vercel cuando la función se ejecute dentro de Vercel.
          </p>
        </section>
      )}
    </main>
  );
}
