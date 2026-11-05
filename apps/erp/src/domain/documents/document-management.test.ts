import { describe, expect, it } from "vitest";
import { canReadDocument, transitionDocument, type ManagedDocument } from "./document-management";
const doc: ManagedDocument = { id: "d1", title: "Acta", classification: "administrativo", access: "confidential", status: "draft", ownerId: "u1", versions: [{ version: 1, fileChecksum: "sha256:abc", createdAt: "2026-11-05", createdBy: "u1", changeNote: "Creación" }], currentVersion: 1 };
describe("gestión documental", () => {
  it("aplica nivel mínimo de acceso", () => {
    expect(canReadDocument(doc, "internal")).toBe(false);
    expect(canReadDocument(doc, "confidential")).toBe(true);
  });
  it("impide publicar directamente desde borrador", () => {
    expect(() => transitionDocument(doc, "published")).toThrow("DOCUMENT_TRANSITION_INVALID");
  });
});
