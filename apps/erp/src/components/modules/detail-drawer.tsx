import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function DetailDrawer({ open, onOpenChange, title, description, children, side = "right" }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string | undefined; children: ReactNode; side?: "left" | "right" | "top" | "bottom" }) {
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side={side} className="flex w-full flex-col overflow-y-auto sm:max-w-xl"><SheetHeader><SheetTitle>{title}</SheetTitle>{description && <SheetDescription>{description}</SheetDescription>}</SheetHeader><div className="flex-1 px-4 pb-6">{children}</div></SheetContent></Sheet>;
}
