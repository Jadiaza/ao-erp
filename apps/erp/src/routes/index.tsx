import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Wine,
  FileText,
  UsersRound,
  ChevronRight,
  Wallet,
  ArrowUp,
  Coins,
  CalendarDays,
  HeartHandshake,
} from "lucide-react";
import { DemoNotice } from "@/components/modules";
import {
  accountingEntities,
  christianAccountingEntities,
  christianTreasuryAccounts,
  christianTreasuryMovements,
  treasuryPeriodSummaryDemo,
} from "@/data/economy-demo";
import {
  christianMembers,
  documentRequests,
  parishioners,
  sacramentalEntries,
  sacramentalRequests,
} from "@/data/community-demo";
import { parishDemo } from "@/data/parish-demo";
import { christianEvents, institutionalEvents } from "@/data/institutional-demo";
import { christianGroups } from "@/data/pastoral-demo";
import { useLocalCollection } from "@/data/local-repository";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { getProfileStorageKey, isChristianProfile } from "@/lib/ao-cristiano-profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — A&O ERP" },
      { name: "description", content: "Panel de gestión eclesial y congregacional en A&O ERP." },
      { property: "og:title", content: "Dashboard — A&O ERP" },
      { property: "og:description", content: "Panel de gestión eclesial y congregacional en A&O ERP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const catholicStats = [
  { icon: Users, value: String(parishioners.length), label: "Feligreses de muestra", tile: "bg-tile-blue", ic: "text-chart-1" },
  { icon: UsersRound, value: String(new Set(parishioners.map((person) => person.familyId)).size), label: "Familias de muestra", tile: "bg-tile-green", ic: "text-success" },
  { icon: Wine, value: String(sacramentalEntries.length), label: "Referencias documentales demo", tile: "bg-tile-gold", ic: "text-warning" },
  { icon: FileText, value: String([...documentRequests, ...sacramentalRequests].filter((request) => request.status === "pending").length), label: "Solicitudes pendientes · demo", tile: "bg-tile-violet", ic: "text-chart-4" },
];

const catholicTasks = [
  ["Revisar resumen demostrativo de tesorería", "Hoy", "text-destructive"],
  ["Completar una sección del informe anual parroquial", "En 3 días", "text-warning"],
  ["Revisar actividad parroquial de muestra", "En 5 días", "text-muted-foreground"],
];

const christianTasks = [
  ["Revisar ingresos por diezmos y ofrendas · demo", "Hoy", "text-destructive"],
  ["Confirmar equipos de servicio para culto dominical", "En 3 días", "text-warning"],
  ["Dar seguimiento a nuevos visitantes de la semana", "En 5 días", "text-muted-foreground"],
];

export function Index() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);
  const terms = settings.terminology;

  const { records: memberRecords } = useLocalCollection(
    getProfileStorageKey("ao-erp:community:parishioners", settings.profile),
    christian ? christianMembers : parishioners,
  );
  const { records: groupRecords } = useLocalCollection(
    getProfileStorageKey("ao-erp:pastoral:groups", settings.profile),
    christian ? christianGroups : [],
  );
  const { records: eventRecords } = useLocalCollection(
    getProfileStorageKey("ao-erp:agenda:events", settings.profile),
    christian ? christianEvents : institutionalEvents,
  );
  const { records: treasuryRecords } = useLocalCollection(
    getProfileStorageKey("ao-erp:treasury:movements", settings.profile),
    christian ? christianTreasuryMovements : [],
  );

  const scopedMembers = memberRecords.filter(
    (m) => !m.organizationId || m.organizationId === settings.organizationId,
  );
  const scopedGroups = groupRecords.filter(
    (g) => !g.organizationId || g.organizationId === settings.organizationId,
  );
  const scopedEvents = eventRecords.filter(
    (e) => !e.organizationId || e.organizationId === settings.organizationId,
  );
  const scopedTreasury = treasuryRecords.filter(
    (t) => !t.organizationId || t.organizationId === settings.organizationId,
  );

  const christianStats = [
    {
      icon: Users,
      value: String(scopedMembers.length),
      label: `${terms.membersLabel} y visitantes`,
      tile: "bg-tile-blue",
      ic: "text-chart-1",
    },
    {
      icon: UsersRound,
      value: String(new Set(scopedMembers.map((person) => person.familyId)).size),
      label: "Familias registradas",
      tile: "bg-tile-green",
      ic: "text-success",
    },
    {
      icon: HeartHandshake,
      value: String(scopedGroups.length),
      label: "Ministerios y células",
      tile: "bg-tile-gold",
      ic: "text-warning",
    },
    {
      icon: CalendarDays,
      value: String(scopedEvents.length),
      label: `${terms.celebrationsLabel} programados`,
      tile: "bg-tile-violet",
      ic: "text-chart-4",
    },
  ];

  const stats = christian ? christianStats : catholicStats;
  const events = (christian ? scopedEvents : institutionalEvents).slice(0, 3);
  const tasks = christian ? christianTasks : catholicTasks;

  const christianIncome = scopedTreasury
    .filter((m) => m.direction === "Ingreso")
    .reduce((sum, m) => sum + m.amount, 0);
  const christianExpense = scopedTreasury
    .filter((m) => m.direction === "Egreso")
    .reduce((sum, m) => sum + m.amount, 0);
  const christianAvailable = christianTreasuryAccounts.reduce((sum, a) => sum + a.balance, 0);

  const income = christian ? christianIncome : treasuryPeriodSummaryDemo.income;
  const expense = christian ? christianExpense : treasuryPeriodSummaryDemo.expense;
  const periodNet = income - expense;
  const available = christian ? christianAvailable : treasuryPeriodSummaryDemo.available;
  const entityName = christian
    ? (christianAccountingEntities[0]?.name ?? `${terms.institutionLabel} · ${settings.organizationId}`)
    : accountingEntities[0]?.name;

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="relative overflow-hidden rounded-2xl border bg-card p-8">
        <img
          src="/favicon.png"
          alt="Emblema de A&O ERP"
          className="absolute right-6 top-1/2 hidden h-20 w-20 -translate-y-1/2 rounded-xl object-cover shadow-sm sm:block"
        />
        <h1 className="text-[28px] font-bold tracking-tight md:text-[30px]">Dashboard</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          {christian
            ? "Instrumento para servir a tu congregación: miembros, ministerios, cultos, finanzas y gestión administrativa."
            : "Que este sea un instrumento para servir mejor a tu comunidad y a la misión de la Iglesia."}
        </p>
        <div className="mt-4 h-1 w-16 rounded-full bg-accent" />
      </section>

      <section className="rounded-2xl border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {christian
                ? `${terms.institutionLabel} · ${settings.organizationId}`
                : parishDemo.officialName}
            </h2>
            <p className="text-muted-foreground">
              {christian
                ? `Paquete ${settings.profile === "combinado" ? "Cristiano + Católico" : "A&O Cristiano"} · ${settings.campusId}`
                : parishDemo.jurisdictionName}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-success">
              <span className="h-2 w-2 rounded-full bg-success" /> En línea · demostración local
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

      <DemoNotice>
        {christian
          ? `Vista congregacional demostrativa (${settings.organizationId} / ${settings.campusId}). Los datos confidenciales de acompañamiento pastoral no se exponen en el Dashboard general.`
          : `${parishDemo.demoLabel}. La relación jurisdiccional y las cifras de esta vista son ilustrativas; no representan acceso diocesano ni registros oficiales.`}
      </DemoNotice>

      <section className="rounded-2xl border bg-card p-6">
        <Heading title={christian ? `Próximos ${terms.celebrationsLabel.toLowerCase()}` : "Próximas actividades"} link="Ver todas" />
        <div className="divide-y">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 py-3">
              <div className="w-14 rounded-lg bg-secondary py-1 text-center">
                <div className="text-lg font-bold">{event.date.split(" ")[0]}</div>
                <div className="text-xs">{event.date.split(" ")[1]?.replace(".", "")}</div>
              </div>
              <div className="flex-1">
                <div className="font-semibold">{event.title}</div>
                <div className="text-sm text-muted-foreground">
                  {event.time} · {event.place}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6">
        <Heading title="Resumen financiero" link="Ver detalle" />
        <div className="grid gap-4 md:grid-cols-3">
          <Money icon={Coins} label="Ingresos de octubre · demo" value={currency(income)} />
          <Money icon={FileText} label="Egresos de octubre · demo" value={currency(expense)} />
          <Money icon={Wallet} label="Neto ingresos − egresos" value={currency(periodNet)} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Saldo ilustrativo en cuentas: {currency(available)} · Entidad: {entityName}
        </p>
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

function Heading({ title, link }: { title: string; link: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-bold">{title}</h2>
      <span className="text-sm font-medium text-primary">{link}</span>
    </div>
  );
}

function Money({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-secondary/40 p-4">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowUp className="h-3.5 w-3.5 text-success" />
        {label}
      </div>
    </div>
  );
}

const currency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
