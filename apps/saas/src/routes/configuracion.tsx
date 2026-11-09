import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SaasIcon } from "../components/saas-icons";
import { saasStore, useSettings } from "../data/saas-repository";

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
  }, [settings.theme, settings.density]);

  useEffect(() => {
    saasStore.updateSettings({
      theme,
      density,
      scope,
      organization,
      enabledModuleIds: groups
        .flatMap((group) => group.items)
        .filter((item) => item.enabled)
        .map((item) => item.id),
    });
  }, [theme, density, scope, organization, groups]);

  function toggle(groupId: string, itemId: string) {
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
          <p>Administra la experiencia visual y los módulos disponibles en A&amp;O ERP.</p>
        </div>
        <span className="demo-badge">Consola del operador</span>
      </header>
      <div className="notice">
        <strong>Configuración centralizada.</strong> Los cambios definidos aquí corresponden al
        operador de A&amp;O SaaS. La disponibilidad para cada entidad debe respetar su plan,
        licencia y permisos. Esta pantalla es una interfaz inicial: todavía no guarda cambios en una
        base de datos.
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
            La asignación por organización deberá estar vinculada al plan contratado y a la licencia
            vigente.
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
                    <option value="global">Predeterminado global</option>
                    <option value="organization">Por organización</option>
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
                      <option value="diocese">Diócesis de demostración</option>
                      <option value="parish">Parroquia de demostración</option>
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
                  <p>Define qué funcionalidades forman parte de la oferta de la plataforma.</p>
                </div>
                <span className="section-symbol">
                  <SaasIcon name="plans" size={16} />
                </span>
              </div>
              <div className="module-summary">
                <div>
                  <small>Módulos habilitados</small>
                  <strong>
                    {enabled} <em>/ {total}</em>
                  </strong>
                </div>
                <div>
                  <small>Grupos funcionales</small>
                  <strong>{groups.length}</strong>
                </div>
                <div>
                  <small>Ámbito</small>
                  <strong>{scope === "global" ? "Global" : "Por entidad"}</strong>
                </div>
              </div>
              <div className="settings-fields module-scope">
                <label className="settings-field">
                  <span>Aplicar configuración</span>
                  <select value={scope} onChange={(event) => setScope(event.target.value)}>
                    <option value="global">Catálogo global</option>
                    <option value="organization">Por organización</option>
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
                      <option value="diocese">Diócesis de demostración</option>
                      <option value="parish">Parroquia de demostración</option>
                    </select>
                  </label>
                )}
              </div>
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
                    {group.items.map((item) => (
                      <label className="module-item" key={item.id}>
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.detail}</small>
                        </span>
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => toggle(group.id, item.id)}
                          aria-label={"Habilitar " + item.name}
                        />
                      </label>
                    ))}
                  </section>
                ))}
              </div>
              <p className="settings-footnote">
                Deshabilitar un módulo no elimina la información histórica de la organización. La
                restricción de acceso debe validarse también en el servidor.
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
                setMessage("Se restablecieron los valores de esta vista.");
              }}
            >
              Restablecer
            </button>
            <button
              className="button-primary"
              onClick={() =>
                setMessage(
                  "Configuración preparada como vista previa. La persistencia y aplicación real requieren conectar el servicio de configuración.",
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
