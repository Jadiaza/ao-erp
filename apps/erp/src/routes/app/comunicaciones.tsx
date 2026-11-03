import { createFileRoute } from "@tanstack/react-router";
import { CommunicationsScreen } from "@/components/modules/communications-screen";

export const Route = createFileRoute("/app/comunicaciones")({
  component: CommunicationsScreen,
});
