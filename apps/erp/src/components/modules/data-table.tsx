import type { ReactNode } from "react";
import { EmptyState } from "@/components/modules/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type DataTableColumn<T> = { id: string; header: ReactNode; cell: (row: T) => ReactNode; className?: string };

export function DataTable<T>({ rows, columns, getRowId, onRowClick, emptyTitle = "Sin registros", emptyDescription = "No hay información para mostrar." }: { rows: T[]; columns: DataTableColumn<T>[]; getRowId: (row: T) => string | number; onRowClick?: (row: T) => void; emptyTitle?: string; emptyDescription?: string }) {
  if (rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return <div className="min-w-0 overflow-hidden rounded-xl border bg-card"><Table><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.id} className={column.className}>{column.header}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={getRowId(row)} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? "cursor-pointer" : undefined}>{columns.map((column) => <TableCell key={column.id} className={column.className}>{column.cell(row)}</TableCell>)}</TableRow>)}</TableBody></Table></div>;
}
