# Segunda auditoría — Intenciones de Misa

**Alcance:** auditoría documental de consistencia y preparación por fases. No se modificó código ni se implementaron funciones.

## 1. Documentos revisados

1. [`docs/erp/plan-implementacion-funcional.md`](../plan-implementacion-funcional.md)
2. [`docs/erp/procesos/intenciones-de-misa.md`](../procesos/intenciones-de-misa.md)
3. [`docs/erp/auditorias/revision-intenciones-de-misa.md`](revision-intenciones-de-misa.md)
4. [`docs/erp/auditorias/propuesta-resolucion-intenciones-de-misa.md`](propuesta-resolucion-intenciones-de-misa.md)
5. [`docs/erp/auditorias/registro-actualizacion-intenciones-de-misa.md`](registro-actualizacion-intenciones-de-misa.md)

Se contrastaron los hallazgos originales, las alternativas propuestas, los cambios documentales y los criterios de aceptación actuales.

## 2. Resultado de los bloqueos críticos originales

### C-01 — `En revisión`: no resuelto para el ciclo completo

La especificación ya no transiciona silenciosamente a `En revisión`; describe tres alternativas y prohíbe usar la transición antes de su aprobación. Esto corrige la contradicción documental y permite que una captura limitada no dependa de ese estado.

La semántica no está decidida: puede ser estado, tarea/indicador o evento de historial. Por tanto, **C-01 permanece abierto para todo flujo que incluya revisión, pendientes, asignación o cierre**. La fase 1 no lo necesita. Una entrega 2A solo puede evitar el bloqueo si excluye explícitamente el estado y no construye una bandeja o transición de revisión bajo otro nombre.

### C-02 — Calendario: orden corregido; condiciones de diseño aún abiertas

El plan y la especificación coinciden ahora en la secuencia **1 → 2A → 3A → 2B → 3B → 4**. 3A ofrece la capacidad mínima consumida por 2B y 3B amplía esa misma fuente. Esto resuelve el orden contradictorio y evita, en el diseño propuesto, introducir un calendario duplicado.

No queda resuelto el contrato operativo: la fuente maestra de Liturgia y la relación con Agenda siguen marcadas como propuesta pendiente de aprobación; los conflictos bloqueantes/advertencias y la disponibilidad de sacerdote, sede, equipo y espacios tampoco están definidos. En consecuencia, **2B no está listo**. La fase 3A solo puede autorizarse después de que Arquitectura, Liturgia y Agenda validen esos elementos. La redacción secuencial por sí sola no crea una fuente de datos ni resuelve esos criterios.

### C-03 — Confirmación de asignación: no resuelto

La documentación separa disponibilidad, selección/propuesta, aprobación, compromiso y comunicación, y advierte que una maqueta no reserva una ocurrencia. Sin embargo, quién puede aprobar/confirmar, si se necesita aceptación del solicitante o del celebrante, y cómo se manejan rechazo, vencimiento y liberación continúan pendientes.

**C-03 sigue bloqueando 2B y cualquier pantalla que afirme una fecha como confirmada o reservada.** No bloquea una captura local sin asignación ni una propuesta visual rotulada como tal.

## 3. Validación de la secuencia

| Fase | Entradas y resultado documentado | Evaluación de criterios y dependencia |
|---|---|---|
| **1. Datos demostrativos coherentes** | Parte de definición funcional aprobada; entrega contexto institucional ficticio, IDs, sedes, periodos y datos de ejemplo coherentes. | Los criterios son verificables mediante comparación de nombres/IDs, rotulado de muestras y revisión por entidad/periodo. Puede desarrollarse sin decidir `En revisión`, confirmación, reglas económicas, Misas gregorianas, pagos, Portal o comunicaciones, siempre que los datos sean ficticios y no se presenten como registros oficiales. |
| **2A. Captura y ciclo inicial demostrativo** | Depende de fase 1. Entrega lista/detalle, captura presencial e historial demostrativos. | La captura sin fecha y la distinción entre solicitud e intención son verificables. El criterio de estado/cambio/cancelación no está totalmente cerrado: `En revisión`, actor de cancelación, etapas posteriores y reglas de cierre siguen pendientes. Puede aprobarse solo una porción de captura local delimitada; no el ciclo completo descrito. |
| **3A. Calendario mínimo** | Depende de fase 1 y de decisiones de producto/arquitectura/Liturgia. Entrega ocurrencias consultables, identificador, hora/zona, sede, celebrante/responsable, estado y consulta de conflictos. | Se puede comprobar presencia y referencia de los campos. No se puede verificar si un conflicto bloquea o solo advierte hasta aprobar la regla. La autoridad de fuente maestra también debe validarse. **No lista para construir sin esa revisión previa.** |
| **2B. Disponibilidad y asignación** | Depende de 3A, reglas de disponibilidad y autoridad/condiciones de compromiso aprobadas. | Pruebas de referencia, revalidación y propuesta pueden verificarse; confirmación, alternativa aceptada, reasignación comprometida y reserva efectiva dependen de decisiones pendientes. **No apta actualmente.** |
| **3B. Ampliación de calendario** | Depende de 3A; añade recurrencias, excepciones, recursos, reservas, vista por sede y publicación. | Recurrencias y excepciones pueden tener pruebas técnicas, pero reglas de recursos/conflictos y publicación deben especificarse por responsable. No debe desarrollar una fuente paralela. Puede planificarse, pero no se considera lista como paquete completo con la información actual. |
| **4. Ciclo sacramental** | Depende de fases 1 y 3; maneja preparación, celebración, libro y certificado. | La separación entre esos conceptos es comprobable; las reglas documentales, privacidad y permisos siguen teniendo aprobaciones propias. No forma parte del alcance autorizable de esta auditoría de Intenciones. |

La secuencia evita la dependencia temporal original. No elimina la necesidad de aprobación antes de 3A ni convierte a 2B en implementable. La fase 4 depende de la disponibilidad de la fase 3 completa como indica el plan; no debe interpretarse como que basta el calendario mínimo 3A.

## 4. Alcance implementable sin decisiones pendientes

### Fase 1

**Puede autorizarse de forma independiente.** Puede organizar un conjunto consistente de datos ficticios: institución demo, sedes, periodos, IDs y cifras ilustrativas. No debe crear registros reales, políticas pastorales/económicas, fuentes maestras operativas, permisos productivos ni relaciones automáticas con diócesis o SaaS. El criterio de aceptación es coherencia interna y rotulado inequívoco de demostración.

### Subconjunto estrecho de fase 2A

Una captura presencial local puede ser técnicamente independiente si recibe autorización separada y se limita a:

- datos ficticios;
- interacción temporal o demostrativa, sin persistencia ni uso productivo;
- registrar visualmente una solicitud con canal, categoría de muestra, contacto ficticio y preferencia opcional de fecha;
- distinguir solicitud de ocurrencia litúrgica y de dinero;
- permitir revisar la captura en la misma demostración, sin afirmar que el caso quedó oficialmente recibido o seguido por la parroquia;
- no usar `En revisión`, `Asignada`, `Confirmada`, `Cumplida` o `Cerrada` como transiciones operativas;
- no exponer seguimiento de Portal, envío de mensajes, cobro, recibos válidos, aceptación de alternativas ni reserva de calendario.

La especificación 2A actual es más amplia: incluye ciclo inicial, estados, cancelación/cambio e historial. Esos comportamientos requieren acordar actores, resultados y transiciones. Antes de autorizar el 2A completo se necesita una revisión funcional breve que delimite el subconjunto de estados permitido y qué significa “recibida” en un prototipo sin persistencia.

## 5. Restricciones obligatorias para cualquier prototipo inicial

1. Etiquetar datos y acciones como demostrativos; usar solo datos ficticios.
2. No afirmar persistencia, recepción oficial, disponibilidad vigente, reserva o confirmación efectiva.
3. No codificar una alternativa de `En revisión` ni mapear por inferencia `Asignada`/`Confirmada` a estados de asignación.
4. Mantener separadas solicitud/intención, ocurrencia/celebración, finanzas y comunicación. Un cambio en uno no actualiza otro automáticamente.
5. No introducir importes, cupos, tarifas, obligaciones, reglas gregorianas ni tratamiento civil/tributario.
6. No conectar Portal real, autenticación, correo, pagos, bases de datos o servicios externos.
7. No dar acceso a SaaS o Diocesano a datos parroquiales ni usar adscripción canónica como permiso.
8. No interpretar el campo textual genérico `intention` de celebraciones demostrativas como una solicitud procesable.
9. Mantener formularios del módulo aislados de cambios que puedan alterar `FormDialog` u otros componentes compartidos.

## 6. Arquitectura y datos

- **Liturgia/Agenda:** el modelo propuesto evita duplicación al hacer que Intenciones referencie una ocurrencia y Agenda gestione recursos. La elección de fuente maestra todavía no está aprobada; fixtures separados actuales no satisfacen el contrato 3A.
- **Estados:** se separan los ejes principales, pero siguen existiendo `Asignada`/`Confirmada` como estados candidatos de solicitud y un eje de asignación con conceptos similares. Debe decidirse si son estados propios, proyecciones o solo estados de asignación para evitar dos fuentes de verdad.
- **Finanzas:** Tesorería registra recepciones/soportes bajo política local; Contabilidad reconoce según entidad y configuración. No hay integración ni asiento automático. Corrección, reverso, reembolso y comprobante requieren política competente.
- **Datos personales:** el diseño prevé minimización y vistas por función, pero no hay autenticación/autorización real en el prototipo. Los criterios de privacidad visual no prueban seguridad.
- **ERP/SaaS/Diocesano:** el flujo se mantiene en ERP. SaaS no administra contenido pastoral ni dinero parroquial; Diocesano no recibe solicitudes nominales automáticamente. No se identifica dependencia técnica entre aplicaciones.
- **Demostrativo/productivo:** la documentación distingue fixtures y fuente operativa, pero la implementación debe reiterar esa diferencia en UI y acciones; un mock no puede probar concurrencia, reserva o control de acceso.

## 7. Criterios de aceptación y vacíos

Los criterios de 2A (captura ficticia válida/sin fecha, ausencia de efectos financieros, duplicado sin fusión) son comprobables. El criterio de mostrar “un estado/etapa aprobado” aún no nombra un conjunto cerrado aprobado y debe reducirse o especificarse antes de codificar. Los criterios sobre actor que cambia/cancela, historial y reapertura dependen de una matriz de responsabilidades todavía pendiente.

Los criterios de 3A permiten probar la existencia de ocurrencias y referencias. “Conflictos configurados” y “revalidar” no bastan para determinar el resultado esperado de cada conflicto hasta que se apruebe la tabla de conflictos y resolución.

Los criterios de 2B (alternativa aceptada, confirmación, reasignación y compromiso) dependen de decisiones explícitas pendientes y no son verificables normativamente. Deben conservarse como bloqueados hasta contar con actor, precondición, acción, resultado y evidencia aprobados.

Los criterios de Portal, seguridad, finanzas, Misas gregorianas e informes son verificables solo después de aprobar sus políticas y construir las capacidades de fases 5–7. No son criterios de la primera entrega.

## 8. Hallazgos nuevos

1. **Frontera de 2A insuficientemente precisa:** el nombre “ciclo inicial e historial” y sus criterios de cambio/cancelación exceden el conjunto de estados que puede ejecutarse sin decidir actores y transición de revisión. Se recomienda especificar un subconjunto limitado previo a autorizar 2A.
2. **Duplicidad potencial de estados de asignación:** `Asignada`/`Confirmada` se mantienen en ciclo de solicitud como candidatos, mientras la asignación tiene catálogo separado. Aunque se marca pendiente, se requiere resolver si el estado del caso refleja un estado de asignación o corre en paralelo.
3. **Disponibilidad no equivale a capacidad de reserva:** 3A puede exponer ocurrencias y una segunda consulta, pero la exclusión ante dos confirmaciones simultáneas requiere persistencia/operación atómica. El plan correctamente limita esa afirmación a fases futuras; debe permanecer fuera de la aceptación 2B demostrativa.
4. **2A sin persistencia frente a “recibida”:** la especificación debe decidir si el término describe una captura local simulada o una recepción institucional efectiva. Mientras persista el prototipo local, debe rotularse como demostración y no como registro oficialmente presentado.
5. **Pruebas de 3B y fase 4:** se mencionan publicación, recursos y privacidad, pero sus políticas de publicación/consulta no están definidas; esas pruebas deben condicionarse a aprobaciones de fases 5/7 cuando corresponda.

## 9. Decisiones que requieren aprobación humana

| Decisión | Responsable sugerido | Impacto |
|---|---|---|
| Alternativa de `En revisión`, actor y transición | Producto ERP, secretaría parroquial y párroco/responsable pastoral | Cierra el ciclo completo de solicitud; no hace falta para fase 1. |
| Significado de “recibida” en el prototipo y estados permitidos en 2A | Producto ERP y parroquia piloto | Permite criterios de 2A verificables sin insinuar registro oficial. |
| Quién aprueba/confirma; aceptación del solicitante/celebrante; vencimiento/liberación | Autoridad pastoral/institucional competente y producto | Bloquea confirmación y 2B. |
| Liturgia como fuente maestra, contrato 3A y relación con Agenda | Arquitectura ERP, responsables de Liturgia y Agenda | Bloquea implementación de 3A y 2B. |
| Conflictos bloqueantes/advertencias y recursos requeridos | Liturgia/Agenda y autoridad pastoral | Bloquea resultados de disponibilidad/confirmación. |
| Cardinalidad de solicitud/intención/ocurrencia/serie | Autoridad eclesiástica competente, producto y arquitectura | Bloquea un modelo de asignación completo; no fijar cupos sin aprobación. |
| Política gregoriana, categorías y publicación | Autoridad eclesiástica/pastoral competente y responsable de privacidad | Bloquea esas capacidades, no la captura ficticia básica. |
| Ofrenda/estipendio, recibos, contabilidad y efectos de reverso/reembolso | Autoridad institucional, Tesorería/Contabilidad y asesoría local cuando aplique | Bloquea flujos monetarios productivos; no captura demo sin importes. |
| Identidad/seguimiento Portal y permisos reales | Institución, privacidad y arquitectura | Bloquea Portal real y uso de datos personales. |

## 10. Dictamen final

### **APTO CON RESTRICCIONES**

La documentación permite iniciar trabajo por fases, pero no implementar el proceso completo ni las fases 2B/3A como si las decisiones abiertas estuvieran resueltas. El bloqueo de calendario se corrigió en el orden del plan, no en la aprobación del contrato operativo. `En revisión` y la autoridad/condición de confirmación continúan pendientes.

### Recomendación concreta

**Puede autorizarse la fase 1 de forma independiente**, limitada a datos completamente ficticios, coherentes y marcados como demostración.

**No se recomienda autorizar todavía la fase 2A completa tal como está descrita.** Si se desea iniciar captura después de fase 1, autorizar primero un subentregable 2A acotado a formulario presencial demostrativo y revisión local temporal, sin ciclo de estados, asignación, cancelación operativa, historial productivo, Portal real ni efectos financieros. Ese alcance debe quedar aceptado por producto/parroquia antes de codificarse.

**No aptas aún:** 3A hasta aprobación del contrato de calendario; 2B hasta aprobación de conflictos y confirmación; 3B hasta definiciones de recursos/recurrencias/publicación aplicables; y Portal, dinero o políticas especiales hasta sus aprobaciones y controles.

El dictamen no autoriza implementación. La fase 1 y cualquier subconjunto de 2A requieren autorización expresa separada.
