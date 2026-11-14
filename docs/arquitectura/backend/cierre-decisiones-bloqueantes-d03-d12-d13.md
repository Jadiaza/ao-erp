# Resolución y Cierre Técnico de Decisiones Bloqueantes: D-03, D-12 y D-13

**Fecha:** 2026-11-14  
**Estado:** Propuesta técnica formal de cierre (Nivel 2.1). Requiere aprobación expresa del propietario antes de ejecutar DDL en Nivel 2.2.  
**Referencias:** `docs/arquitectura/backend/15-especificacion-fisica-postgresql-saas.md`, `informe-nivel-1-cierre-arquitectura-modelo-datos.txt`, `informe-continuacion-nivel-1-cierre-observaciones.txt`, `docs/arquitectura/backend/decision-d14-portabilidad-proveedor.md`

---

## Introducción

El cierre del Nivel 1 identificó tres decisiones bloqueantes inmediatas para iniciar el diseño físico PostgreSQL (DDL y migraciones Fase 1): **D-03**, **D-12** y **D-13**. Este documento resuelve las observaciones técnicas pendientes integrando los requisitos de portabilidad de **D-14** y presenta las propuestas formales para aprobación del propietario.

---

## 1. D-03 — Alcance de membresías (`tenant | entity | campus`) y separación de roles de plataforma vs. institucionales

### 1.1 Problema y alternativas
Las aplicaciones actuales manejan roles de forma simplificada en memoria (`apps/saas/src/data/saas-domain.ts` con un string único por usuario, y `apps/erp/src/lib/ao-cristiano-profile.ts` con `pastoralAccessRole` editable en `localStorage`). En producción, un mismo usuario puede operar en varias organizaciones (p. ej., un contador que asesora dos congregaciones) o tener permisos limitados a una sola entidad o sede física. Además, existe riesgo crítico de mezcla entre administradores de plataforma SaaS y administradores de una iglesia/parroquia.

- **Alternativa A:** Roles planos en texto/JSON dentro del perfil o `user_metadata` de Auth, o una membresía duplicada por cada sede.
- **Alternativa B:** Una única membresía por `(user_id, organization_id)` en `core.memberships`, alcances granulares en `core.membership_scopes` (`tenant | entity | campus`), catálogo de roles en `core.roles` con separación estricta `is_platform_role` y asignaciones temporales/auditadas en `core.membership_roles`.

### 1.2 Consecuencias funcionales y técnicas
- **Alternativa A (descartada):** provoca duplicidad de invitaciones por sede, imposibilita revocar acceso de un tenant completo de forma atómica, depende de claims JWT obsoletos y mezcla administración comercial con operación pastoral/contable.
- **Alternativa B (elegida):** permite que un único usuario (`core.users.id`) pertenezca a 1..N organizaciones, delimita qué entidades o sedes puede operar sin duplicar identidad, impide elevación de privilegios entre plataforma y tenant, y permite validar todo mediante FKs compuestas `(organization_id, id)`. Exige que el middleware `RequestContext` y RLS evalúen simultáneamente membresía vigente, scope, rol, permiso y entitlement.

### 1.3 Solución concreta propuesta
1. **Identidad base (alineada con D-14):** `core.users` -> `core.user_identities` -> `core.memberships` con `UNIQUE (user_id, organization_id)` y `UNIQUE (organization_id, id)`.
2. **Alcances (`core.membership_scopes`):** `scope_type CHECK (scope_type IN ('tenant', 'entity', 'campus'))`, con restricción `CHECK` estricta:
   - `tenant`: `organization_entity_id IS NULL AND campus_id IS NULL`.
   - `entity`: `organization_entity_id IS NOT NULL AND campus_id IS NULL` (FK compuesta a `core.organization_entities`).
   - `campus`: `campus_id IS NOT NULL` (FK compuesta a `core.campuses`, opcionalmente ligado a `organization_entity_id`).
3. **Separación absoluta de roles (`core.roles`):**
   - **Roles de plataforma (`organization_id IS NULL AND is_platform_role = true`)**: `platform_admin`, `platform_commercial`, `platform_billing`, `platform_support`, `platform_auditor`. Operan exclusivamente sobre `core` (nivel plataforma), `saas` y `audit` de plataforma. **Tienen prohibido por RLS y servidor consultar o mutar datos operativos de `erp`, `pastoral` o `sacramental`**.
   - **Roles institucionales/tenant (`is_platform_role = false`)**: plantillas sistema (`organization_id IS NULL`) o personalizados por tenant (`organization_id = <tenant>`): `tenant_admin`, `pastor_principal`, `parroco`, `lider_pastoral`, `consejero_autorizado`, `tesorero`, `contador`, `secretaria`, `custodio_archivo`, `diocesan_reviewer`, `consulta`.
   - Ningún rol institucional (ni siquiera `tenant_admin`) otorga acceso automático a `pastoral.pastoral_care_confidential_notes`; este requiere ACL explícito (`pastoral_care_case_role_acl` / `pastoral_care_case_member_acl`) o `emergency_grant` auditado.

### 1.4 Coherencia con modelo de datos y arquitectura
Encaja 100% con el esquema `core` de `informe-continuacion-nivel-1-cierre-observaciones.txt` §1.2 y §2, sustituyendo la FK directa a `auth.users` por `core.users` conforme a D-14 y conservando las FKs compuestas `(organization_id, membership_id)` y `(membership_id, scope_id)`.

### 1.5 Impactos por producto
- **A&O SaaS:** reemplaza arrays vacíos `memberships: []` y `permissions: []` en `saas-domain.ts`; restringe operadores SaaS a `is_platform_role = true`.
- **A&O ERP:** elimina `pastoralAccessRole` editable en cliente (`settings-center-screen.tsx`); el contexto activo (`organization_id`, `entity_id`, `campus_id`) se resuelve server-side desde `core.memberships` + `core.membership_scopes`.
- **A&O Cristiano y Católico:** comparten el mismo motor RBAC parametrizando roles asignables según licencia (`parroco`/`custodio` sacramental solo cuando aplica `MOD-SAC`; `pastor_principal`/`consejero_autorizado` en `MOD-CRI-PAS`).
- **A&O Diocesano:** opera con rol `diocesan_reviewer` dentro de su propia `organization_id` y requiere además `core.institutional_access_grants` vigente para solicitar/revisar informes de entidades externas.

### 1.6 Propuesta formal para aprobación
> **Propuesta D-03:** Aprobar el modelo de 1 membresía por `(user_id, organization_id)`, 3 niveles de scope (`tenant | entity | campus`) en `core.membership_scopes`, catálogo inicial de 5 roles de plataforma (`is_platform_role = true`) sin acceso a datos operativos ERP/pastorales/sacramentales, y 11 roles institucionales sistema (`is_platform_role = false`) administrables por alcance.

---

## 2. D-12 — Catálogo controlado de estados, restricciones y transiciones válidas

### 2.1 Problema y alternativas
En la fase demo (`saas-domain.ts`, `economy-demo.ts`, `pastoral-care-demo.ts`) los estados se expresan como cadenas libres en español o inglés con inconsistencias entre módulos y sin bloqueo físico de transiciones inválidas (por ejemplo, editar un comprobante contable ya contabilizado o borrar un archivo con `legal_hold`).

- **Alternativa A:** Tablas catálogo independientes para cada estado en todas las entidades.
- **Alternativa B:** `text NOT NULL` con restricciones `CHECK` en PostgreSQL para estados de ciclo de vida cerrados, más validación de transiciones válidas en servicios de dominio y triggers inmutables en registros financieros/históricos; reservar tablas catálogo solo para clasificaciones configurables por negocio (ej. `erp.financial_categories`).

### 2.2 Consecuencias funcionales y técnicas
- **Alternativa A (descartada):** multiplica JOINs innecesarios en políticas RLS, complica FKs compuestas y permite que un cambio arbitrario en una tabla catálogo rompa máquinas de estado de negocio.
- **Alternativa B (elegida):** garantiza integridad determinista en base de datos sin latencia extra en RLS, facilita `INDEX` parciales (`WHERE status = 'active'`, `WHERE is_current = true`), mantiene semántica auditable en inglés técnico en BD con traducción controlada en UI, y obliga a que toda transición inválida sea rechazada tanto en el servicio server-side como por trigger/constraint.

### 2.3 Solución concreta propuesta
Adoptar como catálogo cerrado estándar en PostgreSQL (`CHECK` por tabla):
- `core.users.status`: `invited | active | suspended | locked | archived`.
- `core.organizations.status`: `active | suspended | closed`.
- `core.ecclesial_entities.status`: `active | inactive | archived`.
- `core.organization_entities.status`: `pending | active | suspended | revoked`.
- `core.campuses.status`: `active | inactive`.
- `core.memberships.status` / `core.membership_roles.status`: `invited (solo memberships) | active | suspended | expired | revoked`.
- `saas.contracts.status`: `draft | pending | active | suspended | expired | canceled | terminated`.
- `saas.subscriptions.status` / `saas.licenses.status`: `pending | active | suspended | expired | canceled | terminated`.
- `erp.document_file_metadata.malware_status`: `pending_scan | clean | rejected | quarantined | expired | deleted` (transición a `deleted` bloqueada por trigger si `legal_hold = true`).
- `erp.erp_documents.status`: `in_review | active | archived`.
- `erp.worship_events.status`: `scheduled | in_progress | completed | canceled`.
- `erp.treasury_movements.status`: `draft | pending_review | approved | posted | reversed | voided`.
- `erp.journal_vouchers.status`: `draft | posted | reversed | voided` (trigger `BEFORE UPDATE OR DELETE` bloquea mutación en `posted` y `reversed`).
- `erp.accounting_periods.status`: `open | closing | closed | reopened`.
- `erp.meeting_minutes.status`: `draft | approved | archived`.
- `erp.correspondence_items.status`: `registered | in_followup | answered | archived`.
- `erp.admin_tasks.status`: `pending | in_progress | completed | canceled`.
- `pastoral.pastoral_care_cases.status`: `open | in_followup | closed | archived`.
- `sacramental.sacramental_requests.status`: `draft | pending | in_preparation | approved | celebrated | canceled`.
- `diocesan.*`: Solicitudes (`draft | published | open | closed | cancelled | archived`); Entregas `delivery_status` (`draft | submitted | delivered | failed | withdrawn`); Revisiones `review_status` (`not_started | in_review | correction_requested | accepted | rejected | closed`); Comunicaciones (`draft | published | archived | cancelled`); Destinatarios (`pending | delivered | failed | archived`).

### 2.4 Coherencia con modelo de datos y arquitectura
Consolida 1:1 la Sección 7 del `informe-continuacion-nivel-1-cierre-observaciones.txt` y Doc `15` §2, añadiendo `core.users.status` introducido por D-14.

### 2.5 Impactos por producto
- **A&O SaaS:** `commercial-service.ts` y `provisioning-service.ts` mapearán estados UI en español a códigos canónicos en BD; al suspender/vencer contratos o licencias no se borran registros operativos.
- **A&O ERP (Cristiano y Católico):** tesorería, contabilidad, documentos, actas, correspondencia, cultos, pastoral y sacramentos aplican máquinas de estado estrictas en servidor y bloqueos físicos de inmutabilidad en BD.
- **A&O Diocesano:** separa estado de entrega técnica (`delivery_status`) de estado de revisión (`review_status`).

### 2.6 Propuesta formal para aprobación
> **Propuesta D-12:** Aprobar el catálogo cerrado de estados con restricciones `CHECK` en PostgreSQL y reglas de transición validadas en servicios server-side + triggers de inmutabilidad para registros financieros, aprobados, sacramentales, documentales (`legal_hold`) y de auditoría.

---

## 3. D-13 — Alcance del modelo operativo ERP con motores compartidos y separación de dominios

### 3.1 Problema y alternativas
En la especificación inicial de SaaS (Doc `15` §3), `D-13` excluía las tablas operativas de ERP del esquema SaaS. Durante el cierre del Nivel 1, se comprobó que SaaS, ERP Común, A&O Cristiano, A&O Católico y A&O Diocesano comparten identidad (`core`), habilitación comercial (`saas.service_entitlements`) y un único catálogo de sedes (`core.campuses`), pero corren el riesgo de duplicar motores (personas, finanzas, documentos) o mezclar módulos católicos dentro de planes cristianos.

- **Alternativa A:** Mantener el esquema físico de ERP fuera del diseño PostgreSQL inicial o crear bases/motores separados por perfil (Cristiano vs. Católico).
- **Alternativa B:** Incluir el diseño físico completo del ERP en PostgreSQL estándar dentro del mismo clúster lógico de esquemas separados por dominio (`erp`, `pastoral`, `sacramental`, `diocesan`), conservando **motores únicos compartidos** parametrizados por perfil y **separación estricta de responsabilidades** respecto a `saas`.

### 3.2 Consecuencias funcionales y técnicas
- **Alternativa A (descartada):** duplicaría código y tablas de personas, contabilidad y documentos entre perfiles, o dejaría a ERP sin persistencia al iniciar Nivel 2.
- **Alternativa B (elegida):** garantiza una sola fuente de verdad en `erp.persons`, un único motor financiero (`erp.treasury_movements` -> `journal_vouchers` -> `budget_lines` parametrizado por `financial_categories.profile_scope`) y un único motor documental (`erp.document_file_metadata` + `erp_documents`), mientras aísla físicamente `pastoral` (confidencial) y `sacramental` (católico exclusivo).

### 3.3 Solución concreta propuesta
1. **Separación de 7 esquemas lógicos + 1 interno**:
   - `core`: identidad (`users`, `user_identities`, `profiles`), `organizations`, `ecclesial_entities`, `organization_entities`, `campuses`, RBAC e `institutional_access_grants`.
   - `saas`: catálogo, contratos, licencias, `service_entitlements`, facturación SaaS y CRM.
   - `erp`: maestro único `persons`/`families`, grupos/ministerios, cultos/asistencia, motor financiero único (`accounting_entities`, `chart_of_accounts`, `treasury_*`, `journal_*`, `budget_lines`, `assets`, `procurement_*`), administración operativa (`meeting_minutes`, `correspondence_items`, `admin_tasks`) y documentos (`document_file_metadata`, `erp_documents`).
   - `pastoral`: dominio aislado de acompañamiento pastoral confidencial con `pastoral_care_confidential_notes` separada y ACL relacional (`role_acl`, `member_acl`, `emergency_grants`).
   - `sacramental`: dominio exclusivo católico (`sacramental_books`, `entries`, `marginal_notes`, `requests`, `certificate_issuances`, `catechesis_*`, `liturgy_schedules`, `parish_annual_reports`).
   - `diocesan`: motor de plantillas, solicitudes, presentaciones, revisiones y comunicaciones diocesanas.
   - `audit`: 4 bitácoras `append-only`.
   - `app_internal`: funciones de autorización y contexto no expuestas a API pública.
2. **Regla anti-contaminación de paquetes**: `MOD-FIN` y `MOD-DOC` dependen de `MOD-CORE` (nunca de `MOD-COM`), asegurando que el plan cristiano `PLN-CRI` jamás habilite el esquema `sacramental` ni `MOD-COM`/`MOD-GOB`.

### 3.4 Coherencia con modelo de datos y arquitectura
Cierra la brecha detectada en `informe-auditoria-integral-preparacion-desarrollo.txt` §9.1, mantiene las fronteras definidas en `docs/arquitectura/monorepo.md` y permite migración por fases (`M0`..`M12`) sin romper ningún dominio.

### 3.5 Impactos por producto
- **A&O SaaS:** gobierna habilitación vía `saas.service_entitlements`, pero nunca lee ni escribe tablas de `erp`, `pastoral` o `sacramental`.
- **A&O ERP:** sustituye progresivamente las ~20 colecciones `localStorage` por repositorios PostgreSQL server-side detrás de contratos de servicio.
- **A&O Cristiano:** opera sobre `erp` (con `profile_scope IN ('shared', 'christian')`) + `pastoral`, con bloqueo server-side + RLS sobre `sacramental`.
- **A&O Católico:** opera sobre `erp` (con `profile_scope IN ('shared', 'catholic')`) + `sacramental` sin contaminación de datos cristianos.
- **A&O Diocesano:** opera sobre `diocesan` sin acceso directo a `erp.treasury_*`, `erp.journal_*`, `pastoral.*` ni `sacramental.*` de las parroquias.

### 3.6 Propuesta formal para aprobación
> **Propuesta D-13:** Aprobar el cierre del diseño operativo ERP en PostgreSQL mediante los esquemas separados `erp`, `pastoral` y `sacramental` sobre el tronco común `core` y la proyección `saas.service_entitlements`, conservando motores únicos compartidos (personas, finanzas, documentos) y aislamiento estricto de `pastoral` y `sacramental`.
