export function FormCharacterCounter({ value, maxLength }: { value: string; maxLength: number }) {
  return (
    <p aria-live="polite" className="text-right text-xs text-muted-foreground">
      {value.length} / {maxLength}
    </p>
  );
}
