# Evaluación Técnica de Runtime: Vercel, Node.js, TanStack Start, Nitro y Preset Lovable

**Fecha:** 2026-11-14  
**Alcance:** Evaluación documental y prueba técnica aislada **fuera del repositorio** (`D:\Proyectos\ao-erp` no fue modificado).  
**Aplicaciones evaluadas:** `apps/saas`, `apps/erp` y `apps/diocesano`.

---

## 1. Resumen y dictamen de compatibilidad

**DICTAMEN: COMPATIBLE CON AJUSTES MENORES EN NIVEL 2.2 (APTO PARA VERCEL + NODE.JS 24).**

La inspección directa del código de `@lovable.dev/vite-tanstack-config@2.26.5` y las pruebas aisladas de compilación y ejecución realizadas fuera del repositorio confirman que **Vercel con runtime Node.js es técnicamente viable para las tres aplicaciones sin abandonar el preset de Lovable**. No existen incompatibilidades bloqueantes, pero sí requisitos obligatorios de configuración previa en `apps/saas` y `apps/diocesano` antes de pasar a producción.

---

## 2. Análisis del preset actual `@lovable.dev/vite-tanstack-config` (`2.26.5`)

Al inspeccionar `node_modules/@lovable.dev/vite-tanstack-config/dist/index.js` y `dist/index.d.ts`, se verificaron los siguientes hechos:

1. **Composición interna del preset:** registra en orden `@tanstack/devtools-vite` (solo desarrollo), `@tailwindcss/vite`, `vite-tsconfig-paths`, loggers de desarrollo, `tanstackStart` (con `importProtection` sobre `**/server/**` y `server-only`), `nitro` (`nitro/vite` solo en `command === "build"`) y `@vitejs/plugin-react`.
2. **Comportamiento de Nitro por defecto (`options.nitro === undefined`):**
   - El preset pasa `defaultPreset: "cloudflare-module"` a `nitro()`, pero **NO fuerza `preset: "cloudflare-module"` fuera del sandbox de Lovable**.
   - Según `dist/index.d.ts` (líneas 48–56) y `dist/index.js` (líneas 1183–1215), fuera de Lovable la detección automática de entorno de Nitro (`NITRO_PRESET` o variables de plataforma como `VERCEL=1`) **prevalece** sobre `defaultPreset`, o bien puede fijarse explícitamente con `nitro: { preset: "vercel" }` para CI.
3. **Dependencia `nitro` (`3.0.260603-beta`):**
   - Está declarada como `peerDependency` opcional en `@lovable.dev/vite-tanstack-config`.
   - En el monorepo actual, **`apps/erp/package.json` la declara explícitamente** (`"nitro": "3.0.260603-beta"`), lo que provoca su hoisting a `node_modules/nitro` y permite que `apps/saas` y `apps/diocesano` compilen hoy por efecto transitivo. Para despliegues independientes por app en Vercel, `apps/saas` y `apps/diocesano` deberán declarar `nitro` explícitamente en Nivel 2.2.

---

## 3. Evidencia de la prueba técnica aislada (fuera del repositorio)

Se crearon copias aisladas en un directorio temporal del sistema (`%TEMP%\opencode\nitro-vercel-spike` para `apps/saas` y `%TEMP%\opencode\nitro-vercel-spike-erp` para `apps/erp`, enlazando `node_modules` sin alterar ningún archivo del repositorio) y se ejecutó `vite build` con `NITRO_PRESET=vercel`.

### 3.1 Resultados de compilación

| Prueba | Resultado | Artefactos generados | Runtime detectado |
|---|---|---|---|
| Build aislado `apps/saas` (`NITRO_PRESET=vercel`) | **Exitoso (exit 0)** | `.vercel/output/config.json`, `.vercel/output/nitro.json`, `.vercel/output/static/*`, `.vercel/output/functions/__server.func/index.mjs` | `nodejs24.x` (`LauncherType: Nodejs`, `supportsResponseStreaming: true`) |
| Build aislado `apps/erp` (`NITRO_PRESET=vercel`, con `src/start.ts` y `src/server.ts`) | **Exitoso (exit 0)** | `.vercel/output/functions/__server.func/` + assets cliente y SSR | `nodejs24.x` |

### 3.2 Resultados de ejecución en Node.js (`handler.fetch` sobre `.vercel/output/functions/__server.func/index.mjs`)

Se ejecutó directamente el bundle compilado de Vercel en **Node.js 24.16.0** con variables simuladas (`AO_SAAS_SPIKE_SECRET`, `VERCEL=1`, `VERCEL_REGION=gru1`):

| Comprobación | Resultado observado | Evidencia |
|---|---|---|
| **Renderizado SSR (`/`)** | **Aprobado** | HTTP `200`, `Content-Type: text/html; charset=utf-8`, ausencia del secreto privado en HTML (`SSR_SECRET_LEAK: false`). |
| **Server Function (`POST /_serverFn/...` `runVercelRuntimeProbe`)** | **Aprobado** | HTTP `200`, `provider: "vercel"`, `nodeRuntime: "gru1"`, `privateVariableConfigured: true`, `privateVariableValueExposed: false`. |
| **Cookies `HttpOnly` y seguridad de cabeceras** | **Aprobado** | `Set-Cookie: ao_saas_runtime_spike=server-cookie-ok; Max-Age=300; Path=/; HttpOnly; Secure; SameSite=Lax`, `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`. |
| **Lectura de cookie en segunda petición** | **Aprobado** | Al enviar `Cookie: ao_saas_runtime_spike=server-cookie-ok`, la server function devolvió `cookieReceived: true`. |
| **Protección CSRF entre orígenes** | **Aprobado** | Petición `POST` a `/_serverFn/...` con `Origin: https://evil.example` rechazada automáticamente con **HTTP `403`**. |

*(Nota: la llamada RPC de TanStack Start usa serialización `seroval` y cabecera/origen válidos; cuando se probó un JSON plano incompatible devolvió HTTP `500` por deserialización, lo cual confirma la validación estricta del protocolo RPC).*

---

## 4. Evaluación de requisitos técnicos para producción

### 4.1 Conexiones PostgreSQL y compatibilidad con Pooler Transaccional (Supavisor / PgBouncer)
- **Ventaja del runtime Node.js (`nodejs24.x`) frente a `cloudflare-module`:** en Node.js están disponibles sockets TCP/TLS nativos (`node:net`, `node:tls`), por lo que librerías estándar como `pg` o `postgres` (`postgres.js`) operan directamente sin adaptadores HTTP propietarios.
- **Compatibilidad con pooler transaccional (puerto `6543` en Supabase):**
  1. En funciones serverless de Vercel, el pool por instancia debe mantenerse acotado (`max: 1..3` conexiones por instancia y `idleTimeoutMillis` corto) para no agotar conexiones ante picos de concurrencia.
  2. En modo transaccional (`Transaction Pooling`), **no deben usarse sentencias preparadas con nombre (`prepare: false` en `postgres.js`)** ni variables de sesión globales permanentes.
  3. El contexto de RLS portable (`SET LOCAL app.current_user_id = ...`) funciona de forma segura dentro de bloques `BEGIN ... COMMIT` en *Transaction Pooling* porque `SET LOCAL` dura exactamente la transacción actual y no contamina otras peticiones que reutilicen la conexión.
  4. Las migraciones DDL (`DIRECT_DATABASE_URL`, puerto `5432`) deben ejecutarse siempre contra conexión directa (nunca sobre el pooler transaccional).

### 4.2 Gestión de variables de entorno y separación de secretos
- El preset de Lovable inyecta automáticamente en el bundle cliente únicamente las variables con prefijo **`VITE_`** (`loadEnv(mode, process.cwd(), "VITE_")`).
- Toda variable sin prefijo `VITE_` (`DATABASE_URL`, `DIRECT_DATABASE_URL`, `SUPABASE_SECRET_KEY`, `STORAGE_SECRET_KEY`, `SESSION_COOKIE_SECRET`, `PAPERLESS_TOKEN`) permanece exclusivamente en `node:process` en el servidor Vercel.
- En Nivel 2.2 debe añadirse un chequeo automático en CI sobre `.vercel/output/static` para verificar que ningún secreto aparezca en los artefactos públicos.

### 4.3 SSR, cookies `HttpOnly`, caché y CSRF
- **Caché CDN en Vercel:** `.vercel/output/config.json` aplica `max-age=31536000, immutable` únicamente a `/assets/(.*)` y enruta `/(.*)` a `/__server`. Aun así, todo loader SSR autenticado y toda server function privada debe emitir `Cache-Control: private, no-store` para impedir que capas intermedias almacenen respuestas con datos de usuario o cabeceras `Set-Cookie`.
- **Middleware CSRF y errores:** `apps/erp` ya cuenta con `src/start.ts` (`createCsrfMiddleware` + `errorMiddleware`) y `src/server.ts`. `apps/saas` y `apps/diocesano` deberán incorporar un equivalente en Nivel 2.2 para unificar manejo de errores SSR y políticas de caché.
- **Protección de imports server-only:** `@lovable.dev/vite-tanstack-config` bloquea en cliente cualquier import que coincida con `**/server/**` o `"server-only"`. Como comprobó el spike de Doc `14`, las definiciones `createServerFn` invocadas desde rutas deben ubicarse en `src/server-functions/*`, mientras que el acceso real a BD, Auth y Storage debe residir en módulos `**/server/**` o con `"server-only"` importados únicamente dentro de los handlers server-side.

### 4.4 Despliegue de las tres aplicaciones en Vercel
- El monorepo (`apps/saas`, `apps/erp`, `apps/diocesano`) requiere **tres proyectos independientes en Vercel** conectados al mismo repositorio Git, cada uno con su *Root Directory* (`apps/saas`, `apps/erp`, `apps/diocesano`) o comando de build filtrado (`bun run build:saas`, `bun run build:erp`, `bun run build:diocesano`), y dominios separados (`saas.*`, `erp.*`, `diocesano.*`).
- Para compartir sesión SSO o aislar cookies según política aprobada, cada app gestionará cookies `HttpOnly` estrictamente acotadas a su dominio o subdominio controlado.
- **Brecha menor a resolver al iniciar Nivel 2.2:**
  1. Declarar `"nitro": "3.0.260603-beta"` explícitamente en `apps/saas/package.json` y `apps/diocesano/package.json`.
  2. Incorporar `zod` en `apps/saas` y `apps/diocesano` para validación de entradas en `createServerFn`.
  3. Validar un *Preview Deployment* real en Vercel para comprobar latencia de arranque en frío (*cold start*) con `pg`/`postgres` y cookies reales HTTPS.

---

## 5. Alternativas si surgieran incompatibilidades o sobrecostos en Vercel

Si durante el *Preview Deployment* en Vercel o al escalar tráfico se detectaran limitaciones (p. ej. costos por ancho de banda, latencia entre regiones o necesidad de workers persistentes / conexión TCP constante sin serverless):

| Alternativa | Cuándo activarla | Impacto en código A&O |
|---|---|---|
| **1. Servidor Node.js en contenedor Docker (Fly.io / Railway / Hetzner + Coolify)** | Si se requiere pool PostgreSQL persistente sin cold starts, tareas largas OCR/Paperless o menor costo fijo en escala. | **Cero cambios en lógica de negocio**: basta compilar con `NITRO_PRESET=node_server` y ejecutar `node .output/server/index.mjs`. |
| **2. Cloudflare Workers (preset por defecto `cloudflare-module`)** | Si se prioriza costo mínimo de cómputo edge. | Requiere obligatoriamente **Cloudflare Hyperdrive** (para conectar PostgreSQL vía pooler desde Workers) y evitar dependencias exclusivas de Node.js en el runtime. |

---

## 6. Conclusión técnica

**Vercel + Node.js (`nodejs24.x`) mediante el preset actual de `@lovable.dev/vite-tanstack-config` + Nitro es compatible y ejecutable**, con soporte comprobado para SSR, `createServerFn`, cookies `HttpOnly`, cabeceras `no-store`, lectura aislada de variables privadas y protección CSRF `403`. No se requiere reemplazar el preset de Lovable para desplegar en Vercel; únicamente completar en Nivel 2.2 la declaración explícita de `nitro`/`zod`, `src/start.ts` en SaaS/Diocesano y el *Preview Deployment* real de validación.
