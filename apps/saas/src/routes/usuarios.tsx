import { createFileRoute } from "@tanstack/react-router";
import { AdminScreen } from "../components/admin-screen";
import { users } from "../data/demo";
export const Route = createFileRoute("/usuarios")({
  component: () => (
    <AdminScreen
      title="Usuarios"
      description="Directorio global de operadores y usuarios asignados a organizaciones."
      storageKey="ao-saas:users"
      rows={users}
      columns={["Usuario", "Correo / rol", "Organización", "Estado"]}
      createLabel="Invitar usuario"
      empty="No hay usuarios que coincidan"
    />
  ),
});
