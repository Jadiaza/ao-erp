import { createFileRoute } from "@tanstack/react-router";
import { ProductsCatalogScreen } from "../components/products-catalog-screen";

export const Route = createFileRoute("/productos-servicios")({
  component: ProductsCatalogScreen,
});
