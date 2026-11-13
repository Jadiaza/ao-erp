// Persistencia local directa (sin depender de colecciones tipadas por id).

/**
 * Perfil/paquete demostrativo de A&O ERP.
 * Persistencia local (navegador) para simular activación por suscripción/entitlements SaaS.
 * No representa licencia productiva ni consulta backend real.
 */
export type ErpProductProfile = "catolico" | "cristiano" | "combinado";

export type ChristianTerminology = {
  institutionLabel: string;
  memberLabel: string;
  membersLabel: string;
  celebrationLabel: string;
  celebrationsLabel: string;
  leaderLabel: string;
  campusLabel: string;
};

export type PastoralAccessRole =
  | "pastor_principal"
  | "lider_pastoral"
  | "consejero_autorizado"
  | "administracion"
  | "solo_lectura";

export type AoCristianoSettings = {
  profile: ErpProductProfile;
  organizationId: string;
  campusId: string;
  terminology: ChristianTerminology;
  /** Rol demostrativo para control de acceso a acompañamiento pastoral confidencial. */
  pastoralAccessRole: PastoralAccessRole;
  /** Habilita análisis IA sobre información pastoral sensible (desactivado por defecto). */
  allowPastoralAiAnalysis: boolean;
  /** Módulos genéricos contratados permanecen disponibles cuando el paquete cristiano está activo. */
  genericModulesEnabled: boolean;
};

export const AO_CRISTIANO_SETTINGS_KEY = "ao-erp:ao-cristiano:settings:v1";

export const defaultChristianTerminology: ChristianTerminology = {
  institutionLabel: "Congregación",
  memberLabel: "Miembro",
  membersLabel: "Miembros",
  celebrationLabel: "Culto",
  celebrationsLabel: "Cultos y reuniones",
  leaderLabel: "Líder / responsable",
  campusLabel: "Sede / congregación",
};

export const defaultAoCristianoSettings: AoCristianoSettings = {
  profile: "catolico",
  organizationId: "ORG-DEMO-001",
  campusId: "SEDE-PRINCIPAL",
  terminology: defaultChristianTerminology,
  pastoralAccessRole: "pastor_principal",
  allowPastoralAiAnalysis: false,
  genericModulesEnabled: true,
};

export function readAoCristianoSettings(): AoCristianoSettings {
  if (typeof window === "undefined") return defaultAoCristianoSettings;
  try {
    const saved = window.localStorage.getItem(AO_CRISTIANO_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as AoCristianoSettings | AoCristianoSettings[] | { records?: AoCristianoSettings[] };
      const stored = Array.isArray(parsed)
        ? parsed[0]
        : parsed && typeof parsed === "object" && "records" in parsed && Array.isArray((parsed as { records?: unknown[] }).records)
          ? ((parsed as { records: AoCristianoSettings[] }).records[0] as AoCristianoSettings | undefined)
          : (parsed as AoCristianoSettings);
      if (stored && typeof stored === "object") {
        return {
          ...defaultAoCristianoSettings,
          ...stored,
          terminology: { ...defaultChristianTerminology, ...(stored.terminology ?? {}) },
        };
      }
    }
  } catch {
    // usar defaults
  }
  return defaultAoCristianoSettings;
}

export function writeAoCristianoSettings(settings: AoCristianoSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AO_CRISTIANO_SETTINGS_KEY, JSON.stringify([settings]));
    window.dispatchEvent(new CustomEvent("ao-erp:ao-cristiano:settings-change", { detail: settings }));
  } catch {
    // Persistencia local no disponible; el estado React puede seguir activo en sesión.
  }
}

export function isChristianProfile(profile: ErpProductProfile) {
  return profile === "cristiano" || profile === "combinado";
}

export function isCatholicProfile(profile: ErpProductProfile) {
  return profile === "catolico" || profile === "combinado";
}

/** Rutas católico-exclusivas bloqueadas en suscripción exclusivamente cristiana. */
export const CATHOLIC_ONLY_ROUTE_PATHS = new Set([
  "/app/gestion-sacramental",
  "/app/libros-sacramentales",
  "/app/gestion-diocesana",
  "/app/liturgia-celebraciones",
  "/app/catequesis-formacion",
]);

/** Rutas del paquete A&O Cristiano: requieren perfil cristiano o combinado cuando representan funcionalidad exclusiva del paquete. */
export const CHRISTIAN_PACKAGE_ROUTE_PATHS = new Set([
  "/app/acompanamiento-pastoral",
]);

export function isRouteAllowedForProfile(path: string, profile: ErpProductProfile): boolean {
  if (profile === "cristiano" && CATHOLIC_ONLY_ROUTE_PATHS.has(path)) return false;
  if (profile === "catolico" && CHRISTIAN_PACKAGE_ROUTE_PATHS.has(path)) return false;
  // Perfil combinado conserva acceso a módulos católicos y cristianos según suscripción/paquetes contratados.
  return true;
}

export function getModuleAccessMessage(path: string, profile: ErpProductProfile): string | null {
  if (profile === "cristiano" && CATHOLIC_ONLY_ROUTE_PATHS.has(path)) {
    return "Este módulo es exclusivo del perfil católico y no forma parte de la suscripción A&O Cristiano activa. La información histórica no se elimina; el acceso funcional permanece bloqueado mientras el paquete no esté contratado.";
  }
  if (profile === "catolico" && CHRISTIAN_PACKAGE_ROUTE_PATHS.has(path)) {
    return "Este módulo forma parte del paquete A&O Cristiano y no está habilitado en la suscripción/perfil activo. Al activar el paquete o un plan combinado, el acceso funcional se habilita sin eliminar datos históricos.";
  }
  return null;
}

export function canAccessPastoralCare(role: PastoralAccessRole): boolean {
  return role === "pastor_principal" || role === "lider_pastoral" || role === "consejero_autorizado";
}

export function canWritePastoralCare(role: PastoralAccessRole): boolean {
  return role === "pastor_principal" || role === "lider_pastoral" || role === "consejero_autorizado";
}

export function maskPastoralSensitive(allowed: boolean, value: string): string {
  if (allowed) return value;
  return "Reservado · acceso pastoral autorizado requerido";
}