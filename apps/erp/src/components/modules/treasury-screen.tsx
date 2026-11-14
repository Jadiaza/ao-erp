import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  Download,
  FileSpreadsheet,
  Landmark,
  Wallet,
} from "lucide-react";
import {
  ChartCard,
  DataTable,
  type DataTableColumn,
  DemoNotice,
  DetailDrawer,
  FieldGroup,
  FilterBar,
  FormDialog,
  InfoItem,
  ModuleLayout,
  SearchInput,
  StatCard,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/modules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  accountingEntities,
  budgetLines,
  buildJournalEntriesFromMovement,
  cashFlow,
  christianAccountingEntities,
  christianBudgetLines,
  christianJournalEntries,
  christianTreasuryAccounts,
  christianTreasuryMovements,
  journalEntries,
  reconciliationLines,
  treasuryAccounts,
  treasuryMovements,
  type BudgetLine,
  type JournalEntryDemo,
  type TreasuryMovement,
} from "@/data/economy-demo";
import { appendDemoCollectionRecords, useLocalCollection } from "@/data/local-repository";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { getProfileStorageKey, isChristianProfile } from "@/lib/ao-cristiano-profile";

const currency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);

const CHRISTIAN_CATEGORIES = [
  "Diezmos",
  "Ofrendas",
  "Donaciones",
  "Otros ingresos",
  "Egresos operativos",
  "Egresos ministeriales",
];

const CATHOLIC_CATEGORIES = [
  "Ofrendas",
  "Donaciones",
  "Actividades",
  "Servicios",
  "Pastoral",
  "Mantenimiento",
  "Otros",
];

export function TreasuryScreen() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);
  const activeAccounts = christian ? christianTreasuryAccounts : treasuryAccounts;
  const activeEntities = christian ? christianAccountingEntities : accountingEntities;
  const defaultMovements = christian ? christianTreasuryMovements : treasuryMovements;
  const defaultJournal = christian ? christianJournalEntries : journalEntries;
  const defaultBudgets = christian ? christianBudgetLines : budgetLines;
  const categoryPresets = christian ? CHRISTIAN_CATEGORIES : CATHOLIC_CATEGORIES;

  const [tab, setTab] = useState("movements");
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState("all");
  const [category, setCategory] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<TreasuryMovement | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [movementForm, setMovementForm] = useState({
    concept: "",
    source: "Registro local",
    responsible: "Tesorería · demo",
    direction: "Ingreso" as "Ingreso" | "Egreso",
    account: activeAccounts[0]?.name ?? "",
    category: categoryPresets[0] ?? "Otros",
    budgetLineId: "__none__",
    amount: "",
    dateISO: new Date().toISOString().slice(0, 10),
    campusId: settings.campusId || "SEDE-PRINCIPAL",
  });

  const { records, create } = useLocalCollection(
    getProfileStorageKey("ao-erp:treasury:movements", settings.profile),
    defaultMovements,
  );
  const budgetStore = useLocalCollection<BudgetLine>(
    getProfileStorageKey("ao-erp:budget:lines", settings.profile),
    defaultBudgets,
  );

  const orgScoped = useMemo(
    () => records.filter((m) => !m.organizationId || m.organizationId === settings.organizationId),
    [records, settings.organizationId],
  );
  const scopedBudgets = useMemo(
    () =>
      budgetStore.records.filter(
        (b) => !b.organizationId || b.organizationId === settings.organizationId,
      ),
    [budgetStore.records, settings.organizationId],
  );
  const campuses = useMemo(
    () => [...new Set(orgScoped.map((m) => m.campusId).filter(Boolean))] as string[],
    [orgScoped],
  );
  const categories = useMemo(
    () => [...new Set([...categoryPresets, ...orgScoped.map((movement) => movement.category)])],
    [categoryPresets, orgScoped],
  );

  const visible = useMemo(
    () =>
      orgScoped.filter(
        (item) =>
          `${item.concept} ${item.source} ${item.reference} ${item.responsible ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (account === "all" || item.account === account) &&
          (category === "all" || item.category === category) &&
          (campusFilter === "all" || (item.campusId ?? settings.campusId) === campusFilter) &&
          (!from || item.dateISO >= from) &&
          (!to || item.dateISO <= to),
      ),
    [orgScoped, query, account, category, campusFilter, settings.campusId, from, to],
  );

  const periodIncome = useMemo(
    () => visible.filter((m) => m.direction === "Ingreso").reduce((sum, m) => sum + m.amount, 0),
    [visible],
  );
  const periodExpense = useMemo(
    () => visible.filter((m) => m.direction === "Egreso").reduce((sum, m) => sum + m.amount, 0),
    [visible],
  );
  const totalAvailable = useMemo(() => {
    const base = activeAccounts.reduce((sum, item) => sum + item.balance, 0);
    const seedNet = defaultMovements.reduce(
      (sum, m) => sum + (m.direction === "Ingreso" ? m.amount : -m.amount),
      0,
    );
    const currentNet = orgScoped.reduce(
      (sum, m) => sum + (m.direction === "Ingreso" ? m.amount : -m.amount),
      0,
    );
    return base + (currentNet - seedNet);
  }, [activeAccounts, defaultMovements, orgScoped]);

  const incomeSources = useMemo(() => {
    const incomeMovements = visible.filter((m) => m.direction === "Ingreso");
    const uniqueCats = [...new Set(incomeMovements.map((m) => m.category))];
    return uniqueCats.map((label) => ({
      label,
      value: incomeMovements
        .filter((m) => m.category === label)
        .reduce((sum, m) => sum + m.amount, 0),
    }));
  }, [visible]);

  const reportByCategory = useMemo(() => {
    const map = new Map<string, { category: string; income: number; expense: number }>();
    for (const m of visible) {
      const entry = map.get(m.category) ?? { category: m.category, income: 0, expense: 0 };
      if (m.direction === "Ingreso") entry.income += m.amount;
      else entry.expense += m.amount;
      map.set(m.category, entry);
    }
    return [...map.values()];
  }, [visible]);

  const reportByCampus = useMemo(() => {
    const map = new Map<string, { campus: string; income: number; expense: number }>();
    for (const m of visible) {
      const campus = m.campusId || settings.campusId;
      const entry = map.get(campus) ?? { campus, income: 0, expense: 0 };
      if (m.direction === "Ingreso") entry.income += m.amount;
      else entry.expense += m.amount;
      map.set(campus, entry);
    }
    return [...map.values()];
  }, [visible, settings.campusId]);

  const exportReportCsv = () => {
    if (typeof window === "undefined") return;
    const header = [
      "ID",
      "Fecha",
      "Tipo",
      "Concepto",
      "Categoría",
      "Cuenta",
      "Responsable",
      "Sede",
      "Valor",
      "Comprobante",
    ];
    const rows = visible.map((m) => [
      m.id,
      m.dateISO,
      m.direction,
      m.concept,
      m.category,
      m.account,
      m.responsible ?? "",
      m.campusId ?? "",
      String(m.amount),
      m.journalVoucherId ?? "",
    ]);
    const csv = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tesoreria-${settings.organizationId.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataTableColumn<TreasuryMovement>[] = [
    { id: "date", header: "Fecha", cell: (item) => <span className="text-sm">{item.date}</span> },
    {
      id: "concept",
      header: "Concepto / fuente",
      cell: (item) => (
        <div>
          <p className="font-semibold">{item.concept}</p>
          <p className="text-xs text-muted-foreground">{item.source}</p>
        </div>
      ),
    },
    { id: "category", header: "Categoría", cell: (item) => item.category },
    { id: "account", header: "Cuenta", cell: (item) => item.account },
    {
      id: "direction",
      header: "Tipo",
      cell: (item) => (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${item.direction === "Ingreso" ? "text-emerald-700" : "text-rose-700"}`}
        >
          {item.direction === "Ingreso" ? (
            <ArrowDownLeft className="size-3.5" />
          ) : (
            <ArrowUpRight className="size-3.5" />
          )}
          {item.direction}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Valor",
      cell: (item) => <span className="font-semibold tabular-nums">{currency(item.amount)}</span>,
    },
    { id: "status", header: "Estado", cell: (item) => <StatusBadge status={item.status} /> },
  ];

  const openNewMovement = () => {
    setFormError(null);
    setMovementForm({
      concept: "",
      source: "Registro local",
      responsible: "Tesorería · demo",
      direction: "Ingreso",
      account: activeAccounts[0]?.name ?? "",
      category: categoryPresets[0] ?? "Otros",
      budgetLineId: "__none__",
      amount: "",
      dateISO: new Date().toISOString().slice(0, 10),
      campusId: settings.campusId || "SEDE-PRINCIPAL",
    });
    setFormOpen(true);
  };

  const handleCreateMovement = () => {
    setFormError(null);
    const concept = movementForm.concept.trim();
    const amount = Number(movementForm.amount);
    if (concept.length < 3) {
      setFormError("Ingresa un concepto de al menos 3 caracteres.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Ingresa un valor numérico mayor a 0.");
      return;
    }
    const dateISO = movementForm.dateISO || new Date().toISOString().slice(0, 10);
    const prefix = movementForm.direction === "Ingreso" ? "ING" : "EGR";
    const voucherId = `${christian ? "CMP-CRI" : "CMP-DEMO"}-${Date.now()}`;
    const movement: TreasuryMovement = {
      id: `MOV-DEMO-${Date.now()}`,
      date: dateISO,
      dateISO,
      concept,
      source: movementForm.source.trim() || "Registro local",
      responsible: movementForm.responsible.trim() || "Tesorería · demo",
      category: movementForm.category,
      account: movementForm.account || activeAccounts[0]?.name || "Caja general · demo",
      direction: movementForm.direction,
      amount,
      status: "approved",
      reference: `${prefix}-DEMO-${Date.now()}`,
      journalVoucherId: voucherId,
      budgetLineId: movementForm.budgetLineId !== "__none__" ? movementForm.budgetLineId : undefined,
      organizationId: settings.organizationId,
      campusId: movementForm.campusId || settings.campusId,
    };

    create(movement);

    // Conectar automáticamente el movimiento de tesorería con un comprobante contable equilibrado
    const entityId = activeEntities[0]?.id ?? (christian ? "ENT-CRI-001" : "ENT-DEMO-PAR-014");
    const [debitLine, creditLine] = buildJournalEntriesFromMovement({
      movement,
      entityId,
      christian,
    });
    appendDemoCollectionRecords<JournalEntryDemo>(
      getProfileStorageKey("ao-erp:accounting:journal", settings.profile),
      defaultJournal,
      [debitLine, creditLine],
    );

    // Actualizar ejecución presupuestal si está vinculado a un rubro
    if (movement.budgetLineId) {
      const targetBudget = scopedBudgets.find((b) => b.id === movement.budgetLineId);
      if (targetBudget) {
        budgetStore.update(targetBudget.id, {
          executed: targetBudget.executed + movement.amount,
        });
      }
    }

    setFormOpen(false);
  };

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Finanzas y recursos" },
        { label: christian ? "Finanzas y tesorería congregacional" : "Finanzas y tesorería" },
      ]}
      title={christian ? "Finanzas y tesorería congregacional" : "Finanzas y tesorería"}
      description={
        christian
          ? "Diezmos, ofrendas, donaciones, otros ingresos, egresos, caja/bancos, conciliación e informes por período/categoría/sede conectados con contabilidad y presupuestos."
          : "Lectura de saldos, ingresos, pagos y conciliación de una entidad contable de demostración."
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={exportReportCsv}>
            <Download className="size-4" />
            Exportar reporte
          </Button>
          <Button className="gap-2" onClick={openNewMovement}>
            Nuevo movimiento
          </Button>
        </div>
      }
      stats={
        <>
          <StatCard
            label="Ingresos del periodo demo"
            value={currency(periodIncome)}
            icon={ArrowDownLeft}
            caption={
              christian
                ? "Diezmos, ofrendas, donaciones y otros ingresos"
                : "Ofrendas, donaciones y actividades ficticias"
            }
          />
          <StatCard
            label="Egresos del periodo demo"
            value={currency(periodExpense)}
            icon={ArrowUpRight}
            caption="Gastos operativos y ministeriales"
          />
          <StatCard
            label="Disponible en cuentas"
            value={currency(totalAvailable)}
            icon={Wallet}
            caption={activeEntities[0]?.name ?? "Entidad contable de muestra"}
          />
          <StatCard
            label="Movimientos por revisar"
            value={String(orgScoped.filter((movement) => movement.status === "pending").length)}
            icon={Banknote}
            caption="Estados demostrativos"
          />
        </>
      }
    >
      <DemoNotice>
        Demostración local en navegador ({activeEntities[0]?.name ?? "Entidad"} ·{" "}
        {settings.organizationId}). Los movimientos generan comprobantes contables de muestra sin
        representar contabilidad fiscal o legal productiva.
      </DemoNotice>
      <div className="grid gap-3 md:grid-cols-3">
        {activeAccounts.map((item) => (
          <Card key={item.id} className="shadow-none">
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.kind} · {item.id}
                </p>
                <p className="mt-1 font-semibold">{item.name}</p>
                <p className="mt-2 text-lg font-bold tabular-nums">{currency(item.balance)}</p>
                <p className="text-xs text-muted-foreground">{item.entity}</p>
              </div>
              {item.kind === "Banco" ? (
                <Landmark className="size-5 text-primary" />
              ) : (
                <Building2 className="size-5 text-primary" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)]">
        <ChartCard
          title="Flujo de efectivo"
          description="Valores agregados ficticios · millones COP"
        >
          <div className="flex h-48 items-end gap-3 border-b px-2 pt-4">
            {cashFlow.map((month) => (
              <div
                key={month.month}
                className="relative flex h-full flex-1 items-end justify-center gap-1.5"
              >
                <div
                  title={`Ingresos ${month.income} M · muestra`}
                  className="w-4 rounded-t bg-primary"
                  style={{ height: `${month.income * 8}%` }}
                />
                <div
                  title={`Egresos ${month.expense} M · muestra`}
                  className="w-4 rounded-t bg-accent"
                  style={{ height: `${month.expense * 8}%` }}
                />
                <span className="absolute -bottom-6 text-[10px] text-muted-foreground">
                  {month.month}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <i className="size-2.5 rounded-sm bg-primary" />
              Ingresos
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="size-2.5 rounded-sm bg-accent" />
              Egresos
            </span>
          </div>
        </ChartCard>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Fuentes de ingreso · periodo filtrado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomeSources.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">{currency(item.value)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-muted">
                  <div
                    className="h-full rounded bg-primary"
                    style={{
                      width: `${periodIncome ? Math.min((item.value / periodIncome) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="reports">Informes por categoría y sede</TabsTrigger>
          <TabsTrigger value="reconciliation">Conciliación demostrativa</TabsTrigger>
        </TabsList>
        <TabsContent value="movements" className="space-y-4">
          <FilterBar label="Movimientos">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar concepto, fuente o responsable"
              className="w-full sm:w-64"
            />
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las cuentas</SelectItem>
                {activeAccounts.map((item) => (
                  <SelectItem value={item.name} key={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={campusFilter} onValueChange={setCampusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sede" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las sedes</SelectItem>
                {campuses.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="w-40"
              aria-label="Fecha desde"
            />
            <Input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-40"
              aria-label="Fecha hasta"
            />
          </FilterBar>
          <DataTable
            rows={visible}
            columns={columns}
            getRowId={(item) => item.id}
            onRowClick={setSelected}
            emptyTitle="Sin movimientos para estos filtros"
          />
        </TabsContent>
        <TabsContent value="reports" className="grid gap-4 lg:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSpreadsheet className="size-4 text-primary" />
                Resumen por categoría
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportByCategory.map((row) => (
                <div key={row.category} className="flex items-center justify-between border-b pb-2 text-sm">
                  <span className="font-medium">{row.category}</span>
                  <div className="text-right text-xs">
                    {row.income > 0 && <p className="text-emerald-700">+{currency(row.income)}</p>}
                    {row.expense > 0 && <p className="text-rose-700">-{currency(row.expense)}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-4 text-primary" />
                Resumen por sede
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportByCampus.map((row) => (
                <div key={row.campus} className="flex items-center justify-between border-b pb-2 text-sm">
                  <span className="font-medium">{row.campus}</span>
                  <div className="text-right text-xs">
                    <p className="text-emerald-700">Ingresos: {currency(row.income)}</p>
                    <p className="text-rose-700">Egresos: {currency(row.expense)}</p>
                    <p className="font-semibold">Neto: {currency(row.income - row.expense)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reconciliation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Saldo extracto demo" value={currency(18518500)} />
            <StatCard label="Saldo registro demo" value={currency(18450000)} />
            <StatCard label="Diferencia por revisar" value={currency(68500)} />
          </div>
          <DataTable
            rows={reconciliationLines}
            columns={[
              { id: "date", header: "Fecha", cell: (item) => item.date },
              { id: "bank", header: "Descripción bancaria", cell: (item) => item.bankDescription },
              {
                id: "ledger",
                header: "Registro relacionado",
                cell: (item) => item.ledgerDescription,
              },
              { id: "amount", header: "Importe", cell: (item) => currency(item.amount) },
              {
                id: "status",
                header: "Conciliación",
                cell: (item) => (
                  <StatusBadge
                    status={item.status === "Conciliado" ? "approved" : "pending"}
                    label={item.status}
                  />
                ),
              },
            ]}
            getRowId={(item) => item.id}
          />
          <p className="text-xs text-muted-foreground">
            La comparación no modifica saldos ni genera asientos contables.
          </p>
        </TabsContent>
      </Tabs>
      <FormDialog
        title="Nuevo movimiento de tesorería"
        description="Registra un ingreso o egreso y genera automáticamente su comprobante contable equilibrado."
        open={formOpen}
        onOpenChange={setFormOpen}
        submitLabel="Registrar movimiento"
        onSubmit={handleCreateMovement}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup label="Tipo de movimiento">
            <Select
              value={movementForm.direction}
              onValueChange={(value) => {
                const dir = value as "Ingreso" | "Egreso";
                setMovementForm((f) => ({
                  ...f,
                  direction: dir,
                  category:
                    dir === "Egreso"
                      ? christian
                        ? "Egresos operativos"
                        : "Servicios"
                      : categoryPresets[0] ?? "Ofrendas",
                }));
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ingreso">Ingreso</SelectItem>
                <SelectItem value="Egreso">Egreso</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Cuenta">
            <Select
              value={movementForm.account}
              onValueChange={(value) => setMovementForm((f) => ({ ...f, account: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {activeAccounts.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Categoría">
            <Select
              value={movementForm.category}
              onValueChange={(value) => setMovementForm((f) => ({ ...f, category: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Valor (COP)">
            <Input
              type="number"
              min="1"
              value={movementForm.amount}
              onChange={(e) => setMovementForm((f) => ({ ...f, amount: e.target.value }))}
              required
            />
          </FieldGroup>
          <FieldGroup label="Concepto">
            <Input
              value={movementForm.concept}
              onChange={(e) => setMovementForm((f) => ({ ...f, concept: e.target.value }))}
              required
            />
          </FieldGroup>
          <FieldGroup label="Fuente / beneficiario">
            <Input
              value={movementForm.source}
              onChange={(e) => setMovementForm((f) => ({ ...f, source: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Responsable">
            <Input
              value={movementForm.responsible}
              onChange={(e) => setMovementForm((f) => ({ ...f, responsible: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label="Rubro presupuestal (opcional)">
            <Select
              value={movementForm.budgetLineId}
              onValueChange={(value) => setMovementForm((f) => ({ ...f, budgetLineId: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin vincular a presupuesto</SelectItem>
                {scopedBudgets.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.area} · {b.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Fecha">
            <Input
              type="date"
              value={movementForm.dateISO}
              onChange={(e) => setMovementForm((f) => ({ ...f, dateISO: e.target.value }))}
            />
          </FieldGroup>
          <FieldGroup label={settings.terminology.campusLabel}>
            <Input
              value={movementForm.campusId}
              onChange={(e) => setMovementForm((f) => ({ ...f, campusId: e.target.value }))}
            />
          </FieldGroup>
        </div>
        {formError && (
          <p role="alert" className="mt-2 flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="size-3.5" />
            {formError}
          </p>
        )}
      </FormDialog>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.concept ?? "Detalle de movimiento"}
        description={selected?.reference}
      >
        <div>
          {selected && (
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Fecha">{selected.date}</InfoItem>
              <InfoItem label="Dirección">{selected.direction}</InfoItem>
              <InfoItem label="Fuente">{selected.source}</InfoItem>
              <InfoItem label="Responsable">{selected.responsible ?? "—"}</InfoItem>
              <InfoItem label="Categoría">{selected.category}</InfoItem>
              <InfoItem label="Cuenta">{selected.account}</InfoItem>
              <InfoItem label="Valor">{currency(selected.amount)}</InfoItem>
              <InfoItem label="Estado">
                <StatusBadge status={selected.status} />
              </InfoItem>
              <InfoItem label="Referencia">{selected.reference}</InfoItem>
              <InfoItem label="Comprobante contable">{selected.journalVoucherId ?? "—"}</InfoItem>
              <InfoItem label="Organización">{selected.organizationId ?? settings.organizationId}</InfoItem>
              <InfoItem label={settings.terminology.campusLabel}>{selected.campusId ?? settings.campusId}</InfoItem>
            </div>
          )}
        </div>
      </DetailDrawer>
    </ModuleLayout>
  );
}
