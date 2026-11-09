import { createFileRoute } from "@tanstack/react-router";
import { InfrastructureConsoleScreen } from "../components/infrastructure-console-screen";

export const Route = createFileRoute("/infraestructura")({
  component: InfrastructureConsoleScreen,
});
