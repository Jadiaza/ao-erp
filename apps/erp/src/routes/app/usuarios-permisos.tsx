import { createFileRoute } from "@tanstack/react-router";
import { UsersPermissionsScreen } from "@/components/modules/users-permissions-screen";

export const Route = createFileRoute("/app/usuarios-permisos")({
  component: UsersPermissionsScreen,
});
