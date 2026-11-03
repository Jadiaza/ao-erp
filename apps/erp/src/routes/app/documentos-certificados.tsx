import { createFileRoute } from "@tanstack/react-router";
import { DocumentsScreen } from "@/components/modules/documents-screen";

export const Route = createFileRoute("/app/documentos-certificados")({
  component: DocumentsScreen,
});
