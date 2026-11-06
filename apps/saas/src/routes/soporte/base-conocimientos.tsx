import { createFileRoute } from "@tanstack/react-router";
import { SupportAreaScreen } from "../../components/support-area-screen";

export const Route = createFileRoute("/soporte/base-conocimientos")({
  component: () => <SupportAreaScreen area="base-conocimientos" />,
});
