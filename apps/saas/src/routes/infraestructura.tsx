import { createFileRoute } from "@tanstack/react-router";
import { SaasModuleScreen } from "../components/saas-module-screen";

export const Route = createFileRoute("/infraestructura")({
  component: () => <SaasModuleScreen path="infraestructura" />,
});
