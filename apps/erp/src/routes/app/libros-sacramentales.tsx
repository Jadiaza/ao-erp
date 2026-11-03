import { createFileRoute } from "@tanstack/react-router";
import { SacramentalBooksScreen } from "@/components/modules/sacramental-books-screen";

export const Route = createFileRoute("/app/libros-sacramentales")({
  component: SacramentalBooksScreen,
});
