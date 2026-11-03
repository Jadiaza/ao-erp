# Especificación funcional — intenciones de Misa

**Estado:** especificación funcional en actualización documental. No implementa reglas canónicas, cobros, mensajes, autenticación ni persistencia. Las opciones que requieren decisión se marcan **PENDIENTE DE APROBACIÓN**; no constituyen reglas de operación ni autorización de desarrollo.

## 1. Propósito y alcance

Organizar la recepción, asignación, comunicación y seguimiento de intenciones de Misa dentro de una parroquia, desde la solicitud presencial y, en una fase posterior, el Portal, hasta su cumplimiento o cierre. El proceso conserva referencias claras entre solicitud, ocurrencia de celebración litúrgica, registro financiero, soporte/recibo y asiento contable, sin fusionar sus ciclos.

El sistema registra una solicitud y su seguimiento. No decide por sí mismo la licitud de una intención, cantidad admisible, estipendio, forma de aplicación de una Misa ni norma canónica. Estas reglas pertenecen a la autoridad eclesiástica competente y a las disposiciones locales aprobadas.

## 2. Aplicaciones y módulos involucrados

- **ERP / Liturgia y celebraciones:** fuente maestra de ocurrencias de celebraciones litúrgicas, con identificador estable, fecha/hora y zona horaria, sede, celebrante/responsable y estado; gestiona la relación con las intenciones y la constancia de cumplimiento.
- **ERP / Agenda e infraestructura:** fuente de disponibilidad y reservas de espacios/recursos que sean de su ámbito. Referencia una ocurrencia litúrgica cuando corresponda, sin duplicarla como evento editable. La intención no es una reserva de salón.
- **ERP / Portal del feligrés:** la pantalla actual es demostrativa. Captura pública y seguimiento privado son capacidades de una fase posterior y dependen de un mecanismo de identidad y controles aprobados; la fase demostrativa no acredita identidad ni permite consultar solicitudes reales.
- **ERP / Finanzas y tesorería:** registro de recepción de ofrenda/estipendio cuando la política local lo contempla; movimiento de efectivo y referencia del recibo.
- **ERP / Contabilidad:** registro contable asociado a la entidad contable, periodo y reglas que apruebe la institución. No se crea asiento automáticamente por la existencia de una solicitud.
- **ERP / Comunicaciones:** preparación de confirmaciones, recordatorios o cambios; el envío real no forma parte de esta especificación de prototipo.
- **ERP / Auditoría y trazabilidad:** historial de creación, asignación, cambio, cancelación, consulta o cumplimiento, cuando se implemente trazabilidad efectiva.

**PENDIENTE DE APROBACIÓN — calendario:** arquitectura ERP y responsables de Liturgia/Agenda deben aprobar el contrato de ocurrencias, los datos mínimos y los conflictos bloqueantes. La propuesta técnica es que Liturgia sea fuente maestra de ocurrencias litúrgicas y Agenda de sus espacios/recursos; esto no decide reglas pastorales de aplicación ni cupos por celebración.

**Dueño de los datos:** la parroquia que recibe y gestiona la solicitud. SaaS no es dueño del contenido pastoral ni del dinero parroquial. Diocesano no accede a solicitudes, intenciones nominales ni montos de una parroquia por defecto.

## 3. Actores y responsabilidades

Los perfiles son conceptos funcionales, no roles autenticados implementados. El acceso real se definirá por institución, tarea, sede y necesidad de conocer.

| Actor | Responsabilidad | Información que necesita | Acciones conceptuales |
|---|---|---|---|
| **Feligrés solicitante** | Presentar una intención y recibir seguimiento. | En un canal con identidad verificada, solo sus propios datos, estado y fecha comunicable; un comprobante cuando corresponda. | Presentar solicitud; aportar información; responder a una alternativa si el flujo aprobado lo requiere; solicitar cambio/cancelación. La aceptación como condición de confirmación está **PENDIENTE DE APROBACIÓN**. No consulta terceros ni notas internas. |
| **Secretaría parroquial** | Recibir solicitudes presenciales y dar seguimiento administrativo. | Datos mínimos de contacto, categoría, preferencia de fecha, propuesta/estado y referencia financiera pertinente según permiso. | Registrar y completar solicitud; preparar candidato de fecha/sede/celebrante; documentar comunicación y cambio/cancelación con motivo. La autoridad para aprobar o comprometer asignación queda **PENDIENTE DE APROBACIÓN**. |
| **Párroco o responsable pastoral** | Acompañar y resolver asuntos pastorales dentro de la autoridad que la institución le haya conferido. | Casos que requieren decisión, disponibilidad y datos mínimos necesarios. | Puede revisar propuestas o excepciones según delegación aprobada. Quién tiene autoridad final para aprobar una intención o confirmar su asignación queda **PENDIENTE DE APROBACIÓN** por la autoridad institucional competente; esta tabla no la presume. |
| **Sacerdote celebrante** | Celebrar la Misa y reportar su resultado. | Ocurrencia comprometida según flujo aprobado, referencia e intención con el nivel de detalle necesario e instrucciones litúrgicas pertinentes. | Consultar agenda asignada; informar celebrada, no celebrada o incidencia; solicitar corrección/reasignación. Su aceptación como condición de confirmación queda **PENDIENTE DE APROBACIÓN**. No requiere acceso financiero. |
| **Responsable de tesorería** | Registrar y revisar dinero recibido y su soporte. | Importe, moneda, fecha, método, cuenta/caja y referencia de la solicitud según política. | Registrar recepción/soporte y revisar conciliación; corregir por flujo autorizado. No necesita ver texto pastoral o notas sensibles. |
| **Contabilidad** | Reconocer los movimientos bajo la configuración de su entidad. | Documento fuente, cuenta, periodo, dimensión y referencia aprobada. | Revisar y registrar conforme a reglas de la entidad; consultar sus reportes. No decide la elegibilidad pastoral ni la asignación. El tipo de asiento y comprobante requerido queda sujeto a aprobación local. |

## 4. Categorías y tipos de solicitud

La parroquia podrá configurar categorías, nombres y visibilidad dentro de sus reglas aprobadas. Ejemplos iniciales:

- Por una persona difunta.
- Por una persona viva, familia o comunidad.
- Acción de gracias.
- Necesidad u otra intención pastoral permitida.
- Categoría local adicional autorizada.

El texto libre debe ser opcional y limitado. No solicitar detalles de confesión, historia clínica ni otra información que no sea necesaria para coordinar la celebración. La publicación de una intención en boletín, proyección o listado es una decisión separada y requiere opción/consentimiento explícito; no se publica por defecto.

### Misas gregorianas

Representar una serie como grupo de celebraciones relacionadas, no como una única celebración ni como un sacramento. Antes de habilitarla, la parroquia debe documentar:

- fuente normativa aplicable y versión;
- autoridad competente que aprobó la regla;
- jurisdicción y vigencia;
- duración, continuidad, casos de interrupción y tratamiento de ausencias;
- quién revisa y aprueba excepciones;
- información que se presenta al solicitante.

Esta especificación no fija duración, cantidad, tarifa, disponibilidad, ni una regla universal. Si la política no está aprobada/configurada, el sistema no debe ofrecer una opción que aparente estar autorizada; debe remitir a revisión parroquial.

## 5. Datos funcionales propuestos

| Grupo | Campos conceptuales | Notas |
|---|---|---|
| Identidad de solicitud | ID único; institución; sede; fecha/hora de recepción; canal presencial/Portal; creador y responsable; estado. | Identificador de ERP; no usar nombre/fecha como clave. |
| Solicitante | Nombre de contacto; medio preferido; dato de contacto mínimo; preferencia/consentimiento de comunicación. | Contacto de solicitante no necesariamente es la persona por quien se pide la intención. |
| Intención | Categoría configurable; texto breve opcional; indicación de difusión pública; persona/familia de referencia si procede. | La referencia nominal y texto son información pastoral protegida. |
| Preferencia de celebración | Fecha solicitada, franja horaria, preferencia de sede, si acepta alternativa y notas operativas mínimas. | Fecha solicitada no significa fecha asignada. |
| Asignación | Referencia estable a ocurrencia; fecha/hora local y zona horaria consultadas; sede; celebrante/responsable; estado de asignación; actor, momento, aprobación si aplica y motivo. | Referenciar la fuente maestra; no mantener una copia independiente del horario. Una propuesta no equivale a reserva confirmada. |
| Política local | Tipo de oferta/estipendio; moneda; regla/versión aprobada; autorizador y periodo. | Ningún valor universal prellenado. Las políticas deben ser auditables. |
| Registro financiero | Importe y moneda si aplican; estado; fecha recibida; medio/referencia de pago; caja/cuenta; entidad contable; soporte/recibo. | Sin números de tarjeta; el estado de pago no determina automáticamente estado pastoral. |
| Serie | Identificador de grupo, política autorizada y relación con cada celebración. | Mantener cada celebración y sus resultados por separado. |
| Historial | Actor, fecha/hora, acción, campos cambiados, valor anterior/nuevo, motivo, origen. | No borrar silenciosamente asignaciones o cancelaciones. |

No toda solicitud genera un pago, recibo ni asiento contable. La política local define cómo se registran, pero la relación entre registros conserva identificadores y entidad de origen.

## 6. Estados y transiciones

La solicitud, la asignación, la celebración, las finanzas y la comunicación son dimensiones separadas. Una transición en una dimensión no actualiza automáticamente las demás. La siguiente definición identifica los estados y las bifurcaciones pendientes; no cierra las decisiones institucionales.

### 6.1 Ciclo de solicitud

| Estado | Significado documentado | Salidas posibles y condición |
|---|---|---|
| Borrador | Captura iniciada y aún no recibida por la parroquia. | Envío por canal habilitado → `Recibida`; descarte antes del envío. La habilitación de Portal real queda sujeta a fase 5/7. |
| Recibida | La secretaría ingresó la solicitud presencialmente o un canal autorizado la recibió. | Cuando se determina que falta información → `Pendiente de información`; cuando está lista pero no tiene ocurrencia → `Pendiente de asignación`; la etapa de revisión queda **PENDIENTE DE APROBACIÓN** según §6.2. |
| Pendiente de información | Falta un dato necesario identificado; debe registrarse qué dato y quién dará seguimiento. | Al completar y revisar el dato, continúa a la etapa aprobada de revisión o a `Pendiente de asignación`; retiro por solicitante sigue la política aprobada. |
| Pendiente de asignación | Solicitud lista para buscar ocurrencia, todavía sin compromiso confirmado. | Se prepara una propuesta de asignación o alternativa; cancelación solo con actor y motivo conforme a política aprobada. |
| Alternativa ofrecida | Se comunicó una opción distinta a la preferencia inicial; ofrecerla no reserva por sí solo la ocurrencia. | Aceptación/rechazo y sus plazos son **PENDIENTES DE APROBACIÓN**; la respuesta puede originar una propuesta, retorno a pendiente o cancelación según la regla que se apruebe. |
| Asignada | **PENDIENTE DE APROBACIÓN:** el nombre se conserva como estado candidato, pero no está decidido si significa propuesta, asignación aprobada o compromiso reservado. No debe usarse como transición ejecutable hasta resolver su semántica en §6.3. |
| Confirmada | **PENDIENTE DE APROBACIÓN:** el nombre se conserva como estado candidato; actor, aceptación requerida y condición de compromiso no están definidos. No debe presentarse como confirmación efectiva hasta resolver §6.3. |
| Requiere reprogramación | El arreglo anterior no puede mantenerse o la celebración tuvo una incidencia que requiere decisión posterior. | Nueva propuesta y confirmación bajo regla aprobada, cancelación o cierre autorizado. El resultado de celebración y la situación financiera mantienen sus propios estados. |
| Cumplida | Un celebrante/responsable autorizado informó que la celebración ocurrió. | Cierre administrativo cuando la política local lo requiera; correcciones posteriores quedan registradas y autorizadas. |
| Cancelada | La solicitud no continuará, con motivo y responsable registrados. | Terminal salvo reapertura autorizada y trazada. Los efectos financieros no se deducen de esta transición. |
| Cerrada | El seguimiento del caso concluyó conforme a una regla local. | Reapertura excepcional solo bajo autorización y con historial íntegro. Criterios de cierre son **PENDIENTES DE APROBACIÓN**. |

Una transición válida deberá especificar estado de origen, evento, actor autorizado, precondiciones, datos/motivo requerido, destino y evidencia de historial. Hasta cerrar las decisiones marcadas, los estados candidatos y sus transiciones no son reglas de producción.

### 6.2 `En revisión` — definición pendiente

El documento anterior usaba `En revisión` como salida de `Recibida` sin definir actor ni entrada/salida. En esta actualización no se selecciona una alternativa. La semántica y adopción de ese nombre quedan **PENDIENTES DE APROBACIÓN** por producto ERP, secretaría y párroco/responsable pastoral.

| Alternativa pendiente | Alcance posible | Consecuencia que debe considerarse |
|---|---|---|
| Estado explícito | Un actor autorizado inicia una revisión registrada; al concluir se deriva a información pendiente o asignación pendiente, con condición y motivo definidos. | Hace visible una etapa/cola, pero añade transiciones y requiere delimitar qué se revisa y quién la atiende. |
| Tarea o indicador, sin nuevo estado | La solicitud permanece `Recibida`; tarea separada indica responsable y finalización. | Mantiene el ciclo de solicitud más compacto, pero exige gestionar y mostrar tareas fuera de su estado. |
| Evento de historial, sin estado/tarea | Se registra que hubo revisión y la solicitud pasa directamente a su siguiente estado operativo. | Evita una etapa persistente, pero no proporciona una cola de revisión. |

Hasta aprobación, el flujo no puede transicionar a `En revisión`. La implementación no debe inferir cuál alternativa se eligió.

### 6.3 Asignación: disponibilidad, propuesta, aprobación y confirmación

Estos conceptos no son equivalentes:

1. **Disponibilidad:** lectura de una ocurrencia y sus conflictos en la fuente correspondiente en un momento dado; no reserva ni garantiza que siga disponible.
2. **Selección/propuesta:** candidato de ocurrencia, sede y celebrante/responsable; no constituye compromiso.
3. **Aprobación:** autorización de una excepción o asignación por el actor que determine la política parroquial. Si se exige, debe guardarse actor, momento y motivo.
4. **Confirmación efectiva:** requiere actor y condiciones aprobados, nueva comprobación de conflicto y registro del compromiso/reserva en la fuente maestra cuando exista esa capacidad. La notificación al solicitante es un estado aparte y su fallo no altera automáticamente la asignación.

**PENDIENTE DE APROBACIÓN:** parroquia/producto y autoridad pastoral deben elegir si basta confirmación interna, si se requiere aceptación explícita del solicitante, si interviene además el celebrante, o qué combinación local aplica. La decisión debe definir rechazo, falta de respuesta, vencimiento y liberación de una propuesta provisional. La selección del celebrante por sí sola no significa aprobación ni confirmación.

En un prototipo local sin persistencia solo puede mostrarse una secuencia demostrativa. No se debe afirmar que se reservó una ocurrencia compartida ni que se evitó una asignación simultánea. En una fase persistente, la verificación y el compromiso deberán protegerse contra conflictos concurrentes.

### 6.4 Estados independientes

- **Celebración:** pendiente, celebrada, no celebrada o incidencia por revisar son estados demostrativos de resultado; solo el celebrante/responsable autorizado podrá registrar el resultado cuando exista autorización efectiva. La transición pastoral que sigue a no celebrada/incidencia es **PENDIENTE DE APROBACIÓN**; no actualiza finanzas automáticamente.
- **Finanzas:** no aplica, pendiente de recepción, recibido por verificar, registrado y conciliado describen etapas distintas del dinero y su registro. Corrección, reverso y eventual reembolso son eventos diferentes; actores, efectos y procedimiento están **PENDIENTES DE APROBACIÓN** por autoridad institucional y Tesorería/Contabilidad.
- **Comunicación:** no requerida, preparada, pendiente de envío, enviada o fallida/no verificable. Mientras no haya integración aprobada, todo estado de envío es demostrativo; fallo o reintento no cambia el estado pastoral.
- **Asignación:** puede distinguir candidato/propuesta, aprobada, comprometida/confirmada, en conflicto o cancelada, pero el catálogo definitivo y el mapeo con `Asignada`/`Confirmada` están **PENDIENTES DE APROBACIÓN**. No se debe codificar una equivalencia por inferencia.

## 7. Necesidades mínimas de calendario y agenda

### 7.1 Fuente y alcance

La necesidad mínima de 2B es consultar una ocurrencia de celebración identificable y vigente con: identificador estable, fecha/hora local y zona horaria, sede, celebrante/responsable, estado y referencias a conflictos definidos. La consulta debe poder repetirse antes del compromiso. También se necesita saber si la ocurrencia cambió o se canceló desde la propuesta.

**Propuesta técnica sujeta a aprobación de arquitectura:** Liturgia conserva la fuente maestra de ocurrencias litúrgicas; Agenda conserva la fuente de reservas y disponibilidad de espacios/recursos de su ámbito y referencia la ocurrencia cuando aplique. La intención referencia la ocurrencia: no crea una copia independiente del evento. Una reserva de salón no es una celebración y la intención no es una reserva de espacio.

La disponibilidad de sacerdote, sede, equipo y espacios puede tener reglas distintas. **PENDIENTE DE APROBACIÓN:** responsables de Liturgia/Agenda y autoridad pastoral deben definir qué conflictos bloquean, cuáles solo advierten y quién puede resolverlos. La regla sobre cantidad de intenciones por celebración no se fija aquí.

### 7.2 Dependencias y etapas

- **2A — captura y ciclo inicial:** puede diseñarse y demostrarse con datos ficticios sin calendario, asignación real, persistencia ni seguimiento privado del Portal. Solicitudes sin fecha deben poder representarse.
- **3A — calendario mínimo:** debe estar definido y validado antes de iniciar la asignación 2B. Incluye las ocurrencias y consultas mínimas indicadas arriba, no el calendario funcional completo.
- **2B — disponibilidad/asignación:** referencia 3A, distingue propuesta de compromiso y vuelve a validar cambios/conflictos antes de la confirmación aprobada.
- **3B — ampliación de calendario:** recurrencias, excepciones, equipos, recursos, reservas de espacios y publicaciones amplían la misma fuente creada en 3A; no se establece un segundo calendario.

El plan fija la secuencia: fase 1 → 2A → 3A → 2B → 3B → fase 4. Ningún fixture o adaptador temporal con dos listas de eventos se considerará calendario compartido ni fuente de disponibilidad productiva.

### 7.3 Reglas de consulta y modificación

1. Una fecha solicitada es una preferencia, no una fecha asignada. Si no hay ocurrencia compatible, la solicitud puede quedar pendiente o recibir una alternativa según política aprobada; no se cancela automáticamente.
2. Cambio de sede, horario o celebrante exige consultar la fuente maestra de nuevo y registrar actor, motivo, valores anteriores/nuevos y comunicación separada.
3. La confirmación distingue fecha solicitada, opción propuesta y compromiso aprobado. El Portal solo recibe una vista autorizada y, cuando sea real, después de un mecanismo de identidad aprobado.
4. Las series gregorianas requieren política aprobada y revisión por cada ocurrencia; una serie parcial no se muestra completa. Su duración, continuidad, excepciones y asignación están **PENDIENTES DE APROBACIÓN** de autoridad competente.
5. La hora se interpreta en la zona de la sede. La conversión y los cambios de zona deben probarse al introducir recurrencias y persistencia.

## 8. Ofrendas, estipendios, recibos y contabilidad

- Distinguir **ofrenda voluntaria**, **estipendio sujeto a política local**, donación general, pago por otro servicio y movimiento contable. No son categorías intercambiables.
- No establecer montos mínimos/máximos, límites de intención por Misa, tarifas, obligaciones ni plazo de aplicación sin fuente normativa identificada y aprobación de autoridad competente.
- Permitir registrar que una solicitud no lleva importe o que la recepción está pendiente, cuando la política local así lo permita.
- Mantener importe, moneda, fecha, método/referencia, caja/cuenta y entidad contable separados del texto de intención.
- Un recibo de muestra no es automáticamente factura, documento tributario ni certificado. La forma válida depende de configuración legal local y posibles integraciones.
- En una fase de pagos futura no se almacenan datos de tarjeta. Se requiere confirmación verificable del proveedor, gestión de duplicados/reintentos y conciliación; iniciar pago no equivale a pago recibido.
- Contabilidad recibe referencias o registros conforme a reglas aprobadas y autorización explícita. No crear asientos automáticos solo por crear, asignar o celebrar una intención.

## 9. Pantallas y vistas por actor

Las vistas deben aprovechar las rutas existentes; esta especificación no crea rutas nuevas.

| Vista | Ubicación funcional sugerida | Contenido/acciones |
|---|---|---|
| Bandeja de solicitudes | Liturgia, sección Intenciones | Buscar/filtrar por estado, fecha, canal y categoría; identificar pendientes sin exponer datos sensibles en listados. Acceso de secretaría/responsables autorizados. |
| Captura presencial | Liturgia, acción de secretaría | Registro inicial, solicitante, intención mínima, preferencia de fecha/sede, contacto y decisión de difusión pública. No depende del Portal ni de una ocurrencia disponible; duplicados solo se advierten, nunca se fusionan automáticamente. |
| Disponibilidad y asignación | Ocurrencias de Liturgia y recursos pertinentes de Agenda | Consultar ocurrencia y estado desde la fuente de Liturgia; contrastar conflictos de recursos en Agenda; preparar propuesta y alternativas sin duplicar calendario ni afirmar reserva. |
| Ficha de intención | Detalle desde bandeja/calendario | Historial, estado, preferencia/asignación, comunicaciones, referencias financieras según permiso y cambios trazables. |
| Panel del celebrante | Vista de Liturgia/sacristía | Celebraciones asignadas y datos mínimos de intención; acción de indicar celebrada/no celebrada/incidencia. No mostrar importes ni datos personales innecesarios. |
| Vista de tesorería | Finanzas y tesorería | Pendientes/recibidos, soporte, importe/moneda/cuenta/entidad y recibo; ocultar notas pastorales y categoría nominal si no son necesarias. |
| Solicitar intención en Portal | Fase posterior del Portal | Formulario claro y estado de recepción, solo después de aprobar identidad, privacidad y alcance. No mostrar calendarios privados ni registros ajenos. En la fase demostrativa solo se permiten fixtures ficticios y no se afirma recepción real. |
| Seguimiento del solicitante | Portal personal, fase posterior | Estado propio, fecha comunicable, mensajes autorizados y comprobante cuando aplique. Requiere mecanismo seguro aprobado e implementado; no forma parte del prototipo local de fase 2. |
| Reportes | Liturgia/Tesorería según permiso | Conteos por periodo/categoría/estado, cumplimiento, tiempos de asignación y sumas autorizadas por cuenta/entidad. No mostrar textos nominales por defecto ni consolidar entidades. |

## 10. Excepciones que el flujo debe contemplar

- Sin ocurrencia disponible para la fecha solicitada; conservar pendiente o presentar alternativa conforme a regla aprobada. No cancelar automáticamente.
- Ocurrencia modificada/cancelada, celebrante ausente o cambio de sede/horario; invalidar la propuesta afectada, volver a consultar la fuente maestra, registrar cambio/motivo y seguir la regla de reasignación y confirmación que se apruebe.
- Solicitud duplicada probable; marcar para revisión, nunca fusionar automáticamente.
- Información incompleta, contacto inválido o solicitante sin correo/teléfono.
- Solicitud de publicación pública sin consentimiento; mantenerla privada.
- Ofrenda no aplicable, no recibida, recibida en efectivo, pendiente de verificación o corregida.
- Celebración cancelada/no celebrada; mantener resultado y motivo separados del estado de solicitud y finanzas. Reprogramar, cancelar o cerrar según decisión autorizada, sin reversar dinero automáticamente.
- Serie gregoriana sin continuidad o con celebración interrumpida; bloquear cierre automático y remitir a revisión local competente.
- Registro por entidad/sede/periodo diferente; evitar atribución a la institución equivocada.
- Error de comunicación; conservar el estado de solicitud/asignación y registrar el estado de comunicación por separado, sin asumir notificación.
- Conflicto de celebrante, sede o recurso entre consulta y compromiso; volver a validar y bloquear o advertir según política aprobada; no confirmar en silencio. Un fixture no puede probar exclusión concurrente.
- Cambios posteriores al cierre; corrección autorizada con historial, no sustitución sin evidencia.

## 11. Permisos conceptuales y privacidad

- **Feligrés:** crea y consulta únicamente su solicitud mediante un método de acceso seguro que deberá diseñarse; una URL pública no equivale a verificación de identidad.
- **Secretaría:** administra el caso dentro de su alcance parroquial; ve contacto y datos operativos necesarios, no información financiera global ni notas de acompañamiento no requeridas.
- **Párroco/responsable delegado:** puede revisar propuestas y excepciones según delegación institucional aprobada; autoridad final para aprobar/confirmar queda **PENDIENTE DE APROBACIÓN**. El acceso se limita a la institución/sede autorizada.
- **Celebrante:** recibe agenda e intención mínima de la celebración asignada; puede registrar resultado e incidencia, no consultar cartera ni datos de otros casos.
- **Tesorería:** ve importe, estado, referencia y cuenta necesarios para registrar/conciliar; no ve texto pastoral que no requiere.
- **Contabilidad:** ve soporte, dimensión y entidad contable necesarias para su registro; no decide el contenido pastoral.
- **Diocesano:** no tiene vista de intenciones nominales por el simple hecho de ser diócesis. Un intercambio agregado requeriría autorización, propósito y alcance específicos.
- **SaaS:** no accede al contenido operativo de la parroquia para gestionar contrato/licencia; cualquier soporte técnico debe seguir un procedimiento separado y trazable aprobado.

El texto de intención, asociación con personas y consultas son datos pastorales restringidos. No almacenar detalles de confesión o información clínica. Los reportes usan agregados por defecto; el acceso a información nominal se justifica por tarea. Todo acceso real requiere autenticación, autorización y registros efectivos, hoy inexistentes.

## 12. Criterios de aceptación

Los criterios se verifican por fase. Cuando una regla está **PENDIENTE DE APROBACIÓN**, su criterio es comprobar que no se presenta como habilitada ni se codifica por inferencia.

### Fase 2A — captura y ciclo local demostrativo

1. **Dado** el formulario de captura presencial, **cuando** se registra una solicitud ficticia válida, **entonces** queda distinguido el canal, la fecha de recepción y la preferencia (incluida la opción sin fecha), sin crear una celebración ni un movimiento financiero.
2. **Dado** que falta información marcada como necesaria, **cuando** se guarda la demostración, **entonces** se muestra el dato faltante y un estado/etapa que esté aprobado; si la semántica de `En revisión` sigue pendiente, ninguna transición lo utiliza.
3. **Dado** un cambio o cancelación de ejemplo, **cuando** se registra, **entonces** la vista muestra actor, momento, motivo y valores anteriores/nuevos; no elimina el historial.
4. **Dado** una posible solicitud duplicada, **cuando** coincide con otra de muestra, **entonces** se marca para revisión sin fusionar ni borrar automáticamente.
5. **Dado** una comunicación de demostración fallida, **cuando** se presenta el caso, **entonces** el estado de comunicación cambia sin cambiar automáticamente el estado pastoral.

### Fase 3A/2B — calendario y asignación demostrativos

6. **Dado** un calendario mínimo 3A validado, **cuando** se consulta una ocurrencia, **entonces** la respuesta presenta referencia, fecha/hora y zona, sede, celebrante/responsable y estado desde una fuente única.
7. **Dado** que no existe ocurrencia compatible, **cuando** se busca asignar, **entonces** la solicitud permanece pendiente o muestra alternativa solo conforme a reglas aprobadas; no se asigna ni cancela automáticamente.
8. **Dado** un candidato de asignación, **cuando** cambia la ocurrencia o aparece un conflicto antes del compromiso, **entonces** se vuelve a consultar la fuente y no se muestra como confirmado.
9. **Dado** que actor o condición de confirmación continúan **PENDIENTES DE APROBACIÓN**, **cuando** se ejecuta el prototipo, **entonces** no se afirma aprobación, aceptación del solicitante, reserva compartida ni confirmación efectiva.
10. **Dado** un cambio de sede, hora o celebrante, **cuando** se propone una reasignación, **entonces** se conservan los valores previos, actor, motivo y referencia; comunicación y estado pastoral permanecen separados.

### Fases 5–7 y capacidades sujetas a políticas

11. El seguimiento real del Portal solo muestra la solicitud propia después de aprobar e implementar identidad/autorización; antes de esa fase, cualquier ejemplo usa datos ficticios y no simula un control efectivo.
12. Celebrante, secretaría, Tesorería y Contabilidad reciben vistas diferenciadas según matriz aprobada; las pruebas de seguridad real se ejecutan solo cuando exista autorización implementada.
13. Finanzas no cambia por creación, asignación, cumplimiento o cancelación de una solicitud. El asiento requiere reglas y referencia aprobadas de su entidad contable.
14. Una serie gregoriana no se ofrece como función autorizada sin fuente, jurisdicción, versión y aprobación competente; no se fijan cantidad, duración ni importe por defecto.
15. Reportes muestran periodo, sede y entidad según diccionario aprobado; los datos nominales no se incluyen por defecto y no se consolidan entidades contables automáticamente.
16. Recibos de demostración se identifican como tales y no se presentan como factura, recibo fiscal ni certificado; una acción de prototipo no envía mensajes, cobra dinero ni modifica libros sacramentales.

## 13. Pruebas funcionales previstas

- Captura presencial válida, datos incompletos y solicitud sin fecha en fase 2A; captura real desde Portal solo en su fase posterior autorizada.
- Categorías configurables y rechazo de una categoría deshabilitada.
- Sin ocurrencia, alternativa de muestra sin compromiso, cambios de celebrante/sede y revalidación contra 3A.
- Choque de agenda, cancelación de evento único y cambio de zona horaria.
- Cambio/cancelación por solicitante y por parroquia con historial y motivo.
- Cumplimiento, no celebrada, incidencia y posterior corrección autorizada.
- Ofrenda opcional y estados de recepción/conciliación independientes del estado pastoral.
- Duplicado posible marcado para revisión sin fusión automática.
- Serie gregoriana deshabilitada sin política aprobada; serie de muestra incompleta que no se cierre como cumplida.
- Pruebas de privacidad con autorización efectiva: feligrés A no ve B; celebrante no ve datos financieros; Tesorería no ve notas pastorales; Diocesano no ve solicitudes parroquiales. En prototipo solo se valida presentación ficticia, no seguridad real.
- Navegación, accesibilidad, móvil, errores/estados vacíos, TypeScript, pruebas de rutas y build de la aplicación.

## 14. Decisiones requeridas antes de implementar

1. ¿Qué autoridad competente aprueba cada tipo, restricción y política de Misas gregorianas para cada entidad/jurisdicción? **PENDIENTE DE APROBACIÓN.**
2. ¿Qué categorías son editables por la parroquia y cuáles deben ser comunes/configuradas por país?
3. ¿La confirmación es interna, requiere aceptación del solicitante, requiere aceptación del celebrante o combina esas condiciones? ¿Quién autoriza, qué canales se admiten y cómo vencen/liberan propuestas? **PENDIENTE DE APROBACIÓN.**
4. ¿Cómo se distingue una ofrenda voluntaria del estipendio y de otros ingresos en cada país/entidad?
5. ¿Qué documento se entrega en cada caso: comprobante interno, recibo de donación, factura u otro; qué norma local determina formato/serie?
6. ¿Qué información puede publicarse en boletín/Portal y cómo se obtiene consentimiento revocable?
7. ¿Qué contacto y mecanismo verifican identidad para seguimiento del Portal sin exponer información privada y en qué fase se habilitan? **PENDIENTE DE APROBACIÓN.**
8. ¿Quién puede informar cumplimiento, cancelar, reprogramar y aprobar una corrección después del cierre?
9. ¿Qué parámetros de agenda son obligatorios, quién define conflictos bloqueantes frente a advertencias y cómo se relacionan Liturgia (ocurrencias) y Agenda (recursos)? **PENDIENTE DE APROBACIÓN.**
10. ¿Qué reportes se requieren y qué campos nominales deben quedar excluidos por defecto?

11. ¿`En revisión` será estado, tarea/indicador o evento de historial? ¿Quién lo activa, qué revisa y cómo sale? **PENDIENTE DE APROBACIÓN.**
12. ¿Qué cardinalidad se adopta entre solicitudes, intenciones, ocurrencias y series, y qué relación de una o varias solicitudes por celebración admite la autoridad? **PENDIENTE DE APROBACIÓN; no fijar cupos técnicos.**
13. ¿Qué condiciones llevan de `Cumplida` a `Cerrada`, cuándo se permite reapertura y quién la autoriza? **PENDIENTE DE APROBACIÓN.**
14. ¿Qué métricas, fórmulas, filtros y niveles de detalle integran los reportes? **PENDIENTE DE APROBACIÓN.**

Estas decisiones quedan abiertas; hasta su aprobación, cualquier interacción debe continuar en modo demostrativo y sin reglas universales codificadas. La propuesta de roles, estados y fuente de calendario en este documento delimita requisitos técnicos, no concede autoridad pastoral ni habilita acceso productivo.
