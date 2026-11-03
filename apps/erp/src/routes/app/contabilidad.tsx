import { createFileRoute } from "@tanstack/react-router";
import { AccountingScreen } from "@/components/modules/accounting-screen";

export const Route = createFileRoute("/app/contabilidad")({
  component: AccountingScreen,
});
