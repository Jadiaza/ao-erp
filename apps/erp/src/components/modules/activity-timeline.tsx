import type { ReactNode } from "react";

export type TimelineEntry = { id: string; title: string; description?: string; date: string; actor?: string; icon?: ReactNode };

export function ActivityTimeline({ entries }: { entries: TimelineEntry[] }) {
  return <ol className="space-y-0">{entries.map((entry, index) => <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0"><div className="relative flex w-8 shrink-0 justify-center"><span className="z-10 flex size-8 items-center justify-center rounded-full border bg-card text-primary">{entry.icon ?? <span className="size-2 rounded-full bg-accent" />}</span>{index < entries.length - 1 && <span className="absolute top-8 h-full w-px bg-border" />}</div><div className="min-w-0 flex-1 pt-1"><div className="flex flex-wrap items-baseline justify-between gap-x-4"><h3 className="text-sm font-semibold">{entry.title}</h3><time className="text-xs text-muted-foreground">{entry.date}</time></div>{entry.description && <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>}{entry.actor && <p className="mt-2 text-xs text-muted-foreground">Por {entry.actor}</p>}</div></li>)}</ol>;
}
