import { createFileRoute } from "@tanstack/react-router";
import { AdminScreen } from "../components/admin-screen";
import { plans } from "../data/demo";
import { repositories } from "../data/saas-repository";
export const Route = createFileRoute("/planes-licencias")({
  component: () => (
    <AdminScreen
      title="Planes y licencias"
      description="Oferta comercial y estados de licencia del ecosistema A&O."
      storageKey="ao-saas:plans"
      rows={plans}
      columns={["Plan", "Descripción", "Cobertura", "Estado"]}
      createLabel="Nuevo plan"
      empty="No hay planes que coincidan"
      repository={repositories.plans}
    />
  ),
});
