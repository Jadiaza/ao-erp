# Diccionario maestro de datos — Ecosistema A&O

**Estado:** consolidación arquitectónica; no es un esquema SQL aprobado ni una implementación.  
**Repositorio:** Jadiaza/ao-erp  
**Rama:** design/saas-dashboard-refresh  
**Versión:** 1.0 — 2026-11-08

## 1. Propósito y alcance

Consolida el vocabulario, las entidades, las relaciones y las reglas de datos identificadas en los documentos de arquitectura 01 a 11. Será la referencia para completar el modelo relacional, los diagramas ERD, las migraciones PostgreSQL, las políticas RLS y los contratos entre aplicaciones.

No se inventan columnas, tipos SQL, restricciones ni cardinalidades ausentes en las fuentes. Los vacíos se marcan como pendientes. La presencia de una entidad en este diccionario no significa que exista físicamente en la base de datos.

## 2. Estado real del proyecto

- A&O SaaS es actualmente una aplicación frontend de demostración que utiliza LocalSaasStore/localStorage.
- No hay migraciones SQL, tablas Supabase, Auth conectado ni RLS ejecutado en el estado documentado.
- PostgreSQL/Supabase, Supabase Auth, RLS, Storage y Vercel son arquitectura objetivo sujeta a aprobación y validación técnica.
- El documento 09 amplía y corrige el modelo multiinstitución inicial. Para el modelo institucional objetivo prevalecen organizations, ecclesial_entities, organization_entities, entity_relationships y institutional_access_grants.
- El modelo inicial del documento 02 —institutions, dioceses, parishes, institution_memberships y active_institution_contexts— no debe duplicarse como segundo modelo canónico.
- Los documentos 01–11 no especifican por completo todas las tablas operativas de ERP ni todas las cardinalidades comerciales. Esos vacíos se conservan como pendientes.

### 2.1 Convenciones de estado

| Estado | Significado |
|---|---|
| DEFINIDO | Concepto y responsabilidad expresamente descritos en documentos. |
| PROPUESTO | Entidad descrita como diseño conceptual, aún no implementada. |
| DERIVADO | Vista o proyección calculada; no es fuente independiente de verdad. |
| OPCIONAL | Se incorpora solo si se confirma la necesidad funcional. |
| PENDIENTE | Faltan atributos, cardinalidad, regla o decisión. |
| SUPERADO | Diseño anterior que no debe coexistir como modelo paralelo. |

## 3. Principios del modelo

1. Organization es el tenant/organización contratante; ecclesial_entity es una institución del dominio eclesial. No son sinónimos.
2. Una organización puede vincular varias entidades eclesiales. Una entidad puede tener vínculos con más de una organización cuando exista relación explícita.
3. Una relación canónica o jurisdiccional no concede permisos automáticamente.
4. Membresía, scope, rol, permiso, licencia y entitlement son conceptos diferentes.
5. El servidor determina el contexto autorizado. Los identificadores enviados por el navegador no son prueba de autorización.
6. SaaS administra relación comercial, contratación y licenciamiento; ERP conserva la operación de cada institución; Diocesano solicita, recibe, revisa información autorizada y emite comunicaciones institucionales.
7. La diócesis no administra parroquias ni modifica sus registros originales por el hecho de existir una relación diocesana.
8. Las presentaciones enviadas y los eventos de auditoría conservan historial. Las correcciones se registran como nuevas versiones o eventos.
9. Los datos demo no se importan automáticamente a organizaciones reales.
10. La seguridad se aplica en servicios server-side y PostgreSQL RLS, con pruebas negativas multi-tenant.

## 4. Glosario

| Concepto | Definición | No confundir con |
|---|---|---|
| Usuario Auth | Identidad autenticada | Rol o permiso |
| Perfil | Datos de aplicación asociados al usuario | Membresía |
| Organización | Tenant/organización contratante | Diócesis o parroquia por defecto |
| Entidad eclesial | Diócesis, parroquia, congregación, comunidad, seminario, fundación u otra institución | Organización contratante |
| Vínculo organización-entidad | Relación explícita entre tenant y entidad | Propiedad o permiso automático |
| Relación institucional | Vínculo canónico, jurisdiccional, operativo o comercial descriptivo | Grant de acceso |
| Grant institucional | Autorización explícita, con finalidad, acciones y vigencia | Membresía o licencia |
| Membresía | Pertenencia vigente de un usuario a una organización | Cuenta global |
| Scope | Delimitación de entidades o recursos accesibles | Rol |
| Rol | Agrupación de permisos | Entitlement comercial |
| Permiso | Capacidad funcional concreta | Licencia |
| Contrato | Acuerdo comercial | Suscripción o pago |
| Beneficiario contractual | Entidad cubierta por un contrato | Organización pagadora necesariamente |
| Suscripción | Relación/ciclo del servicio contratado | Pago |
| Licencia | Derecho de uso | Membresía |
| Asignación de licencia | Asignación a entidad beneficiaria | Relación diocesana |
| Entitlement | Capacidad de aplicación o módulo concedida | Permiso de usuario |
| Solicitud de informe | Requerimiento institucional publicado | Comunicación general |
| Presentación | Entrega de un destinatario para una solicitud | Aprobación del contenido |
| Revisión | Evaluación documental | Modificación del registro original |
| Comunicación institucional | Mensaje jurisdiccional o administrativo | Conversación CRM |
| Auditoría | Historial de acciones y accesos | Log editable por usuario |

## 5. Identidad, organizaciones y autorización

| Entidad | Propósito | Relaciones y atributos expresamente identificados | Estado |
|---|---|---|---|
| auth.users | Identidad gestionada por Supabase Auth | Identificador de usuario referenciado por perfiles/membresías | DEFINIDO como proveedor propuesto |
| profiles | Perfil de aplicación | Vinculado a usuario Auth; campos no especificados | PROPUESTO |
| organizations | Tenant/organización contratante | Se relaciona con memberships y ecclesial_entities | PROPUESTO |
| ecclesial_entities | Catálogo de instituciones eclesiales | Tipos y datos descriptivos; catálogo completo pendiente | PROPUESTO |
| organization_entities | Vincula organización y entidad | organization_id, ecclesial_entity_id, relation_type, status | PROPUESTO |
| entity_relationships | Relaciones canónicas/institucionales entre entidades | Origen/destino; tipo y atributos completos pendientes | PROPUESTO |
| institutional_access_grants | Autorización institucional explícita | source_organization_id, source_entity_id, target_organization_id, target_entity_id, purpose, allowed_actions, starts_at, ends_at, status, granted_by | PROPUESTO |
| memberships | Pertenencia de usuario a organización | id, organization_id; usuario, estado y vigencia deben concretarse | PROPUESTO |
| membership_scopes | Limita alcance de membresía | membership_id y organization_id; scope institucional vinculado a organization_entities | PROPUESTO |
| roles | Catálogo de roles | Asignados a membresías; alcance global/organizacional pendiente | PROPUESTO |
| permissions | Catálogo de permisos | Código y descripción; catálogo completo pendiente | PROPUESTO |
| role_permissions | Relación rol-permiso | FK a roles y permissions | PROPUESTO |
| membership_roles | Asignación de roles | FK a memberships y roles; scope/vigencia por precisar | PROPUESTO |

### 5.1 Grants institucionales

Finalidades descritas: reports y communications. Acciones descritas: request, submit, review, comment, download y communicate.

El grant debe comprobar que origen y destino están vinculados a sus organizaciones, que está vigente y que la acción solicitada está permitida. No habilita administración de usuarios, contabilidad, sacramentos ni modificación de registros originales.

### 5.2 Modelo institucional inicial superado

El documento 02 enumera institutions, dioceses, parishes, institution_memberships y active_institution_contexts. El documento 11 identifica la evolución hacia organizations y ecclesial_entities, con vínculos y grants explícitos.

No crear ambas familias como modelos paralelos. Diócesis, parroquia y demás tipos se representan como tipos de ecclesial_entities, según catálogo aprobado. Las relaciones canónicas son descriptivas y no heredan permisos. Si existen datos persistidos del modelo anterior, se necesitará un mapeo de migración; el SaaS revisado utiliza datos locales de demostración.

## 6. Dominio comercial y licenciamiento SaaS

### 6.1 Cadena canónica

~~~text
contracts
  -> contract_entities
  -> subscriptions
  -> licenses
  -> license_assignments
  -> entitlements
~~~

service_entitlements es una vista/proyección derivada, no una segunda concesión independiente.

| Entidad | Propósito | Relaciones/atributos documentados | Estado |
|---|---|---|---|
| parties | Identidad canónica de contraparte | Base de personas y organizaciones comerciales | PROPUESTO |
| party_persons | Especialización persona | FK a parties; datos personales pendientes | PROPUESTO |
| party_organizations | Especialización organización jurídica | FK a parties; datos legales pendientes | PROPUESTO |
| clients | Cliente comercial | Asociado a party | PROPUESTO |
| applications | Catálogo de aplicaciones | Referenciado por módulos y entitlements | PROPUESTO |
| modules | Catálogo de módulos | Relación con applications | PROPUESTO |
| plans | Planes comerciales | Precio, periodicidad y límites pendientes | PROPUESTO |
| contracts | Acuerdo comercial | Organización contratante y beneficiarios por contract_entities | PROPUESTO |
| contract_entities | Beneficiarios del contrato | Contrato y entidad eclesial | PROPUESTO |
| contract_terms | Versiones/términos contractuales | Asociados al contrato; estructura exacta pendiente | PROPUESTO |
| subscriptions | Ciclo/relación de servicio | Cadena contractual; estados y periodos pendientes | PROPUESTO |
| licenses | Derecho de uso | Asociada a suscripción y asignaciones | PROPUESTO |
| license_assignments | Asigna licencia a entidad beneficiaria | Licencia, entidad, vigencia y estado | PROPUESTO |
| entitlements | Capacidades de aplicación/módulo | Derivan de licencia/asignación | PROPUESTO |
| usage_limits | Límites de consumo | Métrica, cantidad y periodo pendientes | PROPUESTO |
| service_entitlements | Consulta efectiva de servicios habilitados | organization_id, ecclesial_entity_id, application_id, module_id, license_id, valid_from, valid_to, status | DERIVADO |

### 6.2 Contratación

El diseño contempla contrato directo de institución, una organización que contrata para varias instituciones, institución vinculada a diócesis con contratación independiente y entidad en directorio sin licencia activa.

La decisión entre contratación centralizada, independiente o mixta no está cerrada. No asumir modalidad ni cardinalidades definitivas de contracts, subscriptions, licenses y contract_entities hasta aprobación.

### 6.3 Facturación y recaudo

| Entidad | Propósito | Relaciones conocidas | Estado |
|---|---|---|---|
| invoices | Facturas/documentos de cobro | Contienen items, impuestos y descuentos; reciben aplicaciones de pagos | PROPUESTO |
| invoice_items | Líneas facturadas | FK a invoice | PROPUESTO |
| invoice_taxes | Impuestos | FK a invoice o item según diseño final | PROPUESTO |
| invoice_discounts | Descuentos | FK a invoice o item según diseño final | PROPUESTO |
| payments | Pagos recibidos | Aplicados a facturas mediante payment_allocations | PROPUESTO |
| payment_allocations | Aplicación de pagos | Pago ↔ factura; valor aplicado | PROPUESTO |
| credit_notes | Notas crédito | Relación con factura original | PROPUESTO |
| credit_note_items | Detalle de nota crédito | FK a credit note | PROPUESTO |
| receivable_adjustments | Ajustes de cartera aprobados | Organización/factura; autorización y motivo pendientes | PROPUESTO |

Regla de saldo: total facturado menos pagos aplicados menos notas crédito, más/menos ajustes aprobados. Los pagos parciales no alteran el total original. Las operaciones deben ser transaccionales. La integración DIAN está fuera de la fase descrita.

## 7. CRM Comercial con IA

El CRM forma parte de A&O SaaS, no es un producto comercial aislado. El documento 11 advierte que falta especificación detallada de algunas cardinalidades.

| Entidad | Propósito y relaciones identificadas | Estado |
|---|---|---|
| leads | Prospectos; referencia a party_id | PROPUESTO |
| lead_events | Historial de prospecto; FK a lead | PROPUESTO |
| contacts | Relación comercial con persona/party | PROPUESTO |
| contact_accounts | Relaciona contacto con varias cuentas | PROPUESTO |
| pipelines | Embudos comerciales | PROPUESTO |
| pipeline_stages | Etapas; FK a pipeline | PROPUESTO |
| opportunities | Oportunidades; pipeline y etapa coherentes mediante FK compuesta | PROPUESTO |
| activities | Actividades y seguimientos; asociaciones exactas pendientes | PROPUESTO |
| products_services | Catálogo comercial | PROPUESTO |
| quotations | Cotizaciones; asociadas a cuenta/oportunidad según regla final | PROPUESTO |
| quotation_items | Detalle de cotización | PROPUESTO |
| campaigns | Campañas comerciales | PROPUESTO |
| campaign_members | Participantes de campaña | PROPUESTO |
| conversations | Conversaciones comerciales | PROPUESTO |
| conversation_messages | Mensajes; FK a conversation | PROPUESTO |
| ai_agents | Configuración de agentes IA; herramientas y permisos pendientes | PROPUESTO |

Reglas: parties es identidad canónica; leads referencia party_id; no deduplicar por nombre global; contacts representa relación comercial y contact_accounts permite varias cuentas. La etapa debe pertenecer al pipeline de la oportunidad. IA puede clasificar, sugerir y registrar dentro de permisos; no modifica precios, concede descuentos, activa licencias ni confirma ventas sin autorización.

Pendiente: propietario de contactos compartidos, consentimiento y retención de conversaciones, estados, cardinalidades y conversión CRM a contratación.

## 8. Informes institucionales

Este dominio sigue el documento 09 y sus correcciones del apartado 17. La diócesis solicita, recibe y revisa; no administra parroquias ni modifica registros originales.

### 8.1 Plantillas

| Entidad | Propósito | Atributos documentados | Estado |
|---|---|---|---|
| report_templates | Catálogo de tipos de informe | owner_organization_id, code, name, description, institution_types, periodicity, status | PROPUESTO |
| report_template_versions | Versión inmutable | template_id, version_number, status, published_at, published_by, rendering_config, source_policy | PROPUESTO |
| report_template_sections | Secciones de versión | template_version_id, code, title, position, description | PROPUESTO |
| report_template_fields | Campos configurables | section_id, code, label, field_type, is_required, is_repeatable, position, validation_schema, erp_source | PROPUESTO |
| report_template_attachments | Soportes requeridos | template_version_id, code, label, is_required, allowed_mime_types, max_size_bytes | PROPUESTO |

Tipos de campo: text, integer, decimal, date, boolean, choice, person_reference, entity_reference, table y document_reference.

La estructura vive exclusivamente en versions, sections, fields y attachments. No duplicar el esquema en un campo JSON schema. rendering_config solo define presentación; source_policy define datos autorizados que ERP puede aportar y no permite consultas arbitrarias.

### 8.2 Solicitudes y presentaciones

| Entidad | Propósito | Atributos documentados | Estado |
|---|---|---|---|
| report_requests | Solicitud publicada desde Diocesano | request_number, vínculo solicitante organización-entidad, template_version_id, title, instructions, period_start, period_end, published_at, due_at, status | PROPUESTO |
| report_request_recipients | Destinatarios explícitos | request_id, recipient_organization_entity_id, recipient_organization_id, recipient_entity_id, status | PROPUESTO |
| report_submissions | Entrega por destinatario | request_recipient_id, version_number, previous_submission_id, delivery_status, review_status, submission_number, radicado_number, submitted_by, submitted_at, received_at, correction_requested_by, correction_requested_at, is_current | PROPUESTO |
| report_field_values | Valores por campo | submission_id, field_id, row_key, value_json, source_system, source_reference | PROPUESTO |
| report_submission_files | Soportes de presentación | submission_id, template_attachment_id, document_reference_id, storage_key, file_name, mime_type, size_bytes, checksum, uploaded_by | PROPUESTO |
| report_reviews | Revisión | submission_id, reviewer_user_id, reviewer_entity_id, status, summary, created_at | PROPUESTO |
| report_review_events | Historial de observaciones/decisiones | review_id, event_type, comment, field_id, author_user_id, created_at | PROPUESTO |

Reglas:
- La solicitud referencia una versión específica e inmutable de plantilla.
- El destinatario se registra explícitamente y se vincula a organization_entities.
- La presentación hereda la entidad del destinatario.
- Un destinatario puede tener varias versiones, pero solo una is_current=true.
- Unicidad de request_recipient_id + version_number e índice único parcial por destinatario para la versión vigente.
- La corrección crea una nueva versión y previous_submission_id apunta a la anterior.
- delivery_status y review_status son independientes.
- La constancia y el radicado se generan al completar recepción documental, no por el éxito de una petición HTTP.

Estados de entrega: draft, submitted, delivered, failed, withdrawn.  
Estados de revisión: not_started, in_review, correction_requested, accepted, rejected, closed.

## 9. Comunicaciones institucionales

| Entidad | Propósito | Atributos documentados | Estado |
|---|---|---|---|
| communication_threads | Agrupa comunicaciones | owner_organization_id, origin_entity_id, subject, thread_type, status, created_by, created_at, closed_at | PROPUESTO |
| communications | Mensaje institucional | thread_id, parent_communication_id, sender_user_id, sender_entity_id, body, allow_replies, published_at, status | PROPUESTO |
| communication_recipients | Destinatario institucional o individual | communication_id, recipient_entity_id, recipient_organization_id, recipient_user_id, recipient_scope_id, delivery_status, delivered_at, read_at, archived_at | PROPUESTO |
| communication_attachments | Adjuntos | communication_id, storage_key, file_name, mime_type, size_bytes, checksum, uploaded_by | PROPUESTO |
| communication_events | Historial de envío/entrega/lectura/respuesta | communication_id, recipient_id, event_type, actor_user_id, metadata, created_at | PROPUESTO |
| communication_read_receipts | Historial detallado de lecturas | recipient_id, user_id, read_at, device_metadata | OPCIONAL |

Destinatario institucional: recipient_user_id nulo. Destinatario individual: recipient_user_id y recipient_scope_id presentes; el usuario debe tener membresía activa en la entidad. La lectura individual no equivale a lectura institucional. Se requieren índices únicos parciales separados para destinatarios institucionales e individuales. La respuesta exige allow_replies.

CRM comercial y comunicaciones institucionales pueden compartir utilidades, no reglas de acceso.

## 10. Archivos y auditoría

### 10.1 Archivos

| Entidad | Propósito | Atributos documentados | Estado |
|---|---|---|---|
| document_file_metadata | Metadatos de archivos; binario en almacenamiento controlado | storage_provider, storage_key, original_name, detected_mime_type, declared_mime_type, size_bytes, checksum_sha256, malware_status, retention_until, deleted_at | PROPUESTO |

Estados: pending_scan, clean, rejected, quarantined, expired, deleted.

Reglas: almacenamiento privado; validar MIME detectado y tamaño; escaneo antimalware; enlaces firmados de corta duración después de autorizar el registro padre; auditoría de descargas y denegaciones; checksum; retención y eliminación lógica. No exponer storage_key ni URL permanente al navegador.

### 10.2 Auditoría

| Entidad | Dominio | Regla | Estado |
|---|---|---|---|
| security_events | Seguridad y accesos | Inserción server-side; append-only | PROPUESTO |
| commercial_audit_events | Operaciones comerciales/licencias | Inserción server-side; append-only | PROPUESTO |
| institutional_audit_events | Informes y comunicaciones | Inserción server-side; append-only | PROPUESTO |
| sensitive_access_events | Accesos/descargas sensibles | Inserción server-side; append-only | PROPUESTO |
| audit_events | Nombre genérico del modelo documental inicial | No duplicar sin decisión los dominios de auditoría posteriores | PENDIENTE / SUPERADO como tabla global |

Los usuarios ordinarios no editan ni eliminan eventos. Evitar almacenar tokens, secretos o datos personales/dispositivo innecesarios.

## 11. Límites de ERP y Diocesano

### A&O ERP

ERP conserva los datos operativos, administrativos, financieros, contables, pastorales y sacramentales de cada institución. Los documentos 01–11 no especifican por completo sus tablas operativas.

El documento 05 nombra servicios, no tablas: DocumentService, ArchiveStructureService, ExpedientService, RegisterBookService, InstrumentService, TransferService y AuditService.

El documento 06 menciona conceptos documentales: fondos, secciones, series, subseries, documentos, expedientes, libros, tomos, folios, instrumentos, transferencias y conservación. Sus nombres SQL, campos, claves y cardinalidades deben cotejarse con la documentación funcional de ERP antes de incorporarlos como tablas canónicas.

### A&O Diocesano

Responsabilidades delimitadas:
1. Solicitudes, recepción, revisión y consolidación de informes autorizados.
2. Comunicaciones institucionales.

No administra usuarios, permisos, contabilidad, sacramentos ni registros originales de parroquias. El directorio jurisdiccional no implica licencia ni acceso.

## 12. Matriz de relaciones principales

| Origen | Relación | Destino | Cardinalidad/regla |
|---|---|---|---|
| auth.users | tiene | profiles | 1:1 esperado; restricción pendiente |
| auth.users | pertenece mediante | memberships | 1:N |
| organizations | contiene | memberships | 1:N |
| memberships | tiene | membership_scopes | 1:N |
| memberships | asigna mediante | membership_roles | N:M con roles |
| roles | concede mediante | role_permissions | N:M con permissions |
| organizations | vincula mediante | organization_entities | N:M con ecclesial_entities |
| ecclesial_entities | se relaciona mediante | entity_relationships | Cardinalidad detallada pendiente |
| institutional_access_grants | autoriza | origen ↔ destino | Acciones, finalidad y vigencia explícitas |
| parties | se especializa en | party_persons / party_organizations | 1:0..1 esperado; restricciones pendientes |
| parties | identifica | leads / clients | Cardinalidad pendiente |
| contacts | se asocia mediante | contact_accounts | N:M |
| applications | contiene | modules | 1:N esperado |
| contracts | beneficia mediante | contract_entities | 1:N |
| contracts | origina | subscriptions | Por concretar |
| subscriptions | habilita | licenses | Por concretar |
| licenses | se asigna mediante | license_assignments | 1:N |
| licenses | concede | entitlements | 1:N conceptual |
| entitlements | proyecta | service_entitlements | Vista derivada |
| invoices | contiene | invoice_items | 1:N |
| payments | se aplica mediante | payment_allocations | N:M con invoices |
| invoices | recibe | credit_notes | 1:N conceptual |
| pipelines | contiene | pipeline_stages | 1:N |
| opportunities | pertenece a | pipeline + stage | FK compuesta |
| quotations | contiene | quotation_items | 1:N |
| conversations | contiene | conversation_messages | 1:N |
| report_templates | versiona mediante | report_template_versions | 1:N |
| report_template_versions | contiene | sections / attachments | 1:N |
| report_template_sections | contiene | report_template_fields | 1:N |
| report_requests | referencia | report_template_version | N:1; versión inmutable |
| report_requests | contiene | report_request_recipients | 1:N |
| report_request_recipients | recibe | report_submissions | 1:N; una vigente |
| report_submissions | contiene | report_field_values / files | 1:N |
| report_submissions | tiene | report_reviews | 1:N |
| report_reviews | conserva | report_review_events | 1:N |
| communication_threads | contiene | communications | 1:N |
| communications | dirige a | communication_recipients | 1:N |
| communications | adjunta | communication_attachments | 1:N |
| communications | registra | communication_events | 1:N |
| communication_recipients | puede tener | communication_read_receipts | 1:N opcional |

## 13. Restricciones e índices identificados

- organization_entities: unicidad de (organization_id, ecclesial_entity_id, relation_type).
- report_template_versions: unicidad de (template_id, version_number).
- report_template_sections: unicidad de código y posición dentro de versión.
- report_submissions: unicidad de (request_recipient_id, version_number); índice único parcial por request_recipient_id donde is_current=true.
- communication_recipients: índices únicos parciales separados para destinatario institucional e individual.
- opportunities: integridad compuesta entre pipeline y etapa.
- payment_allocations: validación transaccional de aplicación, organización y saldo.
- membership_scopes: organization_id debe coincidir con la membresía y el scope institucional debe existir en organization_entities.
- Relaciones multi-tenant críticas: claves foráneas compuestas o restricciones equivalentes para impedir cruces entre organizaciones.
- Roles globales con organization_id NULL: índice único parcial; no asumir unicidad convencional con NULL.
- No usar unicidad global por nombre para deduplicar parties.

Las expresiones SQL exactas se definirán en migraciones revisadas, no en este diccionario.

## 14. Estados y catálogos identificados

| Dominio | Estados/valores descritos |
|---|---|
| Solicitud de informe | draft, published, open, closed, cancelled, archived |
| Entrega de presentación | draft, submitted, delivered, failed, withdrawn |
| Revisión | not_started, in_review, correction_requested, accepted, rejected, closed |
| Comunicación | draft, published, delivered, partially_delivered, failed, archived, cancelled |
| Destinatario de comunicación | pending, delivered, failed, archived; lectura se registra aparte |
| Archivo | pending_scan, clean, rejected, quarantined, expired, deleted |
| Origen de presentación | erp_generated, manual, mixed |
| Tipo de comunicación | particular, circular, convocatoria, notification |
| Tipo de campo de informe | text, integer, decimal, date, boolean, choice, person_reference, entity_reference, table, document_reference |

Los estados de contratos, suscripciones, licencias, pagos, CRM y entidades eclesiales requieren catálogo definitivo. No inferirlos desde este documento.

## 15. Seguridad, privacidad y RLS

- Toda tabla expuesta debe tener RLS habilitado.
- Toda operación privada valida usuario, organización, membresía, scope, rol, permiso y entitlement cuando corresponda.
- Grants se validan al publicar, presentar, revisar y descargar.
- No confiar en organization_id, entity_id, roles ni contexto enviados por navegador.
- Mutaciones mediante server functions con validación de entrada.
- service_role y secretos permanecen server-side.
- SECURITY DEFINER, si se justifica, debe estar en esquema no expuesto, con search_path restringido y permisos mínimos.
- Storage privado autoriza contra el registro padre.
- Las vistas autenticadas requieren revisión explícita de seguridad.
- Auditoría append-only; descargas y accesos sensibles generan eventos.
- Probar aislamiento con dos organizaciones, varias entidades, scopes distintos y membresías suspendidas.

## 16. Decisiones pendientes que bloquean el modelo físico

| Tema | Decisión necesaria |
|---|---|
| Contratación | Centralizada, independiente o mixta; cardinalidades contrato/beneficiarios/suscripción/licencia |
| Identidad comercial | Campos identificadores, deduplicación y titularidad de parties |
| CRM | Propietario de contactos compartidos, consentimiento, retención, estados y conversión |
| Organizaciones | Quién crea tenants/entidades; membresías multi-organización y roles globales |
| Relaciones eclesiales | Tipos de entidad y cardinalidades canónicas, sin herencia de permisos |
| Grants | Quién concede/revoca, delegación, vigencia y combinación de acciones |
| Facturación | Impuestos, numeración, moneda, pagos parciales, reversos, notas crédito y ajustes |
| Licenciamiento | Límites, asignaciones, renovaciones, suspensiones, prorrateos y consumo |
| Informes | Licenciamiento, propiedad de plantillas globales, destinatarios, respuestas y retención |
| Comunicaciones | Comunicación entre instituciones, respuestas y confirmación de lectura |
| Archivos | Proveedor, región, antivirus, retención y eliminación legal |
| Seguridad | MFA, sesiones, recuperación, acceso de emergencia y retención de auditoría |
| Infraestructura | Proveedor, región, plan, ambientes, backups y despliegue |
| ERP/Diocesano | Diccionario operativo completo, integración y límites de datos sensibles |

## 17. Ficha obligatoria para completar cada tabla

Antes de migraciones SQL, cada tabla debe tener:
1. Nombre, dominio y descripción.
2. Propietario del dato.
3. PK, FK y claves alternativas.
4. Campo, tipo PostgreSQL, nulabilidad y valor por defecto.
5. Cardinalidad y reglas ON DELETE/ON UPDATE.
6. Índices, unicidad y restricciones.
7. Estados y transiciones.
8. Tenant y scope de seguridad.
9. Política RLS SELECT/INSERT/UPDATE/DELETE.
10. Eventos de auditoría.
11. Retención, datos sensibles y clasificación.
12. Pruebas unitarias, integración y escenarios negativos.

Este documento consolida el inventario y las reglas expresadas; no reemplaza la especificación física de cada tabla.

## 18. Trazabilidad documental

| Fuente | Aporte |
|---|---|
| 01 — Decisión de arquitectura backend | PostgreSQL/Supabase propuesto y límites de producto |
| 02 — Modelo multiinstitución | Identidad y membresías iniciales; modelo institucional marcado como superado |
| 03 — Autenticación y autorización | Auth, SSR, contexto y autorización server-side |
| 04 — Políticas RLS | Aislamiento, matriz y pruebas negativas |
| 05 — Arquitectura de servicios | Bounded contexts y servicios documentales |
| 06 — Migraciones y datos | SQL versionado, datos demo y conceptos documentales |
| 07 — Infraestructura, costos y despliegue | Ambientes, secretos, backups y runtime pendiente |
| 08 — Plan de implementación backend | Secuencia de implementación y calidad |
| 09 — Informes institucionales y comunicaciones | Modelo institucional evolucionado, grants, informes, comunicaciones, archivos y auditoría |
| 10 — Preparación técnica de implementación SaaS | Estado real de SaaS y LocalSaasStore |
| 11 — Arquitectura ejecutable Vercel y Supabase | Responsabilidades de producto, transición y CRM |

## 19. Criterio de cierre

El diccionario estará listo para pasar a diseño físico cuando:
- Las decisiones bloqueantes de la sección 16 estén resueltas o diferidas explícitamente por fase.
- Cada entidad tenga ficha completa de atributos y restricciones.
- Las cardinalidades comerciales y multi-tenant estén aprobadas.
- El modelo institucional evolucionado sea la única fuente canónica.
- CRM, SaaS, ERP y Diocesano tengan límites de propiedad y acceso inequívocos.
- Las matrices RLS y pruebas negativas estén vinculadas a cada tabla.
- El ERD y este diccionario no presenten nombres, relaciones ni estados contradictorios.

**No iniciar migraciones SQL por el solo hecho de crear este documento.** La aprobación del diccionario, las decisiones de producto y la validación técnica de infraestructura son hitos separados.
