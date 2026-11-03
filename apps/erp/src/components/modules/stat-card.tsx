import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, caption, icon: Icon, trend }: { label: string; value: string | number; caption?: string; icon?: LucideIcon; trend?: { value: string; direction: "up" | "down" } }) {
  const TrendIcon = trend?.direction === "down" ? ArrowDownRight : ArrowUpRight;
  return <Card className="shadow-none"><CardContent className="flex items-start justify-between gap-4 p-5"><div className="min-w-0"><p className="text-[14px] font-medium text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</p>{caption && <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{caption}</p>}{trend && <p className="mt-2 flex items-center gap-1 text-[13px] font-medium text-primary"><TrendIcon className="size-3.5" />{trend.value}</p>}</div>{Icon && <div className="shrink-0 rounded-lg bg-secondary p-2.5 text-primary"><Icon className="size-5" /></div>}</CardContent></Card>;
}
