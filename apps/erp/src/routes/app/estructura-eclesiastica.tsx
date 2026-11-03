import { createFileRoute } from "@tanstack/react-router";
import { EcclesialStructureScreen } from "@/components/modules/ecclesial-structure-screen";

export const Route = createFileRoute("/app/estructura-eclesiastica")({
  component: EcclesialStructureScreen,
});
