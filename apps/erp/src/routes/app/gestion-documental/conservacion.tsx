import { createFileRoute } from "@tanstack/react-router";
import { ArchiveAreaScreen } from "@/components/modules/archive-area-screen";
export const Route = createFileRoute("/app/gestion-documental/conservacion")({
  component: () => <ArchiveAreaScreen area="conservacion" />,
});
