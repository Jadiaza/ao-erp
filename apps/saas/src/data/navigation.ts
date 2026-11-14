import type { AuthSession } from "./auth-service";
import type { SaasIconName } from "../components/saas-icons";

export type NavGroupKey = "primary" | "platform" | "commercial" | "control";

export type ModuleTileTone = "blue" | "gold" | "sky" | "violet" | "emerald" | "rose" | "amber";

export interface SaasNavModule {
  id: string;
  to: string;
  label: string;
  launcherLabel: string;
  description: string;
  group: NavGroupKey;
  icon: SaasIconName;
  tone: ModuleTileTone;
  requiredPermissions: string[];
  allowedRoles: string[];
  showInLauncher?: boolean;
}

export const SAAS_NAV_MODULES: SaasNavModule[] = [
  {
    id: "dashboard",
    to: "/",
    label: "Dashboard",
    launcherLabel: "Dashboard",
    description: "Resumen ejecutivo del ecosistema.",
    group: "primary",
    icon: "dashboard",
    tone: "blue",
    requiredPermissions: ["dashboard:read", "system:access"],
    allowedRoles: [
      "Administrador de plataforma",
      "Administrador institucional",
      "Usuario operativo",
    ],
    showInLauncher: false,
  },
  {
    id: "organizaciones",
    to: "/organizaciones",
    label: "Organizaciones",
    launcherLabel: "Organizaciones",
    description: "Diócesis, redes y gobiernos multi-tenant.",
    group: "platform",
    icon: "organizations",
    tone: "blue",
    requiredPermissions: ["organizations:read", "system:access"],
    allowedRoles: ["Administrador de plataforma", "Administrador institucional"],
  },
  {
    id: "instituciones",
    to: "/instituciones",
    label: "Instituciones",
    launcherLabel: "Instituciones",
    description: "Parroquias, capillas y sedes activas.",
    group: "platform",
    icon: "institutions",
    tone: "gold",
    requiredPermissions: ["institutions:read", "system:access"],
    allowedRoles: [
      "Administrador de plataforma",
      "Administrador institucional",
      "Usuario operativo",
    ],
  },
  {
    id: "aprovisionamiento",
    to: "/aprovisionamiento",
    label: "Aprovisionamiento",
    launcherLabel: "Aprovisionamiento",
    description: "Despliegue de entornos y altas guiadas.",
    group: "platform",
    icon: "provisioning",
    tone: "sky",
    requiredPermissions: ["provisioning:manage", "system:access"],
    allowedRoles: ["Administrador de plataforma"],
  },
  {
    id: "usuarios",
    to: "/usuarios",
    label: "Usuarios",
    launcherLabel: "Usuarios",
    description: "Cuentas globales y operadores.",
    group: "platform",
    icon: "users",
    tone: "violet",
    requiredPermissions: ["users:read", "system:access"],
    allowedRoles: ["Administrador de plataforma", "Administrador institucional"],
  },
  {
    id: "roles-permisos",
    to: "/roles-permisos",
    label: "Roles y permisos",
    launcherLabel: "Roles y permisos",
    description: "Control granular de acceso por rol.",
    group: "platform",
    icon: "roles",
    tone: "blue",
    requiredPermissions: ["roles:read", "system:access"],
    allowedRoles: ["Administrador de plataforma", "Administrador institucional"],
  },
  {
    id: "clientes",
    to: "/clientes",
    label: "Clientes",
    launcherLabel: "Clientes",
    description: "Titulares contractuales y cuentas.",
    group: "commercial",
    icon: "clients",
    tone: "emerald",
    requiredPermissions: ["clients:read", "system:access"],
    allowedRoles: ["Administrador de plataforma"],
  },
  {
    id: "productos-servicios",
    to: "/productos-servicios",
    label: "Productos y servicios",
    launcherLabel: "Productos y servicios",
    description: "Catálogo de aplicaciones A&O.",
    group: "commercial",
    icon: "products",
    tone: "emerald",
    requiredPermissions: ["products:read", "system:access"],
    allowedRoles: ["Administrador de plataforma", "Administrador institucional"],
  },
  {
    id: "planes-licencias",
    to: "/planes-licencias",
    label: "Planes y licencias",
    launcherLabel: "Planes y licencias",
    description: "Ediciones, cupos y vigencias.",
    group: "commercial",
    icon: "plans",
    tone: "blue",
    requiredPermissions: ["plans:read", "system:access"],
    allowedRoles: ["Administrador de plataforma", "Administrador institucional"],
  },
  {
    id: "suscripciones",
    to: "/suscripciones",
    label: "Suscripciones y licencias",
    launcherLabel: "Suscripciones",
    description: "Contratos recurrentes y renovaciones.",
    group: "commercial",
    icon: "subscriptions",
    tone: "violet",
    requiredPermissions: ["subscriptions:read", "system:access"],
    allowedRoles: ["Administrador de plataforma", "Administrador institucional"],
  },
  {
    id: "facturacion-cartera",
    to: "/facturacion-cartera",
    label: "Facturación y cartera",
    launcherLabel: "Facturación y cartera",
    description: "Cobros, facturas y recaudo por divisa.",
    group: "commercial",
    icon: "billing",
    tone: "rose",
    requiredPermissions: ["billing:read", "system:access"],
    allowedRoles: ["Administrador de plataforma", "Administrador institucional"],
  },
  {
    id: "identidad-seguridad",
    to: "/identidad-seguridad",
    label: "Identidad y seguridad",
    launcherLabel: "Identidad y seguridad",
    description: "Sesiones, políticas y resguardo.",
    group: "control",
    icon: "security",
    tone: "amber",
    requiredPermissions: ["security:read", "system:access"],
    allowedRoles: ["Administrador de plataforma", "Administrador institucional"],
  },
  {
    id: "soporte",
    to: "/soporte",
    label: "Soporte y asistencia",
    launcherLabel: "Soporte y asistencia",
    description: "Mesa de ayuda y diagnóstico técnico.",
    group: "control",
    icon: "support",
    tone: "violet",
    requiredPermissions: ["support:read", "system:access"],
    allowedRoles: [
      "Administrador de plataforma",
      "Administrador institucional",
      "Usuario operativo",
    ],
  },
  {
    id: "infraestructura",
    to: "/infraestructura",
    label: "Infraestructura",
    launcherLabel: "Infraestructura",
    description: "Entornos, nodos y salud operativa.",
    group: "control",
    icon: "infrastructure",
    tone: "sky",
    requiredPermissions: ["infrastructure:read", "system:access"],
    allowedRoles: ["Administrador de plataforma"],
  },
  {
    id: "auditoria-cumplimiento",
    to: "/auditoria-cumplimiento",
    label: "Auditoría y cumplimiento",
    launcherLabel: "Auditoría y cumplimiento",
    description: "Bitácora de eventos y trazabilidad.",
    group: "control",
    icon: "audit",
    tone: "amber",
    requiredPermissions: ["audit:read", "system:access"],
    allowedRoles: ["Administrador de plataforma", "Administrador institucional"],
  },
  {
    id: "analitica-reportes",
    to: "/analitica-reportes",
    label: "Analítica y reportes",
    launcherLabel: "Analítica y reportes",
    description: "Indicadores y reportes ejecutivos.",
    group: "control",
    icon: "analytics",
    tone: "blue",
    requiredPermissions: ["analytics:read", "system:access"],
    allowedRoles: [
      "Administrador de plataforma",
      "Administrador institucional",
      "Usuario operativo",
    ],
  },
  {
    id: "configuracion",
    to: "/configuracion",
    label: "Configuración",
    launcherLabel: "Configuración",
    description: "Preferencias globales y tema visual.",
    group: "primary",
    icon: "settings",
    tone: "blue",
    requiredPermissions: ["settings:manage", "system:access"],
    allowedRoles: ["Administrador de plataforma", "Administrador institucional"],
  },
];

export const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard Ejecutivo",
  "/configuracion": "Configuración Global",
  "/organizaciones": "Organizaciones",
  "/instituciones": "Instituciones",
  "/usuarios": "Usuarios Globales",
  "/roles-permisos": "Roles y Permisos",
  "/planes-licencias": "Planes y Licencias",
  "/clientes": "Clientes Comerciales",
  "/productos-servicios": "Productos y Servicios",
  "/suscripciones": "Suscripciones y Licencias",
  "/facturacion-cartera": "Facturación y Cartera",
  "/identidad-seguridad": "Identidad y Seguridad",
  "/aprovisionamiento": "Aprovisionamiento",
  "/soporte": "Centro de Soporte",
  "/infraestructura": "Infraestructura",
  "/auditoria-cumplimiento": "Auditoría y Cumplimiento",
  "/analitica-reportes": "Analítica y Reportes",
};

export function hasModuleAccess(session: AuthSession | null, module: SaasNavModule): boolean {
  if (!session) return false;

  const permissions = session.permissions ?? [];
  const roles = session.roles ?? [];

  if (
    permissions.includes("*") ||
    permissions.includes("system:access") ||
    roles.includes("Administrador de plataforma")
  ) {
    return true;
  }

  if (permissions.some((permission) => module.requiredPermissions.includes(permission))) {
    return true;
  }

  // Si la sesión solo contiene permisos genéricos sin detalle granular, validar por rol asignado
  const hasOnlyGenericFallback =
    permissions.length === 0 || permissions.every((p) => p === "dashboard:read");
  if (hasOnlyGenericFallback && roles.some((role) => module.allowedRoles.includes(role))) {
    return true;
  }

  return false;
}

export function findModuleByPathname(pathname: string): SaasNavModule | undefined {
  if (pathname === "/") {
    return SAAS_NAV_MODULES.find((module) => module.to === "/");
  }
  return SAAS_NAV_MODULES.find(
    (module) =>
      module.to !== "/" && (pathname === module.to || pathname.startsWith(`${module.to}/`)),
  );
}

export function canAccessRoute(session: AuthSession | null, pathname: string): boolean {
  if (pathname === "/login" || pathname === "/vercel-runtime") return true;
  const targetModule = findModuleByPathname(pathname);
  if (!targetModule) return Boolean(session);
  return hasModuleAccess(session, targetModule);
}

export function getAccessibleLauncherModules(session: AuthSession | null): SaasNavModule[] {
  return SAAS_NAV_MODULES.filter(
    (module) => module.showInLauncher !== false && hasModuleAccess(session, module),
  );
}

export function getAccessibleGroupLinks(
  session: AuthSession | null,
  group: NavGroupKey,
): SaasNavModule[] {
  return SAAS_NAV_MODULES.filter(
    (module) => module.group === group && (!session || hasModuleAccess(session, module)),
  );
}
