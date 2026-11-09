# Especificación física PostgreSQL — A&O SaaS

**Versión:** 0.1 — 2026-11-08  
**Estado:** propuesta física para aprobación; no es una migración SQL  
**Repositorio:** `Jadiaza/ao-erp`  
**Rama:** `design/saas-dashboard-refresh`  
**Referencias canónicas:** Documento 12, Diccionario maestro de datos; Documento 13, Modelo relacional maestro

---

## 1. Alcance y autoridad

Este documento transforma el modelo lógico de los Documentos 12 y 13 en una especificación física PostgreSQL para A&O SaaS. No crea un diccionario alternativo, no incorpora tablas de ERP o Diocesano y no ejecuta SQL.

La autoridad de nombres, entidades y límites funcionales permanece en los Documentos 12 y 13. Cuando una decisión de negocio continúa abierta, esta especificación propone una alternativa técnica, pero la marca como bloqueada hasta aprobación.

El estado actual del repositorio sigue siendo demostrativo: no existe conexión Supabase, esquema PostgreSQL ni migración aplicada.

## 2. Convenciones físicas comunes

| Aspecto | Convención propuesta |
|---|---|
| Identificadores | `uuid NOT NULL DEFAULT gen_random_uuid()`; requiere habilitar `pgcrypto` en la primera migración. |
| Fechas | `timestamptz` para eventos; `date` para periodos civiles; `created_at` y `updated_at` en tablas mutables. |
| Borrado | `RESTRICT` por defecto; `CASCADE` solo en tablas puramente hijas y versionadas; baja lógica en historia comercial, institucional, financiera, documental y de auditoría. |
| Actualización | `ON UPDATE` no se usa como mecanismo de negocio; los cambios se realizan mediante servicios y triggers controlados. |
| Moneda | `char(3) NOT NULL` con catálogo ISO validado por servicio; importes `numeric(19,4)` no flotantes. |
| Estados | `text` con `CHECK` para catálogos cerrados de la primera versión; tabla catálogo solo cuando el administrador pueda añadir valores. |
| JSON | `jsonb` únicamente para configuración, snapshots, metadatos o valores definidos en los Documentos 12/13; no sustituye FKs. |
| Historial | Versiones, cobros, auditoría y entregas son append-only; no se eliminan físicamente. |
| Tenant | Las filas con `organization_id` deben usar FK compuesta o validación server-side que impida cruces de organización. |
| Sensibilidad | Datos personales, fiscales, documentales, conversaciones y auditoría requieren RLS y acceso server-side mínimo. |

### 2.1 Tipos abreviados de las fichas

Para mantener legible la matriz, las fichas usan estas reglas explícitas: identificadores y referencias terminadas en `_id` son `uuid`; códigos, nombres, tipos, estados, descripciones, motivos y canales son `text`; fechas con hora son `timestamptz`; fechas civiles son `date`; cantidades monetarias son `numeric(19,4)`; porcentajes son `numeric(5,2)`; indicadores son `boolean`; listas de MIME, acciones o tipos son `text[]`; snapshots, configuración, metadatos y valores son `jsonb`. Cuando el Documento 12 o 13 deja un atributo pendiente, se conserva como pendiente y no se inventa una columna física.

## 3. Matriz de decisiones D-01 a D-13

| ID | Recomendación física | Impacto | Riesgo | Aprobación |
|---|---|---|---|---|
| D-01 | Separar pagador en `clients`/`contracts` de beneficiarios en `contract_entities`; permitir varias suscripciones por contrato y varias licencias por suscripción. | Soporta contratación centralizada o mixta sin duplicar entidades. | Reglas comerciales más complejas y necesidad de validar solapamientos. | **Requerida** para cardinalidades finales. |
| D-02 | Mantener `organization_entities` N:M y exigir vínculo explícito aprobado; no heredar acceso por relación eclesial. La creación de `organizations` es independiente de la aprobación del vínculo. | Permite crear tenants sin inventar relaciones institucionales. | Alta y revocación requieren flujo administrativo. | **Requerida solo para el flujo de vinculación**, no bloquea crear `organizations`. |
| D-03 | Una membresía por usuario-organización; scopes en `membership_scopes`; roles en `membership_roles` con alcance tenant o institucional. | Evita membresías duplicadas por institución. | RLS debe validar organización, scope y vigencia simultáneamente. | **Requerida** para catálogo de roles globales. |
| D-04 | `parties` como identidad comercial canónica; `leads`, `clients` y `contacts` son relaciones de negocio por organización. | Permite conversión y deduplicación sin copiar personas. | Compartir una party entre tenants requiere autorización explícita. | **Requerida** para titularidad de parties compartidas. |
| D-05 | Permitir `owner_organization_id NULL` solo para plantillas de plataforma; publicación y versión son explícitas. | Soporta plantillas globales sin otorgar acceso automático. | Una plantilla global mal publicada puede afectar varias entidades. | **Requerida** para autoridad de publicación. |
| D-06 | Mantener grants institucionales explícitos; no habilitar comunicación cruzada por defecto. | Aísla instituciones y deja trazabilidad. | Flujos de autorización más largos. | **Requerida** para alcance de primera versión. |
| D-07 | `document_file_metadata` como registro único; relaciones puente tipadas por dominio. Storage privado y claves nunca expuestas directamente. | Evita metadatos duplicados. | Faltan tablas puente si aparecen nuevos dominios. | **Requerida** política de retención. |
| D-08 | Mantener `read_at` para estado actual y dejar `communication_read_receipts` opcional para historial por usuario/dispositivo. | Permite empezar simple y ampliar sin romper comunicaciones. | La lectura institucional no equivale a lectura individual. | **Requerida** antes de activar acuses. |
| D-09 | Facturación interna con emisor, serie, moneda y snapshot; impuestos y numeración configurables por jurisdicción. No implementar DIAN en esta fase. | Preserva historia y permite pagos parciales. | No es todavía facturación fiscal electrónica. | **Requerida** para país, emisor e impuestos. |
| D-10 | No crear `usage_events` todavía; mantener `usage_limits` y añadir ledger solo al aprobar cobro por consumo. | Evita migrar un modelo de medición no definido. | No se puede facturar consumo real en primera fase. | **Requerida** antes de medir/cobrar consumo. |
| D-11 | Usar `document_file_metadata` y tablas puente específicas; no usar propietario polimórfico sin FK. | Integridad referencial verificable. | Más tablas puente por cada dominio que adjunte archivos. | **Requerida** elección de puentes iniciales. |
| D-12 | `CHECK` para estados cerrados y servicios de transición; catálogos administrables solo si el producto lo requiere. | Estados predecibles y auditables. | Cambiar un estado exige migración. | **Requerida** catálogo final de estados. |
| D-13 | Excluir contabilidad, sacramentos, pastoral y operación documental ERP de este esquema SaaS. | Mantiene límites de responsabilidad. | Integraciones futuras requerirán contratos de intercambio. | **Requerida** aceptación de límites. |

## 4. Especificación física por dominio

### 4.1 Identidad, organizaciones y autorización

Todas las tablas de esta sección usan `id uuid` salvo las claves compuestas indicadas. Las referencias a `auth.users` son externas al esquema de aplicación y se borran con `RESTRICT` salvo que el flujo de privacidad aprobado indique anonimización.

| Tabla | Columnas físicas principales | PK/FK y unicidad | CHECK, índices y borrado | Estado |
|---|---|---|---|---|
| `profiles` | `id uuid NOT NULL`; `display_name text NOT NULL`; `avatar_path text NULL`; `locale text NOT NULL DEFAULT 'es-CO'`; timestamps | PK/FK `id → auth.users(id)`; una fila por usuario | índice por `locale`; `RESTRICT` | Lista técnicamente |
| `organizations` | `id uuid`; `name text NOT NULL`; `slug text NOT NULL`; `status text NOT NULL`; `created_by uuid NULL`; timestamps | `created_by → auth.users`; UNIQUE `slug` sujeto a decisión de alcance | CHECK estado; índice estado; `RESTRICT` | **Fase 1: lista** |
| `ecclesial_entities` | `id uuid`; `entity_type text NOT NULL`; `legal_name text NOT NULL`; `display_name text NOT NULL`; `country_code char(2) NOT NULL`; `tax_identifier text NULL`; `status text NOT NULL`; timestamps | autoría opcional a `auth.users` | índice tipo/estado; identificador fiscal no único global sin regla país; `RESTRICT` | Lista técnicamente |
| `organization_entities` | `id uuid`; `organization_id uuid NOT NULL`; `ecclesial_entity_id uuid NOT NULL`; `relation_type text NOT NULL`; `status text NOT NULL`; `starts_at timestamptz NULL`; `ends_at timestamptz NULL` | FKs a organizaciones y entidades; UNIQUE `(organization_id, ecclesial_entity_id, relation_type)` | CHECK fechas y estado; índice `(organization_id,status)`; `RESTRICT` | **Fase 1: lista; aprobación del flujo D-02 posterior** |
| `entity_relationships` | `id uuid`; source/target entity UUID NOT NULL; `relationship_type text`; vigencia y `metadata jsonb` | FKs a `ecclesial_entities` | CHECK source <> target salvo catálogo aprobado; índice origen/destino; `RESTRICT` | **Fase 1: lista; catálogo pendiente** |
| `institutional_access_grants` | `id uuid`; `source_organization_entity_id uuid NOT NULL`; `target_organization_entity_id uuid NOT NULL`; `purpose text NOT NULL`; `allowed_actions text[] NOT NULL`; vigencia; `status`; `granted_by uuid NOT NULL`; `revoked_at` | FKs a `organization_entities` y `auth.users`; UNIQUE activo por origen/destino/propósito | CHECK propósito `reports|communications`, acciones no vacías y vigencias coherentes; índices origen/destino/estado; `RESTRICT` | Bloqueada por D-06/D-11 |
| `memberships` | `id uuid`; `user_id uuid NOT NULL`; `organization_id uuid NOT NULL`; estado, invitación, incorporación, vencimiento y timestamps | FKs a Auth y organización; UNIQUE `(user_id,organization_id)` | índice organización/estado/vigencia; `RESTRICT` | **Fase 1: lista; D-03 define reglas de alcance** |
| `membership_scopes` | `id uuid`; `membership_id uuid NOT NULL`; `organization_id uuid NOT NULL`; `scope_type text NOT NULL`; `organization_entity_id uuid NULL`; timestamp | FK compuesta `(membership_id,organization_id) → memberships(id,organization_id)`; FK `(organization_id,organization_entity_id) → organization_entities(organization_id,id)`; UNIQUE membership/scope/entity | CHECK tenant-wide exige entidad NULL e institucional exige entidad; índices membership y entity; `CASCADE` desde membership, `RESTRICT` desde entidad | **Fase 1: lista; requiere aprobar catálogo de scopes D-03** |
| `roles` | `id uuid`; `organization_id uuid NULL`; `code`, `name text NOT NULL`; descripción; `is_system boolean NOT NULL DEFAULT false` | organización NULL significa rol global; UNIQUE parcial global y tenant | índices parciales por código; `RESTRICT` | **Fase 1: lista; D-03 pendiente solo para roles globales** |
| `permissions` | `id uuid`; `code`, `name`, `domain text NOT NULL`; descripción | UNIQUE `code` | índice dominio; `RESTRICT` | **Fase 1: lista** |
| `role_permissions` | `role_id uuid`; `permission_id uuid` | PK compuesta; FKs a roles/permisos | índices inversos; `CASCADE` desde ambas relaciones | **Fase 1: lista** |
| `membership_roles` | `id uuid`; `membership_id`, `role_id` NOT NULL; `scope_id NULL`; vigencia y estado | FKs; scope debe pertenecer a membership; UNIQUE activo | CHECK fechas; índices membership/scope; `CASCADE` solo desde membership | **Fase 1: lista; requiere catálogo D-03** |

**Resolución de `membership_scopes`:** se adopta FK compuesta con `organization_id` para impedir que un scope de una organización sea usado por otra. La tabla `organization_entities` debe tener una clave candidata `(organization_id,id)` o una restricción equivalente para soportarla.

### 4.2 Comercial, contratos y licenciamiento

| Tabla | Columnas físicas principales | PK/FK y unicidad | CHECK, índices y borrado | Estado |
|---|---|---|---|---|
| `parties` | `id uuid`; `party_type`; `display_name`; `status`; timestamps | PK; no UNIQUE por nombre | índice búsqueda normalizada; `RESTRICT` | Bloqueada por D-04 |
| `party_persons` | `party_id`; nombres; documento y contacto NULL | PK/FK a parties | CHECK `party_type=person` mediante servicio/trigger; índice documento protegido; `CASCADE` solo al eliminar party nunca productiva | Bloqueada por D-04 |
| `party_organizations` | `party_id`; razón social; nombre comercial; tax ID; país | PK/FK a parties | índice tax ID/país; `CASCADE` solo dentro de alta inicial | Bloqueada por D-04 |
| `clients` | `id uuid`; `party_id`; `client_code`; `status`; `owner_user_id NULL`; timestamps | FK party/Auth; UNIQUE `client_code` por plataforma | índice estado/owner; `RESTRICT` | Bloqueada por D-04 |
| `applications` | `id uuid`; `code`; `name`; `status` | UNIQUE code | CHECK estado; `RESTRICT` | Lista técnicamente |
| `modules` | `id uuid`; `application_id`; code, nombre, descripción, estado | UNIQUE `(application_id,code)` | índice aplicación/estado; `RESTRICT` | Lista técnicamente |
| `plans` | `id uuid`; application; code/name; periodo; currency; base_price; status | UNIQUE `(application_id,code)` mientras no exista versionado formal | CHECK precio >= 0; índice aplicación/estado; `RESTRICT` | Bloqueada por versionado |
| `contracts` | `id uuid`; `client_id`; `organization_id NULL`; número; estado; fechas; timestamps | FKs cliente/organización; UNIQUE número por emisor/serie | CHECK fechas; índices cliente/organización/estado; `RESTRICT` | Bloqueada por D-01 |
| `contract_entities` | `id uuid`; contract/entity; role; fechas; status | FKs; UNIQUE `(contract_id,ecclesial_entity_id)` | CHECK vigencia; índices contrato/entidad; `RESTRICT` | Bloqueada por D-01 |
| `contract_terms` | `id uuid`; contract; version; `terms jsonb`; effective_at; approved_by | UNIQUE `(contract_id,version_number)`; FK Auth aprobador | version > 0; append-only; `RESTRICT` | Lista técnicamente |
| `subscriptions` | `id uuid`; contract/plan; status; inicio y periodos; cancelled_at | FKs; índice único parcial para ciclo activo si se aprueba | CHECK periodos; índice contrato/estado; `RESTRICT` | Bloqueada por D-01 |
| `licenses` | `id uuid`; subscription; hash opcional; status; vigencia | FK; hash UNIQUE cuando no NULL | CHECK vigencia; índice subscription/status; `RESTRICT` | Bloqueada por D-01 |
| `license_assignments` | `id uuid`; license/entity; status; vigencia | FKs; UNIQUE activo `(license_id,ecclesial_entity_id)` | CHECK vigencia; índices licencia/entidad; `RESTRICT` | Bloqueada por D-01 |
| `entitlements` | `id uuid`; license/module; status; vigencia; config jsonb | FKs; UNIQUE activo licencia/módulo | CHECK vigencia; índices licencia/módulo; `RESTRICT` | Bloqueada por D-01 |
| `usage_limits` | `id uuid`; entitlement; metric; numeric limit; period; status | FK; UNIQUE `(entitlement_id,metric_code,period)` | limit >= 0; índices entitlement/metric; `RESTRICT` | Bloqueada por D-10 |

### 4.3 Facturación y recaudo

| Tabla | Columnas físicas principales | PK/FK y unicidad | CHECK, índices y borrado | Estado |
|---|---|---|---|---|
| `invoices` | `id uuid`; client; contract/org NULL; número; fechas; currency; subtotal/tax/discount/total; status; receptor snapshot jsonb | FKs; unicidad por emisor/serie/número queda pendiente, sin materializar columnas de emisor todavía | importes >= 0; total calculable; índice cliente/status/due_date; `RESTRICT` | Bloqueada por D-09 |
| `invoice_items` | `id uuid`; invoice; module NULL; descripción; cantidad/precio/descuento/impuesto/total | FK invoice; no borrar emitidas | cantidades no negativas; índice invoice; `RESTRICT` | Bloqueada por D-09 |
| `invoice_taxes` | `id uuid`; invoice; item NULL; tax code/rate/base/amount | FK; CHECK exactamente factura o línea | importes no negativos; índices invoice/item; `RESTRICT` | Bloqueada por D-09 |
| `invoice_discounts` | `id uuid`; invoice; item NULL; code/description/amount/approved_by | FKs; ámbito factura o línea | amount >= 0; índice invoice; `RESTRICT` | Bloqueada por D-09 |
| `payments` | `id uuid`; client; referencia; fecha; amount; currency; method; status | FK client; UNIQUE referencia por proveedor cuando exista | amount > 0; índice client/status/date; `RESTRICT` | Lista con D-09 pendiente |
| `payment_allocations` | `id uuid`; payment/invoice; allocated_amount; allocated_at | FKs; UNIQUE payment/invoice opcional | amount > 0; saldo validado transaccionalmente; `RESTRICT` | Bloqueada por D-09 |
| `credit_notes` | `id uuid`; invoice; número; fecha; reason; status; total/currency | FK invoice; número único por serie | total >= 0; índice invoice/status; `RESTRICT` | Bloqueada por D-09 |
| `credit_note_items` | `id uuid`; credit note; invoice item NULL; descripción/cantidad/unit/total | FKs; no borrar emitidas | valores no negativos; índice note; `RESTRICT` | Bloqueada por D-09 |
| `receivable_adjustments` | `id uuid`; invoice; approved_by; type/amount/reason/status/effective_at | FKs; autorización obligatoria | amount >= 0; índice invoice/status; `RESTRICT` | Bloqueada por D-09 |

La regla de saldo será una proyección transaccional: total emitido menos pagos aplicados, notas crédito aplicadas y ajustes aprobados. No se almacenará un saldo editable por el cliente.

### 4.4 CRM comercial con IA

| Tabla | Columnas físicas principales | PK/FK y unicidad | CHECK, índices y borrado | Estado |
|---|---|---|---|---|
| `leads` | `id uuid`; party/org; source/status; owner; created_at; converted_client_id NULL | FKs; UNIQUE conversión si no NULL | CHECK status; índices org/status/owner; `RESTRICT` | Bloqueada por D-04 |
| `lead_events` | `id uuid`; lead; actor NULL; event_type; payload; created_at | FKs | append-only; índice lead/date; `RESTRICT` | Lista técnicamente |
| `contacts` | `id uuid`; party/org; status; preferred_channel; timestamps | FKs; UNIQUE party/org | índices org/status/party; `RESTRICT` | Bloqueada por D-04 |
| `contact_accounts` | `contact_id`, `client_id`; relationship_role; is_primary | PK compuesta; FKs | índice client/contact; `CASCADE` desde ambas relaciones | Bloqueada por D-04 |
| `pipelines` | `id uuid`; org; code/name; is_default; status | UNIQUE `(organization_id,code)` | único default parcial por org; `RESTRICT` | Lista técnicamente |
| `pipeline_stages` | `id uuid`; pipeline; code/name/position/probability/is_won/is_lost | UNIQUE pipeline/code y pipeline/position; clave auxiliar `(pipeline_id,id)` | probability 0..100; `RESTRICT` | Lista técnicamente |
| `opportunities` | `id uuid`; org/client/pipeline/stage/owner; name; amount/currency; close date/status | FKs; FK compuesta pipeline/stage | tenant consistente; índices org/status/stage; `RESTRICT` | Bloqueada por D-04 |
| `activities` | `id uuid`; org; opportunity NULL; lead NULL; owner; type/subject/description/due/completed/status | FKs; CHECK exactamente lead u opportunity cuando se exija | índices org/owner/status/due; `RESTRICT` | Bloqueada por D-04 |
| `products_services` | `id uuid`; application NULL; code/name/description; price/currency/status | FK application; UNIQUE code según catálogo | price >= 0; índices application/status; `RESTRICT` | Lista técnicamente |
| `quotations` | `id uuid`; org/client/opportunity NULL; número; fechas; currency; totals; status | FKs; UNIQUE número por org | totals >= 0; índice org/client/status; `RESTRICT` | Bloqueada por D-04 |
| `quotation_items` | `id uuid`; quotation; product NULL; snapshot description; quantity/unit/discount/line_total | FKs | valores no negativos; índice quotation; `RESTRICT` | Bloqueada por D-04 |
| `campaigns` | `id uuid`; org/owner; name/channel/status; vigencia | FKs | fechas coherentes; índice org/status; `RESTRICT` | Bloqueada por D-04 |
| `campaign_members` | `id uuid`; campaign/party; status; joined/responded | FKs; UNIQUE `(campaign_id,party_id)` | índices party/status; `CASCADE` desde campaign, `RESTRICT` desde party | Bloqueada por D-04 |
| `conversations` | `id uuid`; org; party/lead/client opcionales; channel/status; assigned user; timestamps | FKs | CHECK identidad principal conforme regla aprobada; índice org/status; `RESTRICT` | Bloqueada por D-04 |
| `conversation_messages` | `id uuid`; conversation; sender NULL; direction/body/provider ID/sent_at/metadata | FKs; provider ID único por canal si aplica | body no vacío; append-only; `RESTRICT` | Bloqueada por D-04 |
| `ai_agents` | `id uuid`; org; code/name/status; configuration jsonb; created_by | FKs; UNIQUE `(organization_id,code)` | configuración no contiene secretos; índice org/status; `RESTRICT` | Bloqueada por D-04 |

### 4.5 Informes institucionales

| Tabla | Columnas físicas principales | PK/FK y unicidad | CHECK, índices y borrado | Estado |
|---|---|---|---|---|
| `report_templates` | `id uuid`; owner org NULL; code/name/description; institution_types; periodicity/status | FK org; UNIQUE `(owner_organization_id,code)` y estrategia separada para NULL | publicación autorizada; índice status; `RESTRICT` | Bloqueada por D-05 |
| `report_template_versions` | `id uuid`; template; version; status; published_at/by; rendering/source jsonb | UNIQUE template/version | versión > 0; único publicado si aplica; `RESTRICT` | Lista técnicamente |
| `report_template_sections` | `id uuid`; version; code/title/position/description | UNIQUE version/code y position | position > 0; `RESTRICT` | Lista técnicamente |
| `report_template_fields` | `id uuid`; section; code/label/type/required/repeatable/position; validation/erp_source | UNIQUE section/code y position | position > 0; `RESTRICT` | Bloqueada por D-13 si `erp_source` se activa |
| `report_template_attachments` | `id uuid`; version; code/label/required; MIME array/max size | UNIQUE version/code | max size > 0; `RESTRICT` | Lista técnicamente |
| `report_requests` | `id uuid`; requester organization_entity link; template version; number/title/instructions/periods/publication/due/status | FK compuesta al vínculo solicitante y FK version; UNIQUE request_number por emisor | periodos coherentes; índices status/due; `RESTRICT` | Bloqueada por D-05/D-06 |
| `report_request_recipients` | `id uuid`; request; recipient organization_entity link; status | FK request y FK compuesta vínculo destinatario; UNIQUE request/link | vínculo explícito; `RESTRICT` | Bloqueada por D-06 |
| `report_submissions` | `id uuid`; recipient; previous self NULL; submitted_by; version/current; delivery/review statuses; radicado/fechas | FKs; UNIQUE recipient/version; único current parcial | versiones inmutables; `RESTRICT` | Lista técnicamente |
| `report_field_values` | `id uuid`; submission/field; row_key NULL; value jsonb; source/reference | FKs; UNIQUE submission/field/normalized row key | valor presente; `RESTRICT` | Lista técnicamente |
| `report_submission_files` | `id uuid`; submission; template attachment NULL; document reference NULL | FKs; CHECK al menos una referencia y una sola fuente de archivo | índices submission/document; `RESTRICT` | Bloqueada por D-11 |
| `report_reviews` | `id uuid`; submission; reviewer user/entity; status/summary/created_at | FKs | status cerrado; índice submission/status; `RESTRICT` | Lista técnicamente |
| `report_review_events` | `id uuid`; review; author; field NULL; event/comment/created_at | FKs | append-only; índice review/date; `RESTRICT` | Lista técnicamente |

### 4.6 Comunicaciones institucionales

| Tabla | Columnas físicas principales | PK/FK y unicidad | CHECK, índices y borrado | Estado |
|---|---|---|---|---|
| `communication_threads` | `id uuid`; owner org; origin entity; subject/type/status; created_by; dates | FKs; índice org/status | status/type controlados; `RESTRICT` | Bloqueada por D-06 |
| `communications` | `id uuid`; thread; parent self NULL; sender user/entity; body; replies; published/status | FKs; índice thread/date | respuesta solo si thread permite; `RESTRICT` | Bloqueada por D-06 |
| `communication_recipients` | `id uuid`; communication; recipient entity/org/user/scope opcionales; delivery/read/archive | FKs | CHECK institucional XOR individual; índices parciales de unicidad; `RESTRICT` | Bloqueada por D-06/D-08 |
| `communication_attachments` | `id uuid`; communication; document_file_id | FKs | no duplicar metadata; `RESTRICT` | Bloqueada por D-11 |
| `communication_events` | `id uuid`; communication; recipient/actor NULL; event/metadata/created_at | FKs | append-only; índice communication/date | Bloqueada por D-06 |
| `communication_read_receipts` | `id uuid`; recipient/user; read_at/device_metadata | FKs; UNIQUE recipient/user/read event según política | append-only; índice recipient/user | Bloqueada por D-08 |

### 4.7 Archivos y auditoría

| Tabla | Columnas físicas principales | PK/FK y unicidad | CHECK, índices y borrado | Estado |
|---|---|---|---|---|
| `document_file_metadata` | `id uuid`; uploaded_by; provider/key; original/detected/declared MIME; size; checksum; malware; retention; deleted_at | FK Auth; UNIQUE provider/key y checksum según alcance | size >= 0; Storage privado; índice malware/retención; baja lógica | Bloqueada por D-07/D-11 |
| `security_events` | `id uuid`; actor NULL; event type; subject; IP/device metadata; created_at | FK Auth opcional | append-only; índice actor/type/date; sin UPDATE/DELETE | Lista técnicamente |
| `commercial_audit_events` | `id uuid`; actor/organization/resource; event; metadata; created_at | FKs opcionales según recurso | append-only; índice tenant/date | Lista técnicamente |
| `institutional_audit_events` | `id uuid`; actor/org/entity/resource; event; metadata; created_at | FKs | append-only; índice org/entity/date | Lista técnicamente |
| `sensitive_access_events` | `id uuid`; actor/resource/purpose; event; metadata; created_at | FK actor; referencia de recurso por identificador controlado | append-only; índice actor/resource/date; minimizar datos personales | Lista técnicamente |

## 5. Integridad y restricciones transversales

1. Las tablas con tenant deben impedir cruces mediante FKs compuestas o columnas de contexto verificadas server-side; no basta con filtrar en React.
2. Ninguna relación institucional concede permisos automáticamente.
3. Los estados se modifican mediante servicios de dominio que validan transiciones y registran auditoría.
4. Facturas, notas crédito, pagos aplicados, contratos, licencias, informes versionados, mensajes y auditoría no se borran físicamente.
5. Las versiones de plantillas y presentaciones son inmutables después de publicarse o recibirse.
6. Las sumas de facturación y saldos requieren transacción y bloqueo; no pueden garantizarse con un `CHECK` entre filas.
7. Los datos personales y fiscales deben contar con índices restringidos y no usarse como identificadores públicos.
8. `storage_key` nunca se entrega directamente a clientes; las descargas se autorizan en servidor y generan evento sensible.
9. Las claves externas deben usar `ON UPDATE RESTRICT`; los cascades quedan limitados a tablas puente puramente dependientes.

## 6. Estrategia RLS

RLS se activa junto con cada grupo de tablas expuestas; no se aplaza hasta el final del proyecto. La autorización debe usar funciones server-side y pertenencia vigente, no `user_metadata` editable.

### 6.1 RLS de la Fase 1

La primera fase debe crear las tablas y sus políticas RLS dentro del mismo grupo de entrega. Las funciones auxiliares de autorización pueden crearse antes de las políticas, pero deben quedar versionadas en la misma fase.

| Tabla/grupo | Lectura permitida | Escritura permitida | Denegación obligatoria |
|---|---|---|---|
| `profiles` | `auth.uid() = id`; administración solo con permiso explícito | El propio usuario para campos no privilegiados; server-side para campos administrativos | Un usuario no puede leer ni modificar el perfil de otro usuario. |
| `organizations` | Usuario con membresía vigente o actor de plataforma | Creación por flujo autorizado; edición por administrador del tenant o plataforma | Un miembro de otra organización no puede consultar el tenant. |
| `ecclesial_entities` | Entidad vinculada a una organización accesible | Alta/edición por servicio autorizado | Una relación eclesial no concede acceso. |
| `organization_entities` | Membresía vigente de la organización del vínculo | Administración autorizada, con estado y vigencia auditados | No se puede insertar un vínculo en una organización no accesible. |
| `entity_relationships` | Solo si el contexto de la entidad está autorizado | Servicio institucional autorizado | La relación canónica no habilita datos privados. |
| `memberships` | El propio usuario y administradores del tenant | Invitación, suspensión o vencimiento por administración autorizada | Un usuario no puede otorgarse membresías. |
| `membership_scopes` | Titular de la membresía y administradores autorizados | Servicio que valide el mismo tenant | No se puede apuntar a una entidad de otra organización. |
| `roles`, `permissions`, `role_permissions` | Roles aplicables al tenant y catálogo global | Plataforma o administrador autorizado | Un tenant no puede modificar permisos globales. |
| `membership_roles` | Titular, administradores y servicios de autorización | Solo si membership, role y scope son compatibles | No se puede asignar un rol de otro tenant. |

### 6.2 Pruebas de aislamiento de la Fase 1

Antes de avanzar al dominio comercial se deben probar dos organizaciones (`org_a`, `org_b`), dos entidades y dos usuarios:

1. `user_a` solo consulta `org_a`, sus memberships, vínculos y scopes.
2. `user_a` no puede consultar ni modificar datos de `org_b`.
3. Un scope de `org_a` no puede referenciar un vínculo de `org_b`.
4. `user_a` no puede crear una membresía, rol o vínculo para `org_b`.
5. Una relación entre entidades no concede acceso a la organización de destino.
6. Un administrador de `org_a` solo administra datos de `org_a`.
7. Una membresía suspendida o vencida pierde acceso aunque exista una sesión anterior.

| Dominio | Predicado base | Operaciones |
|---|---|---|
| Profiles | `auth.uid() = id` | El usuario consulta/actualiza su perfil; administración restringida. |
| Organizations | membresía vigente del usuario | Lectura según membresía; escritura para permiso administrativo. |
| Organization entities | membresía + vínculo explícito | Nunca por relación eclesial implícita. |
| Memberships, scopes y roles | usuario propio o permiso de administración de organización | Cambios server-side y auditados. |
| Comercial/CRM | `organization_id` del contexto activo y permiso del dominio | Prohibir acceso cruzado; parties compartidas requieren grant. |
| Contratos/licencias | organización contratante, cliente autorizado o servicio de plataforma | ERP no modifica contratos ni licencias. |
| Informes | solicitante, destinatario explícito, revisores autorizados | Una presentación no expone tablas ERP originales. |
| Comunicaciones | emisor, destinatario o grant institucional vigente | No inferir acceso por jerarquía. |
| Archivos | autorización del registro padre y propósito de descarga | Storage privado y URLs temporales. |
| Auditoría | lectura por roles de auditoría; inserción solo server-side | Sin UPDATE ni DELETE para usuarios finales. |

Cada política `UPDATE` debe tener `USING` y `WITH CHECK`. Las vistas de consulta deberán usar `security_invoker` o permanecer fuera del esquema expuesto. Se requieren pruebas negativas con dos organizaciones, dos entidades y scopes incompatibles.

## 7. Dependencias y orden de creación de la Fase 1

| Orden | Tablas | Dependencias reales | RLS |
|---|---|---|---|
| 0 | Extensiones y funciones auxiliares | `pgcrypto`; funciones de membresía y scope | Funciones internas protegidas |
| 1 | `profiles` | `auth.users` | Inmediato |
| 2 | `organizations` y `ecclesial_entities` | `auth.users` solo para autoría opcional | Inmediato |
| 3 | `organization_entities` | `organizations`, `ecclesial_entities` | En la misma entrega |
| 4 | `memberships` | `auth.users`, `organizations` | En la misma entrega |
| 5 | `roles` y `permissions` | `organizations` para roles tenant | En la misma entrega |
| 6 | `membership_scopes` | `memberships`, `organization_entities` | En la misma entrega |
| 7 | `role_permissions` | `roles`, `permissions` | En la misma entrega |
| 8 | `membership_roles` | `memberships`, `roles`, `membership_scopes` | En la misma entrega |
| 9 | `entity_relationships` | `ecclesial_entities` | En la misma entrega |

`institutional_access_grants` queda fuera de esta fase. Se incorporará después de cerrar su alcance, acciones permitidas y autorización institucional.

## 8. Orden propuesto de migraciones posteriores

1. Fase 1 de identidad y organización, con RLS y pruebas de aislamiento.
2. `institutional_access_grants` cuando D-06 esté aprobado, con RLS del grupo.
3. `parties`, especializaciones, `clients`, aplicaciones, módulos y planes, con RLS comercial.
4. Contratos, términos, beneficiarios, suscripciones, licencias, asignaciones, entitlements y límites.
5. CRM comercial.
6. Facturación y recaudo después de D-09.
7. Plantillas y flujo de informes.
8. Archivos y puentes documentales después de D-07/D-11.
9. Comunicaciones después de D-06/D-08.
10. Auditoría especializada, con RLS del grupo.
11. Seeds sintéticos y pruebas negativas de cada dominio.

## 9. Tablas listas y bloqueadas

### Listas técnicamente para la Fase 1

Estas son exactamente las tablas del alcance inicial. Sus dependencias están disponibles en el orden de la sección 7:

- `profiles`
- `organizations`
- `ecclesial_entities`
- `organization_entities`
- `entity_relationships`
- `memberships`
- `membership_scopes`
- `roles`
- `permissions`
- `role_permissions`
- `membership_roles`

`institutional_access_grants` no forma parte de la Fase 1.

La creación de `organizations` no depende de aprobar el flujo de D-02. D-02 condiciona únicamente las reglas operativas para crear, aprobar, suspender o revocar filas de `organization_entities`.

### Decisiones que bloquean la Fase 1

- D-03: alcance mínimo de `membership_scopes`, roles tenant/globales y asignación de roles.
- D-12: estados mínimos y transiciones de membresías, scopes, vínculos y roles.
- Confirmar que organización y entidad eclesial son catálogos independientes.
- Confirmar el actor autorizado para crear membresías, scopes y roles.

### Decisiones que no bloquean la Fase 1

- D-01 contratación y licenciamiento.
- D-04 parties y CRM.
- D-05 plantillas globales de informes.
- D-06 grants y comunicaciones cruzadas.
- D-07/D-11 archivos y propiedad documental.
- D-08 acuses de lectura.
- D-09 facturación fiscal/comercial.
- D-10 medición de consumo.
- D-13 modelo operativo ERP.

Estas decisiones bloquean únicamente sus dominios posteriores.

### Tablas bloqueadas por decisiones posteriores

- Acceso posterior: `institutional_access_grants` y cualquier extensión de scopes o roles fuera del catálogo aprobado para la Fase 1.
- Contratación: `parties`, `party_persons`, `party_organizations`, `clients`, `plans`, `contracts`, `contract_entities`, `subscriptions`, `licenses`, `license_assignments`, `entitlements`, `usage_limits`.
- Facturación: todas las tablas de facturas, pagos, notas crédito y ajustes.
- CRM dependiente de identidad comercial: `leads`, `contacts`, `contact_accounts`, `opportunities`, `activities`, `quotations`, campañas y conversaciones.
- Informes con alcance institucional: `report_templates`, `report_requests`, `report_request_recipients`, `report_submission_files`.
- Comunicaciones: todas las tablas de comunicaciones.
- Documentos: `document_file_metadata` y sus relaciones puente.

## 10. Criterio de cierre físico

El modelo estará listo para generar migraciones cuando:

1. Se aprueben las decisiones estrictamente necesarias para la Fase 1: D-03, D-12 y los actores autorizados.
2. Cada tabla de la Fase 1 tenga columnas completas, nullability, defaults, índices, `ON DELETE`, estados y restricciones verificadas.
3. Se creen y prueben las políticas RLS junto con cada grupo de tablas de la Fase 1.
4. Se validen los escenarios de aislamiento entre dos organizaciones.
5. Las decisiones posteriores queden formalmente fuera de la primera migración.
6. Se apruebe el orden de migraciones y los seeds sintéticos de la Fase 1.

Hasta ese momento no deben crearse archivos SQL, ejecutarse migraciones ni conectarse Supabase.

## 11. Cambios y limitaciones de esta entrega

- Se ajustó esta especificación para separar la creación de `organizations` del flujo D-02.
- Se corrigió la clasificación de tablas listas considerando sus dependencias de la Fase 1.
- Se estableció RLS junto con cada grupo de tablas y se añadieron pruebas de aislamiento.
- Se separaron los bloqueos estrictos de la Fase 1 de los bloqueos de dominios posteriores.
- Se creó únicamente esta especificación física propuesta.
- No se modificaron los Documentos 12 ni 13.
- No se creó SQL ejecutable.
- No se instalaron dependencias.
- No se conectó Supabase.
- No se modificaron `apps/erp` ni `apps/diocesano`.
- Las decisiones marcadas como **Requerida** continúan pendientes de aprobación del negocio.
