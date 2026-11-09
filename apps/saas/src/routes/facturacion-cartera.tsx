import { createFileRoute } from "@tanstack/react-router";
import { BillingPortfolioScreen } from "../components/billing-portfolio-screen";

export const Route = createFileRoute("/facturacion-cartera")({
  component: BillingPortfolioScreen,
});
