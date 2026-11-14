import { beforeEach, describe, expect, it } from "vitest";
import {
  authenticateUser,
  clearActiveSession,
  ensureDemoCredentialsSeeded,
  getActiveSession,
  getTemporaryDemoCredentials,
  hashPassword,
  requestPasswordReset,
} from "../data/auth-service";
import { repositories, saasStore } from "../data/saas-repository";

describe("Flujo de autenticación e inicio de sesión A&O ERP SaaS", () => {
  beforeEach(async () => {
    localStorage.clear();
    saasStore.reset();
    await ensureDemoCredentialsSeeded();
  });

  it("proporciona las credenciales temporales de demostración oficiales", () => {
    const creds = getTemporaryDemoCredentials();
    expect(creds.email).toBe("demo@aoerp.local");
    expect(creds.password).toBe("A0ERP-Demo-2026!");
    expect(creds.rememberMe).toBe(true);
  });

  it("registra la cuenta demo en el repositorio de usuarios con estado activo", () => {
    const users = repositories.users.list();
    const demoUser = users.find((u) => u.detail?.toLowerCase() === "demo@aoerp.local");
    expect(demoUser).toBeDefined();
    expect(demoUser?.status).toBe("Activo");
    expect(demoUser?.role).toBe("Administrador de plataforma");
  });

  it("valida y rechaza contraseñas erróneas con mensajes claros", async () => {
    const res = await authenticateUser({
      email: "demo@aoerp.local",
      password: "ClaveInvalida123!",
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain("Contraseña incorrecta");
    expect(getActiveSession()).toBeNull();
  });

  it("valida y rechaza usuarios inexistentes", async () => {
    const res = await authenticateUser({
      email: "desconocido@noexiste.local",
      password: "CualquierPassword!",
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain("no válidas");
  });

  it("autentica con éxito la cuenta demo y reconoce organización, roles y licencia", async () => {
    const creds = getTemporaryDemoCredentials();
    const res = await authenticateUser(creds);

    expect(res.success).toBe(true);
    expect(res.session).toBeDefined();

    const session = res.session!;
    expect(session.user.email).toBe("demo@aoerp.local");
    expect(session.status).toBe("authenticated");
    expect(session.isDemoUser).toBe(true);
    expect(session.organization).toBeDefined();
    expect(session.roles.length).toBeGreaterThan(0);
    expect(session.permissions.length).toBeGreaterThan(0);

    // Verifica que se guardó en la sesión activa
    const active = getActiveSession();
    expect(active?.token).toBe(session.token);
  });

  it("cierra la sesión activa correctamente", async () => {
    const creds = getTemporaryDemoCredentials();
    await authenticateUser(creds);
    expect(getActiveSession()).not.toBeNull();

    clearActiveSession();
    expect(getActiveSession()).toBeNull();
  });

  it("genera hashes SHA-256 de forma consistente sin guardar claves planas", async () => {
    const hash1 = await hashPassword("A0ERP-Demo-2026!", "salt-test");
    const hash2 = await hashPassword("A0ERP-Demo-2026!", "salt-test");
    const hashDifferent = await hashPassword("OtraClave123!", "salt-test");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashDifferent);
    expect(hash1).not.toContain("A0ERP-Demo-2026!");
  });

  it("procesa la solicitud de restablecimiento de contraseña", async () => {
    const res = await requestPasswordReset("demo@aoerp.local");
    expect(res.success).toBe(true);
    expect(res.message).toContain("Se ha enviado");
  });
});
