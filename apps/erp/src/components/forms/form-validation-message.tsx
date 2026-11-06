export function FormValidationMessage({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {children}
    </p>
  );
}
