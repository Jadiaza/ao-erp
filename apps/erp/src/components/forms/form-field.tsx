import type { ReactNode } from "react";
import type { Control, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField as RhfFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FormFieldRenderProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  required: boolean;
};

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  label,
  description,
  required = false,
  render,
}: {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  description?: string;
  required?: boolean;
  render: (props: FormFieldRenderProps<TFieldValues, TName>) => ReactNode;
}) {
  return (
    <RhfFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="min-w-0 space-y-1.5">
          <FormLabel>
            {label}
            {required && (
              <>
                <span aria-hidden="true" className="ml-1 text-destructive">
                  *
                </span>
                <span className="sr-only"> (obligatorio)</span>
              </>
            )}
          </FormLabel>
          <FormControl>{render({ field, required })}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type CommonFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
};

export function TextInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  type = "text",
  autoComplete,
  inputMode,
  ...props
}: CommonFieldProps<TFieldValues, TName> & {
  type?: "text" | "email" | "tel" | "number" | "date";
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal";
}) {
  return (
    <FormField
      {...props}
      render={({ field, required }) => (
        <Input
          {...field}
          value={field.value ?? ""}
          type={type}
          placeholder={props.placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
          aria-required={required}
          className="min-w-0"
        />
      )}
    />
  );
}

export function TextareaInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: CommonFieldProps<TFieldValues, TName> & { rows?: number; maxLength?: number }) {
  return (
    <FormField
      {...props}
      render={({ field, required }) => (
        <Textarea
          {...field}
          value={field.value ?? ""}
          rows={props.rows ?? 4}
          maxLength={props.maxLength}
          placeholder={props.placeholder}
          required={required}
          aria-required={required}
          className="min-h-24 resize-y"
        />
      )}
    />
  );
}

export function SelectInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: CommonFieldProps<TFieldValues, TName> & {
    options: Array<{ value: string; label: string }>;
    emptyLabel?: string;
  },
) {
  return (
    <FormField
      {...props}
      render={({ field, required }) => (
        <Select value={String(field.value ?? "")} onValueChange={field.onChange}>
          <SelectTrigger
            ref={field.ref}
            onBlur={field.onBlur}
            name={field.name}
            aria-required={required}
            className="min-w-0"
          >
            <SelectValue
              placeholder={props.placeholder ?? props.emptyLabel ?? "Selecciona una opción"}
            />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}

export function EmailInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: CommonFieldProps<TFieldValues, TName>) {
  return <TextInputField {...props} type="email" autoComplete="email" inputMode="email" />;
}

export function PhoneInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: CommonFieldProps<TFieldValues, TName>) {
  return <TextInputField {...props} type="tel" autoComplete="tel" inputMode="tel" />;
}

export function NumberInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: CommonFieldProps<TFieldValues, TName> & { min?: number; max?: number; step?: number }) {
  return (
    <FormField
      {...props}
      render={({ field, required }) => (
        <Input
          {...field}
          value={field.value ?? ""}
          type="number"
          min={props.min}
          max={props.max}
          step={props.step}
          placeholder={props.placeholder}
          required={required}
          aria-required={required}
          onChange={(event) =>
            field.onChange(
              event.currentTarget.value === "" ? "" : event.currentTarget.valueAsNumber,
            )
          }
          className="min-w-0"
        />
      )}
    />
  );
}

export function DateInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: CommonFieldProps<TFieldValues, TName> & { min?: string; max?: string }) {
  return (
    <FormField
      {...props}
      render={({ field, required }) => (
        <Input
          {...field}
          value={field.value ?? ""}
          type="date"
          min={props.min}
          max={props.max}
          required={required}
          aria-required={required}
          className="min-w-0"
        />
      )}
    />
  );
}
