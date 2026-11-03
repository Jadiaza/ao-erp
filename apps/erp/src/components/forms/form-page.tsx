import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { cn } from "@ao/utilities";
import { FormActions } from "@/components/forms/form-actions";
import { FormHeader } from "@/components/forms/form-header";
import { useFormSubmit } from "@/components/forms/use-form-submit";

export function FormPage<TFieldValues extends FieldValues>({
  form,
  title,
  description,
  icon,
  eyebrow,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  pendingLabel = "Procesando…",
  children,
  className,
  onSuccess,
}: {
  form: UseFormReturn<TFieldValues>;
  title: string;
  description?: string;
  icon?: ReactNode;
  eyebrow?: string;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  const { handleSubmit, isSubmitting, submitError } = useFormSubmit(form, onSubmit, onSuccess);

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={handleSubmit}
        className={cn(
          "mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
          className,
        )}
      >
        <div className="border-b border-border px-5 py-5 sm:px-7">
          <FormHeader title={title} description={description} icon={icon} eyebrow={eyebrow} />
        </div>
        <div className="space-y-5 p-4 sm:p-7">
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
        <div className="sticky bottom-0 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-7">
          <FormActions
            submitLabel={submitLabel}
            cancelLabel={cancelLabel}
            pendingLabel={pendingLabel}
            pending={isSubmitting}
            onCancel={onCancel}
          />
        </div>
      </form>
    </FormProvider>
  );
}
