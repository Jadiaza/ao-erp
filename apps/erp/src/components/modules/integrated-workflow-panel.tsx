import { CheckCircle2, Database, Package, Receipt, RefreshCw, ShieldCheck, Wallet, Workflow } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { resetIntegratedPurchaseDemo, useIntegratedDemo, type DemoModule } from "@/demo/erp-demo-store";

const money = (amount: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);
const moduleNames: Record<DemoModule, string> = {
  purchase: "Compras", inventory: "Inventarios", payable: "Cuentas por pagar",
  treasury: "Tesorería", accounting: "Contabilidad", budget: "Presupuestos",
  document: "Gestión documental", audit: "Auditoría",
};

export function IntegratedWorkflowPanel({ module }: { module: DemoModule | "all" }) {
  const data = useIntegratedDemo();
  const events = module === "all" ? data.events : data.events.filter((event) => event.type === module);
  const purchase = data.purchases[0];
  const payable = data.payables[0];
  const stock = data.stock[0];
  const budget = data.budgets[0];
  const cashTotal = data.cashMovements.reduce((sum, movement) => sum + movement.amount, 0);
  const vouchersTotal = data.vouchers.reduce((sum, voucher) => sum + voucher.lines.reduce((lineSum, line) => lineSum + line.debit, 0), 0);
  return <Card className="mt-6 border-primary/20 shadow-none">
    <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
      <div className="min-w-0"><CardTitle className="flex items-center gap-2 text-base"><Workflow className="size-4 text-primary" />Escenario integrado de demostración</CardTitle><p className="mt-1 text-xs text-muted-foreground">Datos relacionados de extremo a extremo · COP · entidad ficticia · escenario {data.scenarioId}</p></div>
      <Button size="sm" variant="outline" className="shrink-0 gap-2" onClick={resetIntegratedPurchaseDemo}><RefreshCw className="size-4" />Restablecer demo</Button>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-xs text-muted-foreground"><Receipt className="size-3.5" />Orden / compra</p><p className="mt-1 font-mono text-sm font-semibold">{purchase?.id}</p><p className="text-xs text-muted-foreground">{purchase?.supplierName}</p><p className="mt-2 text-sm font-semibold">{money(purchase?.total ?? 0)}</p></div>
        <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-xs text-muted-foreground"><Package className="size-3.5" />Existencias</p><p className="mt-1 text-xl font-bold tabular-nums">{stock?.availableQuantity ?? 0} {stock?.unit}</p><p className="text-xs text-muted-foreground">{stock?.itemName}</p><p className="mt-2 text-xs">Entrada de compra: {stock?.receivedQuantity ?? 0}</p></div>
        <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="size-3.5" />Cuenta por pagar</p><p className="mt-1 font-mono text-sm font-semibold">{payable?.id}</p><p className="text-xs text-muted-foreground">Factura {payable?.invoiceNumber}</p><p className="mt-2 text-sm font-semibold">Saldo: {money(payable?.balance ?? 0)}</p></div>
        <div className="rounded-lg border p-3"><p className="flex items-center gap-2 text-xs text-muted-foreground"><Database className="size-3.5" />Presupuesto disponible</p><p className="mt-1 text-sm font-semibold">{money(budget?.available ?? 0)}</p><p className="text-xs text-muted-foreground">{budget?.code} · {budget?.name}</p><p className="mt-2 text-xs">Causado: {money(budget?.accrued ?? 0)} · Pagado: {money(budget?.paid ?? 0)}</p></div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Tesorería · egresos demo</p><p className="mt-1 font-semibold">{money(cashTotal)}</p><p className="text-xs text-muted-foreground">{data.cashMovements.length} movimiento(s)</p></div>
        <div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Contabilidad · propuesta</p><p className="mt-1 font-semibold">{data.vouchers.length} comprobante(s) borrador</p><p className="text-xs text-muted-foreground">Débitos propuestos: {money(vouchersTotal)}</p></div>
        <div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Evidencia y control</p><p className="mt-1 font-semibold">{data.documents.length} documentos · {data.audit.length} eventos</p><p className="text-xs text-muted-foreground">Relaciones por origen: {data.scenarioId}</p></div>
      </div>
      <div><div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Trazabilidad del ciclo</h3><span className="text-xs text-muted-foreground">{events.length} evento(s) en {module === "all" ? "todos los módulos" : moduleNames[module]}</span></div>
        <div className="space-y-2">{events.map((event) => <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><div className="min-w-0"><p className="text-sm font-medium">{event.title}</p><p className="text-xs text-muted-foreground">{moduleNames[event.type]} · {event.reference} · origen {event.sourceId}</p></div><div className="text-right"><p className="font-mono text-sm font-semibold">{money(event.amount)}</p><p className="flex items-center justify-end gap-1 text-xs text-muted-foreground"><CheckCircle2 className="size-3" />{event.status}</p></div></div>)}</div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0" /><p>Escenario 100 % ficticio y aislado. La recepción aumenta existencias; la factura genera la obligación; el pago actualiza tesorería y presupuesto; el comprobante queda en borrador; los soportes y la auditoría conservan el mismo origen. No se contabiliza ni se mueve dinero real.</p></div>
    </CardContent>
  </Card>;
}
