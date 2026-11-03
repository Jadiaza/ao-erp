import { createFileRoute } from "@tanstack/react-router";
import { LiturgyScreen } from "@/components/modules/liturgy-screen";

export const Route = createFileRoute("/app/liturgia-celebraciones")({
  component: LiturgyScreen,
});
