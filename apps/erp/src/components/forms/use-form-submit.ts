import { useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export function useFormSubmit<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  onSubmit: (values: TFieldValues) => void | Promise<void>,
  onSuccess?: () => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onSuccess?.();
    } catch {
      setSubmitError("No se pudo completar la acción. Revisa la información e inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return { handleSubmit, isSubmitting, submitError };
}
