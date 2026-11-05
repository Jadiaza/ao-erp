import { CheckCircle2, Workflow } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { runIntegratedPurchaseDemo, useIntegratedDemo, type DemoWorkflowEvent } from "@/demo/erp-demo-store";

const labels: Record<string, string> = {
  purchase: "Compras", inventory: "Inventarios", payable: "Cuentas por pagar",
  treasury: "Tesorería", accounting: "Contabilidad", document: "Gestión documental", audit: "Auditoría",
};
const money = (amount: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);

export function IntegratedWorkflowPanel({ module }: { module: DemoWorkflowEvent["type"] | "all" }) {
  const { events } = useIntegratedDemo();
  const visible = module === "all" ? events : events.filter((event) => event.type === module);
  const completed = events.length > 0;
  return <Card className="mt-6 border-primary/20 shadow-none">
    <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
      <div><CardTitle className="flex items-center gap-2 text-base"><Workflow className="size-4 text-primary" />Integración operativa entre módulos</CardTitle><p className="mt-1 text-xs text-muted-foreground">Escenario ficticio compartido. Los registros se conservan en este navegador.</p></div>
      <Button size="sm" variant="outline" className="shrink-0 gap-2" onClick={runIntegratedPurchaseDemo} disabled={completed}><CheckCircle2 className="size-4" />{completed ? "Flujo ejecutado" : "Ejecutar flujo demo"}</Button>
    </CardHeader>
    <CardContent className="space-y-3">
      {visible.length === 0 ? <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Aún no hay movimientos del escenario integrado. Ejecuta el flujo para generar registros relacionados en Compras, Inventarios, Cuentas por pagar, Tesorería, Contabilidad, Gestión documental y Auditoría.</div> :
        <div className="space-y-2">{visible.map((event) => <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><div className="min-w-0"><p className="text-sm font-medium">{event.title}</p><p className="text-xs text-muted-foreground">{labels[event.type]} · {event.reference} · Origen: {event.sourceId}</p></div><div className="text-right"><p className="font-mono text-sm font-semibold">{money(event.amount)}</p><p className="text-xs text-muted-foreground">{event.status}</p></div></div>)}</div>}
      {completed && <p className="text-xs text-muted-foreground">Un mismo identificador de origen relaciona los siete registros. El comprobante queda en borrador y requiere revisión; esta demostración no produce movimientos contables ni pagos bancarios reales.</p>}
    </CardContent>
  </Card>;
}
