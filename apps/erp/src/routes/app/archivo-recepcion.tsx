import { createFileRoute } from "@tanstack/react-router";
import { ArchiveSectionScreen } from "@/components/modules/archive-section-screen";

export const Route = createFileRoute("/app/archivo-recepcion")({
  component: () => <ArchiveSectionScreen section="recepcion" />,
});
