import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItemData } from "@/components/modules/breadcrumbs";
import { PageHeader } from "@/components/modules/page-header";

export function ModuleLayout({ breadcrumbs, title, description, actions, stats, children, className, width = "standard" }: { breadcrumbs: BreadcrumbItemData[]; title: string; description?: string; actions?: ReactNode; stats?: ReactNode; children: ReactNode; className?: string; width?: "standard" | "wide" }) {
  const containerWidth = width === "wide" ? "max-w-[1440px]" : "max-w-[1360px]";
  return <main className={`mx-auto flex w-full min-w-0 ${containerWidth} flex-col gap-6 p-4 sm:p-5 lg:p-7 ${className ?? ""}`}><Breadcrumbs items={breadcrumbs} /><PageHeader title={title} {...(description === undefined ? {} : { description })} {...(actions === undefined ? {} : { actions })} />{stats && <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats}</section>}<section className="min-w-0 space-y-5">{children}</section></main>;
}
