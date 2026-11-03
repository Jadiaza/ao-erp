import { createFileRoute } from "@tanstack/react-router";
import { SettingsCenterScreen } from "@/components/modules/settings-center-screen";

export const Route = createFileRoute("/app/configuracion")({
  component: SettingsCenterScreen,
});
