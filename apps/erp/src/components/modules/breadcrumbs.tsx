import { ChevronRight } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export type BreadcrumbItemData = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItemData[] }) {
  return <Breadcrumb><BreadcrumbList>{items.map((item, index) => {
    return <span className="contents" key={`${item.label}-${index}`}>
    <BreadcrumbItem>{index === items.length - 1 || !item.href ? <BreadcrumbPage>{item.label}</BreadcrumbPage> : <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>}</BreadcrumbItem>
    {index < items.length - 1 && <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>}
  </span>})}</BreadcrumbList></Breadcrumb>;
}
