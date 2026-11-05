import { createFileRoute } from "@tanstack/react-router";
import { ArchiveSectionScreen } from "@/components/modules/archive-section-screen";

export const Route = createFileRoute("/app/archivo-transferencias")({
  component: () => <ArchiveSectionScreen section="transferencias" />,
});
