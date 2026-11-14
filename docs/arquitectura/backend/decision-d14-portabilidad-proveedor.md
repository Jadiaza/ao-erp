# Decisión Arquitectónica D-14 — Independencia del Proveedor y Portabilidad de Infraestructura

**Fecha:** 2026-11-14  
**Estado:** Aprobada como arquitectura objetivo del ecosistema (Cierre Nivel 2.1)  
**Ámbito:** `apps/saas`, `apps/erp`, `apps/diocesano` y futuros paquetes compartidos (`packages/domain`)  
**Referencias:** `docs/arquitectura/backend/informe-nivel-2-1-auditoria-infraestructura.md`, `informe-nivel-1-cierre-arquitectura-modelo-datos.txt`

---

## 1. Contexto y problema

El ecosistema A&O adopta Supabase (PostgreSQL administrado, Supabase Auth y Supabase Storage privado) como plataforma inicial para acelerar la salida de Nivel 2. Sin embargo, acoplar los módulos de negocio, las consultas de interfaz, la identidad de usuario o el almacenamiento documental a APIs propietarias del proveedor generaría un riesgo estratégico de dependencia irreversible (*vendor lock-in*), incrementaría el costo de migración y comprometería la soberanía institucional de los datos parroquiales, congregacionales y diocesanos.

## 2. Decisión formal (D-14)

Se establece como principio arquitectónico obligatorio:

1. **PostgreSQL estándar como motor permanente:** toda la persistencia relacional del ecosistema A&O se diseñará exclusivamente sobre PostgreSQL estándar (versión 15/16/17), con migraciones SQL puras versionadas en Git y sin extensiones propietarias exclusivas de un proveedor.
2. **Supabase como proveedor inicial reversible:** Supabase podrá utilizarse inicialmente para PostgreSQL administrado, Auth y Storage privado, pero ningún módulo funcional de `apps/saas`, `apps/erp` ni `apps/diocesano` podrá depender directamente de un SDK de Supabase para ejecutar sus reglas de negocio.
3. **Lógica de negocio bajo control exclusivo de A&O:** toda validación, autorización, transacción contable/comercial, auditoría y orquestación residirá en **servicios server-side propios de A&O** (TanStack Start / Node.js). Queda prohibido alojar reglas de negocio en Supabase Edge Functions (Deno) o ejecutar consultas directas de negocio desde componentes React al cliente browser de Supabase.
4. **Sustitución progresiva garantizada:** la arquitectura deberá permitir sustituir de forma independiente y gradual:
   - El servidor PostgreSQL (Supabase -> Neon / DigitalOcean / AWS RDS / PostgreSQL autohospedado).
   - El proveedor de autenticación (Supabase Auth -> Keycloak / BetterAuth / OIDC / Auth propio).
   - El almacenamiento de archivos (Supabase Storage -> AWS S3 / Cloudflare R2 / MinIO autohospedado).
   - Los servicios auxiliares (gateway documental Paperless-NGX, mensajería o IA).

## 3. Requisitos obligatorios de portabilidad

### 3.1 Base de datos e identidad (`core.users` y `core.user_identities`)

1. **Identificador interno propio:** ninguna tabla de negocio (`core.profiles`, `core.memberships`, `pastoral.*`, `erp.*`, `saas.*`, `audit.*`) tendrá clave foránea física apuntando a `auth.users(id)` del esquema propietario de Supabase.
2. **Tablas canónicas de identidad desacoplada:**
   - `core.users`: maestro interno de usuarios de A&O (`id uuid PK DEFAULT gen_random_uuid()`, `primary_email`, `status`, `mfa_enforced`, `created_at`, `updated_at`).
   - `core.user_identities`: vínculo desacoplado con proveedores externos (`id uuid PK`, `user_id uuid NOT NULL FK -> core.users(id)`, `provider text NOT NULL`, `provider_subject text NOT NULL`, `last_login_at timestamptz`, `UNIQUE (provider, provider_subject)`).
3. **RLS portable:** las políticas RLS resolverán el actor actual a través de una función interna estable `app_internal.current_user_id()` en esquema no expuesto:
   - En conexiones directas desde el backend propio de A&O (en cualquier PostgreSQL), leerá `NULLIF(current_setting('app.current_user_id', true), '')::uuid` fijado mediante `SET LOCAL` dentro de la transacción.
   - De forma compatible mientras se use JWT de Supabase Auth, podrá mapear `auth.uid()` a `core.users.id` vía `core.user_identities`.

### 3.2 Puertos e interfaces de arquitectura (Server-Only)

| Puerto | Responsabilidad | Adaptador inicial | Adaptadores sustituibles futuros |
|---|---|---|---|
| `AuthProviderPort` | Login, PKCE/callback, verificación de token/sesión, recuperación de clave, revocación y MFA | `SupabaseAuthAdapter` | `OidcAuthAdapter`, `BetterAuthAdapter`, `LocalDevAuthAdapter` |
| `DocumentStoragePort` | Subida privada, metadatos técnicos, borrado lógico/físico controlado y generación de URL firmada temporal | `SupabaseStorageAdapter` | `S3StorageAdapter` (AWS S3 / R2 / Spaces), `MinioStorageAdapter` |
| Repositorios por dominio | Persistencia SQL transaccional (`core`, `saas`, `erp`, `pastoral`, `sacramental`, `diocesan`, `audit`) | `PostgresRepository` (pool estándar `pg` / `postgres`) + `LocalDemoRepository` (demo) | Cualquier PostgreSQL 15/16/17 sin cambiar servicios ni UI |
| `AuditService` | Registro inmutable `append-only` en `audit.*` (`REVOKE UPDATE, DELETE`) | `PostgresAuditAdapter` | Exportación/streaming SIEM externo |

### 3.3 Restricciones de SQL, migraciones, respaldos y restauración

- **Extensiones permitidas:** únicamente extensiones estándar disponibles en cualquier distribución PostgreSQL (`pgcrypto` si se requiere).
- **Migraciones:** archivos `.sql` puros versionados en Git, ejecutables mediante `psql` estándar y sin dependencias obligatorias de esquemas propietarios (`auth.*`, `storage.*`) dentro de las tablas de negocio.
- **Respaldos verificables:** exportación periódica mediante `pg_dump --format=custom --no-owner --no-acl` de los esquemas propios (`core`, `saas`, `erp`, `pastoral`, `sacramental`, `diocesan`, `audit`, `app_internal`), acompañada de respaldo independiente del almacenamiento binario de objetos.
- **Prueba obligatoria de restauración:** antes de pasar a producción y de forma periódica, toda línea base de migraciones y respaldo debe restaurarse con `pg_restore` en una **instancia PostgreSQL independiente** (p. ej. contenedor Docker estándar sin Supabase) verificando integridad referencial, triggers contables y pruebas negativas de RLS.

## 4. Criterios de cumplimiento para Nivel 2.2+

Ningún entregable del Nivel 2.2 ni fases posteriores será aceptado si:
1. Importa `@supabase/*` en componentes React de negocio o ejecuta consultas directas de datos desde el navegador saltándose la frontera server-side de A&O.
2. Crea claves foráneas físicas hacia `auth.users` en lugar de `core.users`.
3. Almacena documentos binarios en PostgreSQL (salvo justificación técnica documentada y aprobada) o expone `storage_key` al cliente.
4. Escribe reglas de negocio en Supabase Edge Functions o triggers acoplados a un único proveedor.
