import { useState, type ReactElement, type ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { cn } from "@ao/utilities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormActions } from "@/components/forms/form-actions";
import { FormHeader } from "@/components/forms/form-header";
import { useFormSubmit } from "@/components/forms/use-form-submit";

export function FormModal<TFieldValues extends FieldValues>({
  form,
  title,
  description,
  icon,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSubmit,
  closeOnSuccess = true,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  pendingLabel = "Procesando…",
  children,
  className,
  contentClassName,
}: {
  form: UseFormReturn<TFieldValues>;
  title: string;
  description?: string;
  icon?: ReactNode;
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
  closeOnSuccess?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const { handleSubmit, isSubmitting, submitError } = useFormSubmit(
    form,
    onSubmit,
    () => closeOnSuccess && setOpen(false),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        overlayClassName="bg-foreground/35 backdrop-blur-[1px]"
        className={cn(
          "flex max-h-[min(92dvh,56rem)] w-[calc(100vw-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:rounded-2xl",
          contentClassName,
        )}
      >
        <FormProvider {...form}>
          <form
            noValidate
            onSubmit={handleSubmit}
            className={cn("flex min-h-0 flex-1 flex-col", className)}
          >
            <div className="border-b border-border px-5 py-4 pr-12 sm:px-6">
              <FormHeader
                title={title}
                description={description}
                icon={icon}
                titleAs={DialogTitle}
                descriptionAs={DialogDescription}
              />
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              {children}
              {submitError && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  {submitError}
                </p>
              )}
            </div>
            <div className="border-t border-border bg-background px-4 py-3 sm:px-6">
              <FormActions
                submitLabel={submitLabel}
                cancelLabel={cancelLabel}
                pendingLabel={pendingLabel}
                pending={isSubmitting}
                onCancel={() => setOpen(false)}
              />
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export function FormModalTrigger({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button type="button" {...props}>
      {children}
    </Button>
  );
}
