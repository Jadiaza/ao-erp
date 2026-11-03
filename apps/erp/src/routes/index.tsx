import { createFileRoute } from "@tanstack/react-router";
import {
  Users, Wine, FileText, UsersRound, ChevronRight, Wallet, ArrowUp, Coins,
} from "lucide-react";
import { DemoNotice } from "@/components/modules";
import { accountingEntities, treasuryPeriodSummaryDemo } from "@/data/economy-demo";
import { documentRequests, parishioners, sacramentalEntries, sacramentalRequests } from "@/data/community-demo";
import { parishDemo } from "@/data/parish-demo";
import { institutionalEvents } from "@/data/institutional-demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — A&O ERP" },
      { name: "description", content: "Panel de gestión eclesial: comunidad, sacramentos, pastoral y finanzas de tu parroquia." },
      { property: "og:title", content: "Dashboard — A&O ERP" },
      { property: "og:description", content: "Panel de gestión eclesial: comunidad, sacramentos, pastoral y finanzas de tu parroquia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const stats = [
  { icon: Users, value: String(parishioners.length), label: "Feligreses de muestra", tile: "bg-tile-blue", ic: "text-chart-1" },
  { icon: UsersRound, value: String(new Set(parishioners.map((person) => person.familyId)).size), label: "Familias de muestra", tile: "bg-tile-green", ic: "text-success" },
  { icon: Wine, value: String(sacramentalEntries.length), label: "Referencias documentales demo", tile: "bg-tile-gold", ic: "text-warning" },
  { icon: FileText, value: String([...documentRequests, ...sacramentalRequests].filter((request) => request.status === "pending").length), label: "Solicitudes pendientes · demo", tile: "bg-tile-violet", ic: "text-chart-4" },
];

const events = institutionalEvents.slice(0, 3);
const periodNet = treasuryPeriodSummaryDemo.income - treasuryPeriodSummaryDemo.expense;

const tasks = [
  ["Revisar resumen demostrativo de tesorer?a", "Hoy", "text-destructive"],
  ["Completar una secci?n del informe anual parroquial", "En 3 d?as", "text-warning"],
  ["Revisar actividad parroquial de muestra", "En 5 d?as", "text-muted-foreground"],
];

function Index() {
  return (
        <main className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
          <section className="relative overflow-hidden rounded-2xl border bg-card p-8">
            <img src="/favicon.png" alt="Emblema de A&O ERP" className="absolute right-6 top-1/2 hidden h-20 w-20 -translate-y-1/2 rounded-xl object-cover shadow-sm sm:block" />
            <h1 className="text-[28px] font-bold tracking-tight md:text-[30px]">Dashboard</h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              Que este sea un instrumento para servir mejor a tu comunidad y a la misión de la Iglesia.
            </p>
            <div className="mt-4 h-1 w-16 rounded-full bg-accent" />
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{parishDemo.officialName}</h2>
                <p className="text-muted-foreground">{parishDemo.jurisdictionName}</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-success">
                  <span className="h-2 w-2 rounded-full bg-success" /> En línea
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map(({ icon: Icon, value, label, tile, ic }) => (
                <div key={label} className={`rounded-xl border p-4 ${tile}`}>
                  <Icon className={`h-6 w-6 ${ic}`} />
                  <div className="mt-3 text-2xl font-bold">{value}</div>
                  <div className="text-sm">{label}</div>
                </div>
              ))}
            </div>
          </section>

          <DemoNotice>{parishDemo.demoLabel}. La relación jurisdiccional y las cifras de esta vista son ilustrativas; no representan acceso diocesano ni registros oficiales.</DemoNotice>

          <section className="rounded-2xl border bg-card p-6">
            <Heading title="Próximas actividades" link="Ver todas" />
            <div className="divide-y">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-4 py-3">
                  <div className="w-14 rounded-lg bg-secondary py-1 text-center">
                    <div className="text-lg font-bold">{event.date.split(" ")[0]}</div>
                    <div className="text-xs">{event.date.split(" ")[1]?.replace(".", "")}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-sm text-muted-foreground">{event.time} · {event.place}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <Heading title="Resumen financiero" link="Ver detalle" />
            <div className="grid gap-4 md:grid-cols-3">
              <Money icon={Coins} label="Ingresos de octubre · demo" value={currency(treasuryPeriodSummaryDemo.income)} />
              <Money icon={FileText} label="Egresos de octubre · demo" value={currency(treasuryPeriodSummaryDemo.expense)} />
              <Money icon={Wallet} label="Neto ingresos − egresos" value={currency(periodNet)} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Saldo ilustrativo en cuentas: {currency(treasuryPeriodSummaryDemo.available)} · Entidad: {accountingEntities[0]?.name}</p>
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <Heading title="Tareas pendientes" link="Ver todas" />
            <div className="divide-y">
              {tasks.map(([t, w, c]) => (
                <label key={t} className="flex items-center gap-3 py-3 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-primary" />
                  <span className="flex-1">{t}</span>
                  <span className={`text-xs font-medium ${c}`}>{w}</span>
                </label>
              ))}
            </div>
          </section>
        </main>
  );
}

function currency(amount: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);
}

function Heading({ title, link }: { title: string; link: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-bold">{title}</h2>
      <button className="text-sm font-medium text-ring hover:underline">{link}</button>
    </div>
  );
}

function Money({ icon: Icon, label, value, delta }: { icon: typeof Coins; label: string; value: string; delta?: string }) {
  return (
    <div className="flex gap-3 rounded-xl border p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-bold">{value}</div>
        {delta && (
          <div className="flex items-center gap-1 text-xs text-success">
            <ArrowUp className="h-3 w-3" /> {delta}
          </div>
        )}
      </div>
    </div>
  );
}
