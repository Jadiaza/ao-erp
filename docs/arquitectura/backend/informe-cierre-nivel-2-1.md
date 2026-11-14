# Informe de Cierre — Nivel 2.1 y Preparación del Nivel 2.2

**Proyecto:** A&O ERP / A&O SaaS / A&O Diocesano  
**Repositorio:** `D:\Proyectos\ao-erp`  
**Fecha:** 2026-11-14  
**Rama observada en workspace:** `main` *(nota: el prompt indica `integracion-final-ao-erp`, la cual existe localmente; conforme a la restricción de no cambiar de rama, se preservó la rama actual sin alteraciones)*  
**Estado:** Nivel 2.1 cerrado documentalmente. **Detenido en espera de autorización expresa del propietario antes de iniciar Nivel 2.2.**

---

## 1. Documentos entregables generados en este cierre

1. `docs/arquitectura/backend/decision-d14-portabilidad-proveedor.md`
2. `docs/arquitectura/backend/cierre-decisiones-bloqueantes-d03-d12-d13.md`
3. `docs/arquitectura/backend/evaluacion-runtime-vercel-node.md`
4. `docs/arquitectura/backend/plan-infraestructura-inicial-ao.md`
5. `docs/arquitectura/backend/informe-cierre-nivel-2-1.md` *(este informe)*

*(Los informes previos `docs/arquitectura/backend/informe-nivel-2-1-auditoria-infraestructura.md` e `informe-nivel-2-1-auditoria-infraestructura.txt` permanecen íntegros sin eliminación).*

---

## 2. Decisiones aprobadas técnicamente (Cierre Nivel 2.1)

De acuerdo con las directrices del propietario y la verificación técnica realizada:

1. **D-14 — Independencia del proveedor y portabilidad:** **APROBADA** como arquitectura objetivo (`decision-d14-portabilidad-proveedor.md`):
   - Motor permanente PostgreSQL estándar; migraciones SQL puras versionadas en Git.
   - Identificador interno `core.users` + `core.user_identities` desacoplado de `auth.users`.
   - RLS portable mediante `app_internal.current_user_id()`.
   - Puertos obligatorios `AuthProviderPort` y `DocumentStoragePort`; servicios de negocio propios server-side de A&O; prohibición de lógica de negocio en Edge Functions o consultas directas desde React; auditoría `append-only` y pruebas de restauración en PostgreSQL independiente.
2. **Infraestructura inicial adoptada como base de trabajo:**
   - Base de datos: Supabase PostgreSQL administrado.
   - Autenticación inicial: Supabase Auth detrás de `AuthProviderPort`.
   - Almacenamiento inicial: Supabase Storage privado detrás de `DocumentStoragePort` (compatible con S3/MinIO futuro; cero binarios en PostgreSQL).
   - Realtime: diferido (no implementar inicialmente).
   - Edge Functions: excluidas para lógica de negocio.
   - Ambientes separados: Desarrollo (local Docker + Supabase CLI), Staging (independiente) y Producción (proyecto independiente).
3. **Destino de despliegue preferido (sujeto a Preview Deployment real en Nivel 2.2):**
   - **Vercel con runtime Node.js (`nodejs24.x`)**, validado mediante compilación y ejecución aislada fuera del repositorio (`evaluacion-runtime-vercel-node.md`).

---

## 3. Decisiones propuestas pendientes de aprobación expresa del propietario

Para habilitar la creación de DDL, migraciones SQL y conexión en **Nivel 2.2**, se someten a aprobación formal del propietario:

1. **Aprobación formal de D-03, D-12 y D-13** (`cierre-decisiones-bloqueantes-d03-d12-d13.md`):
   - **D-03:** 1 membresía por `(user_id, organization_id)`, 3 scopes (`tenant | entity | campus`), separación estricta entre 5 roles globales de plataforma (sin acceso a datos operativos `erp`/`pastoral`/`sacramental`) y 11 roles institucionales sistema.
   - **D-12:** catálogo cerrado de estados con `CHECK` en PostgreSQL, validación de transiciones en servicios server-side y triggers de inmutabilidad en registros financieros, aprobados, sacramentales, `legal_hold` y auditoría.
   - **D-13:** diseño físico integrado del ERP (`erp`, `pastoral`, `sacramental`) sobre `core` y `saas.service_entitlements` con motores únicos compartidos (personas, finanzas, documentos) y aislamiento estricto de notas pastorales y dominio católico.
2. **Selección definitiva de región** (`plan-infraestructura-inicial-ao.md` §3):
   - **Opción A (Prioridad Sudamérica):** Supabase `sa-east-1` (São Paulo) + Vercel Functions fijadas en `gru1` (São Paulo) — datos en Sudamérica; RTT estimado ~90–145 ms desde Colombia (a confirmar con prueba de latencia en Staging).
   - **Opción B (Menor latencia desde Colombia):** Supabase `us-east-1` (North Virginia) + Vercel `iad1` (Washington D.C.) — RTT estimado ~50–75 ms desde Colombia y < 2 ms entre Vercel y Supabase.
3. **Confirmación de presupuesto inicial y política PITR:**
   - Arranque controlado estimado en **~$63–$78/mes** dentro de la meta **USD 50–100/mes** (Staging `Micro` + Producción `Small` + Vercel Pro + backups externos), **sin PITR** inicialmente (el add-on PITR suma **+$100/mes** y elevaría el costo a ~$163–$178/mes).
4. **Decisiones de dominios posteriores (no bloquean Fase 1 de Identidad/Core, pero requeridas antes de sus dominios):** D-01, D-02, D-04, D-05, D-06, D-07 (política de retención documental), D-08, D-09, D-10 y D-11.

---

## 4. Costos estimados y fuentes oficiales

- **Fuentes oficiales verificadas el 2026-11-14:**
  - Supabase Pricing: `https://supabase.com/pricing`
  - Supabase Regions: `https://supabase.com/docs/guides/platform/regions`
  - Vercel Pricing: `https://vercel.com/pricing`
- **Resumen por ambiente (`plan-infraestructura-inicial-ao.md` §4):**
  - **Desarrollo:** `$0/mes` (Docker + Supabase CLI local).
  - **Staging:** `+$10/mes` (proyecto `Micro` adicional en org Pro) + Preview Vercel incluido.
  - **Producción:** `$25/mes` (Supabase Pro org) + `$5/mes` netos (`Small` 2 GB RAM) + `$20/mes` (Vercel Pro) + `~$3–$15/mes` estimados para respaldo binario externo y SMTP = **~$63–$78/mes** en arranque inicial.

---

## 5. Resultado de compatibilidad del runtime

La evaluación técnica de `@lovable.dev/vite-tanstack-config@2.26.5` y las pruebas aisladas en directorio temporal externo (`NITRO_PRESET=vercel` sobre copias de `apps/saas` y `apps/erp`, ejecutado en **Node.js 24.16.0**) demostraron:

- **Compatibilidad confirmada sin modificar `vite.config.ts`:** el preset usa `defaultPreset: "cloudflare-module"`, permitiendo que `NITRO_PRESET=vercel` / `VERCEL=1` genere `.vercel/output` nativo con runtime **`nodejs24.x`**.
- **SSR + Server Functions + Cookies + CSRF verificados:** SSR devolvió `200 text/html` sin filtrar secretos; `createServerFn` devolvió `200`, `Cache-Control: no-store`, `Set-Cookie` con `HttpOnly; Secure; SameSite=Lax`, lectura correcta de cookie en segunda petición y rechazo CSRF `403` ante `Origin` cruzado.
- **Conexiones PostgreSQL:** Node.js 24 permite TCP/TLS estándar (`pg` / `postgres`) compatible con *Transaction Pooling* (`prepare: false`, `SET LOCAL` dentro de transacción y conexiones directas para DDL).

---

## 6. Riesgos y dependencias pendientes para Nivel 2.2

### Riesgos principales
1. **Latencia hacia `sa-east-1` desde Colombia** o cruce regional entre Vercel (`iad1` por defecto) y Supabase (`sa-east-1`): debe fijarse la región de Vercel (`gru1` o `iad1`) coincidente con Supabase y medirse RTT real en Staging.
2. **Falta de PITR dentro de la meta de USD 50–100/mes**: sin el add-on de $100/mes, la ventana de recuperación automática es diaria (RPO hasta 24 h); se mitiga con backups lógicos frecuentes (`pg_dump`) y exportación controlada mientras se decide activar PITR en producción contable.
3. **Falta de `src/start.ts`, `src/server.ts`, `nitro` directo y `zod` en `apps/saas` y `apps/diocesano`**: aunque hoy compilan por hoisting en monorepo, deben declararse explícitamente al preparar despliegue independiente.
4. **Madurez de `@supabase/ssr` (beta)** y cambios de Nitro v3 (`3.0.260603-beta`): mitigado encapsulando todo SDK detrás de `AuthProviderPort` y fijando versiones en `bun.lock`.

### Dependencias pendientes antes de ejecutar código en Nivel 2.2
- Aprobación expresa de **D-03, D-12, D-13**, selección de región (`sa-east-1` vs. `us-east-1`) y confirmación presupuestaria.
- Autorización independiente para crear `supabase/`, scripts DDL/migraciones, instalar dependencias (`zod`, `nitro` en SaaS/Diocesano, cliente `postgres`/`pg`, `@supabase/supabase-js` tras `AuthProviderPort`/`DocumentStoragePort`) y ejecutar *Preview Deployment* en Vercel.

---

## 7. Validación de restricciones y dictamen final

- **Validación de integridad del repositorio:** no se modificó código de aplicación, `vite.config.ts`, `package.json`, `bun.lock`, variables de entorno ni archivos SQL; no hubo conexiones remotas ni cambios en Git; se preservaron todos los cambios locales existentes.

### DICTAMEN PARA NIVEL 2.2: **APTO CON OBSERVACIONES**

El ecosistema A&O queda técnicamente preparado para iniciar el **Nivel 2.2 (diseño físico DDL PostgreSQL, funciones/triggers, RLS portable, migraciones versionadas, seeds sintéticos y pruebas de aislamiento)** en cuanto el propietario apruebe expresamente **D-03**, **D-12**, **D-13**, la **región inicial** (`sa-east-1` + `gru1` vs. `us-east-1` + `iad1`) y el **alcance presupuestario inicial** (con o sin PITR), y emita autorización independiente para crear artefactos SQL/dependencias.

---

*Ejecución detenida al cierre del Nivel 2.1 en espera de autorización expresa del propietario.*
