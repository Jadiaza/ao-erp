# Informes institucionales y comunicaciones diocesanas

Estado: diseño conceptual para aprobación. No implementado.

Este documento extiende el modelo multiinstitucional de los documentos 01 a 08
de este directorio. No crea tablas, migraciones, conexiones ni permisos reales.

## 1. Principios

- La diócesis no es propietaria ni administradora de las parroquias.
- Cada parroquia conserva organización, usuarios, permisos y datos operativos.
- La relación diocesana es institucional y jurisdiccional.
- Diocesano solicita, recibe, revisa y comunica; ERP conserva los registros originales.
- Una entrega recibida no equivale a aprobación ni certificación de veracidad.
- El directorio no habilita servicios automáticamente.
- Informes y comunicaciones requieren licencia, entitlement y permiso.
- Ninguna relación jerárquica concede autorización por sí misma.

## 2. Relaciones institucionales

~~~mermaid
erDiagram
    ORGANIZATIONS ||--o{ ORGANIZATION_ENTITIES : vincula
    ECCLESIAL_ENTITIES ||--o{ ORGANIZATION_ENTITIES : participa
    ORGANIZATIONS ||--o{ MEMBERSHIPS : contiene
    MEMBERSHIPS ||--o{ MEMBERSHIP_SCOPES : delimita
    LICENSES ||--o{ LICENSE_ASSIGNMENTS : habilita
    ECCLESIAL_ENTITIES ||--o{ LICENSE_ASSIGNMENTS : beneficia
    REPORT_TEMPLATES ||--o{ REPORT_TEMPLATE_VERSIONS : versiona
    REPORT_REQUESTS ||--o{ REPORT_REQUEST_RECIPIENTS : solicita
    REPORT_REQUEST_RECIPIENTS ||--o{ REPORT_SUBMISSIONS : presenta
    REPORT_SUBMISSIONS ||--o{ REPORT_REVIEWS : revisa
    COMMUNICATION_THREADS ||--o{ COMMUNICATIONS : contiene
    COMMUNICATIONS ||--o{ COMMUNICATION_RECIPIENTS : dirige
~~~

organization_entities representa un vínculo comercial u operativo. No convierte
a una diócesis en propietaria de una parroquia. entity_relationships describe
relaciones canónicas o institucionales y nunca se usa como permiso.

## 3. Habilitación comercial

Se requiere una asignación de servicio que compruebe licencia y módulo:

~~~text
service_entitlements
- id
- license_id
- application_id
- module_code
- organization_id
- status
- starts_at
- ends_at
~~~

La comprobación debe validar organización, licencia vigente, entidad
beneficiaria, aplicación, módulo, membresía y permiso.

## 4. Motor configurable de informes

### report_templates

Catálogo lógico de informes:

~~~text
id, owner_organization_id, code, name, description,
institution_types, periodicity, status
~~~

Puede ser global de una jurisdicción, privado de una organización o compartido
mediante publicación explícita. No se debe crear una pantalla fija por informe.

### report_template_versions

~~~text
id, template_id, version_number, status, published_at, published_by,
rendering_config, source_policy
~~~

Restricciones:

- unique(template_id, version_number).
- Solo una versión publicada puede ser vigente.
- Una versión usada por una solicitud no se modifica.

Las tablas report_template_sections, report_template_fields y
report_template_attachments son la única fuente estructural de verdad.
rendering_config solo contiene preferencias de presentación que no cambian la
estructura, como formato, orden visual o etiquetas auxiliares.

source_policy describe datos que ERP puede aportar; no permite consultas
arbitrarias.

### report_template_sections

~~~text
id, template_version_id, code, title, position, description
~~~

Índices únicos por versión para code y position.

### report_template_fields

~~~text
id, section_id, code, label, field_type, is_required,
is_repeatable, position, validation_schema, erp_source
~~~

Tipos iniciales:

~~~text
text, integer, decimal, date, boolean, choice,
person_reference, entity_reference, table, document_reference
~~~

### report_template_attachments

~~~text
id, template_version_id, code, label, is_required,
allowed_mime_types, max_size_bytes
~~~

### report_requests

Solicitud publicada desde Diocesano:

~~~text
id, request_number, requesting_entity_id, requesting_organization_id,
template_version_id, title, instructions, period_start, period_end,
published_at, due_at, status
~~~

Estados:

~~~text
draft, published, open, closed, cancelled, archived
~~~

La solicitud apunta a una versión inmutable de plantilla.

### report_request_recipients

~~~text
id, request_id, recipient_entity_id, recipient_organization_id, status
~~~

Índice único: request_id + recipient_entity_id.

El destinatario debe estar vinculado a la organización y tener habilitado el
servicio. La lista no se infiere únicamente de la relación diocesana.

### report_submissions

~~~text
id, request_recipient_id, submission_number, version_number,
submitted_by, status, submitted_at, withdrawn_at, data_source
~~~

data_source puede ser erp_generated, manual o mixed.

Estados:

~~~text
draft, submitted, received, under_review, correction_requested,
corrected, accepted, rejected, withdrawn
~~~

La institución se obtiene del destinatario. Una presentación recibida es
inmutable; una corrección crea una nueva versión.

### report_field_values

~~~text
id, submission_id, field_id, row_key, value_json,
source_system, source_reference
~~~

Índice único: submission_id + field_id + row_key.

### report_submission_files

~~~text
id, submission_id, template_attachment_id, document_reference_id,
storage_key, file_name, mime_type, size_bytes, checksum, uploaded_by
~~~

Conserva metadatos y referencias; los binarios viven en almacenamiento
controlado.

### report_reviews

~~~text
id, submission_id, reviewer_user_id, reviewer_entity_id,
status, summary, created_at
~~~

Estados:

~~~text
pending, in_review, correction_requested, accepted, rejected, closed
~~~

### report_review_events

~~~text
id, review_id, event_type, comment, field_id,
author_user_id, created_at
~~~

Eventos:

~~~text
started, observation_added, correction_requested, response_added,
accepted, rejected, closed
~~~

Las observaciones conservan autor, fecha, motivo y estado.

## 5. Flujo de informes

~~~mermaid
sequenceDiagram
    participant D as Funcionario diocesano
    participant DS as A&O Diocesano
    participant E as A&O ERP
    participant R as Repositorio
    D->>DS: Crea solicitud
    DS->>R: Publica plantilla versionada y destinatarios
    R-->>E: Solicitud disponible
    E->>R: Prepara y diligencia borrador
    E->>R: Genera datos autorizados de ERP
    E->>R: Adjunta soportes y presenta
    R-->>E: Constancia y radicado
    R-->>DS: Entrega recibida
    DS->>R: Revisa y registra observaciones
    R-->>E: Solicita corrección
    E->>R: Presenta nueva versión
~~~

ERP puede generar datos solo de módulos disponibles y autorizados. No se exige
la contratación de todos los módulos ERP para responder una solicitud.

## 6. Comunicaciones institucionales

Las comunicaciones institucionales son diferentes del CRM:

- CRM: conversaciones comerciales con prospectos y clientes.
- Diocesano: comunicaciones jurisdiccionales o administrativas.

Pueden compartir utilidades de archivos y auditoría, pero no reglas de acceso.

### communication_threads

~~~text
id, owner_organization_id, origin_entity_id, subject,
thread_type, status, created_by, created_at, closed_at
~~~

thread_type:

~~~text
particular, circular, convocatoria, notification
~~~

### communications

~~~text
id, thread_id, parent_communication_id, sender_user_id,
sender_entity_id, body, allow_replies, published_at, status
~~~

La autorreferencia permite respuestas sin duplicar conversaciones.

### communication_recipients

~~~text
id, communication_id, recipient_entity_id, recipient_organization_id,
recipient_user_id, delivery_status, delivered_at, read_at, archived_at
~~~

Cada destinatario se registra individualmente. La institución debe tener
habilitado el servicio.

Índice único: communication_id + recipient_entity_id + recipient_user_id.

### communication_attachments

~~~text
id, communication_id, storage_key, file_name, mime_type,
size_bytes, checksum, uploaded_by
~~~

### communication_events

~~~text
id, communication_id, recipient_id, event_type,
actor_user_id, metadata, created_at
~~~

Eventos:

~~~text
created, published, delivered, failed, read, replied, archived
~~~

### communication_read_receipts

Se utiliza si se requiere historial de lecturas:

~~~text
id, recipient_id, user_id, read_at, device_metadata
~~~

Si solo se requiere la última lectura, read_at en
communication_recipients es suficiente.

## 7. Contratación y beneficiarios

El modelo permite:

1. Institución con contrato directo.
2. Organización que contrata para varias instituciones.
3. Institución vinculada a diócesis pero contratante independiente.
4. Entidad en directorio sin licencia activa.

Relaciones necesarias:

~~~text
contracts
contract_entities
subscriptions
licenses
license_assignments
entitlements
service_entitlements
~~~

Directorio, licencia, membresía y permiso son conceptos independientes.

## 8. Integridad multi-tenant

Las relaciones críticas deben incorporar claves compuestas, índices únicos
auxiliares y validaciones de base de datos:

~~~text
memberships(id, organization_id)
membership_scopes(id, membership_id, organization_id)
report_requests(id, requesting_organization_id)
report_request_recipients(id, request_id, recipient_organization_id)
report_submissions(id, request_recipient_id)
communications(id, owner_organization_id)
communication_recipients(id, communication_id, recipient_organization_id)
~~~

Reglas:

- El organization_id del scope debe coincidir con el de la membresía.
- El scope institucional debe existir en organization_entities.
- La presentación hereda la entidad del destinatario.
- El archivo debe pertenecer al mismo ámbito del informe o comunicación.
- Los destinatarios se validan individualmente.
- La interfaz nunca es la única frontera de integridad.

## 9. Permisos

| Rol | Informes | Comunicaciones | Administración |
|---|---|---|---|
| A&O SaaS | Soporte técnico limitado | No operativo | Licencias y servicios |
| Responsable organización | Según scope | Según scope | Miembros de su organización |
| Administrador parroquia | Consulta y presenta | Recibe y responde | Su ERP |
| Responsable informes | Prepara y presenta | Consulta relacionada | No administra globalmente |
| Funcionario diocesano | Crea, publica y consulta | Envía y consulta | No administra parroquias |
| Revisor diocesano | Revisa y observa | Consulta | No modifica ERP |
| Responsable comunicaciones | No revisa por defecto | Envía y sigue estados | No administra sacramentos |

Permisos separados:

~~~text
reports:create_request
reports:publish_request
reports:prepare_submission
reports:submit
reports:review
reports:comment
reports:download
communications:create
communications:publish
communications:reply
communications:read_receipts
communications:archive
~~~

## 10. RLS

Informes:

- Diocesano consulta solicitudes que creó o tiene asignadas.
- ERP consulta solicitudes donde su entidad es destinataria.
- Las presentaciones solo son visibles para el destinatario y revisores autorizados.
- Una revisión no modifica la presentación original.
- La descarga sensible genera auditoría.

Comunicaciones:

- El emisor consulta sus comunicaciones.
- El destinatario consulta solo comunicaciones dirigidas a su entidad o usuario.
- Las instituciones no consultan mensajes ajenos.
- Las respuestas requieren allow_replies.
- Los archivos se autorizan con la comunicación y el destinatario.

Todas las funciones server-side deben validar sesión, membresía, scope,
entitlement, relación, permiso y auditoría.

## 11. Auditoría

Se mantienen dominios separados:

~~~text
security_events
commercial_audit_events
institutional_audit_events
sensitive_access_events
~~~

Eventos mínimos:

- Publicación y cambio de destinatarios.
- Presentación y corrección de informes.
- Observaciones y respuestas.
- Descarga de soportes.
- Envío, entrega, lectura y respuesta de comunicaciones.
- Cambios de licencia.
- Accesos denegados.

Solo servicios server-side insertan eventos. Los usuarios no editan ni eliminan
historial.

## 12. Facturación

La integridad de pagos se implementa mediante transacciones y servicios, no con
CHECK que agreguen varias filas:

~~~text
invoice -> invoice_items
invoice -> payments -> payment_allocations -> invoice
invoice -> credit_notes
invoice -> receivable_adjustments
~~~

Saldo:

~~~text
total facturado
- pagos aplicados
- notas crédito
± ajustes aprobados
= saldo pendiente
~~~

Los pagos parciales no modifican el total original. La facturación electrónica
DIAN queda fuera de esta fase.

## 13. Estados

Informes:

~~~text
draft, published, open, closed, cancelled, archived
~~~

Presentaciones:

~~~text
draft, submitted, received, under_review, correction_requested,
corrected, accepted, rejected, withdrawn
~~~

Revisiones:

~~~text
pending, in_review, correction_requested, accepted, rejected, closed
~~~

Comunicaciones:

~~~text
draft, published, delivered, partially_delivered, failed, archived, cancelled
~~~

Destinatarios:

~~~text
pending, delivered, failed, read, archived
~~~

## 14. Orden de migraciones

1. Esquemas, extensiones y funciones de contexto.
2. Organizaciones, entidades y vínculos institucionales.
3. Membresías, scopes, roles y permisos.
4. Aplicaciones, módulos, licencias y entitlements.
5. Plantillas y versiones de informes.
6. Secciones, campos y adjuntos requeridos.
7. Solicitudes y destinatarios.
8. Presentaciones, valores, archivos y revisiones.
9. Comunicaciones, destinatarios y archivos.
10. Eventos de entrega, lectura y respuesta.
11. Auditoría separada.
12. Índices y restricciones multi-tenant.
13. RLS.
14. Pruebas negativas.
15. Integración gradual con ERP y Diocesano.

## 15. Decisiones pendientes

1. Habilitación de comunicaciones entre instituciones.
2. Tipos de instituciones destinatarias por plantilla.
3. Propiedad de plantillas globales.
4. Retención de informes y soportes.
5. Historial de confirmaciones de lectura.
6. Política de respuestas institucionales.
7. Licenciamiento de informes.
8. Licenciamiento de comunicaciones.
9. Contratos con múltiples beneficiarios.
10. Reglas fiscales de notas crédito.
11. Integración futura con DIAN.
12. Almacenamiento y antivirus de adjuntos.
13. Acceso diocesano a información sensible.
14. Región y retención del almacenamiento.

## 16. Criterio de cierre

El diseño se considera consistente cuando:

- Una diócesis solicita información sin administrar parroquias.
- Una parroquia presenta informes sin entregar control de sus registros.
- Las solicitudes tienen destinatarios explícitos.
- Las plantillas son versionadas.
- Las correcciones conservan historial.
- Las comunicaciones tienen estados de entrega y lectura.
- La licencia controla el servicio.
- Las relaciones no cruzan organizaciones sin autorización.
- Pagos y notas crédito conservan trazabilidad.
- Los eventos sensibles no son editables por usuarios.

No se debe iniciar la implementación SQL hasta aprobar las decisiones pendientes.

## 17. Cierre de integridad 006.1

Esta sección resuelve las inconsistencias identificadas en la revisión del
modelo. Complementa las definiciones anteriores y prevalece cuando exista una
ambigüedad.

### 17.1 Autorización institucional explícita

El vínculo entre una organización y una entidad eclesial debe tener una clave
única que permita referenciarlo desde otras tablas:

~~~text
organization_entities
- id
- organization_id
- ecclesial_entity_id
- relation_type
- status
~~~

Índices y restricciones:

~~~text
unique(id)
unique(organization_id, ecclesial_entity_id, relation_type)
index(organization_id, ecclesial_entity_id, status)
~~~

Las solicitudes deben conservar el vínculo de la entidad solicitante:

~~~text
report_requests
- requesting_organization_entity_id
- requesting_organization_id
- requesting_entity_id
~~~

El par requesting_organization_id + requesting_entity_id debe referenciar el
registro correspondiente de organization_entities mediante una clave compuesta
o una restricción equivalente.

Los destinatarios deben conservar el vínculo operativo que los autoriza:

~~~text
report_request_recipients
- recipient_organization_entity_id
- recipient_organization_id
- recipient_entity_id
~~~

No basta con que una entidad aparezca en el directorio.

### 17.2 Relaciones institucionales autorizadas

Se agrega una entidad conceptual para expresar el permiso institucional
concreto sin convertirlo en propiedad:

~~~text
institutional_access_grants
- id
- source_organization_id
- source_entity_id
- target_organization_id
- target_entity_id
- purpose
- allowed_actions
- starts_at
- ends_at
- status
- granted_by
~~~

Restricciones:

- El origen y el destino deben estar vinculados a sus respectivas organizaciones.
- purpose debe ser reports, communications o ambos mediante catálogo controlado.
- allowed_actions no puede incluir administración de usuarios, contabilidad,
  sacramentos o modificación de registros originales salvo autorización futura
  explícita.
- El grant debe estar vigente al publicar la solicitud y al presentar la
  información.
- La relación jurisdiccional por sí sola no crea este grant.

Acciones posibles:

~~~text
request, submit, review, comment, download, communicate
~~~

La validación de base de datos debe impedir que el grant cruce organizaciones
sin una relación explícita. La función server-side debe volver a comprobarlo
antes de publicar, presentar, revisar o descargar.

### 17.3 Versionamiento de presentaciones

report_submissions debe incorporar:

~~~text
id
request_recipient_id
version_number
previous_submission_id nullable
delivery_status
review_status
submission_number
radicado_number nullable
submitted_by nullable
submitted_at nullable
received_at nullable
correction_requested_by nullable
correction_requested_at nullable
is_current
created_at
~~~

Restricciones:

~~~text
unique(request_recipient_id, version_number)
unique(request_recipient_id) where is_current = true
foreign key(previous_submission_id) references report_submissions(id)
~~~

Reglas:

- La primera versión tiene previous_submission_id nulo.
- Una corrección apunta a la versión inmediatamente anterior.
- Una presentación enviada no se actualiza destructivamente.
- Solo una versión es vigente para cada destinatario.
- Al crear una nueva versión, la anterior deja de ser vigente en la misma
  transacción.
- La versión corregida debe conservar el mismo request_recipient_id.
- La corrección debe identificar quién la solicitó y cuándo.

Se separan los estados:

delivery_status:

~~~text
draft, submitted, delivered, failed, withdrawn
~~~

review_status:

~~~text
not_started, in_review, correction_requested, accepted, rejected, closed
~~~

Así se diferencia:

- submitted: el ERP envió la entrega.
- delivered: el servicio recibió técnicamente la entrega.
- received: si se requiere este concepto, debe ser un evento o marca de
  recepción documental posterior, no un sinónimo de entrega técnica.
- in_review: un revisor inició la revisión.
- accepted: la revisión concluyó favorablemente.

La constancia y el radicado se generan al completar la recepción documental,
no simplemente al recibir una petición HTTP.

### 17.4 Motor de plantillas: fuente única

La estructura de una plantilla vive exclusivamente en:

~~~text
report_template_versions
report_template_sections
report_template_fields
report_template_attachments
~~~

report_template_versions.schema no debe existir como duplicado estructural.
Se sustituye por rendering_config y source_policy.

Una versión publicada queda protegida por estas reglas:

- No se actualizan secciones, campos, adjuntos ni validaciones.
- No se cambia su código ni su versión.
- No se elimina físicamente si tiene solicitudes o presentaciones.
- Una modificación crea una nueva versión.
- report_requests referencia report_template_version_id, nunca solo
  report_template_id.
- report_submissions conserva esa referencia indirectamente a través de la
  solicitud y no puede resolver una plantilla vigente diferente.

### 17.5 Destinatarios de comunicaciones

communication_recipients debe diferenciar destinatario institucional de usuario
individual:

~~~text
id
communication_id
recipient_entity_id
recipient_organization_id
recipient_user_id nullable
recipient_scope_id nullable
delivery_status
delivered_at nullable
read_at nullable
archived_at nullable
~~~

Reglas:

- Un destinatario institucional tiene recipient_user_id nulo.
- Un destinatario individual tiene recipient_user_id y recipient_scope_id.
- El usuario individual debe tener una membresía activa en la entidad.
- recipient_scope_id debe pertenecer a recipient_organization_id y
  recipient_entity_id.
- La lectura de un usuario no equivale a lectura institucional.
- La respuesta personal se limita al usuario y la respuesta institucional se
  limita a responsables autorizados de la entidad.
- Los destinatarios se conservan aunque la comunicación se archive.

Índices únicos parciales PostgreSQL:

~~~text
unique(communication_id, recipient_entity_id)
where recipient_user_id is null

unique(communication_id, recipient_entity_id, recipient_user_id)
where recipient_user_id is not null
~~~

Esto evita que los valores NULL permitan destinatarios institucionales
duplicados.

Estados de entrega y lectura son independientes:

~~~text
delivery_status: pending, delivered, failed, archived
read_at: nullable
~~~

Solo un evento read o una confirmación equivalente establece lectura efectiva.

### 17.6 Cadena de licenciamiento

La fuente de verdad comercial queda definida así:

~~~text
contract
  -> contract_entities
  -> subscription
  -> license
  -> license_assignments
  -> entitlements
~~~

service_entitlements no debe ser una segunda concesión independiente. Se
define como una vista o proyección derivada de license, license_assignments y
entitlements:

~~~text
service_entitlements(
  organization_id,
  ecclesial_entity_id,
  application_id,
  module_id,
  license_id,
  valid_from,
  valid_to,
  status
)
~~~

No se debe insertar directamente en esa proyección.

Para verificar un servicio:

1. La suscripción debe pertenecer al contrato.
2. El contrato debe pertenecer a la organización contratante.
3. La entidad debe aparecer como beneficiaria del contrato.
4. La licencia debe estar asignada a esa entidad.
5. El entitlement debe habilitar el módulo.
6. La fecha actual debe estar dentro de la vigencia.
7. El usuario debe tener membresía y permiso sobre la entidad.

Una relación diocesana no reemplaza contract_entities ni
license_assignments.

### 17.7 Archivos y seguridad documental

Los metadatos y el binario se mantienen separados.

Metadatos:

~~~text
document_file_metadata
- id
- storage_provider
- storage_key
- original_name
- detected_mime_type
- declared_mime_type
- size_bytes
- checksum_sha256
- malware_status
- retention_until
- deleted_at
~~~

Reglas mínimas:

- Validar extensión y MIME detectado, no solo el encabezado enviado.
- Mantener lista de MIME permitidos por plantilla o comunicación.
- Aplicar límite de tamaño antes de almacenar.
- Escanear antimalware antes de marcar el archivo disponible.
- Usar almacenamiento privado.
- No exponer storage_key ni URL permanente al navegador.
- Entregar enlaces firmados de corta duración después de autorización.
- Registrar cada descarga, vista o intento denegado.
- Conservar checksum para detectar alteraciones.
- No eliminar un archivo que tenga una presentación, revisión o comunicación
  histórica sin aplicar una política de retención aprobada.

Estados de seguridad del archivo:

~~~text
pending_scan, clean, rejected, quarantined, expired, deleted
~~~

La eliminación debe ser lógica mientras exista retención legal, institucional,
auditoría o relación histórica.

### 17.8 Transiciones válidas

Solicitudes:

~~~text
draft -> published -> open -> closed
draft -> cancelled
open -> cancelled
closed -> archived
~~~

Presentaciones:

~~~text
draft -> submitted -> delivered
delivered -> withdrawn
~~~

Revisiones:

~~~text
not_started -> in_review
in_review -> correction_requested
in_review -> accepted
in_review -> rejected
correction_requested -> closed
~~~

Comunicaciones:

~~~text
draft -> published
published -> archived
published -> cancelled
~~~

Destinatarios:

~~~text
pending -> delivered
pending -> failed
delivered -> archived
~~~

La lectura no cambia el estado de entrega; se registra por separado.

### 17.9 Auditoría

Generan eventos de auditoría:

- Creación, publicación, cancelación y cierre de solicitudes.
- Cambio de destinatarios.
- Publicación o modificación previa de una plantilla.
- Creación, envío, recepción y corrección de una presentación.
- Solicitud y respuesta de correcciones.
- Revisión, aceptación y rechazo.
- Subida, escaneo, descarga y eliminación lógica de archivos.
- Envío, entrega, fallo, lectura y respuesta de comunicaciones.
- Cambios de licencias y entitlements.
- Accesos denegados.

Solo los servicios server-side insertan eventos. Los eventos son append-only.
No se deben almacenar más datos personales o de dispositivo que los necesarios
para seguridad, soporte y trazabilidad.

## 18. Matriz RLS por dominio

| Dominio | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| Solicitudes | Diocesano emisor y destinatario autorizado | Funcionario con grant | Emisor antes de publicar | Solo borrador sin dependencias |
| Destinatarios | Emisor y entidad destinataria | Servicio de publicación | Emisor antes de publicar | No después de publicar |
| Presentaciones | Entidad presentadora y revisor autorizado | ERP autorizado | Solo borrador | Nunca físico |
| Revisiones | Revisor y presentador según estado | Revisor autorizado | Servicio de revisión | Nunca físico |
| Comunicaciones | Emisor y destinatarios | Responsable autorizado | Antes de publicar | Archivo lógico |
| Archivos | Usuario con permiso sobre el registro padre | Servicio autorizado | Metadatos limitados | Retención controlada |
| Auditoría | Auditoría autorizada | Solo servidor | Nunca | Nunca |

Cada política debe comprobar organización, entidad, scope, grant, licencia y
entitlement cuando correspondan.

## 19. Escenarios negativos obligatorios

1. Una organización no publica solicitudes usando una entidad que no administra.
2. Un destinatario no puede presentarse si no está incluido en la solicitud.
3. Una relación diocesana sin grant no permite solicitar información.
4. Una parroquia no puede modificar una presentación ya enviada.
5. Una revisión diocesana no puede editar registros originales de ERP.
6. Una versión publicada de plantilla no puede ser modificada.
7. Una comunicación no puede dirigirse a una institución sin servicio habilitado.
8. Un usuario no puede leer una comunicación individual de otro usuario.
9. Un usuario no puede descargar un archivo sin permiso sobre el registro padre.
10. Una licencia de otra entidad no habilita el módulo.
11. Una membresía suspendida no permite presentar ni revisar.
12. Un evento de auditoría no puede ser actualizado o eliminado.
13. Un pago o ajuste no puede aplicarse a otra organización.
14. Un archivo rechazado por malware no puede marcarse manualmente como limpio.

## 20. Matriz de cambios

| Área | Ajuste |
|---|---|
| Integridad institucional | Vínculos compuestos y grants explícitos |
| Versionamiento | Versiones encadenadas, vigencia única y estados separados |
| Plantillas | Secciones, campos y adjuntos como única fuente estructural |
| Comunicaciones | Índices únicos parciales y scopes de destinatario |
| Licencias | service_entitlements como proyección, no segunda fuente |
| Archivos | Metadatos separados, escaneo, checksum y almacenamiento privado |
| Estados | Transiciones válidas explícitas |
| Auditoría | Eventos append-only por dominio |
| RLS | Matriz de operación y escenarios negativos |

## 21. Dictamen de consistencia

El documento 09 queda consistente con los documentos 01 a 08 bajo estas
condiciones:

- La autonomía de las parroquias se conserva.
- Las relaciones diocesanas no conceden administración.
- La contratación y el licenciamiento son independientes del directorio.
- Las plantillas publicadas son inmutables.
- Las presentaciones enviadas se conservan y se corrigen por versiones.
- La entrega técnica se separa de recepción y revisión.
- Los destinatarios institucionales e individuales se diferencian.
- La habilitación de servicios se deriva de la cadena comercial.
- Los archivos tienen controles de seguridad y retención.
- Las políticas RLS dependen de membresía, scope, grant y licencia.

Decisiones que permanecen pendientes:

1. Comunicación entre instituciones.
2. Propiedad y publicación de plantillas globales.
3. Retención documental.
4. Política de respuestas.
5. Licenciamiento comercial de informes y comunicaciones.
6. Contratación con múltiples beneficiarios.
7. Integración futura con facturación electrónica.

No se debe iniciar la implementación SQL hasta aprobar estas decisiones.
