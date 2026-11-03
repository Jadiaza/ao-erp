import { createFileRoute } from "@tanstack/react-router";
import { SocialActionScreen } from "@/components/modules/social-action-screen";

export const Route = createFileRoute("/app/accion-pastoral-social")({
  component: SocialActionScreen,
});
