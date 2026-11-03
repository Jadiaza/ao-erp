import { describe, expect, it } from "vitest";
import {
  combineOrdoEntries,
  getOrdoPeriodDescription,
  normalizeOrdoEntry,
  normalizeOrdoText,
} from "@/lib/ordo/normalize";
import { OrdoHtmlContent } from "@/components/modules/ordo-html-content";
import { render, screen } from "@testing-library/react";

describe("normalización de ORDO", () => {
  it("normaliza nulos literales sin alterar el HTML con contenido", () => {
    expect(normalizeOrdoText(null)).toBeNull();
    expect(normalizeOrdoText("null")).toBeNull();
    expect(normalizeOrdoText("<p>null</p>")).toBeNull();
    expect(normalizeOrdoText("<p>San Martín de Porres</p>")).toBe("<p>San Martín de Porres</p>");
  });

  it("preserva celebraciones distintas en la misma fecha y fusiona por id", () => {
    const complete = [
      normalizeOrdoEntry({ id: 640047, fecha: "2026-11-01", misa: "<p>Resumen</p>", celebracion: "Celebración completa" }),
      normalizeOrdoEntry({ id: 640048, fecha: "2026-11-01", misa: "<p>Vigilia</p>" }),
    ].filter((entry) => entry !== null);
    const principal = [
      normalizeOrdoEntry({ id: 640047, fecha: "2026-11-01", primera_lectura: "<p>Lectura</p>", celebracion: null }),
    ].filter((entry) => entry !== null);

    const merged = combineOrdoEntries(complete, principal);
    expect(merged).toHaveLength(2);
    expect(merged.map((entry) => entry.id)).toEqual([640047, 640048]);
    expect(merged[0]?.primera_lectura).toBe("<p>Lectura</p>");
    expect(merged[0]?.celebracion).toBe("Celebración completa");
  });

  it("elige la descripción de tiempo litúrgico correspondiente sin calcularla", () => {
    expect(
      getOrdoPeriodDescription("II TIEMPO ORDINARIO", {
        ordinarySecond: "Descripción servida por ORDO",
      }),
    ).toBe("Descripción servida por ORDO");
    expect(getOrdoPeriodDescription("Tiempo desconocido", {})).toBeNull();
  });
});

describe("contenido HTML externo de ORDO", () => {
  it("conserva formato permitido y elimina etiquetas y atributos activos", () => {
    const { container } = render(
      <OrdoHtmlContent
        html={'<p onclick="alert(1)">Texto <strong>seguro</strong><script>alert(2)</script><img src=x></p>'}
      />,
    );

    expect(screen.getByText("seguro").tagName).toBe("STRONG");
    expect(container.querySelector("script, img, [onclick]")).toBeNull();
    expect(container.textContent).toContain("Texto seguro");
  });
});
