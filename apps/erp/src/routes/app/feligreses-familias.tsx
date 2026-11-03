import { createFileRoute } from "@tanstack/react-router";
import { CommunityScreen } from "@/components/modules/community-screen";

export const Route = createFileRoute("/app/feligreses-familias")({
  component: CommunityScreen,
});
