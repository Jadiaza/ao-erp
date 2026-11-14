import { useId } from "react";

export interface AoErpBrandLogoProps {
  className?: string;
  variant?: "light" | "dark" | "default";
  brandSuffix?: "SAAS" | "ERP";
  showSubtitle?: boolean;
  subtitleText?: string;
  showAppBadge?: boolean;
  badgeLabel?: string;
  appBadgeVariant?: "solid" | "outlined";
  showDivider?: boolean;
  showRegisteredMark?: boolean;
  align?: "left" | "center";
}

/**
 * Logotipo oficial de A&O SAAS / A&O ERP con isotipo de nube dorada institucional,
 * wordmark, badge configurable y subtítulo centrado debajo del wordmark.
 */
export function AoErpBrandLogo({
  className = "",
  variant = "light",
  brandSuffix = "SAAS",
  showSubtitle = true,
  subtitleText = "CONSOLA DEL ECOSISTEMA",
  showAppBadge = true,
  badgeLabel = "Consola",
  appBadgeVariant = "solid",
  showDivider = false,
  showRegisteredMark = true,
  align = "left",
}: AoErpBrandLogoProps) {
  const uid = useId().replace(/:/g, "");
  const cloudMainGrad = `ao-erp-cloud-main-${uid}`;
  const saGoldGrad = `ao-erp-sa-gold-${uid}`;
  const cloudRimGrad = `ao-erp-cloud-rim-${uid}`;
  const cloudGlowFilter = `ao-erp-cloud-glow-${uid}`;

  const isDarkText = variant === "dark";
  const primaryTextColor = isDarkText ? "#0b3574" : "#ffffff";
  const subtitleColor = isDarkText ? "#0b3574" : "rgba(255, 255, 255, 0.95)";
  const isCenter = align === "center";

  return (
    <div
      className={`ao-erp-brand-logo-container ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "flex-start",
        justifyContent: isCenter ? "center" : "flex-start",
        gap: showDivider ? "18px" : "10px",
      }}
    >
      {/* Bloque principal: Isotipo + Wordmark + Subtítulo centrado bajo A&O SAAS */}
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
        }}
      >
        <svg
          viewBox="0 0 228 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: isCenter ? "274px" : "262px", height: "auto", overflow: "visible" }}
          role="img"
          aria-label={`A&O ${brandSuffix}`}
        >
          <defs>
            <linearGradient id={cloudMainGrad} x1="6" y1="2" x2="88" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F5B71A" />
              <stop offset="100%" stopColor="#E69B00" />
            </linearGradient>
            <linearGradient id={saGoldGrad} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="52%" stopColor="#F5B71A" />
              <stop offset="100%" stopColor="#E69B00" />
            </linearGradient>
            <linearGradient id={cloudRimGrad} x1="8" y1="4" x2="88" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#FDE68A" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
            </linearGradient>
            <filter id={cloudGlowFilter} x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="1.2"
                floodColor="#000000"
                floodOpacity={isDarkText ? "0.06" : "0.2"}
              />
            </filter>
          </defs>

          {/* Isotipo Nube Trébol A&O cerrando sobre & */}
          <g filter={`url(#${cloudGlowFilter})`}>
            <path
              d="M 30 48.5 C 12.5 47 3.2 35.8 7 23 C 9.4 15 17.2 12.2 25.5 14.8 C 29.2 4.6 41 0.4 53.2 3.4 C 61 5.4 66.2 10.6 67.8 17.2 C 73.5 15 79.8 17 82.6 22.6 L 78.2 24.4 C 75.5 20.2 70.6 19.2 64.5 22.2 C 63.2 13.8 56.8 8.4 48.2 8.2 C 39.2 8 31.8 13.8 30.4 22 C 25 18.8 17.4 19 13.4 24 C 9.2 29.2 10.8 37.8 17.5 43.6 C 21.4 46.8 25.6 48 30 48.5 Z"
              fill={`url(#${cloudMainGrad})`}
            />
            <path
              d="M 30 48.5 C 12.5 47 3.2 35.8 7 23 C 9.4 15 17.2 12.2 25.5 14.8 C 29.2 4.6 41 0.4 53.2 3.4 C 61 5.4 66.2 10.6 67.8 17.2 C 73.5 15 79.8 17 82.6 22.6"
              stroke={`url(#${cloudRimGrad})`}
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </g>

          {/* Wordmark oficial: A&O [SA amarillo oro][AS primario] o A&O [ERP amarillo oro] */}
          <text
            x="33"
            y="47"
            fontFamily="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
            fontWeight="800"
            fontSize="28.5"
            letterSpacing="-0.55"
          >
            <tspan fill={primaryTextColor}>A&amp;O </tspan>
            {brandSuffix === "SAAS" ? (
              <>
                <tspan fill={`url(#${saGoldGrad})`}>SA</tspan>
                <tspan fill={primaryTextColor}>AS</tspan>
              </>
            ) : (
              <tspan fill={`url(#${saGoldGrad})`}>{brandSuffix}</tspan>
            )}
          </text>

          {showRegisteredMark && (
            <text
              x={brandSuffix === "SAAS" ? "177" : "162"}
              y="29"
              fontFamily="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
              fontWeight="700"
              fontSize="10"
              fill={primaryTextColor}
              opacity="0.92"
            >
              ®
            </text>
          )}
        </svg>

        {showSubtitle && (
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
              fontSize: isCenter ? "11.5px" : "11px",
              fontWeight: 700,
              letterSpacing: "0.085em",
              color: subtitleColor,
              textTransform: "uppercase",
              marginTop: "-3px",
              paddingLeft: "6px",
              textAlign: "center",
            }}
          >
            {subtitleText}
          </span>
        )}
      </div>

      {showDivider && (
        <span
          aria-hidden="true"
          style={{
            width: "1px",
            height: "36px",
            background: isDarkText ? "rgba(11, 53, 116, 0.25)" : "rgba(255, 255, 255, 0.58)",
            marginTop: "15px",
          }}
        />
      )}

      {showAppBadge && (
        <span
          style={
            appBadgeVariant === "outlined"
              ? {
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(10, 62, 138, 0.28)",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 600,
                  padding: "5px 20px",
                  borderRadius: "999px",
                  border: "1.5px solid rgba(125, 211, 252, 0.78)",
                  letterSpacing: "0.01em",
                  marginTop: "15px",
                }
              : {
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#0B66D4",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "4px 14px",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 2px 6px rgba(11, 102, 212, 0.28)",
                  letterSpacing: "0.01em",
                  marginTop: "14px",
                }
          }
        >
          {badgeLabel}
        </span>
      )}
    </div>
  );
}
