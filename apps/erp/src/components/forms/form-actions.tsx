import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FormActions({
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  pendingLabel = "Procesando…",
  pending = false,
  disabled = false,
  hideCancel = false,
  onCancel,
}: {
  submitLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  pending?: boolean;
  disabled?: boolean;
  hideCancel?: boolean;
  onCancel?: (() => void) | undefined;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      {!hideCancel && (
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" disabled={disabled || pending}>
        {pending && <LoaderCircle aria-hidden="true" className="mr-2 size-4 animate-spin" />}
        {pending ? pendingLabel : submitLabel}
      </Button>
    </div>
  );
}
