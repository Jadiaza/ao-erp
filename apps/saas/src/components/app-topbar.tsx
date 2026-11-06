import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  repositories,
  useRepositoryRows,
  useSupportRows,
  getSupportRepository,
} from "../data/saas-repository";

export function AppTopbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const clients = useRepositoryRows(repositories.clients);
  const institutions = useRepositoryRows(repositories.institutions);
  const users = useRepositoryRows(repositories.users);
  const support = useSupportRows(useMemo(() => getSupportRepository("mesa-ayuda"), []));
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return [
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
      ...users.map((item) => ({ id: item.id, label: item.name, type: "Usuario", to: "/usuarios" })),
      ...support.map((item) => ({
        id: item.id,
        label: item.title,
        type: "Ticket",
        to: "/soporte/mesa-ayuda",
      })),
    ]
      .filter((item) => `${item.id} ${item.label} ${item.type}`.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [clients, institutions, users, support, query]);

  return (
    <header className="topbar">
      <button
        className="topbar-menu"
        type="button"
        aria-label="Abrir o contraer menú"
        onClick={onMenuToggle}
      >
        ☰
      </button>
      <div className="global-search">
        <span aria-hidden="true">⌕</span>
        <input
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
                  onClick={() => setQuery("")}
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
      <div className="topbar-actions">
        <select aria-label="Seleccionar ecosistema" defaultValue="ecosistema">
          <option value="ecosistema">▱ &nbsp; Ecosistema A&amp;O</option>
        </select>
        <button
          className="topbar-icon"
          type="button"
          aria-label="Notificaciones"
          onClick={() => setShowNotifications((current) => !current)}
        >
          ♧<span className="notification-count">3</span>
        </button>
        <Link className="topbar-icon" to="/soporte" aria-label="Centro de ayuda">
          ?
        </Link>
        <div className="profile-wrap">
          <button
            className="profile-button"
            type="button"
            onClick={() => setShowProfile((current) => !current)}
            aria-expanded={showProfile}
          >
            <span className="profile-avatar">AO</span>
            <span>
              <strong>Administrador</strong>
              <small>A&amp;O TECHNOLOGIES</small>
            </span>
            <span aria-hidden="true">⌄</span>
          </button>
          {showProfile && (
            <div className="profile-menu">
              <strong>A&amp;O TECHNOLOGIES</strong>
              <small>Administrador del ecosistema</small>
              <Link to="/configuracion">Configuración</Link>
            </div>
          )}
        </div>
        {showNotifications && (
          <div className="notification-panel">
            <strong>Notificaciones demo</strong>
            <span>3 eventos requieren revisión local.</span>
            <Link to="/soporte">Abrir soporte</Link>
          </div>
        )}
      </div>
    </header>
  );
}
