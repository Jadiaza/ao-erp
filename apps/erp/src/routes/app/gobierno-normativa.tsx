import { createFileRoute } from "@tanstack/react-router";
import { GovernanceNormsScreen } from "@/components/modules/governance-norms-screen";

export const Route = createFileRoute("/app/gobierno-normativa")({
  component: GovernanceNormsScreen,
});
