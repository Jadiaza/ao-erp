import { useState } from "react";
import { FormValidationMessage } from "@/components/forms/form-validation-message";

export function FormFileField({
  label = "Archivo",
  accept,
  onChange,
}: {
  label?: string;
  accept?: string;
  onChange?: (file: File | null) => void;
}) {
  const [error, setError] = useState<string>();
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type="file"
        accept={accept}
        className="rounded-md border bg-background px-3 py-2 text-sm"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0] ?? null;
          const nextError =
            file && file.size > 10 * 1024 * 1024 ? "El archivo no puede superar 10 MB." : undefined;
          setError(nextError);
          if (!nextError) onChange?.(file);
        }}
      />
      {error && <FormValidationMessage>{error}</FormValidationMessage>}
      <span className="text-xs text-muted-foreground">
        El componente entrega el archivo al módulo; no simula una carga remota.
      </span>
    </label>
  );
}
