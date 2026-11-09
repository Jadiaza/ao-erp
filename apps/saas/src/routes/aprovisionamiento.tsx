import { createFileRoute } from "@tanstack/react-router";
import { ProvisioningConsoleScreen } from "../components/provisioning-console-screen";

export const Route = createFileRoute("/aprovisionamiento")({
  component: ProvisioningConsoleScreen,
});
