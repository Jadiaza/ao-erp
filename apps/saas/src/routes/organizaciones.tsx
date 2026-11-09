import { createFileRoute } from "@tanstack/react-router";
import { OrganizationsMasterScreen } from "../components/organizations-master-screen";

export const Route = createFileRoute("/organizaciones")({
  component: OrganizationsMasterScreen,
});
