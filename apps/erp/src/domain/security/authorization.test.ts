import { describe, expect, it } from "vitest";
import { authorize, canAuthenticate, type AccessPolicy } from "./authorization";
describe("autorización", () => {
  it("exige rol, organización y alcance", () => {
    const subject = { userId: "u1", roleIds: ["secretary"], organizationId: "org1", unitIds: ["parish1"], attributes: {} };
    const policy: AccessPolicy = { id: "p1", resource: "sacramental-entry", actions: ["read"], roleIds: ["secretary"], organizationScoped: true, unitScoped: true };
    expect(authorize(subject, policy, "read", "org1", "parish1")).toBe(true);
    expect(authorize(subject, policy, "read", "org2", "parish1")).toBe(false);
    expect(authorize(subject, policy, "delete", "org1", "parish1")).toBe(false);
  });
  it("requiere MFA cuando la política lo exige", () => {
    expect(canAuthenticate("active", false, true)).toBe(false);
    expect(canAuthenticate("active", true, true)).toBe(true);
    expect(canAuthenticate("locked", true, false)).toBe(false);
  });
});
