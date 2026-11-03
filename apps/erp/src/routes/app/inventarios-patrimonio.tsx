import { createFileRoute } from "@tanstack/react-router";
import { AssetsScreen } from "@/components/modules/assets-screen";

export const Route = createFileRoute("/app/inventarios-patrimonio")({
  component: AssetsScreen,
});
