import { createFileRoute } from "@tanstack/react-router";
import { PlatformAdminScreen } from "@/components/modules/platform-admin-screen";

export const Route = createFileRoute("/app/administracion-plataforma")({
  component: PlatformAdminScreen,
});
