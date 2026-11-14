import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import type { AuthSession } from "../data/auth-service";
import { canAccessRoute, findModuleByPathname } from "../data/navigation";

export interface ModuleRouteAccessInput {
  pathname: string;
  roles: string[];
  permissions: string[];
}

export const validateModuleRouteAccess = createServerFn({ method: "POST" })
  .inputValidator((input: ModuleRouteAccessInput) => input)
  .handler(async ({ data }) => {
    setResponseHeaders(
      new Headers({
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      }),
    );

    const normalizedRoles = Array.isArray(data.roles) ? data.roles : [];
    const normalizedPermissions = Array.isArray(data.permissions) ? data.permissions : [];

    const sessionStub: AuthSession | null =
      normalizedRoles.length > 0 || normalizedPermissions.length > 0
        ? {
            token: "server-validation",
            user: { id: "server", name: "Server Check", email: "", status: "Activo" },
            organization: null,
            institution: null,
            roles: normalizedRoles,
            permissions: normalizedPermissions,
            expiresAt: Date.now() + 60_000,
            status: "authenticated",
            isDemoUser: false,
            requiresPasswordChange: false,
          }
        : null;

    const targetModule = findModuleByPathname(data.pathname);
    const allowed = canAccessRoute(sessionStub, data.pathname);

    return {
      allowed,
      pathname: data.pathname,
      moduleId: targetModule?.id ?? null,
      reason: allowed ? null : "Tu rol o permisos no autorizan el acceso a este módulo.",
    } as const;
  });
