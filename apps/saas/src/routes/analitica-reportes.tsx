import { createFileRoute } from "@tanstack/react-router";
import { SaasModuleScreen } from "../components/saas-module-screen";

export const Route = createFileRoute("/analitica-reportes")({
  component: () => <SaasModuleScreen path="analitica-reportes" />,
});
