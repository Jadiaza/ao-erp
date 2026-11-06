import { createFileRoute } from "@tanstack/react-router";
import { AdminScreen } from "../components/admin-screen";
import { roles } from "../data/demo";
export const Route = createFileRoute("/roles-permisos")({
  component: () => (
    <AdminScreen
      title="Roles y permisos"
      description="Perfiles globales y alcances de acceso que luego deberá validar el servidor."
      storageKey="ao-saas:roles"
      rows={roles}
      columns={["Rol", "Descripción", "Alcance", "Estado"]}
      createLabel="Nuevo rol"
      empty="No hay roles que coincidan"
    />
  ),
});
