import type { ReactNode } from "react";

export function DemoNotice({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"><span className="font-semibold">Demostración:</span> {children}</div>;
}

export function FieldGroup({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}{children}{hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}</label>;
}

export function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><div className="text-sm font-medium">{children}</div></div>;
}
