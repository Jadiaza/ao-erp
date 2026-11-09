import { createFileRoute } from "@tanstack/react-router";
import { ClientsMasterScreen } from "../components/clients-master-screen";

export const Route = createFileRoute("/clientes")({
  component: ClientsMasterScreen,
});
