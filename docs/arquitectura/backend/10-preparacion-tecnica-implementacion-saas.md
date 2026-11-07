# Preparación técnica para implementar A&O SaaS

**Fecha de revisión:** 2026-11-07  
**Alcance:** diagnóstico y planificación. No se implementan migraciones, conexión a Supabase ni cambios de aplicaciones.

## 1. Resumen ejecutivo

A&O SaaS está preparado como una consola de demostración frontend basada en React, Vite y TanStack Router/Start. Sus datos se administran mediante un repositorio local respaldado por `localStorage`. No existe todavía una integración operativa con PostgreSQL, Supabase Auth, Supabase Storage, RLS ni funciones server-side propias de SaaS.

La implementación debe comenzar agregando una frontera de servidor para SaaS, sin reemplazar de una vez las pantallas ni eliminar el modo demostración. La estrategia recomendada es conservar los contratos que utilizan las pantallas y sustituir progresivamente el adaptador local por repositorios server-side, con autorización y contexto institucional centralizados.

## 2. Estado verificado del repositorio

### 2.1 Git

- Rama: `design/saas-dashboard-refresh`.
- Rama remota equivalente: `origin/design/saas-dashboard-refresh`.
- Último commit: `5884ae9 feat: actualiza ecosistema completo A&O ERP`.
- Cambios locales preservados al realizar esta revisión:
  - `apps/diocesano/src/routeTree.gen.ts` aparece modificado en el estado de Git, pero la revisión previa determinó que no presenta diferencias de contenido útiles frente a `HEAD`.
  - `apps/saas/src/test/setup.ts` contiene el ajuste previo del entorno de pruebas para proveer `localStorage` en Vitest.
  - `docs/arquitectura/backend/09-informes-institucionales-y-comunicaciones.md` es documentación local no confirmada y se conserva sin alteraciones.
- No se realizaron commits, push, merge, rebase ni limpieza del árbol.

### 2.2 Monorepo y aplicaciones

| Área | Estado actual | Observación |
|---|---|---|
| `apps/saas` | Frontend funcional de demostración | Usa TanStack Router/Start, React y repositorios locales; no tiene `src/server`. |
| `apps/erp` | Aplicación con base TanStack Start server-side | Tiene `src/start.ts` y `src/server.ts`, middleware CSRF y manejo SSR; no es una integración SaaS. |
| `apps/diocesano` | Aplicación frontend separada | No debe recibir cambios en esta etapa. |
| `packages/utilities` | Utilidades visuales compartidas | Actualmente concentra `cn`; no contiene dominio, persistencia ni autenticación. |
| `supabase/` | Ausente | No hay `config.toml`, migraciones, seeds ni pruebas SQL. |

### 2.3 Configuración y scripts

Los scripts raíz disponibles separan las aplicaciones, incluyendo `dev:saas`, `build:saas`, `typecheck:saas`, `lint:saas`, `test:saas` y `preview:saas`. SaaS utiliza `@lovable.dev/vite-tanstack-config` y su configuración incluye Vite, TanStack Start y alias `@`; no se debe duplicar manualmente la configuración que el preset ya incorpora.

El `tsconfig` de SaaS usa TypeScript estricto, resolución `Bundler`, JSX React y no emisión. Vitest usa `jsdom` y el setup de pruebas local. El ajuste de `apps/saas/src/test/setup.ts` es una solución de pruebas aislada y no representa persistencia de producción.

### 2.4 Dependencias y Supabase

La aplicación SaaS no declara paquetes `@supabase/*`, `@supabase/ssr` ni un cliente PostgreSQL. Tampoco se detectaron variables `.env`, ejemplos de variables, configuración de Supabase CLI o archivos de migración. Por tanto, no puede afirmarse que exista autenticación, conexión de datos o aislamiento multi-tenant real.

## 3. Componentes reutilizables y límites actuales

### Reutilizable

- `apps/saas/src/data/saas-domain.ts`: tipos y fixtures del dominio SaaS.
- `apps/saas/src/data/saas-repository.ts`: `LocalSaasStore`, repositorios de entidades, soporte y módulos.
- Componentes de pantalla y navegación existentes en `apps/saas/src/components` y `apps/saas/src/routes`.
- Patrón de repositorio local de `apps/erp/src/data/local-repository.ts`, únicamente como referencia de modo demostración.
- Arranque server-side, middleware CSRF y manejo de errores de `apps/erp`, como referencia técnica; no se comparte automáticamente con SaaS.
- `packages/utilities` para utilidades sin estado y presentación.

### Pendiente de implementación

- Cliente Supabase server-side y cliente browser limitado.
- Gestión de sesión SSR y renovación de cookies.
- Contexto de organización, entidad e institución.
- Repositorios SaaS server-side y servicios de dominio.
- Validación server-side y autorización por membresía, rol, licencia y entitlement.
- Migraciones, seeds controlados, RLS y pruebas negativas.
- Auditoría de operaciones sensibles.
- Adaptador de almacenamiento documental cuando se apruebe el proveedor.

## 4. Arquitectura objetivo

```text
Navegador React / TanStack Router
          |
          | sesión y operaciones mediante server functions
          v
TanStack Start server de A&O SaaS
  ├─ autenticación y cookies SSR
  ├─ resolución del contexto activo
  ├─ validación de entrada
  ├─ autorización por organización/institución/módulo
  ├─ servicios de dominio
  └─ repositorios
          |
          v
Supabase
  ├─ Supabase Auth
  ├─ PostgreSQL + RLS
  ├─ Storage privado, si se aprueba
  └─ auditoría y observabilidad
```

La clave secreta nunca debe llegar al navegador. El cliente público, si se utiliza, solo debe recibir la URL pública y la clave publicable; las operaciones privilegiadas deben ejecutarse en server functions o servicios server-side.

SaaS, ERP y Diocesano deben conservar límites de responsabilidad:

- SaaS administra clientes comerciales, organizaciones contratantes, instituciones registradas, planes, contratos, suscripciones, licencias, entitlements y aprovisionamiento.
- CRM administra prospectos, contactos, oportunidades, actividades, cotizaciones y agentes comerciales.
- ERP y Diocesano administran la operación de cada institución, sin convertirse en el repositorio comercial de SaaS.

Los tipos o contratos compartidos podrán extraerse posteriormente a `packages/domain`, pero los servicios y repositorios deben permanecer separados por producto.

## 5. Estructura recomendada

Esta estructura es objetivo técnico; no se ha creado en esta tarea:

```text
apps/saas/src/
  server/
    auth/
    context/
    db/
    repositories/
    services/
    functions/
    schemas/
  data/
    components/
    routes/

packages/domain/
  identity/
  organizations/
  commercial/
  crm/
  audit/

supabase/
  config.toml
  migrations/
  seed/
  tests/
```

La UI no debe importar un cliente con privilegios. Las rutas llaman a contratos de servicio; los servicios resuelven el contexto y delegan en repositorios. El adaptador local puede mantenerse para modo demostración y pruebas unitarias.

## 6. Variables de entorno propuestas

No se han creado archivos de entorno ni se han añadido valores. Los nombres siguientes son una propuesta que requiere aprobación:

| Variable | Uso | Exposición |
|---|---|---|
| `SUPABASE_URL` | URL del proyecto para servidor | Servidor; puede existir una variante pública separada. |
| `VITE_SUPABASE_URL` | URL pública si el cliente browser la necesita | Navegador, sin secreto. |
| `SUPABASE_PUBLISHABLE_KEY` | Clave publicable para el cliente permitido | Navegador, con RLS activo. |
| `SUPABASE_SECRET_KEY` | Operaciones privilegiadas server-side | Nunca navegador ni repositorio. |
| `SUPABASE_DB_URL` | Migraciones o tareas server-side controladas | Nunca navegador. |
| `APP_URL` | URLs de callback y cookies | Servidor/configuración. |
| `SESSION_COOKIE_DOMAIN` | Dominio de cookies si aplica | Servidor/configuración. |
| `PAPERLESS_URL` | Gateway documental server-side futuro | Servidor. |
| `PAPERLESS_TOKEN` | Credencial del gateway documental | Nunca navegador ni repositorio. |

Debe existir una configuración independiente para desarrollo, pruebas y producción, con proyectos Supabase separados. Las credenciales se administrarán fuera de Git y se rotarán según el entorno.

## 7. Autenticación, sesión y autorización

1. Utilizar Supabase Auth con flujo SSR basado en cookies y PKCE cuando se apruebe la dependencia correspondiente.
2. Resolver la sesión en el servidor y no confiar en datos editables de `user_metadata` para permisos.
3. Derivar autorización desde perfiles, membresías, roles, permisos, alcance institucional y entitlements persistidos.
4. Resolver un `RequestContext` con usuario, organización activa, entidad activa e institución activa.
5. Rechazar operaciones cuando la membresía esté suspendida o vencida, el módulo no esté contratado o el recurso pertenezca a otro tenant.
6. Registrar operaciones administrativas y accesos a información sensible.
7. Probar explícitamente acceso cruzado entre organizaciones, cambio de contexto y revocación de membresías.

La navegación puede mantener el contexto seleccionado en la interfaz, pero la decisión de acceso debe repetirse server-side y en RLS.

## 8. Repositorios y servicios

El primer paso de código deberá definir interfaces de repositorio equivalentes a las operaciones que hoy consume `LocalSaasStore`. Se recomienda una forma conceptual como:

```text
SaasRepository
  ├─ LocalSaasRepository       (demostración y pruebas unitarias)
  └─ SupabaseSaasRepository   (producción, server-side)
```

Los servicios deben concentrar reglas que no pueden quedar en la pantalla:

- creación y actualización de organizaciones e instituciones;
- membresías, roles y permisos;
- contratos, suscripciones, licencias y entitlements;
- límites de uso y aprovisionamiento;
- facturación y cartera;
- tickets, soporte y trazabilidad;
- auditoría de operaciones.

Las entradas deben validarse en el límite del servidor. El esquema de validación concreto debe alinearse con la biblioteca aprobada para SaaS antes de instalar o agregar dependencias. No se introduce una biblioteca en esta fase.

## 9. Orden de implementación

### Etapa 0 — Decisiones y entornos

- Aprobar proveedor, regiones, nombres de proyectos y destino de despliegue.
- Crear proyectos Supabase separados para desarrollo, pruebas y producción fuera de este repositorio.
- Aprobar las variables y el mecanismo de secretos.

### Etapa 1 — Base server-side y autenticación

- Añadir el cliente oficial compatible con el stack y fijar versiones en el lockfile.
- Crear cliente server-side y cliente browser con responsabilidades separadas.
- Implementar cookies SSR, callbacks, cierre de sesión y recuperación de sesión.
- Añadir pruebas de sesión y protección CSRF.

### Etapa 2 — Identidad y aislamiento

- Migrar perfiles, organizaciones, entidades, membresías, roles y permisos.
- Definir contexto activo y funciones de autorización.
- Activar RLS desde la primera migración de tablas expuestas.
- Ejecutar pruebas negativas de aislamiento.

### Etapa 3 — Comercial SaaS

- Contratos, planes, suscripciones, licencias, entitlements, límites, facturas y pagos.
- Sustituir por dominio los repositorios locales, conservando fallback de demostración.
- Verificar consistencia entre dashboard, clientes, instituciones y soporte.

### Etapa 4 — CRM

- Prospectos, contactos, oportunidades, embudos, actividades, productos, cotizaciones y agentes.
- Definir conversión de prospecto/oportunidad a cliente sin duplicar personas u organizaciones.

### Etapa 5 — Informes, comunicaciones y documentos

- Integrar el modelo documentado en `09-informes-institucionales-y-comunicaciones.md`.
- Mantener los datos pastorales e institucionales bajo su contexto de acceso.
- Incorporar gateway documental únicamente server-side.

### Etapa 6 — Migración gradual de pantallas

- Cambiar una ruta a la vez del adaptador local al servicio server-side.
- Comparar respuestas y estados de error.
- Mantener modo demo identificable hasta completar cada dominio.

## 10. Migraciones y datos

- Usar migraciones pequeñas, revisables y ordenadas por dependencia.
- Crear primero extensiones y funciones auxiliares aprobadas, después identidad, organizaciones y entidades, luego comercial y CRM.
- Definir restricciones, índices y RLS en la misma fase que cada dominio; no dejar tablas expuestas sin políticas.
- Mantener seeds de pruebas separados de los fixtures visuales.
- No importar automáticamente `initialSaasState` a producción.
- No usar `localStorage` como mecanismo de autenticación ni como evidencia de persistencia productiva.
- Toda migración debe probarse en proyecto de desarrollo y luego en un proyecto de pruebas antes de producción.

## 11. Plan de pruebas

### Automatizadas

- Typecheck, lint, pruebas y build por aplicación.
- Unitarias para validadores, servicios, repositorios y transiciones de estado.
- Integración contra un proyecto Supabase de pruebas.
- Pruebas de cookies, renovación, cierre de sesión y expiración.
- Pruebas de RLS con dos organizaciones, dos instituciones y membresías con alcances diferentes.
- Pruebas negativas para lectura, inserción, actualización y eliminación cruzadas.
- Pruebas de licencias, entitlements, límites y membresías suspendidas.

### Operativas

- Creación, edición y eliminación controlada desde cada pantalla SaaS.
- Actualización inmediata y posterior recarga.
- Concurrencia y errores de red.
- Auditoría de acciones sensibles.
- Verificación de que ningún secreto aparece en bundles, logs ni respuestas.

En esta tarea no se ejecutan pruebas de integración Supabase porque no hay proyecto, cliente, migraciones ni credenciales configurados.

## 12. Riesgos técnicos

1. El almacenamiento actual en `localStorage` no ofrece aislamiento, control de acceso ni durabilidad productiva.
2. SaaS no tiene actualmente una frontera server-side propia; añadir solo un cliente en el navegador sería un riesgo de seguridad.
3. El modelo TypeScript actual es útil para la demo, pero no sustituye restricciones, claves foráneas ni estados controlados de PostgreSQL.
4. La configuración TanStack/Vite está encapsulada en el preset de Lovable; duplicarla podría romper el build.
5. La estrategia de despliegue server-side debe confirmarse antes de depender de APIs específicas de Node, Cloudflare o Vercel.
6. Los documentos sensibles requieren almacenamiento privado, escaneo, metadatos de seguridad, retención y auditoría antes de producción.
7. Los JWT pueden conservar claims antiguos; los cambios de permisos deben contemplar renovación o comprobación server-side.
8. La integración CRM y la administración institucional pueden duplicar contactos si no se adopta un identificador de persona/organización común.

## 13. Decisiones que requieren aprobación

- Proyecto y región de Supabase para cada entorno.
- Destino de despliegue compatible con TanStack Start y funciones server-side.
- Convención definitiva de variables y gestor de secretos.
- Uso de Supabase Auth, MFA y política de sesiones.
- Modelo final de organización, entidad e institución y sus alcances.
- Catálogo inicial de roles, permisos y entitlements.
- Estrategia de archivos: Supabase Storage, Paperless-NGX u otro gateway.
- Política de copias de seguridad, retención y recuperación.
- Política de auditoría y clasificación de información sensible.
- Alcance de la primera migración de CRM.

## 14. Resultado de la tarea

No se modificaron aplicaciones, dependencias, `package.json`, `bun.lock`, configuraciones de despliegue, variables de entorno ni archivos SQL. No se conectó Supabase, no se crearon tablas y no se ejecutaron migraciones.

Este documento deja preparada la secuencia técnica para comenzar la implementación únicamente después de aprobar las decisiones del apartado 13.
