import { createFileRoute } from "@tanstack/react-router";
import { PlansLicensingScreen } from "../components/plans-licensing-screen";

export const Route = createFileRoute("/planes-licencias")({
  component: PlansLicensingScreen,
});
