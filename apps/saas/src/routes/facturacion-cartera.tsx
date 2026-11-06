import { createFileRoute } from "@tanstack/react-router";
import { SaasModuleScreen } from "../components/saas-module-screen";

export const Route = createFileRoute("/facturacion-cartera")({
  component: () => <SaasModuleScreen path="facturacion-cartera" />,
});
