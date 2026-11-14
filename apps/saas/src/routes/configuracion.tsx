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
    id: "core",
    name: "Núcleo institucional (genérico)",
    detail: "Identidad, sedes, configuración, usuarios, agenda base y comunicaciones.",
    items: [
      {
        id: "MOD-CORE",
        name: "Núcleo institucional y administración base",
        detail: "Identidad institucional, sedes, configuración regional, usuarios/permisos y trazabilidad base.",
        enabled: true,
      },
    ],
  },
  {
    id: "catholic",
    name: "Gestión parroquial y sacramental (A&O Católico)",
    detail: "Comunidad parroquial, pastoral católica, sacramentos, libros, liturgia y catequesis.",
    items: [
      {
        id: "MOD-COM",
        name: "Comunidad y pastoral católica",
        detail: "Directorio de feligreses, grupos apostólicos, catequesis, liturgia y agenda parroquial.",
        enabled: true,
      },
      {
        id: "MOD-SAC",
        name: "Sacramentos y partidas",
        detail: "Libros parroquiales canónicos, partidas sacramentales y emisión de certificados.",
        enabled: true,
      },
    ],
  },
  {
    id: "shared-resources",
    name: "Finanzas y gestión documental (genéricos)",
    detail: "Módulos compartidos parametrizables para entidades católicas o cristianas.",
    items: [
      {
        id: "MOD-FIN",
        name: "Finanzas y recursos",
        detail: "Tesorería, contabilidad institucional, presupuestos, inventarios y compras.",
        enabled: true,
      },
      {
        id: "MOD-DOC",
        name: "Gestión documental",
        detail: "Archivo digital, clasificación, expedientes, correspondencia y conservación.",
        enabled: true,
      },
    ],
  },
  {
    id: "diocesan",
    name: "Gobierno diocesano (A&O Diocesano)",
    detail: "Supervisión territorial y consolidación de curia.",
    items: [
      {
        id: "MOD-GOB",
        name: "Gobierno y consolidación diocesana",
        detail: "Supervisión de parroquias, decretos episcopales, clero y economato diocesano.",
        enabled: true,
      },
    ],
  },
  {
    id: "cristiano",
    name: "A&O Cristiano (Congregaciones)",
    detail: "Gestión congregacional, membresía, ministerios y cultos.",
    items: [
      {
        id: "MOD-CRI-COM",
        name: "Miembros y comunidad",
        detail: "Membresía, registro familiar, visitantes y bautismos congregacionales.",
        enabled: true,
      },
      {
        id: "MOD-CRI-GRP",
        name: "Ministerios y grupos",
        detail: "Células, grupos pequeños, ministerios y equipos de servicio.",
        enabled: true,
      },
      {
        id: "MOD-CRI-CUL",
        name: "Cultos, eventos y asistencia",
        detail: "Programación de cultos, reuniones, calendario y registro de asistencia.",
        enabled: true,
      },
      {
        id: "MOD-CRI-ADM",
        name: "Administración y finanzas congregacionales",
        detail: "Diezmos, ofrendas, presupuesto local y gestión documental.",
        enabled: true,
      },
      {
        id: "MOD-CRI-PAS",
        name: "Acompañamiento pastoral",
        detail: "Consejería pastoral confidencial, visitas y seguimiento.",
        enabled: true,
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
