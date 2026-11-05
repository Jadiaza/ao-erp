import { useMemo, useState } from "react";
import { IntegratedWorkflowPanel } from "@/components/modules/integrated-workflow-panel";
import { BookCheck, BookOpen, Calculator, FileSpreadsheet, Landmark, Scale } from "lucide-react";
import { DataTable, type DataTableColumn, DemoNotice, DetailDrawer, InfoItem, ModuleLayout, StatCard, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { accountingAccounts, accountingEntities, journalEntries } from "@/data/economy-demo";

const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Math.abs(value));

export function AccountingScreen() {
  const [entity, setEntity] = useState(accountingEntities[0]?.id ?? "");
  const [tab, setTab] = useState("chart");
  const [selected, setSelected] = useState<(typeof journalEntries)[number] | null>(null);
  const currentEntity = accountingEntities.find((item) => item.id === entity) ?? accountingEntities[0]!;
  const accounts = useMemo(() => accountingAccounts.filter((item) => item.entityId === entity), [entity]);
  const journal = useMemo(() => journalEntries.filter((item) => item.entityId === entity), [entity]);
  const financialPosition = [
    { label: "Activos", value: accountingAccounts.find((account) => account.code === "1")?.balance ?? 0 },
    { label: "Pasivos", value: Math.abs(accountingAccounts.find((account) => account.code === "2")?.balance ?? 0) },
    { label: "Patrimonio institucional", value: Math.abs(accountingAccounts.find((account) => account.code === "3")?.balance ?? 0) },
  ];
  const activityStatement = [
    { label: "Ingresos acumulados ? demo", value: Math.abs(accountingAccounts.find((account) => account.code === "4")?.balance ?? 0) },
    { label: "Gastos acumulados ? demo", value: accountingAccounts.find((account) => account.code === "5")?.balance ?? 0 },
    { label: "Excedente acumulado ? demo", value: Math.abs(accountingAccounts.find((account) => account.code === "4")?.balance ?? 0) - (accountingAccounts.find((account) => account.code === "5")?.balance ?? 0) },
  ];
  const periodDebits = journal.reduce((total, entry) => total + entry.debit, 0);
  const periodCredits = journal.reduce((total, entry) => total + entry.credit, 0);
  const accountColumns: DataTableColumn<(typeof accountingAccounts)[number]>[] = [
    { id: "code", header: "Código", cell: (row) => <span className="font-mono font-semibold tabular-nums">{row.code}</span> },
    { id: "name", header: "Cuenta jerárquica", cell: (row) => <div style={{ paddingLeft: `${Math.max(0, row.code.length - 1) * 14}px` }}><p className={`font-medium ${row.type === "Clase" ? "text-primary" : ""}`}>{row.name}</p><p className="text-[10px] text-muted-foreground">{row.type}{row.parent ? ` · depende de ${row.parent}` : ""}</p></div> },
    { id: "dimension", header: "Dimensión", cell: (row) => row.dimension },
    { id: "debit", header: "Débito", cell: (row) => <span className="font-mono tabular-nums">{money(row.debit)}</span> },
    { id: "credit", header: "Crédito", cell: (row) => <span className="font-mono tabular-nums">{money(row.credit)}</span> },
    { id: "balance", header: "Saldo de muestra", cell: (row) => <span className="font-mono font-semibold tabular-nums">{row.balance < 0 ? "−" : ""}{money(row.balance)}</span> },
  ];
  const journalColumns: DataTableColumn<(typeof journalEntries)[number]>[] = [
    { id: "date", header: "Fecha / periodo", cell: (row) => <div>{row.date}<p className="text-xs text-muted-foreground">{row.period}</p></div> },
    { id: "voucher", header: "Comprobante", cell: (row) => <span className="font-mono font-semibold">{row.id}</span> },
    { id: "description", header: "Concepto", cell: (row) => row.description },
    { id: "account", header: "Cuenta", cell: (row) => row.account },
    { id: "debit", header: "Débito", cell: (row) => <span className="font-mono tabular-nums">{row.debit ? money(row.debit) : "—"}</span> },
    { id: "credit", header: "Crédito", cell: (row) => <span className="font-mono tabular-nums">{row.credit ? money(row.credit) : "—"}</span> },
    { id: "dimension", header: "Dimensión", cell: (row) => row.dimension },
  ];

  return <ModuleLayout breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Finanzas y recursos" }, { label: "Contabilidad" }]} title="Contabilidad" width="wide" description="Catálogo configurable, comprobantes y estados demostrativos por entidad contable." actions={<div className="flex items-center gap-2 rounded-lg border bg-card p-1.5"><Landmark className="ml-1 size-4 text-primary" /><Select value={entity} onValueChange={setEntity}><SelectTrigger className="w-64 border-0 shadow-none"><SelectValue /></SelectTrigger><SelectContent>{accountingEntities.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>} stats={<><StatCard label="Periodo contable" value="Octubre 2026" icon={Calculator} caption="Periodo demostrativo abierto" /><StatCard label="Comprobantes" value={String(new Set(journal.map((entry) => entry.id)).size)} icon={BookCheck} caption="De la entidad seleccionada" /><StatCard label="Movimientos del periodo" value={journal.length} icon={BookOpen} caption="Asientos de muestra" /><StatCard label="Cuadre demostrativo" value="Balanceado" icon={Scale} caption="Débitos = créditos · demo" /></>}>
    <DemoNotice><strong>{currentEntity.name}</strong> · {currentEntity.country}. {currentEntity.framework}. Catálogos y dimensiones son configurables por jurisdicción y entidad; los valores de otras entidades no se agregan a esta vista.</DemoNotice>
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3"><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contexto contable</span><Select defaultValue="2026-10"><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2026-10">Octubre 2026</SelectItem><SelectItem value="2026-09">Septiembre 2026</SelectItem><SelectItem value="2026-08">Agosto 2026</SelectItem></SelectContent></Select><span className="rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">Base contable · local configurable</span><span className="rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">Dimensión · pastoral / administrativa</span></div>
    <Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="chart">Plan de cuentas</TabsTrigger><TabsTrigger value="journal">Libro diario</TabsTrigger><TabsTrigger value="ledger">Mayor y balance</TabsTrigger><TabsTrigger value="statements">Estados financieros</TabsTrigger></TabsList>
      <TabsContent value="chart" className="space-y-4"><div className="grid gap-4 md:grid-cols-3"><Card className="shadow-none"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Estructura</p><p className="mt-1 font-semibold">Catálogo jerárquico local</p><p className="mt-1 text-xs text-muted-foreground">Clases, grupos y cuentas</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Centro analítico</p><p className="mt-1 font-semibold">Pastoral / Administrativa</p><p className="mt-1 text-xs text-muted-foreground">Dimensiones ilustrativas</p></CardContent></Card><Card className="shadow-none"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Marco aplicable</p><p className="mt-1 font-semibold">Configuración de entidad</p><p className="mt-1 text-xs text-muted-foreground">No impone un catálogo universal</p></CardContent></Card></div><DataTable rows={accounts} columns={accountColumns} getRowId={(item) => `${entity}-${item.code}-${item.name}`} /></TabsContent>
      <TabsContent value="journal" className="space-y-4"><Card className="border-primary/15 bg-secondary/30 shadow-none"><CardContent className="flex items-center justify-between gap-4 p-4"><div><p className="font-semibold">Libro diario · {currentEntity.name}</p><p className="text-xs text-muted-foreground">Asientos por fecha, comprobante, cuenta y dimensión analítica.</p></div><div className="text-right font-mono text-sm"><p>Débitos período: {money(periodDebits)}</p><p>Créditos período: {money(periodCredits)}</p></div></CardContent></Card><DataTable rows={journal} columns={journalColumns} getRowId={(item) => `${item.id}-${item.account}`} onRowClick={setSelected} /></TabsContent>
      <TabsContent value="ledger" className="space-y-4"><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]"><div><div className="mb-3 flex items-center gap-2"><FileSpreadsheet className="size-4 text-primary" /><h2 className="font-semibold">Mayor por cuenta</h2></div><DataTable rows={accounts.filter((item) => item.type === "Cuenta" || item.type === "Grupo")} columns={accountColumns} getRowId={(item) => `${entity}-${item.code}-${item.name}`} /></div><Card className="h-fit shadow-none"><CardHeader><CardTitle className="text-base">Balance de comprobación</CardTitle></CardHeader><CardContent className="space-y-3">{[{ label: "Total débitos", value: periodDebits }, { label: "Total créditos", value: periodCredits }, { label: "Diferencia", value: Math.abs(periodDebits - periodCredits) }].map((row) => <div key={row.label} className="flex justify-between border-b pb-2 text-sm"><span className="text-muted-foreground">{row.label}</span><span className="font-mono font-semibold">{money(row.value)}</span></div>)}<p className="text-xs text-muted-foreground">Suma de asientos de ejemplo para el periodo seleccionado.</p></CardContent></Card></div></TabsContent>
      <TabsContent value="statements" className="grid gap-4 lg:grid-cols-2"><Card className="shadow-none"><CardHeader><CardTitle className="text-base">Estado de situación financiera</CardTitle><p className="text-xs text-muted-foreground">Corte de muestra · {currentEntity.name}</p></CardHeader><CardContent className="space-y-3">{financialPosition.map((row) => <div key={row.label} className="flex justify-between border-b py-2 text-sm"><span>{row.label}</span><span className="font-mono font-semibold">{money(row.value)}</span></div>)}</CardContent></Card><Card className="shadow-none"><CardHeader><CardTitle className="text-base">Estado de actividades</CardTitle><p className="text-xs text-muted-foreground">Presentación de referencia configurable por entidad</p></CardHeader><CardContent className="space-y-3">{activityStatement.map((row) => <div key={row.label} className="flex justify-between border-b py-2 text-sm"><span>{row.label}</span><span className="font-mono font-semibold">{money(row.value)}</span></div>)}<p className="pt-2 text-xs text-muted-foreground">La forma de presentación depende del marco configurado y la naturaleza de la entidad.</p></CardContent></Card></TabsContent>
    </Tabs>
    <DetailDrawer open={!!selected} onOpenChange={(open) => !open && setSelected(null)} title={selected?.id ?? "Detalle del comprobante"} description={selected ? `${selected.date} · ${currentEntity.name}` : undefined}><div>{selected && <div className="grid grid-cols-2 gap-4"><InfoItem label="Periodo">{selected.period}</InfoItem><InfoItem label="Descripción">{selected.description}</InfoItem><InfoItem label="Cuenta">{selected.account}</InfoItem><InfoItem label="Dimensión">{selected.dimension}</InfoItem><InfoItem label="Débito">{money(selected.debit)}</InfoItem><InfoItem label="Crédito">{money(selected.credit)}</InfoItem></div>}</div></DetailDrawer>
    <IntegratedWorkflowPanel module="accounting" />
  </ModuleLayout>;
}
