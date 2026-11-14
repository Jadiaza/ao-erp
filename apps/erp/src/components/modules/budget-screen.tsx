import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarRange,
  ChartColumnIncreasing,
  CircleDollarSign,
} from "lucide-react";
import {
  ChartCard,
  DataTable,
  type DataTableColumn,
  DemoNotice,
  FieldGroup,
  FilterBar,
  FormDialog,
  ModuleLayout,
  StatCard,
} from "@/components/modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/modules";
import { budgetLines, christianBudgetLines, type BudgetLine } from "@/data/economy-demo";
import { useLocalCollection } from "@/data/local-repository";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { getProfileStorageKey, isChristianProfile } from "@/lib/ao-cristiano-profile";

const fmt = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export function BudgetScreen() {
  const { settings } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);
  const [formOpen, setFormOpen] = useState(false);
  const [campusFilter, setCampusFilter] = useState("all");
  const [lineForm, setLineForm] = useState({
    area: christian ? "Congregacional" : "Pastoral",
    type: "Gasto" as "Ingreso" | "Gasto",
    category: "",
    budget: "",
    campusId: settings.campusId || "SEDE-PRINCIPAL",
  });

  const { records, create } = useLocalCollection(
    getProfileStorageKey("ao-erp:budget:lines", settings.profile),
    christian ? christianBudgetLines : budgetLines,
  );
  const [tab, setTab] = useState("overview");
  const [area, setArea] = useState("all");
  const [kind, setKind] = useState("all");

  const scopedRecords = useMemo(
    () =>
      records.filter(
        (line) =>
          (!line.organizationId || line.organizationId === settings.organizationId) &&
          (campusFilter === "all" || (line.campusId ?? settings.campusId) === campusFilter),
      ),
    [records, settings.organizationId, settings.campusId, campusFilter],
  );
  const campuses = useMemo(
    () => [...new Set(records.map((l) => l.campusId).filter(Boolean))] as string[],
    [records],
  );
  const areas = useMemo(() => [...new Set(scopedRecords.map((line) => line.area))], [scopedRecords]);

  const projectedIncome = useMemo(
    () => scopedRecords.filter((l) => l.type === "Ingreso").reduce((sum, l) => sum + l.budget, 0),
    [scopedRecords],
  );
  const plannedExpenses = useMemo(
    () => scopedRecords.filter((l) => l.type === "Gasto").reduce((sum, l) => sum + l.budget, 0),
    [scopedRecords],
  );
  const totalBudget = useMemo(
    () => scopedRecords.reduce((sum, l) => sum + l.budget, 0),
    [scopedRecords],
  );
  const totalExecuted = useMemo(
    () => scopedRecords.reduce((sum, l) => sum + l.executed, 0),
    [scopedRecords],
  );
  const executionPct = totalBudget > 0 ? Math.round((totalExecuted / totalBudget) * 100) : 0;
  const alertCount = useMemo(
    () => scopedRecords.filter((l) => l.type === "Gasto" && l.executed > l.budget).length,
    [scopedRecords],
  );

  const lines = useMemo(
    () =>
      scopedRecords.filter(
        (line) => (area === "all" || line.area === area) && (kind === "all" || line.type === kind),
      ),
    [scopedRecords, area, kind],
  );
  const columns: DataTableColumn<BudgetLine>[] = [
    {
      id: "area",
      header: "Área",
      cell: (line) => <span className="font-medium">{line.area}</span>,
    },
    {
      id: "category",
      header: "Rubro presupuestal",
      cell: (line) => (
        <div>
          <p className="font-semibold">{line.category}</p>
          <p className="text-xs text-muted-foreground">
            {line.type} · {line.period} 2026
          </p>
        </div>
      ),
    },
    {
      id: "budget",
      header: "Presupuesto aprobado",
      cell: (line) => <span className="font-mono tabular-nums">{fmt(line.budget)}</span>,
    },
    {
      id: "executed",
      header: "Ejecución demo",
      cell: (line) => <span className="font-mono tabular-nums">{fmt(line.executed)}</span>,
    },
    {
      id: "variance",
      header: "Variación",
      cell: (line) => {
        const variance = line.budget - line.executed;
        return (
          <span
            className={`font-mono font-semibold ${variance < 0 && line.type === "Gasto" ? "text-destructive" : ""}`}
          >
            {variance < 0 ? "−" : ""}
            {fmt(Math.abs(variance))}
          </span>
        );
      },
    },
    {
      id: "execution",
      header: "Ejecución",
      cell: (line) => {
        const pct = line.budget > 0 ? Math.round((line.executed / line.budget) * 100) : 0;
        return (
          <div className="min-w-28">
            <div className="mb-1 flex justify-between text-xs">
              <span>{pct}%</span>
              {line.type === "Gasto" && pct > 100 && (
                <AlertTriangle className="size-3.5 text-destructive" />
              )}
            </div>
            <div className="h-1.5 rounded bg-muted">
              <div
                className={`h-full rounded ${line.type === "Gasto" && pct > 100 ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Finanzas y recursos" },
        { label: christian ? "Presupuestos congregacionales" : "Presupuestos" },
      ]}
      title={christian ? "Presupuestos congregacionales" : "Presupuestos"}
      description={
        christian
          ? "Seguimiento del presupuesto congregacional por áreas, ministerios, diezmos, ofrendas y gastos."
          : "Seguimiento del presupuesto anual y ejecución por áreas, rubros y periodo."
      }
      actions={
        <div className="flex items-center gap-2">
          <div className="rounded-lg border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
            Año presupuestal · 2026 · DEMO
          </div>
          <Button
            onClick={() => {
              setLineForm({
                area: christian ? "Congregacional" : "Pastoral",
                type: "Gasto",
                category: "",
                budget: "",
                campusId: settings.campusId || "SEDE-PRINCIPAL",
              });
              setFormOpen(true);
            }}
          >
            Nuevo rubro
          </Button>
        </div>
      }
      stats={
        <>
          <StatCard
            label="Ingresos proyectados"
            value={fmt(projectedIncome)}
            icon={ArrowDownToLine}
            caption="Presupuesto anual de muestra"
          />
          <StatCard
            label="Gastos previstos"
            value={fmt(plannedExpenses)}
            icon={ArrowUpFromLine}
            caption={christian ? "Áreas ministeriales y administrativas" : "Áreas pastorales y administrativas"}
          />
          <StatCard
            label="Ejecución general"
            value={`${executionPct}%`}
            icon={ChartColumnIncreasing}
            caption="Calculado sobre rubros visibles"
          />
          <StatCard
            label="Rubros con alerta"
            value={String(alertCount)}
            icon={AlertTriangle}
            caption="Gastos sobre presupuesto"
          />
        </>
      }
    >
      <DemoNotice>
        Presupuestos y cifras de ejemplo en COP para {settings.organizationId}. Los indicadores de
        ejecución reflejan los rubros locales visibles; no son reglas productivas de aprobación.
      </DemoNotice>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <ChartCard
          title="Presupuesto frente a ejecución"
          description="Comparación por área · montos de referencia"
        >
          <div className="space-y-5">
            {areas.map((label) => {
              const subset = scopedRecords.filter((line) => line.area === label);
              const budget = subset.reduce((sum, line) => sum + line.budget, 0);
              const executed = subset.reduce((sum, line) => sum + line.executed, 0);
              const ratio = budget > 0 ? Math.round((executed / budget) * 100) : 0;
              return (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">
                      {fmt(executed)} / {fmt(budget)}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(ratio, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[11px] text-muted-foreground">
                    {ratio}% ejecutado
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex gap-5 border-t pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <i className="size-2.5 rounded-sm bg-primary" />
              Ejecución a la fecha
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="size-2.5 rounded-sm bg-muted" />
              Saldo presupuestal
            </span>
          </div>
        </ChartCard>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="size-4 text-primary" />
              Seguimiento por periodo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { month: "Julio", value: 48 },
              { month: "Agosto", value: 55 },
              { month: "Septiembre", value: 61 },
              { month: "Octubre", value: executionPct },
            ].map((item) => (
              <div key={item.month} className="flex items-center gap-3">
                <span className="w-20 text-xs text-muted-foreground">{item.month}</span>
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/80"
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  />
                </div>
                <span className="w-9 text-right text-xs font-semibold">{item.value}%</span>
              </div>
            ))}
            {alertCount > 0 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                  <AlertTriangle className="size-3.5" />
                  Revisión de variación
                </p>
                <p className="mt-1 text-xs text-amber-900">
                  {alertCount} rubro(s) de gasto superan el monto previsto en esta muestra.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Ejecución presupuestal</TabsTrigger>
          <TabsTrigger value="income">Ingresos proyectados</TabsTrigger>
          <TabsTrigger value="expenses">Gastos previstos</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="space-y-4">
          <FilterBar label="Presupuesto">
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {areas.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Tipo de rubro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Ingresos y gastos</SelectItem>
                <SelectItem value="Ingreso">Ingresos</SelectItem>
                <SelectItem value="Gasto">Gastos</SelectItem>
              </SelectContent>
            </Select>
            {campuses.length > 0 && (
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
            )}
            <span className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">
              <CircleDollarSign className="size-3.5" />
              COP · cifras demostrativas
            </span>
          </FilterBar>
          <DataTable
            rows={lines.filter((line) =>
              tab === "income"
                ? line.type === "Ingreso"
                : tab === "expenses"
                  ? line.type === "Gasto"
                  : true,
            )}
            columns={columns}
            getRowId={(line) => line.id}
            emptyTitle="No hay rubros para los filtros seleccionados"
          />
        </TabsContent>
      </Tabs>
      <FormDialog
        title="Nuevo rubro presupuestal"
        description="Registra una asignación local de demostración."
        open={formOpen}
        onOpenChange={setFormOpen}
        submitLabel="Guardar rubro"
        onSubmit={() => {
          const category = lineForm.category.trim();
          const budget = Number(lineForm.budget);
          if (category.length < 3 || !Number.isFinite(budget) || budget <= 0) return;
          create({
            id: `${christian ? "PRE-CRI" : "PRE-DEMO"}-${Date.now()}`,
            area: lineForm.area,
            category,
            type: lineForm.type,
            budget,
            executed: 0,
            period: "Octubre",
            organizationId: settings.organizationId,
            campusId: lineForm.campusId || settings.campusId,
          });
          setFormOpen(false);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldGroup label="Área">
            <Select
              value={lineForm.area}
              onValueChange={(value) => setLineForm((f) => ({ ...f, area: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(christian
                  ? ["Congregacional", "Ministerios", "Administrativa", "Acción social", "Operación"]
                  : ["Pastoral", "Administrativa", "Acción social"]
                ).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Tipo">
            <Select
              value={lineForm.type}
              onValueChange={(value) => setLineForm((f) => ({ ...f, type: value as "Ingreso" | "Gasto" }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ingreso">Ingreso</SelectItem>
                <SelectItem value="Gasto">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Rubro">
            <Input
              value={lineForm.category}
              onChange={(e) => setLineForm((f) => ({ ...f, category: e.target.value }))}
              required
            />
          </FieldGroup>
          <FieldGroup label="Presupuesto aprobado">
            <Input
              type="number"
              min="1"
              value={lineForm.budget}
              onChange={(e) => setLineForm((f) => ({ ...f, budget: e.target.value }))}
              required
            />
          </FieldGroup>
        </div>
      </FormDialog>
    </ModuleLayout>
  );
}
