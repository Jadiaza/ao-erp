import { createFileRoute } from "@tanstack/react-router";
import { AdminScreen } from "../components/admin-screen";
import { institutions } from "../data/demo";
export const Route = createFileRoute("/instituciones")({
  component: () => (
    <AdminScreen
      title="Instituciones"
      description="Parroquias, obras y sedes vinculadas a organizaciones del ecosistema."
      storageKey="ao-saas:institutions"
      rows={institutions}
      columns={["Institución", "Referencia", "Responsable", "Estado"]}
      createLabel="Nueva institución"
      empty="No hay instituciones que coincidan"
    />
  ),
});
