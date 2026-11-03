import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function FormDialog({ title, description, trigger, children, open, onOpenChange, onSubmit, submitLabel = "Guardar", cancelLabel = "Cancelar" }: { title: string; description?: string; trigger?: ReactNode; children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; onSubmit?: () => void; submitLabel?: string; cancelLabel?: string }) {
  return <Dialog {...(open === undefined ? {} : { open })} {...(onOpenChange ? { onOpenChange } : {})}><DialogTrigger asChild>{trigger ?? <Button>Nuevo registro</Button>}</DialogTrigger><DialogContent><form onSubmit={(event) => { event.preventDefault(); onSubmit?.(); onOpenChange?.(false); }}><DialogHeader><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader><div className="grid gap-4 py-5">{children}</div><DialogFooter><DialogClose asChild><Button type="button" variant="outline">{cancelLabel}</Button></DialogClose><Button type="submit">{submitLabel}</Button></DialogFooter></form></DialogContent></Dialog>;
}
