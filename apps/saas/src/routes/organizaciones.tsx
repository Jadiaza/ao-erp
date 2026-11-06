import { createFileRoute } from "@tanstack/react-router";
import { AdminScreen } from "../components/admin-screen";
import { organizations } from "../data/demo";
export const Route = createFileRoute("/organizaciones")({
  component: () => (
    <AdminScreen
      title="Organizaciones"
      description="Clientes y organizaciones que administran productos A&O."
      storageKey="ao-saas:organizations"
      rows={organizations}
      columns={["Organización", "Tipo", "Contacto", "Estado"]}
      createLabel="Nueva organización"
      empty="No hay organizaciones que coincidan"
    />
  ),
});
