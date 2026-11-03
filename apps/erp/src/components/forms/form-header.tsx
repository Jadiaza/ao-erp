import type { ElementType, ReactNode } from "react";
import { cn } from "@ao/utilities";

type FormHeaderProps = {
  title: string;
  description?: string | undefined;
  icon?: ReactNode | undefined;
  eyebrow?: string | undefined;
  titleAs?: ElementType<{ className?: string; children?: ReactNode }> | undefined;
  descriptionAs?: ElementType<{ className?: string; children?: ReactNode }> | undefined;
  className?: string | undefined;
};

export function FormHeader({
  title,
  description,
  icon,
  eyebrow,
  titleAs: Title = "h2",
  descriptionAs: Description = "p",
  className,
}: FormHeaderProps) {
  return (
    <header className={cn("flex items-start gap-3", className)}>
      {icon && (
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <Title className="font-heading text-lg font-bold leading-tight text-foreground sm:text-xl">
          {title}
        </Title>
        {description && (
          <Description className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </Description>
        )}
      </div>
    </header>
  );
}
