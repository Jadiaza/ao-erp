import { useState, type ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { cn } from "@ao/utilities";
import { FormActions } from "@/components/forms/form-actions";
import { FormHeader } from "@/components/forms/form-header";
import { useFormSubmit } from "@/components/forms/use-form-submit";

export type FormWizardStep = {
  title: string;
  description?: string;
  fields?: string[];
  content: ReactNode;
};

export function FormWizard<TFieldValues extends FieldValues>({
  form,
  title,
  description,
  steps,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  className,
}: {
  form: UseFormReturn<TFieldValues>;
  title: string;
  description?: string;
  steps: FormWizardStep[];
  onSubmit: (values: TFieldValues) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(0);
  const { handleSubmit, isSubmitting, submitError } = useFormSubmit(form, onSubmit, onCancel);
  const step = steps[current];
  const isLast = current === steps.length - 1;
  const next = async () => {
    const valid = await form.trigger(step?.fields as never);
    if (valid && !isLast) setCurrent((value) => value + 1);
  };
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
          <FormHeader title={title} description={description} />
          <ol aria-label="Progreso del formulario" className="mt-4 grid gap-2 sm:grid-cols-4">
            {steps.map((item, index) => (
              <li
                key={item.title}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  index === current ? "font-semibold text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border",
                    index <= current && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {index + 1}
                </span>
                {item.title}
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-5 p-4 sm:p-7">
          <section aria-labelledby={`wizard-step-${current}`}>
            <h2 id={`wizard-step-${current}`} className="mb-1 font-heading text-lg font-bold">
              {step?.title}
            </h2>
            {step?.description && (
              <p className="mb-4 text-sm text-muted-foreground">{step.description}</p>
            )}
            {step?.content}
          </section>
          {submitError && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {submitError}
            </p>
          )}
        </div>
        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:flex-row sm:justify-between sm:px-7">
          {current > 0 ? (
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm"
              onClick={() => setCurrent((value) => value - 1)}
            >
              Anterior
            </button>
          ) : (
            <span />
          )}
          {isLast ? (
            <FormActions submitLabel={submitLabel} pending={isSubmitting} onCancel={onCancel} />
          ) : (
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              onClick={next}
            >
              Siguiente
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
