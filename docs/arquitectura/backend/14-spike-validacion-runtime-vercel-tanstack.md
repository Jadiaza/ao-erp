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

El spike de código queda aislado en A&O SaaS y no incorpora dependencias ni modifica el comportamiento de las rutas existentes. Su validación funcional requiere ejecutar los comandos y probar la ruta en el PC local. La validación Vercel permanece bloqueada hasta autorizar la incorporación de Nitro y realizar un Preview Deployment.

Este resultado no constituye autenticación, persistencia productiva, conexión Supabase ni aprobación del modelo físico de datos.
