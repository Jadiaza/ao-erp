import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { cn } from "@ao/utilities";
import { FormActions } from "@/components/forms/form-actions";
import { FormHeader } from "@/components/forms/form-header";
import { useFormSubmit } from "@/components/forms/use-form-submit";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function FormDrawer<TFieldValues extends FieldValues>({
  form,
  open,
  onOpenChange,
  title,
  description,
  icon,
  onSubmit,
  submitLabel = "Guardar cambios",
  cancelLabel = "Cancelar",
  pendingLabel = "Procesando…",
  closeOnSuccess = true,
  children,
  className,
}: {
  form: UseFormReturn<TFieldValues>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  closeOnSuccess?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { handleSubmit, isSubmitting, submitError } = useFormSubmit(
    form,
    onSubmit,
    () => closeOnSuccess && onOpenChange(false),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex h-full w-full max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          className,
        )}
      >
        <FormProvider {...form}>
          <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <SheetHeader className="border-b border-border px-5 py-4 pr-12 text-left">
              <FormHeader
                title={title}
                description={description}
                icon={icon}
                titleAs={SheetTitle}
                descriptionAs={SheetDescription}
              />
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
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
            <div className="border-t border-border bg-background p-4">
              <FormActions
                submitLabel={submitLabel}
                cancelLabel={cancelLabel}
                pendingLabel={pendingLabel}
                pending={isSubmitting}
                onCancel={() => onOpenChange(false)}
              />
            </div>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
