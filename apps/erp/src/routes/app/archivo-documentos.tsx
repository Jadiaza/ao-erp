import { createFileRoute } from "@tanstack/react-router";
import { ArchiveSectionScreen } from "@/components/modules/archive-section-screen";

export const Route = createFileRoute("/app/archivo-documentos")({
  component: () => <ArchiveSectionScreen section="documentos" />,
});
