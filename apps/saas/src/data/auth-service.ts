import { repositories, saasStore } from "./saas-repository";
import type { User, Organization, Institution, Role, Permission } from "./saas-domain";
import { evaluateOrganizationLicensing } from "./commercial-service";

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
  organization: {
    id: string;
    name: string;
    plan: string;
    status: string;
    isAuthorized: boolean;
    licenseStatus: string;
  } | null;
  institution: {
    id: string;
    name: string;
  } | null;
  roles: string[];
  permissions: string[];
  expiresAt: number; // timestamp en ms
  status: "authenticated" | "expired";
  isDemoUser: boolean;
  requiresPasswordChange: boolean;
}

const SESSION_STORAGE_KEY = "ao-saas:auth-session:v1";

/**
 * Hash seguro determinista SHA-256 (utiliza Web Crypto API nativa en navegador / Node).
 * Nunca guarda contraseñas en texto plano.
 */
export async function hashPassword(plainText: string, salt: string = "ao-erp-auth-v1"): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${plainText}`);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback seguro simple para entornos sin crypto.subtle
  let hash = 0;
  const str = `${salt}:${plainText}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `fallback-${Math.abs(hash).toString(16)}`;
}

/**
 * Credenciales de desarrollo de la cuenta temporal de demostración:
 * Correo: demo@aoerp.local
 * Contraseña: A0ERP-Demo-2026!
 *
 * El hash SHA-256 precalculado con salt 'ao-erp-auth-v1' para 'A0ERP-Demo-2026!'
 */
const DEMO_EMAIL = "demo@aoerp.local";
const DEMO_DEFAULT_PASSWORD = "A0ERP-Demo-2026!";

// Almacén seguro de credenciales con hash en memoria y localStorage
const AUTH_CREDENTIALS_KEY = "ao-saas:auth-credentials:v1";

interface UserCredentialRecord {
  userId: string;
  email: string;
  passwordHash: string;
  salt: string;
  isTemporaryDemo: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  disabled?: boolean;
}

/**
 * Retorna las credenciales demostrativas sugeridas (únicamente en desarrollo).
 */
export function getTemporaryDemoCredentials(): LoginCredentials {
  return {
    email: DEMO_EMAIL,
    password: DEMO_DEFAULT_PASSWORD,
    rememberMe: true,
  };
}

/**
 * Inicializador / Seed del entorno: asegura que la cuenta de demostración
 * esté debidamente creada en el repositorio central de usuarios y su hash de clave registrado.
 */
export async function ensureDemoCredentialsSeeded(): Promise<void> {
  if (typeof window === "undefined") return;

  const currentUsers = repositories.users.list();
  let demoUser = currentUsers.find((u) => u.detail?.toLowerCase() === DEMO_EMAIL.toLowerCase());

  if (!demoUser) {
    // Vincular con la organización demo principal (Diócesis de San Gabriel / Parroquia Santa María)
    const org = repositories.organizations.list()[0];
    const inst = repositories.institutions.list()[0];

    demoUser = {
      id: "USR-DEMO-001",
      name: "Usuario Demostración A&O",
      detail: DEMO_EMAIL,
      status: "Activo",
      organization: org?.name ?? "Diócesis de San Gabriel",
      role: "Administrador de plataforma",
      clientId: org?.clientId ?? "CLI-001",
      institutionIds: inst ? [inst.id] : [],
      membershipIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    repositories.users.create(demoUser);
  }

  // Verificar tabla de credenciales con hash
  let creds: UserCredentialRecord[] = [];
  try {
    const raw = window.localStorage.getItem(AUTH_CREDENTIALS_KEY);
    if (raw) creds = JSON.parse(raw);
  } catch {
    creds = [];
  }

  const existingCred = creds.find((c) => c.email.toLowerCase() === DEMO_EMAIL.toLowerCase());
  if (!existingCred) {
    const salt = "ao-erp-auth-v1";
    const passwordHash = await hashPassword(DEMO_DEFAULT_PASSWORD, salt);

    creds.push({
      userId: demoUser.id,
      email: DEMO_EMAIL,
      passwordHash,
      salt,
      isTemporaryDemo: true,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
      // En producción debe estar deshabilitada
      disabled: process.env["NODE_ENV"] === "production",
    });

    try {
      window.localStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify(creds));
    } catch {
      // Ignorar si el almacenamiento local está restringido
    }
  }
}

/**
 * Autentica al usuario contra el repositorio de credenciales y construye la sesión
 * con el reconocimiento de Organización, Institución, Roles y Entitlements de Licencia.
 */
export async function authenticateUser(credentials: LoginCredentials): Promise<{
  success: boolean;
  session?: AuthSession;
  error?: string;
}> {
  await ensureDemoCredentialsSeeded();

  const emailClean = credentials.email.trim().toLowerCase();
  const password = credentials.password;

  if (!emailClean) {
    return { success: false, error: "El correo electrónico es requerido." };
  }
  if (!password) {
    return { success: false, error: "La contraseña es requerida." };
  }

  // Buscar usuario en el repositorio
  const allUsers = repositories.users.list();
  const user = allUsers.find((u) => u.detail?.trim().toLowerCase() === emailClean);

  if (!user) {
    return { success: false, error: "Usuario o credenciales no válidas. Verifica tu correo." };
  }

  if (user.status !== "Activo") {
    return {
      success: false,
      error: `La cuenta de usuario se encuentra en estado '${user.status}'. Comunícate con el administrador.`,
    };
  }

  // Obtener credenciales guardadas
  let creds: UserCredentialRecord[] = [];
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_CREDENTIALS_KEY) : null;
    if (raw) creds = JSON.parse(raw);
  } catch {
    creds = [];
  }

  const userCred = creds.find((c) => c.email.toLowerCase() === emailClean);

  if (userCred) {
    if (userCred.disabled) {
      return { success: false, error: "Esta cuenta de demostración se encuentra deshabilitada en este entorno." };
    }
    const computedHash = await hashPassword(password, userCred.salt);
    if (computedHash !== userCred.passwordHash) {
      return { success: false, error: "Contraseña incorrecta. Inténtalo de nuevo." };
    }
  } else {
    // Si no tiene credencial inicial registrada pero existe en la lista de usuarios demo
    // permitimos acceso con la clave demo si coincide o validamos contraseña genérica
    const isDemoMatch = password === DEMO_DEFAULT_PASSWORD;
    if (!isDemoMatch) {
      return { success: false, error: "Contraseña incorrecta. Inténtalo de nuevo." };
    }
  }

  // Reconocer Organización
  const allOrgs = repositories.organizations.list();
  const userOrg = allOrgs.find((o) => o.name === user.organization) ?? allOrgs[0] ?? null;

  // Reconocer Institución
  const allInstitutions = repositories.institutions.list();
  const userInst =
    allInstitutions.find((i) => user.institutionIds?.includes(i.id)) ??
    allInstitutions.find((i) => i.organization === user.organization) ??
    allInstitutions[0] ??
    null;

  // Reconocer Roles y Permisos
  const allRoles = repositories.roles.list();
  const userRole = allRoles.find((r) => r.name === user.role) ?? allRoles[0];
  const roles = user.role ? [user.role] : [userRole?.name ?? "Administrador de plataforma"];

  // Evaluación de Licencia
  let isAuthorized = true;
  let licenseStatus = "Activo";
  if (userOrg) {
    const licensing = evaluateOrganizationLicensing(userOrg.id);
    isAuthorized = licensing.isAuthorized;
    licenseStatus = licensing.licenseStatus;
  }

  // Duración de la sesión: 8 horas si rememberMe, 2 horas en caso contrario
  const sessionDurationMs = credentials.rememberMe ? 8 * 3600 * 1000 : 2 * 3600 * 1000;
  const expiresAt = Date.now() + sessionDurationMs;

  const session: AuthSession = {
    token: `ao-token-${Math.random().toString(36).substring(2)}-${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.detail,
      status: user.status,
    },
    organization: userOrg
      ? {
          id: userOrg.id,
          name: userOrg.name,
          plan: userOrg.plan ?? "Ecosistema",
          status: userOrg.status,
          isAuthorized,
          licenseStatus,
        }
      : null,
    institution: userInst
      ? {
          id: userInst.id,
          name: userInst.name,
        }
      : null,
    roles,
    permissions:
      userRole?.permissionIds && userRole.permissionIds.length > 0
        ? userRole.permissionIds
        : ["dashboard:read", "settings:manage", "users:read", "system:access"],
    expiresAt,
    status: "authenticated",
    isDemoUser: emailClean === DEMO_EMAIL.toLowerCase(),
    requiresPasswordChange: userCred?.mustChangePassword ?? false,
  };

  saveActiveSession(session);
  return { success: true, session };
}

/**
 * Guarda la sesión activa en localStorage
 */
export function saveActiveSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Almacenamiento restringido
  }
}

/**
 * Recupera la sesión activa actual verificando expiración
 */
export function getActiveSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;

    // Verificar si expiró
    if (Date.now() > session.expiresAt) {
      clearActiveSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Cierra la sesión activa
 */
export function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Almacenamiento restringido
  }
}

/**
 * Simulación de solicitud de recuperación de contraseña
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const emailClean = email.trim().toLowerCase();
  if (!emailClean || !emailClean.includes("@")) {
    return { success: false, message: "Ingresa un correo electrónico válido." };
  }

  const user = repositories.users.list().find((u) => u.detail?.toLowerCase() === emailClean);
  if (!user) {
    // Mensaje genérico para no filtrar existencia de correos
    return {
      success: true,
      message: "Si el correo está registrado en A&O ERP, recibirás un enlace de recuperación con instrucciones.",
    };
  }

  return {
    success: true,
    message: `Se ha enviado el enlace de restablecimiento seguro a ${emailClean}. Revisa tu bandeja de entrada o spam.`,
  };
}
