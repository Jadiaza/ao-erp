import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { RecordStatus } from "@/data/demo-types";

export type { RecordStatus } from "@/data/demo-types";
const statusPresentation: Record<RecordStatus, { label: string; className: string }> = {
  active: { label: "Activo", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  pending: { label: "Pendiente", className: "border-amber-200 bg-amber-50 text-amber-800" },
  approved: { label: "Aprobado", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rechazado", className: "border-red-200 bg-red-50 text-red-700" },
  inactive: { label: "Inactivo", className: "border-slate-200 bg-slate-100 text-slate-600" },
  draft: { label: "Borrador", className: "border-slate-200 bg-slate-50 text-slate-600" },
  paid: { label: "Pagado", className: "border-blue-200 bg-blue-50 text-blue-700" },
  overdue: { label: "Vencido", className: "border-red-200 bg-red-50 text-red-700" },
};

export function StatusBadge({ status, label, ...props }: { status: RecordStatus; label?: string | undefined } & Omit<BadgeProps, "variant">) {
  const presentation = statusPresentation[status];
  return <Badge variant="outline" {...props} className={`${presentation.className} ${props.className ?? ""}`}>{label ?? presentation.label}</Badge>;
}
