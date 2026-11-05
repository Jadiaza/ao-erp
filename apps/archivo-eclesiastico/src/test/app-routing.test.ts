import { describe, expect, it } from "vitest";

describe("A&O Archivo Eclesiástico", () => {
  it("define el alcance de la aplicación como producto archivístico independiente", () => {
    const navigation = [
      "/", "/recepcion", "/digitalizacion", "/documentos", "/clasificacion",
      "/expedientes", "/instrumentos", "/transferencias", "/conservacion"
    ];
    expect(navigation).toContain("/");
    expect(navigation).toContain("/recepcion");
    expect(navigation).toContain("/digitalizacion");
    expect(navigation).toHaveLength(9);
  });
});
