import { createFileRoute } from "@tanstack/react-router";
import { BudgetScreen } from "@/components/modules/budget-screen";

export const Route = createFileRoute("/app/presupuestos")({
  component: BudgetScreen,
});
