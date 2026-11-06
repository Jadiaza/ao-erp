import { useState, type FormEvent, type ReactNode } from "react";
import { FormActions, FormHeader } from "@/components/forms";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Compatibility shell for legacy uncontrolled forms while they migrate to RHF. */
export function FormDialog({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange,
  onSubmit,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
}: {
  title: string;
  description?: string;
  trigger?: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: FormData) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
}) {
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (!next && dirty && !window.confirm("Hay cambios sin guardar. ¿Deseas descartarlos?")) return;
    setDirty(false);
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      await onSubmit?.(new FormData(event.currentTarget));
      setDirty(false);
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="flex max-h-[min(92dvh,56rem)] w-[calc(100vw-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:rounded-2xl">
        <form
          noValidate
          onSubmit={handleSubmit}
          onInput={() => setDirty(true)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="border-b border-border px-5 py-4 pr-12 sm:px-6">
            <FormHeader
              title={title}
              description={description}
              titleAs={DialogTitle}
              descriptionAs={DialogDescription}
            />
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            {children}
          </div>
          <div className="border-t border-border bg-background px-4 py-3 sm:px-6">
            <FormActions
              submitLabel={submitLabel}
              cancelLabel={cancelLabel}
              pending={pending}
              onCancel={() => setOpen(false)}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FormDialogTrigger({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button type="button" {...props}>
      {children}
    </Button>
  );
}
