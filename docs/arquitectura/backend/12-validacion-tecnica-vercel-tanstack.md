# Validación técnica de Vercel y TanStack Start para A&O SaaS

**Fecha:** 2026-11-07  
**Alcance:** validación técnica no invasiva. No se conectó Supabase ni se modificaron aplicaciones, dependencias o configuración productiva.

## 1. Dictamen

**Resultado: compatible con ajustes; despliegue Vercel no validado end-to-end.**

La aplicación SaaS compila con SSR y genera artefactos Nitro server-side. La prueba local respondió HTML SSR correctamente. Sin embargo:

- el build actual genera el preset `cloudflare-module`, no una salida Vercel validada;
- no existe `vercel.json` en la raíz ni en `apps/saas`;
- SaaS no tiene `src/start.ts`, `src/server.ts`, `createServerFn`, middleware de autenticación ni server functions propias;
- no existen cookies de sesión, variables privadas ni rutas autenticadas para probar;
- no se puede demostrar todavía una ejecución Vercel real sin un spike o preview controlado.

La base técnica es compatible con el modelo previsto, pero requiere validar el adaptador/runtime de Vercel y añadir la capa server-side antes de iniciar Supabase SSR.

## 2. Estado Git y preservación de cambios

Estado observado antes y después de las pruebas:

```text
## design/saas-dashboard-refresh...origin/design/saas-dashboard-refresh
 M apps/diocesano/src/routeTree.gen.ts
 M apps/saas/src/test/setup.ts
?? docs/arquitectura/backend/09-informes-institucionales-y-comunicaciones.md
?? docs/arquitectura/backend/10-preparacion-tecnica-implementacion-saas.md
?? docs/arquitectura/backend/11-arquitectura-ejecutable-vercel-supabase.md
```

No se descartaron cambios, no se hicieron commits, push, merge, rebase ni modificaciones de ERP o Diocesano. El build generó artefactos ignorados bajo `apps/saas/.output` y `.wrangler`; no se incorporaron archivos fuente al cambio funcional.

## 3. Configuración real de Vercel y build

### 3.1 Configuración encontrada

- No existe `vercel.json` en la raíz.
- No existe `apps/saas/vercel.json`.
- No existe configuración específica de proyecto Vercel en el repositorio.
- `apps/saas/vite.config.ts` contiene únicamente:

```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({});
```

El preset de Lovable incorpora Vite, React, TanStack Start, Nitro y resolución de alias. No se debe agregar manualmente otra instancia de los plugins sin comprobar duplicaciones.

### 3.2 Resultado del build

Comando:

```text
bun run build:saas
```

Resultado: **exitoso, código 0**.

Evidencia relevante:

```text
vite v8.1.5 building client environment for production...
✓ built in 510ms
vite v8.1.5 building ssr environment for production...
✓ built in 357ms
[nitro] Building [Nitro] (preset: cloudflare-module, compatibility: 2026-11-02)
[nitro] compiled
```

El build genera:

- `.output/public` con assets del navegador;
- `.output/server` con bundle SSR;
- `.output/nitro.json` con `preset: cloudflare-module`;
- `.output/server/wrangler.json`;
- `.wrangler/deploy/config.json`.

Esto demuestra que el preset actual produce SSR y servidor Nitro, pero no demuestra que el artefacto sea el formato adecuado para el runtime de Vercel.

## 4. Versiones verificadas

| Componente | Versión declarada |
|---|---:|
| React / React DOM | `^19.2.0` |
| `@tanstack/react-router` | `1.170.41` |
| `@tanstack/react-start` | `1.168.60` |
| Vite | `8.1.5` |
| TypeScript | `^5.8.3` |
| Vitest | `^4.1.10` |
| `@lovable.dev/vite-tanstack-config` | `2.26.5` |
| Nitro | Transitivo del preset; el build reporta `cloudflare-module` |

No se modificaron versiones ni lockfile.

## 5. Resultado de los comandos técnicos

| Comando | Resultado |
|---|---|
| `bun run typecheck:saas` | Exitoso, código 0 |
| `bun run lint:saas` | Exitoso, código 0 |
| `bun run test:saas` | Exitoso: 2 archivos y 5 pruebas aprobadas |
| `bun run build:saas` | Exitoso, código 0; cliente, SSR y Nitro generados |

Vitest mostró la advertencia experimental de Node sobre `localStorage` sin `--localstorage-file`, pero las cinco pruebas pasaron gracias al setup de almacenamiento en memoria existente. La advertencia no corresponde a Vercel ni a SSR productivo.

## 6. Validación local de SSR

Se ejecutó temporalmente el servidor de desarrollo sin modificar archivos:

```text
bun run dev:saas -- --host 127.0.0.1
```

El puerto 8080 ya estaba ocupado, por lo que Vite inició en `http://127.0.0.1:8081/`.

Solicitud realizada:

```text
GET http://127.0.0.1:8081/
```

Resultado observado:

- HTTP `200`.
- `Content-Type: text/html; charset=utf-8`.
- El cuerpo comenzó con `<!DOCTYPE html><html lang="es" ...>`.
- El HTML incluyó referencias de origen SSR a `src/routes/__root.tsx`.
- No hubo `Set-Cookie`.
- No hubo `Cache-Control` específico.

Conclusión: **SSR local comprobado** para la ruta principal. La prueba solo demuestra renderizado SSR, no autenticación ni despliegue Vercel.

## 7. Server functions y separación cliente/servidor

Se buscaron `createServerFn`, `createServerOnlyFn`, `createMiddleware`, rutas con `server`, `src/start.ts` y `src/server.ts` dentro de SaaS.

Resultado:

- No existe `apps/saas/src/start.ts`.
- No existe `apps/saas/src/server.ts`.
- No se encontraron `createServerFn` ni server functions propias.
- Las rutas encontradas son rutas de componentes con `createFileRoute`.
- El bundle SSR contiene el renderizador y los componentes, pero no una API de dominio ni una función privada invocable.

Conclusión: **server functions no validadas porque todavía no están implementadas en SaaS**. No es correcto declarar que una función ejecuta exclusivamente en servidor solo porque exista un bundle SSR.

La separación actual es únicamente la separación de bundles que produce TanStack/Nitro. La separación de secretos, acceso a datos y autorización server-side aún no existe.

## 8. Cookies, variables privadas y autenticación

### 8.1 Estado actual

No se encontraron:

- `Set-Cookie` o lectura/escritura de cookies en SaaS;
- `SUPABASE_*`, `PAPERLESS_*` u otras variables privadas;
- `import.meta.env` o `process.env` de negocio;
- cliente Supabase;
- autenticación o sesión SSR;
- rutas autenticadas;
- políticas de cache para respuestas con sesión.

Por este motivo, las pruebas de cookie HttpOnly, renovación de sesión, variable privada y cierre de sesión quedan **no aplicables en la línea base**.

### 8.2 Requisito futuro

Para Supabase SSR deberá existir un cliente server-side que gestione cookies y PKCE, además de un cliente browser limitado a valores públicos. Ninguna clave secreta ni `service_role` debe aparecer en variables `VITE_*`, bundles, respuestas o logs.

La implementación futura debe comprobar:

1. Cookie `HttpOnly`, `Secure` y `SameSite` según ambiente.
2. Intercambio PKCE mediante callback server-side.
3. Renovación de tokens y propagación correcta de `Set-Cookie`.
4. Cierre y revocación de sesión.
5. Ausencia de cache compartida para respuestas autenticadas.
6. Revalidación del usuario y membresía en cada server function privada.

## 9. Riesgos de caché y aislamiento

El servidor local no devolvió `Cache-Control`, lo cual no constituye una política de seguridad. Antes de producción deben definirse reglas explícitas:

- respuestas autenticadas: `private` o `no-store` cuando corresponda;
- no cachear respuestas que renueven cookies;
- no usar ISR o CDN compartido para contenido dependiente de sesión sin una estrategia validada;
- separar datos públicos, datos por organización y datos por institución;
- hacer que el tenant y el contexto efectivo provengan de la sesión/membresía, no de un parámetro confiado del navegador;
- aplicar RLS incluso si el servidor ya autoriza la operación;
- evitar que prefetch, loaders o rutas SSR expongan datos de otro contexto.

El uso actual de `localStorage` es especialmente incompatible con aislamiento productivo: cualquier usuario del navegador puede inspeccionar y modificar el estado local.

## 10. Ajustes necesarios para Supabase SSR

No se aplican en esta tarea. La secuencia recomendada es:

1. Confirmar destino Vercel y runtime compatible con la salida Nitro.
2. Crear una prueba aislada de TanStack Start con una server function mínima y un cookie controlado, sin Supabase.
3. Fijar versiones aprobadas de `@supabase/supabase-js` y `@supabase/ssr` sin instalar todavía.
4. Crear cliente server-only y cliente browser público en módulos separados.
5. Implementar callback PKCE y renovación de cookies.
6. Añadir middleware de sesión y contexto, sin tomar `beforeLoad` como frontera de seguridad.
7. Añadir autorización server-side antes de repositorios.
8. Activar RLS en las primeras tablas y ejecutar pruebas negativas.
9. Configurar variables separadas en Vercel Preview y Production mediante el gestor de secretos.
10. Verificar que el bundle browser no contiene claves ni imports server-only.

La documentación oficial indica que TanStack Start se despliega en Vercel mediante Nitro y que Supabase SSR utiliza cookies y PKCE. Estas referencias describen compatibilidad de la tecnología, pero la prueba específica del proyecto sigue pendiente:

- [TanStack Start: hosting y Vercel](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
- [TanStack Start: server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [TanStack Start: middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
- [Supabase: SSR Auth](https://supabase.com/docs/guides/auth/server-side)
- [Supabase: paquetes server-side](https://supabase.com/docs/guides/auth/choosing-a-server-package)
- [Vercel: TanStack Start](https://vercel.com/kb/guide/deploy-a-tanstack-start-app-to-vercel)

## 11. Pruebas no realizadas y motivo

| Prueba | Estado | Motivo |
|---|---|---|
| Deploy Preview en Vercel | No realizada | Requiere entorno externo y no se autorizó despliegue. |
| Server function privada | No realizada | SaaS no contiene ninguna server function. |
| Escritura de cookie | No realizada | No hay ruta ni sesión implementada. |
| Lectura de variable privada | No realizada | No existen variables de entorno ni archivo `.env`. |
| Verificación Supabase | No realizada | Está explícitamente fuera del alcance. |
| Cache de ruta autenticada | No realizada | No hay rutas autenticadas ni respuestas con sesión. |
| Bundle con secreto real | No realizada | No se introdujeron credenciales ni variables privadas. |

Se considera correcto no fabricar estas pruebas con mocks que oculten la ausencia de la funcionalidad real.

## 12. Criterios de aceptación

| Criterio | Resultado |
|---|---|
| Configuración real de Vercel inspeccionada | Cumplido: no hay configuración Vercel en el repositorio. |
| Versiones instaladas verificadas | Cumplido. |
| SSR comprobado localmente | Cumplido para `/`. |
| Build SSR/Nitro comprobado | Cumplido. |
| Server functions comprobadas | No validado: no existen en SaaS. |
| Cookies y variables privadas comprobadas | No validado: no están implementadas/configuradas. |
| Separación de código cliente/servidor | Parcial: separación de bundles, sin frontera de datos privada. |
| Compatibilidad Vercel end-to-end | No validada. |
| Supabase conectado | No; correctamente fuera del alcance. |
| ERP y Diocesano modificados | No. |

## 13. Conclusión

A&O SaaS tiene una base TanStack Start capaz de generar SSR y artefactos Nitro, y sus verificaciones locales pasan. El preset actual, sin embargo, construye `cloudflare-module`; no existe evidencia suficiente para afirmar que el resultado esté listo para Vercel.

El siguiente paso técnico, previa autorización, debe ser un spike aislado y reversible de Vercel/Nitro con una server function controlada, cookies de prueba y variable privada sintética. Solo después de validar ese runtime debe iniciarse la integración Supabase SSR.

No se inició la integración Supabase ni se ejecutó ningún despliegue.
