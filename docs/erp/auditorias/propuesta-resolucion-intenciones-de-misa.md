# Propuesta de resolución de hallazgos — Intenciones de Misa

**Estado:** propuesta documental para revisión y aprobación. No modifica la especificación funcional ni autoriza desarrollo.

## 1. Resumen ejecutivo

Se revisaron íntegramente el [informe de auditoría](revision-intenciones-de-misa.md), el [plan de implementación funcional](../plan-implementacion-funcional.md) y la [especificación de Intenciones de Misa](../procesos/intenciones-de-misa.md). La arquitectura asigna correctamente el proceso parroquial a A&O ERP y mantiene separadas las responsabilidades de A&O SaaS y A&O Diocesano. También separa, como principio, la solicitud, la celebración, las finanzas y la comunicación.

El proceso todavía no debe pasar a implementación completa. Los tres bloqueos críticos afectan decisiones centrales: el significado y recorrido de `En revisión`, el calendario del que dependería una asignación y el momento en que una asignación se considera confirmada. Los documentos permiten proponer soluciones técnicas, pero no elegir por la parroquia quién tiene autoridad para confirmar, qué compromiso se comunica ni qué políticas pastorales o económicas rigen.

La recomendación es actualizar primero ambos documentos, con aprobaciones funcionales explícitas. Para conservar el orden general sin duplicar agendas, se propone que la fase 2 se divida en captura/seguimiento y asignación; que una capacidad mínima de calendario litúrgico sea una dependencia previa de la asignación; y que la fase 3 amplíe esa misma fuente. La selección de actor y condición de confirmación, así como la semántica de `En revisión`, deben quedar aprobadas por responsables parroquiales y de producto antes de cerrar la especificación.

**Dictamen de esta propuesta:** **APTO PARA PASAR A UNA FASE DE ACTUALIZACIÓN DOCUMENTAL**, no para implementar el proceso. La actualización solo debe consolidar las opciones que aprueben las personas competentes. Las alternativas de este informe no son decisiones adoptadas.

## 2. Alcance y criterio de análisis

Se contrastaron las fases, dependencias, hitos y pruebas del plan con los apartados de actores, datos, estados, disponibilidad, finanzas, pantallas, excepciones, permisos y aceptación de la especificación. También se consideró la situación técnica descrita por la auditoría: Liturgia y Agenda usan conjuntos demostrativos separados; el Portal no captura ni verifica solicitudes de Misa; Tesorería y Contabilidad son estáticas; y `FormDialog` no persiste formularios.

Este informe no define normas canónicas, categorías obligatorias, estipendios, límites, tarifas, requisitos fiscales ni políticas institucionales. Tampoco supone que las pantallas demostrativas actuales sean fuentes operativas.

## 3. Bloqueos críticos

### C-01 — Estado `En revisión`

**Apartado afectado:** especificación, §6 “Estados y transiciones”; relacionado con §10 “Excepciones”, §14 “Decisiones requeridas” y fase 2 del plan.

**Vacío y consecuencias.** `Recibida` permite pasar a `En revisión`, pero el catálogo no define ese estado, su responsable, su condición de entrada ni su salida. No se puede saber si es una etapa obligatoria, una bandeja de trabajo o una etiqueta libre. Esto impide implementar y probar una máquina de estados sin interpretación local.

**Alternativas para decisión de producto y parroquia:**

1. **Estado explícito de revisión.** Secretaría u otro responsable autorizado lo asigna al iniciar la evaluación. Debe definirse la información mínima que se revisa y qué evento permite salir: por ejemplo, pasar a `Pendiente de información` cuando falta un dato, o a `Pendiente de asignación` cuando la solicitud está lista. También deben definirse los motivos, campos editables, actor autorizado y registro de historial. Ventaja: hace visible una cola de trabajo. Consecuencia: añade transiciones, criterios y potencialmente tiempos de atención que deberán administrarse.
2. **No crear un estado; usar tarea o indicador de revisión.** La solicitud permanece `Recibida` mientras una tarea asignada registra quién la está revisando. Al terminar, la solicitud pasa al estado operativo que corresponda. Ventaja: mantiene el estado para describir el ciclo de la solicitud. Consecuencia: requiere definir y mostrar por separado la tarea, su responsable y su cierre.
3. **Eliminar la transición y la noción de revisión del flujo.** `Recibida` pasa directamente a información pendiente o asignación pendiente; la revisión se registra como evento del historial si se necesita trazabilidad. Ventaja: flujo más simple. Consecuencia: no se obtiene una bandeja de revisión explícita.

**Propuesta técnica:** elegir una sola alternativa y reflejarla en un catálogo y una matriz de transiciones con estado inicial, evento, actor, precondiciones, datos requeridos, destino y motivo. No usar `En revisión` como estado genérico para bloquear o resolver casos heterogéneos.

**Aprobación necesaria:** responsable de producto ERP, secretaría parroquial y párroco/responsable pastoral. La arquitectura puede validar consistencia y trazabilidad, pero no seleccionar la práctica operativa parroquial.

### C-02 — Dependencia del calendario

**Apartado afectado:** plan, fases 2 y 3; especificación, §2, §7 y §9.

**Contradicción y consecuencias.** La fase 2 promete disponibilidad y asignación; la especificación consulta horarios de Liturgia y Agenda y requiere una fuente única; pero el calendario común se construye en fase 3. En el estado actual del prototipo las pantallas emplean fixtures distintos, por lo que no existe una fuente capaz de confirmar disponibilidad. Copiar eventos de una pantalla a otra produciría calendarios divergentes, y un fixture estático no garantiza reserva ni evita asignaciones simultáneas.

**Capacidad mínima que necesita la asignación:** consultar ocurrencias de celebraciones con fecha y zona horaria, sede y horario; conocer su estado; identificar el celebrante o responsable cuando aplique; consultar conflictos definidos por la institución; devolver una referencia estable a la ocurrencia; y volver a validar disponibilidad antes de confirmar. La política de cupo de intenciones por celebración queda fuera de la definición técnica hasta que la autoridad competente la resuelva. La agenda de espacios también debe consultarse cuando un recurso sea requisito, pero una intención no equivale a reservar un salón.

**Alternativas de secuenciación:**

1. **Adelantar una base mínima de calendario a la fase 2.** La fase 2A implementa captura, estados iniciales e historial sin asignación. Antes de la fase 2B se entrega el contrato y la capacidad mínima de ocurrencias de Liturgia; 2B realiza disponibilidad y asignación contra esa fuente. La fase 3 amplía la misma fuente con recurrencias, excepciones, equipos, espacios y publicación. No se crea una segunda agenda. Es la alternativa recomendada para conservar una entrega temprana de Intenciones sin posponer indefinidamente la asignación.
2. **Mantener completa la fase 3 antes de asignar.** La fase 2 se limita a captura, clasificación y seguimiento sin prometer disponibilidad ni asignación. Se mueve la asignación a una entrega posterior a fase 3. Es clara en dependencias, pero cambia significativamente el alcance y orden aprobados de la fase 2.
3. **Definir una interfaz funcional temporal.** Intenciones consulta una abstracción de disponibilidad mientras Liturgia/Agenda se preparan. Solo es aceptable si se define desde el inicio cuál módulo conserva la fuente maestra y la interfaz no mantiene calendario, horarios ni reservas duplicadas. Con los datos actuales separados, un adaptador de demostración no sería una disponibilidad real ni una confirmación; presentaría riesgo de falsa certeza.

**Propuesta técnica:** adoptar la alternativa 1 como propuesta de secuenciación y describir el contrato mínimo antes de la fase 2B. Es una recomendación arquitectónica, no una aprobación. El calendario litúrgico de ERP debe ser fuente maestra de ocurrencias de celebración; Agenda debe aportar disponibilidad/reserva de recursos que sean de su ámbito, referenciando la ocurrencia y sin copiarla como evento editable independiente. La propiedad de eventos no litúrgicos debe permanecer en Agenda.

**Aprobación necesaria:** arquitectura ERP y responsables de Liturgia y Agenda para fuente, datos mínimos y regla de conflictos; responsable de producto ERP para reordenar/partir entregables. La autoridad pastoral debe aprobar las reglas de asignación y cualquier límite de aplicación.

### C-03 — Condición de confirmación de la asignación

**Apartado afectado:** especificación, §6 “Estados y transiciones”, §7 “Disponibilidad y asignación”, §9 “Pantallas” y §14; fase 2 del plan.

**Vacío y consecuencias.** `Asignada` puede significar celebración propuesta o reservada; `Confirmada` puede depender de aceptación del solicitante o de una decisión interna. No se sabe si el sistema comunica una propuesta o un compromiso. Tampoco se distingue disponibilidad consultada, selección de celebrante, aprobación de excepción y confirmación efectiva.

**Distinciones técnicas necesarias:**

1. **Disponibilidad:** resultado de consultar la fuente maestra en un momento dado. Es informativo y puede cambiar; por sí solo no reserva.
2. **Propuesta:** combinación candidata de ocurrencia, sede y celebrante que todavía no constituye compromiso.
3. **Aprobación:** autorización de una persona con responsabilidad definida cuando la política exige revisar excepción, cambio o asignación. Debe quedar asociada a su motivo y alcance.
4. **Confirmación efectiva:** transición posterior a una nueva comprobación de conflictos, con autorización del actor designado, registro de la decisión y reserva/compromiso en la fuente de calendario si la arquitectura ofrece esa capacidad. La comunicación al solicitante es un estado separado; un envío fallido no debe deshacer silenciosamente la asignación.

En el prototipo local, una pantalla solo puede representar estos pasos de forma demostrativa. No debe afirmar que un horario está reservado o confirmado contra una agenda compartida si no existe persistencia y control de concurrencia. En una implementación persistente, la validación y el compromiso deben evitar que dos operaciones concurrentes confirmen la misma capacidad incompatible.

**Decisiones funcionales alternativas:**

- Confirmación interna por secretaría autorizada o responsable pastoral, seguida de notificación al solicitante. Tiene menos pasos, pero la institución debe definir quién puede comprometer la celebración y cuándo se informa.
- Confirmación institucional más aceptación explícita del solicitante. Distingue oferta de aceptación, pero exige definir vencimiento, rechazo, ausencia de respuesta y liberación de la asignación provisional.
- Aceptación del celebrante como condición adicional. Puede ser necesaria según la organización local, pero agrega otro actor y una transición; no debe imponerse universalmente.

Estas alternativas pueden combinarse según política local, pero los documentos deben declarar una ruta aprobada y sus excepciones antes de desarrollar la confirmación.

**Aprobación necesaria:** párroco o autoridad pastoral competente y responsable de producto/parroquia; arquitectura valida el mecanismo de disponibilidad y compromiso. La selección del sacerdote no equivale automáticamente a aprobación o confirmación.

## 4. Otros hallazgos: discrepancias importantes y menores

### I-01 — Solicitud, celebración, finanzas y comunicación

La separación conceptual ya está declarada, pero falta la matriz que conecte cambios entre dimensiones. Definir eventos y consecuencias por separado: por ejemplo, una celebración no realizada puede llevar a revisión de la solicitud, pero no debe modificar por sí sola la recepción financiera. Una cancelación pastoral tampoco debe revertir dinero automáticamente.

**Propuesta:** mantener ciclos independientes y documentar únicamente relaciones explícitas: qué evento de celebración ofrece opciones para el caso, quién decide reprogramar/cancelar y cómo se conserva el estado financiero. No diseñar una sola máquina de estados compuesta ni una etiqueta común.

**Aprobación:** producto y responsables pastorales; Tesorería/Contabilidad para las consecuencias monetarias.

### I-02 — Cardinalidades y series

Los documentos no determinan si una solicitud contiene una o más intenciones, si varias solicitudes pueden referenciar una celebración, ni cómo se relaciona una serie con solicitudes y ocurrencias. No se debe fijar por diseño una cuota por Misa ni asumir una relación uno a uno.

**Propuesta:** actualizar el modelo conceptual con cardinalidades aprobadas para solicitud, intención, asignación, ocurrencia y serie. Mantener las reglas de cupo/aceptación como política configurada, no como constante técnica, solo si la autoridad competente aprueba que deban configurarse.

**Aprobación:** autoridad eclesiástica competente para la práctica pastoral; producto y arquitectura para expresar la relación sin pérdida de historial.

### I-03 e I-04 — Portal, identidad y permisos

La fase 2 del plan contempla seguimiento por solicitante, mientras la fase 7 posterga Portal público y formularios y la fase 5 reserva la implementación de permisos reales. La maqueta actual no identifica al solicitante de manera segura. Una vista local de ejemplo no debe presentarse como acceso controlado.

**Propuesta:** separar expresamente: (a) captura presencial y seguimiento interno demostrativo en fase 2; (b) flujo visual de Portal con datos ficticios solo si se necesita validar experiencia; y (c) solicitudes, identificación y seguimiento reales únicamente en fase 7, una vez implementado y verificado el mecanismo de acceso aprobado en fase 5. El Portal no debe bloquear la captura presencial.

**Aprobación:** responsable de producto/parroquia para alcance de fase 2; responsable institucional de privacidad y arquitectura para el método de identidad, consentimiento y visibilidad. No usar datos reales antes de completar controles.

### I-05 e I-06 — Registro financiero y recibos

`Reversado/corregido` mezcla operaciones distintas; “recibo” no determina documento, emisor ni evento de emisión. Una solicitud, una ofrenda recibida, un movimiento verificado, un comprobante contable y un recibo no deben tratarse como una sola entidad ni inferirse unos de otros.

**Propuesta:** documentar eventos separados de corrección, reverso y eventual reembolso, preservando referencias e historial; definir si cada fase solo muestra datos ficticios o integra un movimiento. Especificar tipo, emisor, momento y alcance del recibo antes de que una pantalla pueda representarlo como documento válido. Ningún asiento se crea solo por solicitud o asignación.

**Aprobación:** Tesorería y Contabilidad de la entidad; autoridad institucional; asesoría contable, jurídica o tributaria local cuando corresponda. Ofrenda y estipendio conservan las distinciones de la especificación. No se fijan importes, moneda, tarifa ni tratamiento fiscal aquí.

### I-07 — Casos sin responsable definido

Faltan responsables y salidas para datos incompletos, duplicados probables, alternativas sin respuesta, vencimientos y reapertura.

**Propuesta:** agregar a la matriz de flujo, para cada caso, actor que revisa, acción siguiente, motivo/evidencia, estado resultante y si existe plazo local. La detección de posible duplicado debe ser una señal revisable, nunca una fusión automática. No establecer vencimientos por defecto.

**Aprobación:** secretaría y párroco/responsable pastoral; producto para traducir la política a estados/tareas.

### I-08 — Informes

Los reportes no tienen diccionario de métricas, periodo, filtros, nivel nominal ni permisos.

**Propuesta:** definir cada indicador con propósito, unidad, regla de inclusión/exclusión, fecha de corte, filtros por sede/periodo/entidad, nivel de detalle y perfil destinatario. Separar estadísticas de solicitudes/celebraciones de informes económicos, que corresponden a Tesorería/Contabilidad.

**Aprobación:** producto y responsables parroquiales; Tesorería/Contabilidad para indicadores económicos; privacidad para datos nominales.

### I-09 — Pruebas de fiabilidad

Las pruebas previstas no cubren todos los reintentos, duplicados e interacciones concurrentes que el plan contempla para futuras integraciones.

**Propuesta:** para un prototipo local, comprobar doble acción, repetición y estados demostrativos sin atribuir garantías de servidor. Para una fase con persistencia o proveedores, añadir idempotencia, timeout, respuesta duplicada, reintento y conflictos concurrentes antes de liberar esa función.

**Aprobación:** no requiere una política pastoral; arquitectura y responsables técnicos definen el alcance por fase. Los efectos económicos de reintentos sí requieren aprobación de Tesorería/Contabilidad.

### M-01 a M-04 — Ajustes menores

- **M-01, término “intención”:** distinguir en etiquetas y datos una solicitud nominal, el texto litúrgico general y la celebración. El campo libre actual en datos de celebración no debe interpretarse como una solicitud.
- **M-02, nombres de categorías:** dejar su vocabulario y visibilidad a revisión pastoral; el diseño técnico puede admitir etiquetas configurables.
- **M-03, consentimiento y publicaciones:** registrar consentimiento por publicación y su retiro para usos futuros; la política sobre material ya emitido requiere decisión institucional, no una regla retroactiva asumida.
- **M-04, zona horaria:** mantener zona de sede y hora local en asignaciones; probar cambios de zona y recurrencias en el entregable de calendario. La captura sin fecha puede avanzar sin resolver recurrencias.

Estos ajustes pueden incorporarse al actualizar los documentos y refinarse en interacción, siempre que no oculten decisiones institucionales pendientes.

## 5. Responsabilidades entre módulos y aplicaciones

| Capacidad | Responsable funcional propuesto | Límite que debe conservarse |
|---|---|---|
| Solicitud, intención e historial del caso | ERP / Liturgia | La solicitud puede existir sin celebración asignada; datos nominales parroquiales no pasan a otra aplicación por defecto. |
| Ocurrencias de celebraciones litúrgicas | ERP / Liturgia | Una sola fuente maestra de horarios litúrgicos; asignaciones referencian la ocurrencia, no la duplican. |
| Espacios y recursos institucionales | ERP / Agenda | La reserva de espacio es distinta de la celebración; Agenda referencia la ocurrencia si hay dependencia. |
| Experiencia del solicitante | ERP / Portal | Captura/seguimiento real espera mecanismo de identidad y controles de fase 5/7; ninguna consulta de terceros. |
| Recepción y comprobantes de dinero | ERP / Tesorería | Flujo financiero separado del pastoral; políticas locales aprobadas; sin cobro real en el alcance actual. |
| Reconocimiento contable | ERP / Contabilidad | Pertenece a la entidad contable correspondiente; no hay asientos automáticos ni consolidación implícita. |
| Confirmaciones y avisos | ERP / Comunicaciones | Preparación no equivale a envío; estado de entrega independiente del estado de solicitud. |
| Producto, licencias y operación global | A&O SaaS | Sin administración del contenido pastoral o de dinero parroquial. |
| Seguimiento territorial | A&O Diocesano | Sin acceso nominal a solicitudes parroquiales por adscripción canónica solamente. |

La propuesta mantiene la independencia comercial de SaaS y la relación canónica diocesana. Ninguna actualización documental debe habilitar intercambio interaplicación ni acceso automático.

## 6. Decisiones pendientes y responsables

| Decisión por aprobar | Responsable que debe resolverla | Requisito para cerrar |
|---|---|---|
| `En revisión`: estado, tarea o evento; actor, entradas y salidas | Producto ERP, secretaría y párroco/responsable pastoral | Opción elegida y matriz de transición completa. |
| Alcance de fase 2 y calendario mínimo antes de asignar | Producto ERP, arquitectura, Liturgia y Agenda | Fuente maestra, campos, conflictos, revalidación y orden de entregables. |
| Quién aprueba, compromete y confirma una asignación | Párroco/autoridad pastoral y responsable de producto | Ruta aprobada entre disponibilidad, propuesta, aprobación, confirmación y comunicación. |
| Cardinalidades de solicitudes, intenciones, celebraciones y series | Autoridad pastoral competente; producto y arquitectura | Diagrama conceptual, sin cuotas técnicas no aprobadas. |
| Reglas de Misas gregorianas y autoridad normativa | Autoridad eclesiástica competente de la jurisdicción; asesoría canónica cuando proceda | Fuente/versionado, ámbito y aprobación documentados; capacidad deshabilitada hasta entonces. |
| Categorías, publicación, consentimiento y material ya difundido | Responsable pastoral y responsable institucional de privacidad | Vocabulario, visibilidad y tratamiento del retiro definidos. |
| Alcance del Portal de fase 2 frente a fase 7 | Producto ERP y parroquia | Separación demostración local / función pública real, sin prometer identidad verificada inexistente. |
| Reprogramación, cancelación, no celebración, reapertura y corrección | Párroco/responsable pastoral y secretaría | Matriz de consecuencias entre ciclos y motivos/actores. |
| Ofrenda, estipendio, registro, corrección, reverso, recibo e impuesto | Autoridad institucional y Tesorería/Contabilidad; asesoría local aplicable | Política por entidad/país aprobada; sin valores universales. |
| Informes, detalle nominal y accesos | Producto, responsable pastoral, Tesorería/Contabilidad y privacidad | Diccionario de métricas, filtros y permisos. |
| Garantía de reservas concurrentes en producción | Arquitectura y equipo técnico; validación funcional de Liturgia/Agenda | Contrato técnico de commit/reserva y pruebas concurrentes; no confundir con mock. |

## 7. Cambios propuestos en los documentos originales

No se han aplicado. Después de aprobación, se propone:

### 7.1 `docs/erp/procesos/intenciones-de-misa.md`

1. **§2 y §7:** identificar Liturgia como fuente maestra de ocurrencias litúrgicas y Agenda como fuente de recursos/espacios; establecer una referencia entre ambas, sin duplicar calendarios.
2. **§6:** resolver `En revisión` según la alternativa aprobada; añadir matriz verificable de transiciones para solicitud, asignación, celebración, finanzas y comunicación. Mantener esas dimensiones separadas.
3. **§6–§7:** precisar disponibilidad no reservada, propuesta, autorización y confirmación efectiva; incluir nueva comprobación de conflicto antes del compromiso y actor/condición aprobados.
4. **§5 y §7:** definir cardinalidades conceptuales de solicitud, intención, asignación, ocurrencia y serie solo después de aprobación pastoral; no codificar un cupo universal.
5. **§2, §9, §11–§12:** etiquetar claramente captura y seguimiento demostrativos/locales frente a Portal real; diferir identidad verificada, control de acceso real y datos reales a las fases autorizadas.
6. **§6, §8 y §10:** separar corrección, reverso y reembolso; añadir la matriz de efectos entre solicitud, celebración y finanzas; documentar recibos por tipo y emisor cuando exista aprobación local.
7. **§9 y §12–§13:** convertir los criterios en casos con precondición, actor, acción, resultado y evidencia; dividir pruebas demostrativas, funcionales persistentes y de seguridad/integración.
8. **§9 y §14:** definir reportes mínimos y sus campos/filtros; mantener pendientes las decisiones de acceso nominal.
9. **§4, §10 y §14:** mantener Misas gregorianas inhabilitadas hasta registrar fuente, autoridad, jurisdicción y vigencia; no introducir duración, continuidad, tarifa ni excepciones universales.

### 7.2 `docs/erp/plan-implementacion-funcional.md`

1. **Fase 2:** dividir explícitamente en 2A (captura, clasificación, ciclo inicial e historial demostrativo) y 2B (disponibilidad/asignación contra calendario mínimo aprobado). Indicar qué interacción puede completarse sin persistencia.
2. **Dependencias:** hacer que 2B dependa de un entregable mínimo de calendario de Liturgia; mantener la fase 3 como ampliación de esa misma fuente, no como segundo calendario.
3. **Fase 2 y fase 7:** quitar la ambigüedad sobre Portal: experiencia visual con fixtures puede validarse aparte; captura/seguimiento real se pospone a fase 7 tras controles de fase 5.
4. **Fases 2, 5, 6 y 7:** distinguir pruebas de comportamiento visual de permisos reales; marcar qué dinero/documento es demostrativo, qué necesita política local y qué requiere integración.
5. **Hitos B–E:** añadir aprobación de estados, confirmación y calendario mínimo al hito B; reservar políticas gregorianas/económicas para autoridad competente y seguridad/Portal para sus hitos correspondientes.
6. **Pruebas:** asignar idempotencia, reintentos, seguridad real y concurrencia a las fases con persistencia/integraciones; para el prototipo, limitar afirmaciones a lo que puede verificarse localmente.

La secuencia propuesta preserva la arquitectura de los tres productos y el principio del plan de una sola fuente por tipo de dato.

## 8. Dependencias y orden de trabajo recomendado

1. **Aprobación funcional breve:** resolver alternativa de `En revisión`, autoridad/aceptación de asignación y alcance del Portal demostrativo. Registrar decisiones y responsables.
2. **Aprobación arquitectónica:** acordar fuente maestra Liturgia, relación con Agenda y capacidad mínima de calendario; incorporar este entregable como dependencia de 2B.
3. **Resolución pastoral pendiente:** acordar cardinalidades y práctica de aplicación de intenciones con autoridad competente; dejar las reglas especiales sin habilitar hasta que existan fuentes aprobadas.
4. **Política financiera y documental:** Tesorería/Contabilidad y autoridad institucional definen qué puede registrarse, recibirse y documentarse localmente. No es necesario bloquear captura sin importe si esa capacidad está definida como demostrativa y separada.
5. **Actualización controlada de ambos documentos:** incorporar solo decisiones aprobadas, identificar lo que sigue pendiente y reconciliar fases, criterios y pruebas.
6. **Nueva auditoría documental:** verificar el grafo de estados, dependencias, permisos por etapa, alcance Portal y criterios. Solo luego solicitar autorización de implementación para el alcance que haya quedado listo.
7. **Implementación por entregables aprobados:** iniciar con captura/datos ficticios si está autorizada; no afirmar asignación confirmada hasta que fuente y compromiso estén implementados y probados.

No es necesario esperar a resolver todos los asuntos futuros de pagos o comunicaciones para actualizar el diseño de captura local, siempre que dichos alcances queden explícitamente excluidos y no se simulen como procesos reales. Las funciones productivas que dependen de esas decisiones permanecen bloqueadas.

## 9. Criterios para una nueva auditoría

La siguiente revisión debería comprobar que:

- cada estado usado existe y tiene significado, actor, evento de entrada, condición, salidas y terminalidad/reapertura definidos;
- disponibilidad, propuesta, aprobación, confirmación, reserva y comunicación no se confunden;
- el plan coloca cada dependencia antes de la entrega que la consume y conserva una sola fuente de calendario;
- el alcance de Portal está separado por etapa y no presenta un mock como autenticación, privacidad o envío real;
- cardinalidades y series cuentan con decisión competente, sin imponer cupos ni reglas no aprobados;
- cambios de celebración tienen consecuencias pastorales explícitas y no mutan automáticamente el estado financiero;
- ofrenda, estipendio, movimiento, recibo y asiento tienen responsables, eventos y referencias distintos, bajo política local aprobada;
- los informes indican fórmulas, periodo, filtros, entidad y tratamiento de información nominal;
- cada criterio de aceptación es comprobable con precondición, actor, acción, resultado y evidencia, y se asigna a la fase correcta;
- las pruebas de prototipo no se presentan como controles reales de autorización, persistencia, concurrencia o integración;
- el texto mantiene los límites ERP/SaaS/Diocesano y no habilita acceso cruzado automático.

## 10. Dictamen

### **APTO PARA PASAR A UNA FASE DE ACTUALIZACIÓN DOCUMENTAL**

Los hallazgos permiten preparar cambios documentales concretos y acotados. La arquitectura general es consistente; no se identificó una razón para cancelar el proceso ni para moverlo a SaaS o Diocesano. Antes de actualizar los originales deben aprobarse las decisiones funcionales sobre revisión, calendario y confirmación, y debe dejarse claro qué capacidades son solo demostrativas.

Este dictamen **no** convierte ninguna alternativa en política aprobada y **no** autoriza implementar. Misas gregorianas, reglas pastorales, ofrendas/estipendios, comprobantes válidos, acceso real al Portal, permisos productivos y efectos contables continúan sujetos a sus autoridades y fases correspondientes.
