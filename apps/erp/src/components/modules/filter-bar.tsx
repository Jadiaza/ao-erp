import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";

export function FilterBar({ children, label = "Filtros" }: { children: ReactNode; label?: string }) {
  return <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3"><span className="mr-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><SlidersHorizontal className="size-3.5" />{label}</span>{children}</div>;
}
