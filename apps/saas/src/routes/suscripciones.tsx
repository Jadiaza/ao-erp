import { createFileRoute } from "@tanstack/react-router";
import { ContractsSubscriptionsScreen } from "../components/contracts-subscriptions-screen";

export const Route = createFileRoute("/suscripciones")({
  component: ContractsSubscriptionsScreen,
});
