import { createFileRoute } from "@tanstack/react-router";
import { TreasuryScreen } from "@/components/modules/treasury-screen";

export const Route = createFileRoute("/app/finanzas-tesoreria")({
  component: TreasuryScreen,
});
