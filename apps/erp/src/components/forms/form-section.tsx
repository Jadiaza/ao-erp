import { useId, type ReactNode } from "react";
import { cn } from "@ao/utilities";

export function FormSection({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}
    >
      <div className="flex items-start gap-3 bg-secondary/75 px-4 py-3 text-secondary-foreground">
        {icon && (
          <span aria-hidden="true" className="mt-0.5 shrink-0 text-primary">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 id={headingId} className="font-heading text-sm font-bold sm:text-base">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">{children}</div>
    </section>
  );
}
