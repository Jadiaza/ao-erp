import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrdoCalendarView } from "@/components/modules/ordo-calendar-view";
import { normalizeOrdoEntry, normalizeOrdoTime } from "@/lib/ordo/normalize";

const entries = [
  normalizeOrdoEntry({ id: 640047, fecha: "2026-11-01", titulo: "Todos los Santos", colores_dia: "Blanco" })!,
  normalizeOrdoEntry({ id: 640049, fecha: "2026-11-03", titulo: "Contenido del 3 de noviembre", colores_dia: "Verde o Blanco" })!,
];
const times = [
  normalizeOrdoTime({ ANO_ANO: 2026, NOMBRE: "CICLO A PAR", FECHA_CRISTO_REY_II: "2026-11-29" })!,
];

function selectDate(container: HTMLElement, day: string) {
  const button = Array.from(container.querySelectorAll<HTMLButtonElement>("button[data-day]")).find(
    (item) => item.textContent?.trim() === day,
  );
  if (!button) throw new Error(`No se encontró el día ${day} en el calendario de noviembre.`);
  fireEvent.click(button);
}

describe("vista del calendario ORDO", () => {
  it("presenta el contenido recibido y conserva un color alternativo sin escogerlo", () => {
    const { container } = render(
      <OrdoCalendarView
        entries={entries}
        feasts={[]}
        times={times}
        loading={{}}
        errors={{}}
        loadedAt={null}
        onRetry={() => undefined}
      />,
    );

    expect(screen.getByText("Todos los Santos")).toBeTruthy();
    selectDate(container, "3");
    expect(screen.getByText("Contenido del 3 de noviembre")).toBeTruthy();
    expect(screen.getByText("Color: Verde o Blanco")).toBeTruthy();
  });

  it("abre la consulta de detalle para un registro ORDO sin efectuar cambios", () => {
    const detailedEntries = [
      normalizeOrdoEntry({
        id: 640047,
        fecha: "2026-11-01",
        titulo: "Todos los Santos",
        primera_lectura: "<p>Texto recibido de ORDO</p>",
      })!,
    ];
    render(
      <OrdoCalendarView
        entries={detailedEntries}
        feasts={[]}
        times={times}
        loading={{}}
        errors={{}}
        loadedAt={null}
        onRetry={() => undefined}
      />,
    );

    fireEvent.click(screen.getByText("Ver contenido"));
    expect(screen.getByText("Referencia ORDO: 640047")).toBeTruthy();
    expect(screen.getByText("Texto recibido de ORDO")).toBeTruthy();
  });

  it("mantiene separado un hito de tiempo cuando ORDO no devuelve contenido para la fecha", () => {
    const { container } = render(
      <OrdoCalendarView
        entries={entries}
        feasts={[]}
        times={times}
        loading={{}}
        errors={{}}
        loadedAt={null}
        onRetry={() => undefined}
      />,
    );

    selectDate(container, "29");
    expect(screen.getByText("ORDO no devolvió registros de contenido para esta fecha")).toBeTruthy();
    expect(screen.getAllByText("Cristo Rey").length).toBeGreaterThan(0);
  });
});
