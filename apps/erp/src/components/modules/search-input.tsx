import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchInput({ value, onChange, placeholder = "Buscar...", className }: { value: string; onChange: (value: string) => void; placeholder?: string; className?: string }) {
  return <div className={`relative min-w-48 ${className ?? ""}`}><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-9 pr-9" aria-label={placeholder} />{value && <Button type="button" variant="ghost" size="icon" aria-label="Limpiar búsqueda" onClick={() => onChange("")} className="absolute right-1 top-1/2 size-7 -translate-y-1/2"><X className="size-3.5" /></Button>}</div>;
}
