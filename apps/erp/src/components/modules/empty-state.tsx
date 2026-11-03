import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, description, icon: Icon = Inbox, action }: { title: string; description?: string; icon?: LucideIcon; action?: ReactNode }) {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-10 text-center"><div className="mb-4 rounded-full bg-secondary p-3 text-primary"><Icon className="size-5" /></div><h3 className="font-semibold">{title}</h3>{description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}{action && <div className="mt-4">{action}</div>}</div>;
}
