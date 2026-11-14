import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TableActionIconButton, TableRowActions } from "../components/saas-ui";

describe("Acciones visuales centralizadas de tablas administrativas A&O SaaS", () => {
  it("renderiza iconos accesibles sin texto visible para visualizar, editar, eliminar y configurar", () => {
    const html = renderToStaticMarkup(
      createElement(TableRowActions, {
        children: [
          createElement(TableActionIconButton, {
            key: "view",
            kind: "view",
            label: "Ver ficha",
            onClick: () => {},
          }),
          createElement(TableActionIconButton, {
            key: "edit",
            kind: "edit",
            label: "Editar",
            onClick: () => {},
          }),
          createElement(TableActionIconButton, {
            key: "delete",
            kind: "delete",
            label: "Eliminar",
            onClick: () => {},
          }),
          createElement(TableActionIconButton, {
            key: "configure",
            kind: "configure",
            label: "Configurar",
            onClick: () => {},
          }),
        ],
      }),
    );

    expect(html).toContain('class="row-actions"');
    expect(html).toContain("ao-table-action-btn--view");
    expect(html).toContain("ao-table-action-btn--edit");
    expect(html).toContain("ao-table-action-btn--delete");
    expect(html).toContain("ao-table-action-btn--configure");
    expect(html).toContain('title="Ver ficha"');
    expect(html).toContain('aria-label="Ver ficha"');
    expect(html).toContain('title="Editar"');
    expect(html).toContain('aria-label="Editar"');
    expect(html).toContain('title="Eliminar"');
    expect(html).toContain('aria-label="Eliminar"');
    expect(html).toContain('title="Configurar"');
    expect(html).toContain('aria-label="Configurar"');
    expect(html).toContain("<svg");
    expect(html).not.toContain(">Editar<");
    expect(html).not.toContain(">Eliminar<");
  });
});
