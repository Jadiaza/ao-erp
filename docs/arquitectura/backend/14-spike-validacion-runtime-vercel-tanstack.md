# Instrucción 10 — Spike de validación server-side para Vercel

**Fecha:** 2026-11-08  
**Estado:** spike de código aislado incorporado; ejecución local y despliegue Vercel pendientes de verificación en el entorno del proyecto.  
**Aplicación:** exclusivamente `apps/saas`.  
**Rama:** `design/saas-dashboard-refresh`.

## 1. Objetivo

Continuar el resultado de la Tarea 009 con una prueba pequeña y reversible que permita verificar capacidades server-side de TanStack Start antes de integrar Supabase SSR.

La prueba no crea autenticación, sesiones reales, repositorios, acceso a datos ni conexión a Supabase. Tampoco modifica ERP o Diocesano.

## 2. Cambios incorporados

| Archivo | Propósito |
|---|---|
| `apps/saas/src/server/spikes/vercel-runtime.ts` | Server function POST que lee una cookie, establece cookie HttpOnly, lee una variable privada y devuelve únicamente indicadores booleanos. |
| `apps/saas/src/routes/__spikes/vercel-runtime.tsx` | Pantalla temporal para ejecutar la prueba desde el navegador. |
| `docs/arquitectura/backend/14-spike-validacion-runtime-vercel-tanstack.md` | Registro de alcance, procedimiento, límites y criterios de aceptación. |

La función utiliza las APIs documentadas de TanStack Start: `createServerFn`, `getCookie`, `setCookie` y `setResponseHeaders`.

## 3. Seguridad de la prueba

- El endpoint usa método POST.
- La cookie de prueba no representa una sesión y no concede permisos.
- La cookie lleva `HttpOnly`, `SameSite=Lax`, `Path=/` y cinco minutos de vigencia.
- `Secure` se activa cuando el entorno es Vercel o producción.
- La variable `AO_SAAS_SPIKE_SECRET` se consulta desde `node:process`, dentro del módulo server-side.
- El valor de la variable nunca se devuelve al navegador ni se registra.
- La respuesta incluye `Cache-Control: no-store`.
- El indicador `provider` informa Vercel solo si `VERCEL=1`; una prueba local no se considera prueba de Vercel.

## 4. Procedimiento de validación local

Desde la raíz del monorepo:

```powershell
$env:AO_SAAS_SPIKE_SECRET = "spike-local-secret-no-productivo"
bun run typecheck:saas
bun run lint:saas
bun run test:saas
bun run build:saas
bun run dev:saas
```

Abrir la ruta:

```text
/__spikes/vercel-runtime
```

Pulsar **Ejecutar prueba** dos veces. Resultado esperado:

- Primera ejecución: `cookieWritten: true`; `cookieReceived` puede ser false.
- Segunda ejecución: `cookieReceived: true`.
- `privateVariableConfigured: true` si la variable se definió en el proceso que ejecuta Vite.
- `privateVariableValueExposed: false` siempre.
- `provider: local-or-other` en local.

La cookie debe inspeccionarse en DevTools > Application/Storage > Cookies. Debe figurar como HttpOnly; en desarrollo local sin HTTPS, Secure puede ser false por diseño.

Al terminar, cerrar el proceso y limpiar la variable de la sesión PowerShell:

```powershell
Remove-Item Env:AO_SAAS_SPIKE_SECRET
```

## 5. Bloqueo para la validación Vercel end-to-end

La configuración de la línea base identificada en la Tarea 009 usa el preset de Vite/Lovable que generó `cloudflare-module`. El proyecto no declara actualmente el paquete `nitro` como dependencia directa ni registra el plugin `nitro/vite`.

La guía vigente de Vercel para TanStack Start indica que el despliegue se realiza mediante Nitro y que se debe añadir `nitro()` al pipeline Vite. No se debe afirmar compatibilidad Vercel por tener SSR o una server function funcionando en desarrollo.

**No se ha instalado Nitro ni se ha cambiado `vite.config.ts`, `package.json` o `bun.lock` en este spike.** Esto evita alterar el pipeline de build sin autorización específica para modificar dependencias y validar la integración con el preset de Lovable.

Por tanto, esta tarea deja preparado el código de prueba de server function/cookie/variable privada, pero no cambia el runtime de producción y no demuestra todavía una ejecución en Vercel.

## 6. Siguiente paso requerido para completar la prueba Vercel

Una vez aprobada la incorporación de Nitro como dependencia directa de SaaS:

1. Añadir la versión compatible de `nitro` a `apps/saas` y actualizar `bun.lock` mediante Bun.
2. Integrar `nitro()` con la configuración existente sin duplicar plugins que ya aporte el preset de Lovable.
3. Generar build y comprobar que el preset de salida es Vercel, no `cloudflare-module`.
4. Ejecutar las comprobaciones locales anteriores.
5. Crear un Preview Deployment controlado de Vercel.
6. Configurar `AO_SAAS_SPIKE_SECRET` como variable Preview no productiva, sin prefijo `VITE_`.
7. Ejecutar dos veces la prueba en Preview y comprobar cookie, variable privada, respuesta SSR y logs.
8. Retirar la ruta temporal cuando la evidencia esté documentada o convertirla en prueba interna no pública protegida.

No se debe promover a Production ni conectar Supabase como parte de este spike.

## 7. Criterios de aceptación

| Criterio | Estado |
|---|---|
| Server function POST aislada creada | Incorporada; falta ejecutar |
| Cookie HttpOnly escrita | Incorporada; falta ejecutar |
| Cookie leída en solicitud posterior | Incorporada; falta ejecutar |
| Variable privada leída solo en servidor | Incorporada; falta ejecutar |
| Valor secreto ausente de respuesta | Garantizado por implementación; verificar bundle |
| Cache-Control no-store | Incorporado; falta inspeccionar respuesta |
| Typecheck, lint, test y build | Pendientes de ejecutar tras incorporar archivos |
| Nitro integrado al preset actual | Pendiente de aprobación e instalación |
| Build con preset Vercel | Pendiente |
| Preview Deployment Vercel | Pendiente |
| Supabase Auth/SSR | Fuera de alcance |

## 8. Referencias técnicas

- [TanStack Start — Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [TanStack Start — Authentication Server Primitives](https://tanstack.com/start/latest/docs/framework/react/guide/authentication-server-primitives)
- [TanStack Start — Hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
- [Vercel — Deploy a TanStack Start app](https://vercel.com/kb/guide/deploy-a-tanstack-start-app-to-vercel)

## 9. Dictamen

## 10. Actualizacion de validacion local - 2026-11-08

La implementacion fue revisada en la rama `design/saas-dashboard-refresh` sin crear una segunda prueba.

### Correcciones aplicadas

- Se corrigio el acceso a variables de entorno para cumplir `noPropertyAccessFromIndexSignature`, usando `env["..."]`.
- Se traslado el modulo de la funcion a `apps/saas/src/server-functions/vercel-runtime.ts`. El import desde una carpeta llamada `server` era bloqueado por la proteccion de imports de TanStack en el bundle cliente, aunque la funcion utilizara `createServerFn`.
- La ruta `apps/saas/src/routes/vercel-runtime.tsx` ahora importa el modulo server function desde `@/server-functions/vercel-runtime`.
- Se ejecuto el generador de rutas mediante el build; `apps/saas/src/routeTree.gen.ts` registra `/vercel-runtime`. No se edito manualmente ese archivo generado.
- Se normalizo el formato de los archivos del spike y del setup de pruebas para eliminar errores CRLF reportados por Prettier.
- No se modificaron dependencias, `package.json`, `bun.lock`, ERP, Diocesano ni Supabase.

### Resultados de comandos

| Comando | Resultado |
|---|---|
| `bun run typecheck:saas` | Exitoso, codigo 0 |
| `bun run lint:saas` | Exitoso, codigo 0 |
| `bun run test:saas` | Exitoso: 2 archivos y 5 pruebas aprobadas |
| `bun run build:saas` | Exitoso, codigo 0; cliente, SSR y Nitro generados |

Vitest sigue mostrando la advertencia experimental de Node sobre `localStorage` sin `--localstorage-file`, pero las cinco pruebas pasan y el setup existente proporciona almacenamiento en memoria.

### Ruta y bundle

- La solicitud local `GET /vercel-runtime` devolvio `200` con `text/html; charset=utf-8` y HTML SSR con referencias de `__root.tsx`.
- El bundle de desarrollo transformo la funcion en un `createClientRpc` y conservo la implementacion server-side en el modulo SSR.
- El build incluyo assets cliente y SSR especificos de `vercel-runtime`.
- El build continuo generando Nitro con preset `cloudflare-module`; esto no valida Vercel.

### Cookies y variable privada

Se inicio Vite localmente en un proceso aislado con una variable sintetica `AO_SAAS_SPIKE_SECRET`, sin credenciales reales. La pagina SSR cargo correctamente.

No se pudo automatizar desde este entorno el clic del navegador para ejecutar dos invocaciones consecutivas de la server function y observar `Set-Cookie`. Por ello, los siguientes puntos quedan como prueba manual pendiente:

- primera invocacion con `cookieWritten: true`;
- segunda invocacion con `cookieReceived: true`;
- presencia de `HttpOnly`, `SameSite=Lax`, `Path=/` y `Max-Age=300`;
- `Cache-Control: no-store` en la respuesta;
- `privateVariableConfigured: true` sin devolver el valor secreto.

La implementacion no devuelve el secreto y el bundle cliente inspeccionado no contiene el valor sintetico.

### Estado de cierre

La validacion local del codigo queda **cerrada con correcciones**: typecheck, lint, pruebas, build y registro de ruta pasan. La comprobacion interactiva de cookies queda pendiente de ejecutarse manualmente en el navegador.

La validacion real de Vercel permanece pendiente porque el build usa `cloudflare-module`, no existe un Preview Deployment validado y no se autorizo instalar/configurar Nitro, modificar dependencias o conectar Supabase.

El spike de código queda aislado en A&O SaaS y no incorpora dependencias ni modifica el comportamiento de las rutas existentes. Su validación funcional requiere ejecutar los comandos y probar la ruta en el PC local. La validación Vercel permanece bloqueada hasta autorizar la incorporación de Nitro y realizar un Preview Deployment.

Este resultado no constituye autenticación, persistencia productiva, conexión Supabase ni aprobación del modelo físico de datos.
