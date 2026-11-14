import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/auth-context";
import { AoErpBrandLogo } from "../components/ao-erp-brand-logo";
import { SaasIcon } from "../components/saas-icons";
import { requestPasswordReset } from "../data/auth-service";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function StaticModuleIcon({ kind }: { kind: string }) {
  switch (kind) {
    case "fieles":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="14" cy="9" r="3.4" />
          <path d="M8.5 21.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
          <circle cx="6.5" cy="11.5" r="2.4" />
          <path d="M2.5 20.5c0-2.2 1.8-3.8 4-3.8" />
          <circle cx="21.5" cy="11.5" r="2.4" />
          <path d="M25.5 20.5c0-2.2-1.8-3.8-4-3.8" />
        </svg>
      );
    case "sacramentos":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 6h12v4.5a6 6 0 0 1-12 0V6Z" />
          <path d="M14 16.5V22" />
          <path d="M9.5 22h9" />
          <path d="M8.5 9.5h11" />
        </svg>
      );
    case "pastoral":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4.5" y="6.5" width="19" height="16.5" rx="2.5" />
          <path d="M9.5 4.5v4M18.5 4.5v4M4.5 11.5h19" />
          <path d="M9.5 15.5h2M13 15.5h2M16.5 15.5h2M9.5 19h2M13 19h2" />
        </svg>
      );
    case "finanzas":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <ellipse cx="11.5" cy="9.5" rx="6" ry="2.6" />
          <path d="M5.5 9.5v4c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-4" />
          <path d="M5.5 13.5v4c0 1.4 2.7 2.6 6 2.6" />
          <ellipse cx="18" cy="16.5" rx="4.8" ry="2.1" />
          <path d="M13.2 16.5v3.5c0 1.2 2.1 2.1 4.8 2.1s4.8-.9 4.8-2.1v-3.5" />
        </svg>
      );
    case "documentos":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7.5 4.5h9l4.5 4.5v14.5a1.5 1.5 0 0 1-1.5 1.5h-12a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Z" />
          <path d="M16.5 4.5V9H21" />
          <path d="M9.5 13.5h9M9.5 17h9M9.5 20.5h6" />
        </svg>
      );
    case "reportes":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 22.5h18" />
          <rect x="7.5" y="14.5" width="3" height="8" rx="0.8" />
          <rect x="12.5" y="10.5" width="3" height="12" rx="0.8" />
          <rect x="17.5" y="6.5" width="3" height="16" rx="0.8" />
        </svg>
      );
    case "roles":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 4.5 21.5 7.5v6c0 5.1-3.2 8.7-7.5 10.5-4.3-1.8-7.5-5.4-7.5-10.5v-6L14 4.5Z" />
          <path d="m10.8 14.2 2.2 2.2 4.4-4.4" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5.5" y="5.5" width="7" height="7" rx="1.4" />
          <rect x="15.5" y="5.5" width="7" height="7" rx="1.4" />
          <rect x="5.5" y="15.5" width="7" height="7" rx="1.4" />
          <rect x="15.5" y="15.5" width="7" height="7" rx="1.4" />
        </svg>
      );
  }
}

const STATIC_MODULES = [
  { label: "Fieles y\nfamilias", kind: "fieles" },
  { label: "Sacramentos", kind: "sacramentos" },
  { label: "Pastoral y\nactividades", kind: "pastoral" },
  { label: "Finanzas y\ntesorería", kind: "finanzas" },
  { label: "Documentos", kind: "documentos" },
  { label: "Reportes", kind: "reportes" },
  { label: "Roles y\npermisos", kind: "roles" },
  { label: "Más\nmódulos", kind: "mas" },
] as const;

function LoginPage() {
  const navigate = useNavigate();
  const { login, demoCredentials } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Por favor ingresa tu correo electrónico administrativo.");
      return;
    }
    if (!password) {
      setErrorMessage("Por favor ingresa tu contraseña de acceso.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (result.success) {
        navigate({ to: "/" });
      } else {
        setErrorMessage(result.error ?? "No fue posible iniciar sesión. Verifica tus datos.");
      }
    } catch {
      setErrorMessage("Ocurrió un error inesperado al validar tus credenciales.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoQuickLogin = async () => {
    setErrorMessage("");
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setRememberMe(true);
    setIsSubmitting(true);

    try {
      const result = await login({
        email: demoCredentials.email,
        password: demoCredentials.password,
        rememberMe: true,
      });

      if (result.success) {
        navigate({ to: "/" });
      } else {
        setErrorMessage(result.error ?? "No fue posible iniciar sesión con la cuenta demo.");
      }
    } catch {
      setErrorMessage("Ocurrió un error inesperado al iniciar la sesión de demostración.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setForgotMessage("");
    try {
      const res = await requestPasswordReset(forgotEmail);
      setForgotMessage(res.message);
    } catch {
      setForgotMessage("Error al procesar la solicitud de recuperación.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="ao-login-root">
      {/* Capa fotográfica de la iglesia recortada suavemente con máscara SVG difuminada */}
      <svg
        className="ao-login-church-svg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <filter id="ao-church-mask-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <mask id="ao-church-cutout-mask">
            <rect width="1600" height="900" fill="#000000" />
            <g filter="url(#ao-church-mask-blur)">
              {/* Zona superior de cruz y campanario */}
              <ellipse cx="755" cy="185" rx="135" ry="185" fill="#ffffff" />
              {/* Fachada central de la iglesia y vegetación derecha */}
              <path
                d="M 684 195 L 852 195 L 852 770 L 555 770 L 555 705 L 678 665 L 678 405 Z"
                fill="#ffffff"
              />
            </g>
            {/* Recorte estricto fuera del blur para que jamás aparezca texto de los 8 recuadros */}
            <rect x="0" y="385" width="636" height="292" fill="#000000" />
            {/* Corte de seguridad antes de la tarjeta de la imagen fuente */}
            <rect x="892" y="0" width="708" height="900" fill="#000000" />
          </mask>
        </defs>
        <image
          href="/church-hero.jpg"
          x="0"
          y="0"
          width="1600"
          height="900"
          preserveAspectRatio="none"
          mask="url(#ao-church-cutout-mask)"
        />
      </svg>

      {/* Ondas azul y dorada inferiores fieles a la imagen de referencia */}
      <svg
        className="ao-login-waves-svg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ao-wave-gold" x1="0%" y1="60%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ca8a04" stopOpacity="0" />
            <stop offset="20%" stopColor="#e5a01b" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#f5b731" stopOpacity="1" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="ao-wave-blue-main" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#05388a" />
            <stop offset="45%" stopColor="#0d5cc1" />
            <stop offset="80%" stopColor="#2684e8" />
            <stop offset="100%" stopColor="#65b8fb" />
          </linearGradient>
          <linearGradient id="ao-wave-blue-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#09469e" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#146ad0" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="ao-wave-blue-soft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a4da8" stopOpacity="0.24" />
            <stop offset="50%" stopColor="#3593ef" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#9ed5ff" stopOpacity="0.16" />
          </linearGradient>
        </defs>

        {/* Onda curva suave detrás del borde izquierdo de la tarjeta */}
        <path
          d="M 885 0 C 785 250, 775 560, 880 900 L 1600 900 L 1600 0 Z"
          fill="url(#ao-wave-blue-soft)"
        />

        {/* Onda suave izquierda inferior */}
        <path
          d="M 0 825 C 210 792, 430 855, 650 852 L 650 900 L 0 900 Z"
          fill="url(#ao-wave-blue-left)"
        />

        {/* Cinta dorada ascendente curva bajo la iglesia hasta detrás de la tarjeta */}
        <path
          d="M 280 868 C 530 852, 770 782, 1020 648 L 1038 682 C 785 812, 540 882, 280 886 Z"
          fill="url(#ao-wave-gold)"
        />

        {/* Onda azul inferior envolvente */}
        <path
          d="M 0 868 C 235 842, 470 865, 695 812 C 885 768, 1210 710, 1600 662 L 1600 900 L 0 900 Z"
          fill="url(#ao-wave-blue-main)"
          opacity="0.94"
        />
      </svg>

      <div className="ao-login-container">
        {/* ========================================================
            PANEL IZQUIERDO: Identidad, Módulos Estáticos e Iglesia
            ======================================================== */}
        <section className="ao-login-left-panel">
          <div className="ao-login-left-content">
            <div className="ao-login-left-header">
              <AoErpBrandLogo
                variant="light"
                brandSuffix="SAAS"
                badgeLabel="Consola"
                appBadgeVariant="outlined"
                showDivider
                showSubtitle
                subtitleText="CONSOLA DEL ECOSISTEMA"
              />
            </div>

            <div className="ao-login-hero">
              <h1 className="ao-login-hero-title">
                La plataforma para
                <br />
                la gestión de tu
                <br />
                <span className="ao-highlight-gold">comunidad de fe</span>
              </h1>
              <div className="ao-login-hero-rule" aria-hidden="true" />
              <p className="ao-login-hero-desc">
                Administra, organiza y gobierna el ecosistema A&amp;O. Gestiona organizaciones,
                instituciones, usuarios, planes, licencias y servicios, en un solo lugar.
              </p>
            </div>

            {/* Ocho módulos informativos estrictamente estáticos (sin hover ni interacción) */}
            <div className="ao-login-modules-grid" aria-label="Módulos del ecosistema">
              {STATIC_MODULES.map((item) => (
                <div key={item.kind} className="ao-login-module-card">
                  <div className="ao-login-module-icon">
                    <StaticModuleIcon kind={item.kind} />
                  </div>
                  <span className="ao-login-module-name">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Lista vertical de 3 atributos institucionales */}
            <div className="ao-login-badges">
              <div className="ao-login-badge-item">
                <span className="ao-login-badge-check" aria-hidden="true">✓</span>
                <span>Seguro y confiable</span>
              </div>
              <div className="ao-login-badge-item">
                <span className="ao-login-badge-check" aria-hidden="true">✓</span>
                <span>Modular y escalable</span>
              </div>
              <div className="ao-login-badge-item">
                <span className="ao-login-badge-check" aria-hidden="true">✓</span>
                <span>Diseñado para la Iglesia</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            PANEL DERECHO: Tarjeta Flotante de Acceso Administrativo
            ======================================================== */}
        <section className="ao-login-right-panel">
          <div className="ao-login-card">
            {/* Esquina azul superior derecha con ícono de escudo y candado */}
            <div className="ao-login-card-corner" aria-hidden="true">
              <svg
                className="ao-login-card-corner-icon"
                viewBox="0 0 28 28"
                width="30"
                height="30"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 3.5 22 6.8v6.2c0 5.4-3.4 9.3-8 11.3-4.6-2-8-5.9-8-11.3V6.8L14 3.5Z" />
                <rect x="10.8" y="13" width="6.4" height="5.2" rx="1.2" />
                <path d="M12.2 13v-1.6a1.8 1.8 0 0 1 3.6 0V13" />
                <circle cx="14" cy="15.5" r="0.65" fill="#ffffff" />
              </svg>
            </div>

            {/* Encabezado centrado de la tarjeta */}
            <div className="ao-login-card-header">
              <AoErpBrandLogo
                variant="dark"
                brandSuffix="SAAS"
                align="center"
                showAppBadge={false}
                showSubtitle
                subtitleText="CONSOLA DEL ECOSISTEMA"
              />
            </div>

            <div className="ao-login-card-intro">
              <h2 className="ao-login-card-title">Acceso administrativo</h2>
              <p className="ao-login-card-subtitle">
                Identifícate para administrar el ecosistema A&amp;O
              </p>
            </div>

            {errorMessage && (
              <div className="ao-login-alert-error" role="alert">
                <SaasIcon name="alert" size={17} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="ao-login-form" noValidate>
              <div className="ao-form-group">
                <label htmlFor="ao-email" className="ao-sr-only">
                  Correo electrónico administrativo
                </label>
                <div className="ao-input-wrapper">
                  <span className="ao-input-icon" aria-hidden="true">
                    <SaasIcon name="mail" size={18} />
                  </span>
                  <input
                    id="ao-email"
                    type="email"
                    className="ao-input-field"
                    placeholder="Correo electrónico administrativo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="ao-form-group">
                <label htmlFor="ao-password" className="ao-sr-only">
                  Contraseña
                </label>
                <div className="ao-input-wrapper">
                  <span className="ao-input-icon" aria-hidden="true">
                    <SaasIcon name="lock" size={18} />
                  </span>
                  <input
                    id="ao-password"
                    type={showPassword ? "text" : "password"}
                    className="ao-input-field"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="ao-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    <SaasIcon name={showPassword ? "eye-off" : "eye"} size={17} />
                  </button>
                </div>
              </div>

              <div className="ao-login-utilities-row">
                <label className="ao-remember-me-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Recordarme</span>
                </label>
                <button
                  type="button"
                  className="ao-forgot-link"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotEmail(email);
                    setForgotMessage("");
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                className="ao-btn-primary-login"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="ao-login-spinner" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <SaasIcon name="log-in" size={18} />
                    <span>Iniciar sesión</span>
                  </>
                )}
              </button>

              {/* Recuadro informativo estático: Acceso protegido */}
              <div className="ao-protected-access-box">
                <div className="ao-protected-access-icon" aria-hidden="true">
                  <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
                    <path
                      d="M14 3.5 22 6.8v6.2c0 5.4-3.4 9.3-8 11.3-4.6-2-8-5.9-8-11.3V6.8L14 3.5Z"
                      stroke="#16a34a"
                      strokeWidth="2.1"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m10.4 14.3 2.4 2.4 4.9-5"
                      stroke="#16a34a"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="ao-protected-access-copy">
                  <strong>Acceso protegido</strong>
                  <span>Autenticación multifactor (MFA) requerida para administradores.</span>
                </div>
              </div>

              {/* Botón de acceso directo con cuenta de demostración */}
              <button
                type="button"
                className="ao-btn-demo-account"
                onClick={handleDemoQuickLogin}
                disabled={isSubmitting}
              >
                <span className="ao-demo-monitor-icon" aria-hidden="true">
                  <SaasIcon name="monitor" size={20} />
                </span>
                <span className="ao-demo-account-copy">
                  <strong>Ingresar con cuenta de demostración</strong>
                  <span>(Solo en entorno de desarrollo)</span>
                </span>
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Modal de Recuperación de contraseña */}
      {showForgotModal && (
        <div className="ao-modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="ao-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ao-modal-header">
              <h3>Recuperación de contraseña</h3>
              <button
                type="button"
                className="ao-modal-close-btn"
                onClick={() => setShowForgotModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlePasswordResetSubmit}>
              <p className="ao-modal-desc">
                Ingresa tu correo administrativo registrado para recibir el enlace seguro de
                restablecimiento de contraseña.
              </p>
              <div className="ao-form-group" style={{ marginBottom: "16px" }}>
                <input
                  type="email"
                  className="ao-input-field ao-input-plain"
                  placeholder="admin@aoerp.local"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              {forgotMessage && <div className="ao-modal-message">{forgotMessage}</div>}
              <div className="ao-modal-actions">
                <button
                  type="button"
                  className="button-muted"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cerrar
                </button>
                <button type="submit" className="button-primary" disabled={isResetting}>
                  {isResetting ? "Enviando..." : "Enviar enlace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
