import { createFileRoute } from "@tanstack/react-router";
import { InstitutionsMasterScreen } from "../components/institutions-master-screen";

export const Route = createFileRoute("/instituciones")({
  component: InstitutionsMasterScreen,
});
