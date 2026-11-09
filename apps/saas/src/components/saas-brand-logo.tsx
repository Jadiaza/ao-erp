import { useId } from "react";

export function SaasBrandLogo({
  collapsed = false,
  subtitle = "Consola del Ecosistema",
}: {
  collapsed?: boolean | undefined;
  subtitle?: string | undefined;
}) {
  const uid = useId().replace(/:/g, "");
  const cloudMainGrad = `ao-cloud-main-${uid}`;
  const cloudRimGrad = `ao-cloud-rim-${uid}`;
  const cloudGlowFilter = `ao-cloud-glow-${uid}`;

  if (collapsed) {
    return (
      <div className="ao-saas-logo ao-saas-logo--collapsed" aria-label="A&O SaaS">
        <svg
          className="ao-saas-logo-emblem"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={cloudMainGrad}
              x1="6"
              y1="8"
              x2="56"
              y2="50"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="45%" stopColor="#E6A72E" />
              <stop offset="100%" stopColor="#C88719" />
            </linearGradient>
            <linearGradient
              id={cloudRimGrad}
              x1="8"
              y1="8"
              x2="50"
              y2="44"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#FDE68A" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#C88719" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 19 52 C 7.5 47.5 4 35.5 9.5 26.5 C 12.6 21.4 18.2 19.2 23.4 20.4 C 26.5 10.6 37.2 6.2 46.2 10.8 C 50.8 13.1 53.8 17.5 54.6 22.4 C 58.2 22.8 61.2 24.8 62.5 27.6 C 59.3 25.8 55.6 25.4 51.4 26.6 C 50.8 19.8 45.4 14.4 38.4 14.4 C 31.6 14.4 26.2 19.4 25.6 26.0 C 24.0 24.8 21.8 24.2 19.5 24.4 C 14.2 24.8 10.4 29.4 10.6 35.2 C 10.8 41.6 14.4 47.6 19 52 Z"
            fill={`url(#${cloudMainGrad})`}
          />
          <path
            d="M 19 52 C 7.5 47.5 4 35.5 9.5 26.5 C 12.6 21.4 18.2 19.2 23.4 20.4 C 26.5 10.6 37.2 6.2 46.2 10.8 C 50.8 13.1 53.8 17.5 54.6 22.4"
            stroke={`url(#${cloudRimGrad})`}
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <text
            x="35"
            y="45"
            textAnchor="middle"
            className="ao-saas-emblem-text"
            fontFamily="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
            fontWeight="800"
            fontSize="18.5"
            letterSpacing="-0.6"
          >
            A&amp;O
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="ao-saas-logo" aria-label={`A&O SaaS · ${subtitle}`}>
      <div className="ao-saas-logo-graphic">
        <svg
          className="ao-saas-logo-svg"
          viewBox="0 0 218 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={cloudMainGrad}
              x1="6"
              y1="4"
              x2="128"
              y2="52"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="42%" stopColor="#E6A72E" />
              <stop offset="85%" stopColor="#D9931A" />
              <stop offset="100%" stopColor="#C27D12" />
            </linearGradient>
            <linearGradient
              id={cloudRimGrad}
              x1="8"
              y1="5"
              x2="98"
              y2="46"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0.15" />
            </linearGradient>
            <filter id={cloudGlowFilter} x="-12%" y="-15%" width="124%" height="130%">
              <feDropShadow
                dx="0"
                dy="1.5"
                stdDeviation="1.6"
                floodColor="#000000"
                floodOpacity="0.26"
              />
            </filter>
          </defs>

          {/* Nube en amarillo oro (#E6A72E) */}
          <g filter={`url(#${cloudGlowFilter})`}>
            <path
              d="M 27.5 53.5 C 12.2 50.2 4.2 38.6 8.2 26.8 C 11.0 18.6 19.2 14.8 27.4 17.2 C 31.2 6.2 44.2 1.2 56.4 5.8 C 63.6 8.5 68.8 14.5 70.6 21.4 C 78.6 20.6 86.8 23.4 93.2 29.2 C 86.4 26.4 79.0 25.8 71.2 27.4 L 66.2 28.4 L 65.8 24.2 C 64.6 15.8 56.8 9.8 47.6 10.2 C 38.8 10.6 31.8 16.8 30.8 25.2 L 30.2 29.6 L 26.2 27.4 C 23.8 26.0 20.8 25.6 18.0 26.4 C 13.4 27.8 10.8 32.8 11.8 38.4 C 13.0 44.8 18.8 50.2 27.5 53.5 Z"
              fill={`url(#${cloudMainGrad})`}
            />
            <path
              d="M 27.5 53.5 C 12.2 50.2 4.2 38.6 8.2 26.8 C 11.0 18.6 19.2 14.8 27.4 17.2 C 31.2 6.2 44.2 1.2 56.4 5.8 C 63.6 8.5 68.8 14.5 70.6 21.4 C 78.6 20.6 86.8 23.4 93.2 29.2"
              stroke={`url(#${cloudRimGrad})`}
              strokeWidth="1.15"
              strokeLinecap="round"
            />
          </g>

          {/* Wordmark oficial: A&O en blanco, SA en amarillo oro, AS en blanco */}
          <text
            x="33"
            y="46.5"
            fontFamily="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
            fontWeight="800"
            fontSize="26.5"
            letterSpacing="-0.6"
          >
            <tspan className="ao-saas-word-light">A&amp;O </tspan>
            <tspan fill={`url(#${cloudMainGrad})`} className="ao-saas-word-gold">
              SA
            </tspan>
            <tspan className="ao-saas-word-light">AS</tspan>
          </text>
        </svg>
        {subtitle ? <span className="ao-saas-logo-subtitle">{subtitle}</span> : null}
      </div>
    </div>
  );
}
