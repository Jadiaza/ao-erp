import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  CATHOLIC_ONLY_ROUTE_PATHS,
  CHRISTIAN_PACKAGE_ROUTE_PATHS,
  canAccessPastoralRecord,
  defaultAoCristianoSettings,
  getProfileStorageKey,
  isRouteAllowedForProfile,
  writeAoCristianoSettings,
} from "@/lib/ao-cristiano-profile";
import { christianFamilies, christianMembers, parishioners } from "@/data/community-demo";
import { christianGroups, parishGroups } from "@/data/pastoral-demo";
import { detectScheduleConflict } from "@/data/institutional-demo";
import {
  budgetLines,
  buildJournalEntriesFromMovement,
  christianBudgetLines,
  christianTreasuryMovements,
  treasuryMovements,
} from "@/data/economy-demo";
import { Index as DashboardPage } from "@/routes/index";
import { CommunityScreen } from "@/components/modules/community-screen";
import { GroupsScreen } from "@/components/modules/groups-screen";
import { InstitutionalAgendaScreen } from "@/components/modules/institutional-agenda-screen";
import { TreasuryScreen } from "@/components/modules/treasury-screen";
import { AccountingScreen } from "@/components/modules/accounting-screen";
import { BudgetScreen } from "@/components/modules/budget-screen";
import { InstitutionalAdministrationScreen } from "@/components/modules/institutional-administration-screen";
import { AssetsScreen } from "@/components/modules/assets-screen";
import { PastoralCareScreen } from "@/components/modules/pastoral-care-screen";

function activateTab(name: string) {
  const tab = screen.getByRole("tab", { name });
  fireEvent.mouseDown(tab, { button: 0 });
  fireEvent.click(tab);
}

describe("A&O Cristiano — consolidación funcional Fase 1 y Fase 2", () => {
  beforeEach(() => {
    window.localStorage.clear();
    writeAoCristianoSettings(defaultAoCristianoSettings);
  });

  it("separa los datos de demostración cristianos y católicos sin contaminar el perfil católico", () => {
    expect(parishioners.some((p) => p.id.startsWith("MBR-"))).toBe(false);
    expect(parishioners.some((p) => (p.congregationalBaptisms?.length ?? 0) > 0)).toBe(false);
    expect(christianMembers.some((p) => p.id.startsWith("MBR-"))).toBe(true);
    expect(christianFamilies.length).toBeGreaterThanOrEqual(4);

    expect(parishGroups.some((g) => g.kind === "Célula" || g.name === "Ministerio de Alabanza")).toBe(
      false,
    );
    expect(christianGroups.some((g) => g.kind === "Célula")).toBe(true);

    expect(treasuryMovements.some((m) => m.category === "Diezmos")).toBe(false);
    expect(christianTreasuryMovements.some((m) => m.category === "Diezmos")).toBe(true);

    expect(budgetLines.some((b) => b.area === "Congregacional")).toBe(false);
    expect(christianBudgetLines.some((b) => b.area === "Congregacional")).toBe(true);

    expect(getProfileStorageKey("ao-erp:treasury:movements", "catolico")).toBe(
      "ao-erp:treasury:movements",
    );
    expect(getProfileStorageKey("ao-erp:treasury:movements", "cristiano")).toBe(
      "ao-erp:treasury:movements:cristiano",
    );
  });

  it("protege rutas católicas en perfil cristiano y rutas cristianas en perfil católico", () => {
    for (const path of CATHOLIC_ONLY_ROUTE_PATHS) {
      expect(isRouteAllowedForProfile(path, "cristiano")).toBe(false);
      expect(isRouteAllowedForProfile(path, "catolico")).toBe(true);
      expect(isRouteAllowedForProfile(path, "combinado")).toBe(true);
    }
    for (const path of CHRISTIAN_PACKAGE_ROUTE_PATHS) {
      expect(isRouteAllowedForProfile(path, "catolico")).toBe(false);
      expect(isRouteAllowedForProfile(path, "cristiano")).toBe(true);
      expect(isRouteAllowedForProfile(path, "combinado")).toBe(true);
    }
  });

  it("adapta el Dashboard correctamente según el perfil sin exponer datos confidenciales pastorales", () => {
    const { unmount } = render(<DashboardPage />);
    expect(screen.getByText("Parroquia Santa María del Camino")).toBeInTheDocument();
    expect(screen.getByText("Feligreses de muestra")).toBeInTheDocument();
    unmount();

    writeAoCristianoSettings({
      ...defaultAoCristianoSettings,
      profile: "cristiano",
      organizationId: "ORG-CRI-TEST",
      campusId: "SEDE-NORTE",
    });

    render(<DashboardPage />);
    expect(screen.queryByText("Parroquia Santa María del Camino")).not.toBeInTheDocument();
    expect(screen.getByText(/Congregación · ORG-CRI-TEST/i)).toBeInTheDocument();
    expect(screen.queryByText(/estrictamente confidencial/i)).not.toBeInTheDocument();
  });

  it("permite consulta, edición de miembro, familias y filtrado organizacional en Área 1", () => {
    writeAoCristianoSettings({
      ...defaultAoCristianoSettings,
      profile: "cristiano",
      organizationId: "ORG-DEMO-001",
    });
    const { unmount } = render(<CommunityScreen />);
    expect(screen.getByText("Miembro de muestra 01")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Miembro de muestra 01"));
    expect(screen.getByText("Editar ficha")).toBeInTheDocument();
    unmount();

    writeAoCristianoSettings({
      ...defaultAoCristianoSettings,
      profile: "cristiano",
      organizationId: "ORG-OTRA-999",
    });
    render(<CommunityScreen />);
    expect(screen.queryByText("Miembro de muestra 01")).not.toBeInTheDocument();
  });

  it("vincula integrantes reales en Área 2 y previene integrantes duplicados", () => {
    writeAoCristianoSettings({
      ...defaultAoCristianoSettings,
      profile: "cristiano",
      organizationId: "ORG-DEMO-001",
    });
    render(<GroupsScreen />);
    // Abrir ficha del primer grupo (Ministerio de Alabanza, que ya tiene MBR-DEMO-001)
    fireEvent.click(screen.getAllByText("Ministerio de Alabanza")[0]!);
    expect(screen.getByText("Editar grupo")).toBeInTheDocument();
    activateTab("Integrantes");
    expect(screen.getAllByText(/MBR-DEMO-001/).length).toBeGreaterThan(0);
    // Intentar vincular sin seleccionar persona dispara validación
    fireEvent.click(screen.getByText("Vincular integrante"));
    expect(screen.getByRole("alert")).toHaveTextContent(/Selecciona una persona/i);
  });

  it("detecta conflictos de horario/espacio y vincula asistencia a personas reales en Área 3", () => {
    const conflict = detectScheduleConflict(
      [
        {
          id: "EV-1",
          date: "8 nov. 2026",
          iso: "2026-11-08",
          time: "10:00",
          endTime: "12:00",
          title: "Culto dominical",
          type: "Culto",
          place: "Auditorio congregacional",
          facilityId: "ESP-CRI-01",
          responsible: "Pastor",
          participants: "Congregación",
          reminder: "1d",
          organizationId: "ORG-DEMO-001",
        },
      ],
      {
        id: "EV-2",
        iso: "2026-11-08",
        time: "11:00",
        endTime: "12:30",
        place: "Auditorio congregacional",
        facilityId: "ESP-CRI-01",
        organizationId: "ORG-DEMO-001",
      },
    );
    expect(conflict?.id).toBe("EV-1");

    writeAoCristianoSettings({
      ...defaultAoCristianoSettings,
      profile: "cristiano",
      organizationId: "ORG-DEMO-001",
    });
    render(<InstitutionalAgendaScreen />);
    activateTab("Asistencia e informes");
    expect(screen.getAllByText("MBR-DEMO-001").length).toBeGreaterThan(0);
    expect(screen.getAllByText("GRP-CRI-01").length).toBeGreaterThan(0);
  });

  it("conecta tesorería con comprobantes contables equilibrados y presupuestos en Área 4", () => {
    writeAoCristianoSettings({
      ...defaultAoCristianoSettings,
      profile: "cristiano",
      organizationId: "ORG-DEMO-001",
      campusId: "SEDE-PRINCIPAL",
    });

    const [debitLine, creditLine] = buildJournalEntriesFromMovement({
      movement: christianTreasuryMovements[0]!,
      entityId: "ENT-CRI-001",
      christian: true,
    });
    expect(debitLine.debit).toBe(creditLine.credit);
    expect(debitLine.debit).toBe(1850000);

    const { unmount } = render(<TreasuryScreen />);
    expect(
      screen.getByRole("heading", { name: "Finanzas y tesorería congregacional" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Ingreso").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Egreso").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText("Nuevo movimiento"));
    const inputs = document.querySelectorAll("input");
    const amountInput = Array.from(inputs).find((el) => el.type === "number")!;
    const conceptInput = Array.from(inputs).find(
      (el) => el.type === "text" && el.hasAttribute("required"),
    )!;
    fireEvent.change(conceptInput, { target: { value: "Ofrenda especial de misiones" } });
    fireEvent.change(amountInput, { target: { value: "750000" } });
    fireEvent.click(screen.getByText("Registrar movimiento"));
    expect(screen.getByText("Ofrenda especial de misiones")).toBeInTheDocument();
    unmount();

    // Verificar que el comprobante generado automáticamente llegó a contabilidad equilibrado
    const { unmount: unmountAcc } = render(<AccountingScreen />);
    expect(screen.getByText("Balanceado")).toBeInTheDocument();
    unmountAcc();

    render(<BudgetScreen />);
    expect(
      screen.getByRole("heading", { name: "Presupuestos congregacionales" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // 1 rubro con alerta en christianBudgetLines
  });

  it("gestiona actas, correspondencia, tareas e inventarios con aislamiento organizacional en Área 5", () => {
    writeAoCristianoSettings({
      ...defaultAoCristianoSettings,
      profile: "cristiano",
      organizationId: "ORG-DEMO-001",
    });
    const { unmount } = render(<InstitutionalAdministrationScreen />);
    expect(screen.getByText("Planificación de cultos y presupuesto noviembre")).toBeInTheDocument();
    activateTab("Correspondencia");
    expect(screen.getByText("Confirmación de permiso para jornada solidaria comunitaria")).toBeInTheDocument();
    activateTab("Tareas administrativas");
    expect(screen.getByText("Consolidar cierre financiero mensual de diezmos y ofrendas")).toBeInTheDocument();
    unmount();

    const { unmount: unmountAssets } = render(<AssetsScreen />);
    expect(screen.getByText("Consola digital y sistema de audio · demo")).toBeInTheDocument();
    unmountAssets();

    // Organización sin registros debe ver 0 actas y 0 bienes
    writeAoCristianoSettings({
      ...defaultAoCristianoSettings,
      profile: "cristiano",
      organizationId: "ORG-AISLADA-777",
    });
    render(<InstitutionalAdministrationScreen />);
    expect(
      screen.queryByText("Planificación de cultos y presupuesto noviembre"),
    ).not.toBeInTheDocument();
  });

  it("valida authorizedRoles por registro y sede estricta en Área 6", () => {
    expect(canAccessPastoralRecord("lider_pastoral", ["pastor_principal", "consejero_autorizado"])).toBe(
      false,
    );
    expect(canAccessPastoralRecord("consejero_autorizado", ["pastor_principal", "consejero_autorizado"])).toBe(
      true,
    );

    writeAoCristianoSettings({
      ...defaultAoCristianoSettings,
      profile: "cristiano",
      organizationId: "ORG-DEMO-001",
      campusId: "SEDE-PRINCIPAL",
      pastoralAccessRole: "lider_pastoral",
      allowPastoralAiAnalysis: false,
    });

    render(<PastoralCareScreen />);
    // AP-001 (Visitante de muestra 04) y AP-002 (Familia de muestra B) son de SEDE-PRINCIPAL y autorizan lider_pastoral;
    // AP-003 es de SEDE-SECUNDARIA; AP-004 (Consejería, Miembro de muestra 02) excluye lider_pastoral.
    expect(screen.getByText("Visitante de muestra 04")).toBeInTheDocument();
    expect(screen.queryByText("Miembro de muestra 02")).not.toBeInTheDocument();
    expect(screen.queryByText("Miembro de muestra 06")).not.toBeInTheDocument();
    expect(screen.getByText("1 restringido(s) por rol")).toBeInTheDocument();
  });
});
