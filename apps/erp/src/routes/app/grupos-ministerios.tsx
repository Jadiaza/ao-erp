import { createFileRoute } from "@tanstack/react-router";
import { GroupsScreen } from "@/components/modules/groups-screen";

export const Route = createFileRoute("/app/grupos-ministerios")({
  component: GroupsScreen,
});
