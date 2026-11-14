import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/auth-context";
import { getAccessibleLauncherModules, type SaasNavModule } from "../data/navigation";
import { saasStore, useSettings } from "../data/saas-repository";
import { AoErpBrandLogo } from "./ao-erp-brand-logo";
import { SaasIcon } from "./saas-icons";

function LauncherGridGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="2.2" />
      <rect x="13" y="3" width="8" height="8" rx="2.2" />
      <rect x="3" y="13" width="8" height="8" rx="2.2" />
      <rect x="13" y="13" width="8" height="8" rx="2.2" />
    </svg>
  );
}

export function FloatingLauncherButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`ao-fab-launcher${open ? " is-active" : ""}`}
      aria-label={open ? "Cerrar lanzador de módulos" : "Abrir módulos"}
      aria-expanded={open}
      aria-controls="ao-module-launcher"
      title="Abrir módulos"
      onClick={onToggle}
    >
      <span className="ao-fab-launcher-ring" aria-hidden="true" />
      <span className="ao-fab-launcher-core" aria-hidden="true">
        <LauncherGridGlyph />
      </span>
    </button>
  );
}

function isModuleActive(pathname: string, target: string): boolean {
  if (target === "/") return pathname === "/";
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function ModuleLauncher({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const accessibleModules = getAccessibleLauncherModules(session);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  const handleSelectModule = (module: SaasNavModule) => {
    onClose();
    navigate({ to: module.to as never });
  };

  return (
    <div
      className="ao-launcher-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        id="ao-module-launcher"
        className="ao-launcher-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ao-launcher-title"
      >
        <header className="ao-launcher-header">
          <div className="ao-launcher-header-top">
            <button
              type="button"
              className="ao-launcher-back-btn"
              aria-label="Cerrar lanzador y volver"
              onClick={onClose}
            >
              <SaasIcon name="arrow-left" size={20} />
            </button>
            <div className="ao-launcher-brand-wrap">
              <AoErpBrandLogo
                variant="light"
                brandSuffix="SAAS"
                align="center"
                showAppBadge={false}
                showSubtitle
                subtitleText="CONSOLA DEL ECOSISTEMA"
                className="ao-launcher-brand-svg"
              />
            </div>
            <button
              type="button"
              className="ao-launcher-close-btn"
              aria-label="Cerrar lanzador"
              onClick={onClose}
            >
              <SaasIcon name="close" size={18} />
            </button>
          </div>
          <div className="ao-launcher-hero-copy">
            <h2 id="ao-launcher-title">Aplicaciones y Módulos</h2>
            <p>Accede a los módulos del ecosistema A&amp;O</p>
          </div>
        </header>

        <div className="ao-launcher-body">
          {accessibleModules.length > 0 ? (
            <div className="ao-launcher-grid" role="list" aria-label="Módulos disponibles">
              {accessibleModules.map((module) => {
                const active = isModuleActive(pathname, module.to);
                return (
                  <button
                    key={module.id}
                    type="button"
                    role="listitem"
                    className={`ao-launcher-tile${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => handleSelectModule(module)}
                  >
                    <span
                      className={`ao-launcher-tile-icon ao-launcher-tile-icon--${module.tone}`}
                      aria-hidden="true"
                    >
                      <SaasIcon name={module.icon} size={22} />
                    </span>
                    <span className="ao-launcher-tile-label">{module.launcherLabel}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="ao-launcher-empty">
              <SaasIcon name="lock" size={24} />
              <strong>Sin módulos habilitados</strong>
              <span>
                Tu rol actual no tiene permisos asignados para acceder a módulos en el lanzador.
              </span>
            </div>
          )}

          <footer className="ao-launcher-footer">
            <span className="ao-launcher-role-chip">
              <SaasIcon name="roles" size={13} />
              <span>{session?.roles[0] ?? "Operador del ecosistema"}</span>
            </span>
            <span className="ao-launcher-count-chip">
              {accessibleModules.length} módulo(s) disponibles
            </span>
          </footer>
        </div>
      </section>
    </div>
  );
}

const themeOrder = ["institutional", "light", "dark", "system"] as const;
const themeLabels: Record<string, string> = {
  institutional: "Institucional",
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
};

export function MobileBottomNav({
  pathname,
  launcherOpen,
  onOpenLauncher,
  onCloseLauncher,
  hasAlerts = true,
}: {
  pathname: string;
  launcherOpen: boolean;
  onOpenLauncher: () => void;
  onCloseLauncher: () => void;
  hasAlerts?: boolean;
}) {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const settings = useSettings();
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  const isHomeActive = pathname === "/" && !launcherOpen && !profileSheetOpen;
  const isReportsActive =
    pathname.startsWith("/analitica-reportes") && !launcherOpen && !profileSheetOpen;

  const handleAlertsClick = () => {
    setProfileSheetOpen(false);
    onCloseLauncher();
    if (pathname === "/") {
      const target = document.getElementById("alertas-operativas");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate({ to: "/" as never });
    window.setTimeout(() => {
      document.getElementById("alertas-operativas")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 140);
  };

  const currentTheme = settings.theme || "institutional";
  const cycleTheme = () => {
    const idx = themeOrder.indexOf(currentTheme as (typeof themeOrder)[number]);
    const next = themeOrder[(idx + 1) % themeOrder.length] ?? "institutional";
    saasStore.updateSettings({ theme: next });
  };

  return (
    <>
      {profileSheetOpen && (
        <div
          className="ao-profile-sheet-backdrop"
          role="presentation"
          onClick={() => setProfileSheetOpen(false)}
        >
          <div
            className="ao-profile-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Perfil de usuario"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ao-profile-sheet-head">
              <span className="ao-profile-sheet-avatar">
                {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "AO"}
              </span>
              <div>
                <strong>{session?.user?.name ?? "Administrador"}</strong>
                <small>{session?.user?.email ?? "A&O TECHNOLOGIES"}</small>
                <span className="ao-profile-sheet-role">
                  {session?.roles[0] ?? "Administrador de plataforma"}
                </span>
              </div>
            </div>
            <div className="ao-profile-sheet-actions">
              <button type="button" onClick={cycleTheme}>
                <SaasIcon name="palette" size={16} />
                <span>Tema: {themeLabels[currentTheme] ?? "Institucional"}</span>
              </button>
              <Link
                to="/configuracion"
                onClick={() => {
                  setProfileSheetOpen(false);
                  onCloseLauncher();
                }}
              >
                <SaasIcon name="settings" size={16} />
                <span>Configuración global</span>
              </Link>
              <button
                type="button"
                className="ao-profile-sheet-logout"
                onClick={() => {
                  setProfileSheetOpen(false);
                  onCloseLauncher();
                  logout();
                  navigate({ to: "/login" as never });
                }}
              >
                <SaasIcon name="log-out" size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="ao-bottom-nav" aria-label="Navegación inferior">
        <Link
          to="/"
          className={`ao-bottom-nav-item${isHomeActive ? " is-active" : ""}`}
          onClick={() => {
            setProfileSheetOpen(false);
            onCloseLauncher();
          }}
        >
          <span className="ao-bottom-nav-icon">
            <SaasIcon name="home" size={20} />
          </span>
          <span>Inicio</span>
        </Link>

        <button
          type="button"
          className={`ao-bottom-nav-item ao-bottom-nav-modules${launcherOpen ? " is-active" : ""}`}
          onClick={() => {
            setProfileSheetOpen(false);
            onOpenLauncher();
          }}
        >
          <span className="ao-bottom-nav-icon">
            <SaasIcon name="layout-grid" size={20} />
          </span>
          <span>Módulos</span>
        </button>

        <Link
          to="/analitica-reportes"
          className={`ao-bottom-nav-item${isReportsActive ? " is-active" : ""}`}
          onClick={() => {
            setProfileSheetOpen(false);
            onCloseLauncher();
          }}
        >
          <span className="ao-bottom-nav-icon">
            <SaasIcon name="analytics" size={20} />
          </span>
          <span>Reportes</span>
        </Link>

        <button type="button" className="ao-bottom-nav-item" onClick={handleAlertsClick}>
          <span className="ao-bottom-nav-icon">
            <SaasIcon name="bell" size={20} />
            {hasAlerts && <i className="ao-bottom-nav-dot" aria-hidden="true" />}
          </span>
          <span>Alertas</span>
        </button>

        <button
          type="button"
          className={`ao-bottom-nav-item${profileSheetOpen ? " is-active" : ""}`}
          onClick={() => {
            onCloseLauncher();
            setProfileSheetOpen((prev) => !prev);
          }}
        >
          <span className="ao-bottom-nav-icon">
            <SaasIcon name="user" size={20} />
          </span>
          <span>Perfil</span>
        </button>
      </nav>
    </>
  );
}
