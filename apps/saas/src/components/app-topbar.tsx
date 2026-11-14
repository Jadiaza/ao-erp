import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/auth-context";
import { ROUTE_TITLES } from "../data/navigation";
import {
  getSupportRepository,
  repositories,
  saasStore,
  useRepositoryRows,
  useSettings,
  useSupportRows,
} from "../data/saas-repository";
import { AoErpBrandLogo } from "./ao-erp-brand-logo";
import { SaasIcon } from "./saas-icons";

const themeLabels: Record<string, string> = {
  institutional: "Institucional",
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
};

const themeOrder = ["institutional", "light", "dark", "system"] as const;

export function AppTopbar({
  onMenuToggle,
  pathname = "/",
}: {
  onMenuToggle: () => void;
  pathname?: string;
}) {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const topbarRef = useRef<HTMLElement>(null);

  const settings = useSettings();
  const clients = useRepositoryRows(repositories.clients);
  const organizations = useRepositoryRows(repositories.organizations);
  const institutions = useRepositoryRows(repositories.institutions);
  const users = useRepositoryRows(repositories.users);
  const plans = useRepositoryRows(repositories.plans);
  const support = useSupportRows(useMemo(() => getSupportRepository("mesa-ayuda"), []));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (event.key === "Escape") {
        setQuery("");
        setShowNotifications(false);
        setShowProfile(false);
        setMobileSearchOpen(false);
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (topbarRef.current && !topbarRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return [
      ...organizations.map((item) => ({
        id: item.id,
        label: item.name,
        type: "Organización",
        to: "/organizaciones",
      })),
      ...clients.map((item) => ({
        id: item.id,
        label: item.name,
        type: "Cliente",
        to: "/clientes",
      })),
      ...institutions.map((item) => ({
        id: item.id,
        label: item.name,
        type: "Institución",
        to: "/instituciones",
      })),
      ...users.map((item) => ({
        id: item.id,
        label: item.name,
        type: "Usuario",
        to: "/usuarios",
      })),
      ...plans.map((item) => ({
        id: item.id,
        label: item.name,
        type: "Plan",
        to: "/planes-licencias",
      })),
      ...support.map((item) => ({
        id: item.id,
        label: item.title,
        type: "Ticket",
        to: "/soporte/mesa-ayuda",
      })),
    ]
      .filter((item) => `${item.id} ${item.label} ${item.type}`.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [organizations, clients, institutions, users, plans, support, query]);

  const currentSectionTitle = useMemo(() => {
    if (pathname.startsWith("/soporte/")) return "Centro de Soporte";
    return ROUTE_TITLES[pathname] ?? "Consola SaaS";
  }, [pathname]);

  const cycleTheme = () => {
    const currentIndex = themeOrder.indexOf(
      (settings.theme as (typeof themeOrder)[number]) ?? "institutional",
    );
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length] ?? "institutional";
    saasStore.updateSettings({ theme: nextTheme });
  };

  const currentTheme = settings.theme || "institutional";
  const themeIcon =
    currentTheme === "dark"
      ? "moon"
      : currentTheme === "light"
        ? "sun"
        : currentTheme === "system"
          ? "monitor"
          : "palette";

  return (
    <header
      className={`topbar${mobileSearchOpen ? " is-mobile-search-open" : ""}`}
      ref={topbarRef}
    >
      <div className="topbar-left">
        <button
          className="topbar-menu"
          type="button"
          aria-label="Abrir o contraer menú"
          onClick={onMenuToggle}
        >
          <SaasIcon name="menu" size={18} />
        </button>
        <Link to="/" className="topbar-brand-mobile" aria-label="A&O SaaS Inicio">
          <AoErpBrandLogo
            variant="light"
            brandSuffix="SAAS"
            showAppBadge={false}
            showSubtitle
            subtitleText="CONSOLA DEL ECOSISTEMA"
          />
        </Link>
        <div className="topbar-breadcrumb" aria-label="Ubicación actual">
          <span>A&amp;O SaaS</span>
          <SaasIcon name="chevron-right" size={13} />
          <strong>{currentSectionTitle}</strong>
        </div>
        <div className="global-search">
          <SaasIcon name="search" size={15} className="global-search-icon" />
          <input
            ref={searchInputRef}
            aria-label="Buscar en todo el ecosistema"
            placeholder="Buscar en todo el ecosistema..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd>Ctrl K</kbd>
          {query && (
            <div className="search-results" role="listbox">
              {results.length ? (
                results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    to={result.to as never}
                    onClick={() => {
                      setQuery("");
                      setMobileSearchOpen(false);
                    }}
                  >
                    <span className="search-result-icon">{result.type.slice(0, 1)}</span>
                    <span>
                      <strong>{result.label}</strong>
                      <small>
                        {result.type} · {result.id}
                      </small>
                    </span>
                  </Link>
                ))
              ) : (
                <span className="search-empty">No hay coincidencias en los datos locales.</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="topbar-actions">
        <select aria-label="Seleccionar ecosistema" defaultValue="ecosistema">
          <option value="ecosistema">Ecosistema A&amp;O</option>
        </select>
        <button
          className="theme-toggle-button"
          type="button"
          aria-label="Cambiar tema visual"
          title="Alternar tema visual (Institucional, Claro, Oscuro, Sistema)"
          onClick={cycleTheme}
        >
          <SaasIcon name={themeIcon} size={15} />
          <span>{themeLabels[currentTheme] ?? "Institucional"}</span>
        </button>
        <button
          className="topbar-icon topbar-search-toggle"
          type="button"
          aria-label="Buscar en el ecosistema"
          aria-expanded={mobileSearchOpen}
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
            setMobileSearchOpen((prev) => {
              const next = !prev;
              if (next) {
                window.setTimeout(() => searchInputRef.current?.focus(), 60);
              }
              return next;
            });
          }}
        >
          <SaasIcon name="search" size={17} />
        </button>
        <button
          className="topbar-icon"
          type="button"
          aria-label="Notificaciones"
          onClick={() => {
            setShowProfile(false);
            setShowNotifications((current) => !current);
          }}
        >
          <SaasIcon name="bell" size={17} />
          <span className="notification-count">3</span>
        </button>
        <Link className="topbar-icon topbar-help-link" to="/soporte" aria-label="Centro de ayuda">
          <SaasIcon name="help" size={17} />
        </Link>
        <div className="profile-wrap">
          <button
            className="profile-button"
            type="button"
            onClick={() => {
              setShowNotifications(false);
              setShowProfile((current) => !current);
            }}
            aria-expanded={showProfile}
          >
            <span className="profile-avatar">{session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "AO"}</span>
            <span>
              <strong>{session?.user?.name ?? "Administrador"}</strong>
              <small>{session?.organization?.name ?? "A&O TECHNOLOGIES"}</small>
            </span>
            <SaasIcon name="chevron-down" size={14} />
          </button>
          {showProfile && (
            <div className="profile-menu">
              <strong>{session?.organization?.name ?? "A&O TECHNOLOGIES"}</strong>
              <small>{session?.user?.email ?? "Administrador del ecosistema"}</small>
              <Link to="/configuracion" onClick={() => setShowProfile(false)}>
                <SaasIcon name="settings" size={14} />
                Configuración
              </Link>
              <button
                type="button"
                className="profile-menu-logout"
                onClick={() => {
                  setShowProfile(false);
                  logout();
                  navigate({ to: "/login" as never });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "8px 12px",
                  marginTop: "4px",
                  border: "none",
                  borderTop: "1px solid var(--line-subtle)",
                  background: "transparent",
                  color: "var(--danger)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  textAlign: "left",
                }}
              >
                <SaasIcon name="log-out" size={14} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
        {showNotifications && (
          <div className="notification-panel">
            <strong>Notificaciones demo</strong>
            <span>3 eventos requieren revisión local.</span>
            <Link to="/soporte" onClick={() => setShowNotifications(false)}>
              Abrir soporte
              <SaasIcon name="arrow-right" size={13} />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
