import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SaasIcon } from "../components/saas-icons";
import { StatusBadge } from "../components/saas-ui";
import { evaluateOrganizationLicensing } from "../data/commercial-service";
import { repositories, saasStore, useRepositoryRows, useSettings } from "../data/saas-repository";

type ModuleItem = { id: string; name: string; detail: string; enabled: boolean };
type ModuleGroup = { id: string; name: string; detail: string; items: ModuleItem[] };

const initialGroups: ModuleGroup[] = [
  {
    id: "community",
    name: "Comunidad y sacramentos",
    detail: "Personas, familias y vida sacramental.",
    items: [
      {
        id: "parishioners",
        name: "Feligreses y familias",
        detail: "Registro y administración de personas y hogares.",
        enabled: true,
      },
      {
        id: "sacraments",
        name: "Gestión sacramental",
        detail: "Partidas, libros y procesos sacramentales.",
        enabled: true,
      },
      {
        id: "certificates",
        name: "Documentos y certificados",
        detail: "Solicitudes y expedición documental.",
        enabled: true,
      },
    ],
  },
  {
    id: "pastoral",
    name: "Pastoral y evangelización",
    detail: "Acompañamiento, formación y celebración.",
    items: [
      {
        id: "catechesis",
        name: "Catequesis y formación",
        detail: "Procesos formativos y grupos de catequesis.",
        enabled: true,
      },
      {
        id: "pastoral-action",
        name: "Acción pastoral y social",
        detail: "Proyectos y obras pastorales.",
        enabled: true,
      },
      {
        id: "liturgy",
        name: "Liturgia y celebraciones",
        detail: "Celebraciones e intenciones.",
        enabled: true,
      },
    ],
  },
  {
    id: "finance",
    name: "Finanzas y recursos",
    detail: "Administración económica y patrimonial.",
    items: [
      {
        id: "treasury",
        name: "Finanzas y tesorería",
        detail: "Ingresos, egresos y caja.",
        enabled: true,
      },
      {
        id: "accounting",
        name: "Contabilidad",
        detail: "Asientos, comprobantes y libros contables.",
        enabled: true,
      },
      {
        id: "budgets",
        name: "Presupuestos",
        detail: "Planeación y seguimiento presupuestal.",
        enabled: true,
      },
      {
        id: "assets",
        name: "Inventarios y patrimonio",
        detail: "Bienes, activos y existencias.",
        enabled: true,
      },
    ],
  },
  {
    id: "management",
    name: "Gestión institucional",
    detail: "Gobierno, control y operación.",
    items: [
      {
        id: "governance",
        name: "Gobierno y normativa",
        detail: "Normativa y gobierno institucional.",
        enabled: true,
      },
      {
        id: "documents",
        name: "Gestión documental",
        detail: "Archivo, clasificación y trazabilidad.",
        enabled: true,
      },
      {
        id: "reports",
        name: "Informes institucionales",
        detail: "Rendición de cuentas e indicadores.",
        enabled: true,
      },
      {
        id: "agenda",
        name: "Agenda e infraestructura",
        detail: "Espacios, recursos y programación.",
        enabled: true,
      },
    ],
  },
  {
    id: "services",
    name: "Servicios y tecnología",
    detail: "Canales de atención y herramientas.",
    items: [
      {
        id: "portal",
        name: "Portal del feligrés",
        detail: "Autogestión y solicitudes.",
        enabled: true,
      },
      {
        id: "communications",
        name: "Comunicaciones",
        detail: "Mensajería institucional.",
        enabled: true,
      },
      {
        id: "ai",
        name: "Inteligencia artificial",
        detail: "Asistentes y automatizaciones.",
        enabled: false,
      },
    ],
  },
];

function groupsFromSettings(enabledModuleIds: string[]) {
  return initialGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      enabled: enabledModuleIds.includes(item.id),
    })),
  }));
}

export const Route = createFileRoute("/configuracion")({ component: ConfigurationPage });

function ConfigurationPage() {
  const settings = useSettings();
  const organizations = useRepositoryRows(repositories.organizations);
  const [tab, setTab] = useState<"appearance" | "modules">("appearance");
  const [theme, setTheme] = useState(settings.theme);
  const [density, setDensity] = useState(settings.density);
  const [scope, setScope] = useState(settings.scope);
  const [organization, setOrganization] = useState(settings.organization);
  const [groups, setGroups] = useState(() => groupsFromSettings(settings.enabledModuleIds));
  const [message, setMessage] = useState("");
  const enabled = useMemo(
    () => groups.flatMap((group) => group.items).filter((item) => item.enabled).length,
    [groups],
  );
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  useEffect(() => {
    setTheme(settings.theme);
    setDensity(settings.density);
    setScope(settings.scope);
    setOrganization(settings.organization);
    setGroups(groupsFromSettings(settings.enabledModuleIds));
  }, [settings.theme, settings.density, settings.scope, settings.organization, settings.enabledModuleIds]);

  useEffect(() => {
    saasStore.updateSettings({
      theme,
      density,
      scope,
      organization: scope === "organization" ? organization : "",
      enabledModuleIds: groups
        .flatMap((group) => group.items)
        .filter((item) => item.enabled)
        .map((item) => item.id),
    });
  }, [theme, density, scope, organization, groups]);

  const selectedOrganization = organizations.find((item) => item.id === organization) ?? null;
  const licensingEvaluation = useMemo(() => {
    if (scope !== "organization" || !organization) return null;
    return evaluateOrganizationLicensing(organization);
  }, [scope, organization, organizations]);

  const effectiveEnabledIds = useMemo(() => {
    const globallyEnabled = groups
      .flatMap((group) => group.items)
      .filter((item) => item.enabled)
      .map((item) => item.id);
    if (!licensingEvaluation) return globallyEnabled;
    return globallyEnabled.filter((id) => licensingEvaluation.enabledModuleIds.includes(id));
  }, [groups, licensingEvaluation]);

  function toggle(groupId: string, itemId: string) {
    if (scope === "organization" && licensingEvaluation && !licensingEvaluation.enabledModuleIds.includes(itemId)) {
      setMessage(
        "El módulo seleccionado no está contemplado en los entitlements/licencia efectiva de la organización. Revisa Planes y licencias antes de habilitarlo.",
      );
      return;
    }
    setGroups((current) =>
      current.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              items: group.items.map((item) =>
                item.id !== itemId ? item : { ...item, enabled: !item.enabled },
              ),
            },
      ),
    );
    setMessage("");
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">A&amp;O SaaS / Administración central</p>
          <h1>Configuración</h1>
          <p>Administra la experiencia visual y el catálogo de módulos de la plataforma.</p>
        </div>
        <span className="demo-badge">Consola del operador</span>
      </header>
      <div className="notice">
        <strong>Configuración centralizada (demo local).</strong> Los cambios se guardan en el
        repositorio local del navegador, no en una base de datos ni en producción. La habilitación
        efectiva para una organización debe respetar su plan, contrato, licencia, entitlements y
        permisos; al deshabilitar un módulo no se elimina información histórica.
      </div>
      <div className="settings-layout">
        <aside className="panel settings-nav">
          <span className="settings-caption">PREFERENCIAS DE PLATAFORMA</span>
          <button
            type="button"
            className={tab === "appearance" ? "settings-tab selected" : "settings-tab"}
            onClick={() => setTab("appearance")}
          >
            <span className="settings-icon">
              <SaasIcon name="palette" size={16} />
            </span>
            <span>
              <strong>Interfaz</strong>
              <small>Temas y presentación</small>
            </span>
          </button>
          <button
            type="button"
            className={tab === "modules" ? "settings-tab selected" : "settings-tab"}
            onClick={() => setTab("modules")}
          >
            <span className="settings-icon">
              <SaasIcon name="plans" size={16} />
            </span>
            <span>
              <strong>Módulos</strong>
              <small>Catálogo y disponibilidad</small>
            </span>
          </button>
          <div className="settings-hint">
            Catálogo global de plataforma ≠ habilitación efectiva por organización. La disponibilidad
            por entidad se valida con licenciamiento y aprovisionamiento.
          </div>
        </aside>
        <main className="settings-main">
          {tab === "appearance" ? (
            <section className="panel">
              <div className="section-heading">
                <div>
                  <h2>Interfaz y apariencia</h2>
                  <p>Establece los valores predeterminados de presentación de A&amp;O ERP.</p>
                </div>
                <span className="section-symbol">
                  <SaasIcon name="palette" size={16} />
                </span>
              </div>
              <div className="settings-fields">
                <label className="settings-field">
                  <span>Ámbito de configuración</span>
                  <select value={scope} onChange={(event) => setScope(event.target.value)}>
                    <option value="global">Predeterminado global (plataforma)</option>
                    <option value="organization">Contexto por organización</option>
                  </select>
                </label>
                {scope === "organization" && (
                  <label className="settings-field">
                    <span>Organización</span>
                    <select
                      value={organization}
                      onChange={(event) => setOrganization(event.target.value)}
                    >
                      <option value="">Selecciona una organización</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.id})
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="settings-field">
                  <span>Tema visual</span>
                  <select value={theme} onChange={(event) => setTheme(event.target.value)}>
                    <option value="institutional">Institucional A&amp;O</option>
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                    <option value="system">Según dispositivo</option>
                  </select>
                </label>
                <label className="settings-field">
                  <span>Densidad de información</span>
                  <select value={density} onChange={(event) => setDensity(event.target.value)}>
                    <option value="comfortable">Cómoda</option>
                    <option value="compact">Compacta</option>
                    <option value="spacious">Amplia</option>
                  </select>
                </label>
              </div>
              <div className={"appearance-preview theme-" + theme}>
                <div className="preview-toolbar">
                  <i></i>
                  <i></i>
                  <i></i>
                  <span>Vista previa · A&amp;O ERP</span>
                </div>
                <div className="preview-workspace">
                  <div className="preview-menu">
                    <b></b>
                    <b></b>
                    <b></b>
                    <b></b>
                  </div>
                  <div className="preview-content">
                    <strong>Panel de la organización</strong>
                    <div className="preview-metrics">
                      <i></i>
                      <i></i>
                      <i></i>
                    </div>
                    <div className="preview-lines">
                      <i></i>
                      <i></i>
                    </div>
                  </div>
                </div>
              </div>
              <p className="settings-footnote">
                La personalización visual debe conservar la identidad gráfica y el logotipo oficial
                de A&amp;O.
              </p>
            </section>
          ) : (
            <section className="panel">
              <div className="section-heading">
                <div>
                  <h2>Catálogo y disponibilidad de módulos</h2>
                  <p>
                    Catálogo de plataforma (global). La disponibilidad efectiva por organización se
                    determina por plan, contrato, licencia y entitlements.
                  </p>
                </div>
                <span className="section-symbol">
                  <SaasIcon name="plans" size={16} />
                </span>
              </div>
              <div className="module-summary">
                <div>
                  <small>Módulos habilitados (catálogo)</small>
                  <strong>
                    {enabled} <em>/ {total}</em>
                  </strong>
                </div>
                <div>
                  <small>Grupos funcionales</small>
                  <strong>{groups.length}</strong>
                </div>
                <div>
                  <small>Ámbito visualizado</small>
                  <strong>{scope === "global" ? "Global" : "Organización"}</strong>
                </div>
              </div>
              <div className="settings-fields module-scope">
                <label className="settings-field">
                  <span>Aplicar contexto</span>
                  <select value={scope} onChange={(event) => setScope(event.target.value)}>
                    <option value="global">Catálogo global de plataforma</option>
                    <option value="organization">Por organización (verificación efectiva)</option>
                  </select>
                </label>
                {scope === "organization" && (
                  <label className="settings-field">
                    <span>Organización</span>
                    <select
                      value={organization}
                      onChange={(event) => {
                        setOrganization(event.target.value);
                        setMessage("");
                      }}
                    >
                      <option value="">Selecciona una organización</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.id}) · {org.plan}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              {scope === "organization" && selectedOrganization && licensingEvaluation && (
                <div className="notice">
                  <strong>Contexto efectivo: {selectedOrganization.name}.</strong> Estado de licencia:{" "}
                  <StatusBadge status={licensingEvaluation.licenseStatus} /> · Autorizada:{" "}
                  {licensingEvaluation.isAuthorized ? "Sí" : "No"} · Módulos con entitlement:{" "}
                  {licensingEvaluation.enabledModuleIds.length} · Habilitados en catálogo y
                  efectivamente disponibles: {effectiveEnabledIds.length}. Esta validación usa el
                  servicio centralizado de licenciamiento (demo local), sin persistencia backend.
                </div>
              )}
              {scope === "organization" && !organization && (
                <div className="notice">
                  Selecciona una organización para contrastar el catálogo con su plan, licencia y
                  entitlements efectivos.
                </div>
              )}
              <div className="module-list">
                {groups.map((group) => (
                  <section className="module-group" key={group.id}>
                    <header>
                      <div>
                        <h3>{group.name}</h3>
                        <p>{group.detail}</p>
                      </div>
                      <span>
                        {group.items.filter((item) => item.enabled).length}/{group.items.length}
                      </span>
                    </header>
                    {group.items.map((item) => {
                      const entitled =
                        !licensingEvaluation || licensingEvaluation.enabledModuleIds.includes(item.id);
                      const effectivelyAvailable = item.enabled && entitled;
                      return (
                        <label className="module-item" key={item.id}>
                          <span>
                            <strong>
                              {item.name}{" "}
                              {scope === "organization" && organization ? (
                                <em style={{ fontStyle: "normal", marginLeft: 6 }}>
                                  ({entitled ? "con entitlement" : "sin entitlement/licencia"})
                                </em>
                              ) : null}
                            </strong>
                            <small>
                              {item.detail}
                              {scope === "organization" && organization
                                ? effectivelyAvailable
                                  ? " · Disponible efectivamente."
                                  : item.enabled
                                    ? " · Habilitado en catálogo, pero no autorizado por licencia efectiva."
                                    : " · Deshabilitado en catálogo de plataforma."
                                : ""}
                            </small>
                          </span>
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={() => toggle(group.id, item.id)}
                            aria-label={"Habilitar " + item.name}
                          />
                        </label>
                      );
                    })}
                  </section>
                ))}
              </div>
              <p className="settings-footnote">
                Deshabilitar un módulo no elimina la información histórica de la organización. La
                restricción de acceso y disponibilidad efectiva debe validarse también en el servidor
                y en el aprovisionamiento del producto.
              </p>
            </section>
          )}
          <div className="settings-actions">
            <button
              className="button-muted"
              onClick={() => {
                setGroups(initialGroups);
                setTheme("institutional");
                setDensity("comfortable");
                setScope("global");
                setOrganization("");
                setMessage("Se restablecieron los valores predeterminados de la vista.");
              }}
            >
              Restablecer
            </button>
            <button
              className="button-primary"
              onClick={() =>
                setMessage(
                  "Configuración guardada en el repositorio local de demostración (navegador). La aplicación real por organización requiere persistencia backend y validación de permisos/entitlements.",
                )
              }
            >
              Guardar configuración
            </button>
          </div>
          {message && <div className="notice settings-message">{message}</div>}
        </main>
      </div>
    </div>
  );
}
