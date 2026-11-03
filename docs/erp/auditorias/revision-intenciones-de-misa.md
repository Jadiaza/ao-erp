# Auditoría de preparación — Intenciones de Misa

**Fecha:** 3 de noviembre de 2026  
**Alcance:** revisión documental y técnica de solo lectura. No se modificaron especificaciones originales ni código.  
**Dictamen:** **NO APTO PARA IMPLEMENTAR el proceso completo** hasta resolver los hallazgos críticos de estados, calendario y asignación. Se puede preparar trabajo posterior de baja fidelidad o prototipado sin persistencia, pero no presentarlo como ciclo funcional ni fijar las decisiones pendientes.

## 1. Documentos y fuentes revisados

1. [Plan de implementación funcional](../plan-implementacion-funcional.md), con atención a los límites de productos, las fases 1–3, dependencias, hitos y pruebas.
2. [Especificación de Intenciones de Misa](../procesos/intenciones-de-misa.md), secciones de actores, datos, estados, disponibilidad, finanzas, pantallas, excepciones, permisos y aceptación.
3. Fuentes actuales de ERP relacionadas: [navegación](../../../apps/erp/src/data/navigation.ts), [Liturgia](../../../apps/erp/src/components/modules/liturgy-screen.tsx), [Agenda](../../../apps/erp/src/components/modules/institutional-agenda-screen.tsx), [Portal del feligrés](../../../apps/erp/src/components/modules/parishioner-portal-screen.tsx), [Tesorería](../../../apps/erp/src/components/modules/treasury-screen.tsx), [Contabilidad](../../../apps/erp/src/components/modules/accounting-screen.tsx), [FormDialog](../../../apps/erp/src/components/modules/form-dialog.tsx) y datos ficticios de [`pastoral-demo.ts`](../../../apps/erp/src/data/pastoral-demo.ts), [`institutional-demo.ts`](../../../apps/erp/src/data/institutional-demo.ts), [`services-demo.ts`](../../../apps/erp/src/data/services-demo.ts) y [`economy-demo.ts`](../../../apps/erp/src/data/economy-demo.ts).

## 2. Resultado general

La distribución de responsabilidades es consistente: la intención parroquial corresponde a ERP; Liturgia organiza la celebración; Agenda coordina calendario y recursos; el Portal ofrece la experiencia del solicitante; Tesorería registra dinero recibido; Contabilidad reconoce registros de su entidad bajo reglas aprobadas. La especificación también protege datos pastorales y evita reglas canónicas y económicas universales.

Sin embargo, la definición **no está lista para implementar el proceso completo**. Hay una transición a un estado no declarado; el calendario del que depende la asignación no tiene fuente única ni aparece como dependencia de la fase 2; y la transición de Asignada a Confirmada está expresamente pendiente. Además, el prototipo actual contiene celebraciones con un campo de texto libre llamado `intention`, pero no tiene una entidad/flujo separado de solicitud de intención, ni una agenda compartida entre Liturgia y Agenda.

Las decisiones sobre Misas gregorianas, estipendios, ofrendas y acceso al Portal correctamente quedan abiertas. Esas capacidades no pueden activarse como reglas ni procesos reales hasta recibir las aprobaciones correspondientes.

## 3. Coherencia entre los documentos

### Coherencia lograda

- **Límite ERP/SaaS/Diocesano:** ambos asignan las solicitudes y datos parroquiales a ERP; SaaS no administra el contenido pastoral y Diocesano no recibe solicitudes nominales automáticamente.
- **Finanzas:** el plan y la especificación evitan asientos automáticos, consolidación implícita y reglas universales de dinero.
- **Aprobación previa:** el plan exige aprobar actores, estados y políticas antes de interacción local; la especificación enumera decisiones abiertas antes de implementar.
- **Secuencia sacramental:** se preserva la diferencia entre solicitud, celebración, partida y certificado.

### Inconsistencias y dependencias

1. **Estado sin definición:** la especificación permite pasar de `Recibida` a `En revisión`, pero `En revisión` no aparece en el catálogo de estados. No hay definición de responsable, acción de entrada, salida ni criterio de cierre para ese estado. [Proceso, §6](../procesos/intenciones-de-misa.md)
2. **Calendario como dependencia no resuelta:** la fase 2 incluye disponibilidad y asignación; la especificación obtiene disponibilidad de Liturgia y Agenda y exige una fuente única. El plan construye el calendario común en la fase 3, posterior a Intenciones. La implementación no sabe qué calendario consultar en fase 2. [Plan, fases 2–3](../plan-implementacion-funcional.md) · [Proceso, §7 y §9](../procesos/intenciones-de-misa.md)
3. **Confirmación sin regla de transición:** `Asignada` puede ser propuesta o reservada; `Confirmada` puede depender de aceptación del solicitante o de confirmación interna. El documento reconoce que esto debe decidirse antes del desarrollo, pero el plan de fase 2 requiere asignación y seguimiento. [Proceso, §6 y §14](../procesos/intenciones-de-misa.md)
4. **Portal adelantado respecto del plan:** la fase 2 contempla seguimiento del solicitante y la especificación permite captura/consulta desde Portal; el plan posterga Portal público, formularios y seguimiento privado a fase 7. La fase 2 debe decir si incluye solo captura interna, un mock local o Portal funcional posterior. [Plan, fases 2 y 7](../plan-implementacion-funcional.md) · [Proceso, §2 y §9](../procesos/intenciones-de-misa.md)
5. **Permisos aceptados como criterios antes de la fase de permisos:** las pruebas negativas por actor requieren controles efectivos, pero el plan ubica la implementación real de privacidad y permisos en fase 5 y excluye autenticación del prototipo. Los criterios deben distinguir demostración visual de control real. [Plan, fases 2 y 5](../plan-implementacion-funcional.md) · [Proceso, criterios 8–9](../procesos/intenciones-de-misa.md)

## 4. Hallazgos clasificados

### CRÍTICO — impide iniciar la implementación del flujo completo

| ID | Hallazgo y evidencia | Efecto | Resolución requerida |
|---|---|---|---|
| C-01 | `Recibida` puede pasar a `En revisión`, pero dicho estado no está definido en la lista ni en las pruebas. [Proceso, §6](../procesos/intenciones-de-misa.md) | No se puede implementar una máquina de estados coherente ni verificar qué acción permite continuar el caso. | Aprobar catálogo completo de estados, propietario, evento de entrada/salida, transiciones permitidas y motivos; eliminar o definir `En revisión`. |
| C-02 | La fase 2 depende solo de datos demostrativos coherentes, pero exige disponibilidad desde Liturgia/Agenda; el plan coloca el calendario común en fase 3. [Plan, fases 2–3](../plan-implementacion-funcional.md) | La asignación no tiene fuente fiable de fecha, sede y celebrante. El prototipo podría duplicar calendarios existentes o mostrar disponibilidad falsa. | Decidir si el calendario mínimo pasa a ser dependencia previa de fase 2, o limitar explícitamente fase 2 a solicitudes sin asignación real mientras se prepara fase 3. Definir cuál módulo es fuente maestra de cada dato. |
| C-03 | Los significados de `Asignada` y `Confirmada` se solapan, y el documento deja abierta la condición de aceptación/confirmación. [Proceso, §6 y §14](../procesos/intenciones-de-misa.md) | No se sabe cuándo se reserva la celebración, qué se comunica al solicitante, quién autoriza y cuándo se puede marcar Cumplida. | Aprobar una transición con actor, condición, registro de decisión y comunicación. Distinguir propuesta temporal de compromiso confirmado. |

### IMPORTANTE — debe resolverse antes de completar el proceso

| ID | Hallazgo y evidencia | Efecto | Resolución requerida |
|---|---|---|---|
| I-01 | `Requiere reprogramación`, `no celebrada`, cancelación de celebración y cancelación de solicitud aparecen en dimensiones distintas, pero no se define cómo se sincronizan. [Proceso, §6 y §10](../procesos/intenciones-de-misa.md) | La solicitud podría quedar confirmada aunque la celebración se haya cancelado, o cerrarse sin decisión pastoral. | Definir tabla de consecuencias entre estado de celebración y solicitud, quién elige reprogramar/cancelar y qué se comunica. |
| I-02 | La ficha propone un `ID de celebración`, pero no decide la cardinalidad entre solicitudes, intenciones y celebraciones. Una serie relaciona un caso con varias celebraciones; no se define si varias solicitudes pueden relacionarse con una misma celebración. [Proceso, §5 y §7](../procesos/intenciones-de-misa.md) | Riesgo de modelar una relación rígida que luego impida reglas locales o series. | Aprobar cardinalidad conceptual y dejar cuotas/limitaciones como política configurada únicamente por autoridad competente. No fijar el número permitido en esta auditoría. |
| I-03 | La solicitud desde Portal y el seguimiento propio dependen de identificar al solicitante, pero el mecanismo seguro no está definido y la experiencia actual del Portal es una vista ficticia con perfil, no un canal público de solicitudes de Misa. [Proceso, §2, §9 y §14](../procesos/intenciones-de-misa.md) · [Portal actual](../../../apps/erp/src/components/modules/parishioner-portal-screen.tsx) | No debe exponerse estado, contacto o texto pastoral mediante una URL pública predecible. | Definir alcance de la fase 2 (interno/demo) y diferir seguimiento real hasta autenticación o un mecanismo de verificación aprobado. Decidir qué se puede solicitar sin cuenta. |
| I-04 | Las pruebas de privacidad exigen negar accesos por rol, pero hoy no existe autenticación ni autorización real. [Plan, §2 y fase 5](../plan-implementacion-funcional.md) | Un control visual no cumple un criterio de seguridad; presentar la prueba como efectiva sería engañoso. | Separar los criterios de prototipo local de los criterios productivos; reservar pruebas de acceso real para fase 5. No usar datos reales antes de entonces. |
| I-05 | `Finanzas` combina `reversado/corregido` en un estado y no define qué objeto se revierte, si hay reembolso, quién lo autoriza o cómo afecta Tesorería/Contabilidad. [Proceso, §6 y §8](../procesos/intenciones-de-misa.md) | Riesgo de alterar un movimiento o asiento sin preservar el historial o confundir reversión con edición. | Tesorería y Contabilidad deben aprobar eventos, responsables y referencia entre corrección, reverso, reembolso (si aplica) y conciliación. No inferir tratamiento tributario. |
| I-06 | Se menciona “recibo”, soporte y referencia financiera, pero no se define cuándo se emite, qué lo dispara y quién confirma su validez. [Proceso, §5, §8 y criterios 6/11](../procesos/intenciones-de-misa.md) | Puede confundirse un comprobante de muestra con recibo fiscal o certificado parroquial, o emitirse antes de verificar recepción. | Definir tipos documentales por país/entidad, emisor, evento de emisión, numeración y estado; las integraciones quedan fuera hasta aprobación. |
| I-07 | `En revisión` no es el único estado con acciones ambiguas: falta definir quién resuelve datos incompletos, duplicados probables, alternativas vencidas y reapertura de casos cerrados. [Proceso, §6, §10 y §14](../procesos/intenciones-de-misa.md) | Bandejas y criterios de cierre quedan sujetos a interpretación. | Definir responsables, vencimiento/recordatorio si aplica, condición para cancelar/cerrar y auditar duplicados sin fusión automática. |
| I-08 | Informes se nombran, pero no se definen indicadores, fórmulas, periodo, permisos ni tratamiento nominal. [Proceso, §9, §12 y §14](../procesos/intenciones-de-misa.md) | Dos reportes podrían contar de manera distinta solicitudes, asignaciones, celebraciones o ingresos. | Aprobar diccionario de reportes y filtros antes de construir cifras; separar reportes litúrgicos de tesorería y entidad contable. |
| I-09 | Las pruebas previstas no incluyen idempotencia de recepción, reintento de comunicación/pago ni colisiones simultáneas de asignación; el plan sí pide considerar reintentos/duplicados para integraciones futuras. [Proceso, §13](../procesos/intenciones-de-misa.md) · [Plan, §5](../plan-implementacion-funcional.md) | Una repetición podría duplicar solicitud, recibo o asignación en fases con servicios. | Añadir escenarios cuando se autoricen persistencia e integraciones; para fase local, probar doble clic/reintento y concurrencia simulada sin afirmar garantías de servidor. |

### MENOR — puede resolverse durante el diseño de interacción

| ID | Hallazgo | Recomendación |
|---|---|---|
| M-01 | El término “intención” también aparece como texto general dentro de la celebración litúrgica. En el demo actual no es una solicitud relacionada. | En vistas y reportes distinguir `intención solicitada`, `texto litúrgico general` y `celebración`; evitar que un campo libre se interprete como solicitud procesable. |
| M-02 | Las categorías distinguen difuntos, vivos, acción de gracias y otras, pero no definen etiquetas de lista para privacidad o impresión. | Acordar nomenclatura y textos de ayuda con responsables pastorales antes de presentar el formulario. |
| M-03 | La publicación pública requiere consentimiento revocable, pero no se define cómo retirar una intención ya incluida en un boletín emitido. | Determinar si el consentimiento se controla en cada publicación y conservar historial; no alterar retrospectivamente material ya distribuido sin política. |
| M-04 | El requisito de zona horaria es detallado para un proceso sin recurrencia aún implementada. | Mantenerlo como criterio técnico; validar fechas locales y cambios de zona en fase calendario, sin retrasar captura interna sin fecha. |

## 5. Coherencia con el código actual y preparación técnica

### Entidades conceptuales necesarias

Sin proponer tablas SQL, la implementación necesitará como mínimo conceptos diferenciados de:

1. **Solicitud/intención**: institución, canal, solicitante, categoría, contenido mínimo protegido, preferencia de fecha, consentimiento de publicación y estado.
2. **Celebración litúrgica**: horario, sede, celebrante, estado y referencia a la fuente maestra del calendario.
3. **Asignación**: relación versionable entre solicitud/serie y celebración, con actor, estado, fecha de decisión y motivo.
4. **Serie de intenciones**: agrupación de solicitudes/celebraciones si la regla local aprobada habilita Misa gregoriana.
5. **Registro financiero**: evento monetario separado, con tipo, importe/moneda cuando aplique, cuenta, entidad contable, soporte y estado.
6. **Recibo/soporte**: documento tipificado, emisor, fecha y estado, distinto de certificado sacramental.
7. **Comunicación**: canal, destinatario, contenido/plantilla aprobada, consentimiento, estado de entrega y vínculo con el evento que la originó.
8. **Evento de historial**: quién cambió qué, cuándo, origen y motivo.
9. **Política local versionada**: referencia a regla aprobada, autoridad, jurisdicción, periodo de vigencia y responsable de aprobación.

Las referencias a persona/familia deben reutilizar la identidad existente cuando proceda, sin duplicar contactos ni conceder acceso familiar. Debe resolverse antes si solicitante y persona mencionada pueden ser la misma persona, si una solicitud contiene más de una intención y la cardinalidad por celebración; esta auditoría no las decide.

### Dependencias actuales observadas

- `liturgy-screen.tsx` consume `liturgicalCelebrations` de `pastoral-demo.ts`. El tipo contiene `intention: string`, junto a fecha, sede y celebrante, pero no una entidad de solicitud o asignación.
- `institutional-agenda-screen.tsx` consume su propio conjunto `institutionalEvents` y `facilities` de `institutional-demo.ts`. Por tanto, hoy Liturgia y Agenda no comparten un calendario fuente.
- `parishioner-portal-screen.tsx` muestra solicitudes y agenda ficticias desde `services-demo.ts`; no captura una intención de Misa ni verifica identidad.
- `treasury-screen.tsx` y `economy-demo.ts` contienen movimientos y conciliación estáticos. No hay referencia a solicitudes de Misa.
- `accounting-screen.tsx` muestra entidades, cuentas y asientos demostrativos; el proceso no produce comprobantes.
- `FormDialog` previene el envío web, invoca una acción local opcional y cierra el diálogo; no serializa ni persiste campos. Modificarlo para un flujo real afectaría formularios compartidos.

### Riesgos de diseño/implementación

- Hacer de la solicitud una propiedad de la celebración impediría representar solicitudes pendientes, cambios de fecha o series; hacer de la celebración una copia de la Agenda generaría doble fuente.
- Cambiar `FormDialog` globalmente podría alterar formularios de Documentos, Compras, Agenda y otros módulos. Conviene aislar el flujo específico o evolucionar el componente compartido con compatibilidad probada.
- Una agenda estática no garantiza disponibilidad ni evita asignaciones simultáneas; ningún indicador visual equivale a una reserva atómica.
- Estados financieros y pastorales no deben compartir una sola etiqueta/status de UI o una transición automática.
- Si la fase 2 conserva solo datos locales, pruebas de permisos no prueban seguridad efectiva ni deben habilitar datos reales.

## 6. Pruebas que deberán cubrirse durante la implementación

Además de los casos previstos en la especificación, antes de completar el proceso se requieren:

1. **Máquina de estados:** transición permitida, transición prohibida, rol que ejecuta, condición, motivo requerido y conservación del historial.
2. **Calendario:** fecha alternativa, choque por sacerdote/sede, cancelación de una ocurrencia y reasignación sin duplicar evento.
3. **Relaciones:** solicitud pendiente sin celebración; solicitud asignada; serie parcial; reglas de cardinalidad una vez aprobadas; referencias no duplicadas entre Liturgia/Agenda.
4. **Cancelación/corrección:** solicitante antes y después de confirmación; cambio por parroquia; celebración no realizada; cierre y reapertura con autorización.
5. **Finanzas:** sin importe; recepción no verificada; movimiento registrado; corrección/reverso según procedimiento aprobado; sin creación automática de asiento.
6. **Privacidad:** dos solicitantes distintos; celebrante sin acceso financiero; tesorería sin nota pastoral; Portal sin lectura de terceros; auditoría sin filtrar texto protegido en listados.
7. **Series gregorianas:** opción deshabilitada cuando no existe política; política vigente; serie parcial; interrupción y decisión autorizada. No probar reglas no aprobadas.
8. **Fiabilidad de canal:** doble envío local, error de contacto, reintento, respuesta duplicada de proveedor y timeout solo cuando haya integración autorizada.
9. **Regresión:** pruebas de rutas y navegación; comportamiento de componentes compartidos; formularios de los demás módulos; TypeScript, lint y build.

Las pruebas de seguridad real requieren autenticación, autorización y persistencia aprobadas; no son sustituibles por pruebas de visibilidad de una maqueta.

## 7. Decisiones pendientes y responsables de aprobación

| Decisión | Quién debe aprobarla | Alcance bloqueado si no hay decisión |
|---|---|---|
| Catálogo completo de estados y semántica de `En revisión` | Responsable de producto ERP + secretaría parroquial + párroco | Cualquier flujo de estados completo. |
| Fuente maestra del calendario y dependencia Fase 2/Fase 3 | Arquitectura ERP + responsables de Liturgia y Agenda | Asignación y disponibilidad efectiva. |
| Significado/condición de `Asignada` y `Confirmada`, aceptación del solicitante | Párroco/responsable pastoral + responsable de producto | Comunicación y compromiso de fecha. |
| Cardinalidad solicitud–intención–celebración y políticas de asignación | Autoridad eclesiástica competente + arquitectura ERP | Modelo de datos y reglas de asignación. |
| Reglas de Misas gregorianas, fuente, alcance y vigencia | Autoridad eclesiástica competente de la jurisdicción; asesoría canónica si la institución lo requiere | Habilitar cualquier oferta o cumplimiento gregoriano. |
| Definición de ofrenda/estipendio y tratamiento local | Párroco/autoridad competente + tesorería/administración; asesoría contable/legal local cuando aplique | Cobro, recibo, políticas de importe y registro contable. |
| Tipos de recibo/comprobante y momento de emisión | Tesorería/contabilidad + responsable civil/tributario local | Generación de documentos con apariencia oficial. |
| Identidad y acceso para Portal/consentimiento/publicación | Responsable de privacidad/institución + arquitectura/producto | Seguimiento privado, publicación nominal y datos reales. |
| Permisos, cancelaciones, reapertura y corrección financiera | Párroco + responsables funcionales de Tesorería/Contabilidad | Autorizaciones y trazabilidad efectiva. |

## 8. Recomendaciones de ajuste documental

1. Añadir `En revisión` al catálogo o quitarlo de las transiciones de `Recibida`; especificar actor, entrada, salida y datos editables.
2. Crear una matriz formal `estado actual → evento/actor/condición → estado siguiente` para solicitud y otra para celebración, además de estados financieros separados.
3. Resolver el calendario previo: definir el conjunto mínimo que Fase 2 puede leer de Liturgia o convertir la disponibilidad común en dependencia explícita anterior a la asignación.
4. Separar explícitamente alcance de fase 2 (captura/seguimiento demostrativos) del Portal funcional de fase 7 y de la autenticación futura.
5. Documentar cardinalidades conceptuales de solicitud, intención, asignación, celebración y serie, dejando cupos/reglas canónicas configurables y no preestablecidos.
6. Definir qué transición de celebración afecta la solicitud y qué transición financiera afecta recibo/conciliación; distinguir corrección, reverso y reembolso sin asumir equivalencia.
7. Convertir criterios de aceptación en casos verificables con precondición, actor, acción, resultado visible y evidencia; etiquetar qué se prueba en prototipo local y qué requiere seguridad/integración.
8. Definir informes: indicadores, numerador/denominador cuando aplique, filtros, agregación, permisos y fecha de corte.

## 9. Condiciones para autorizar implementación

### Requeridas antes de iniciar el proceso con asignación

- [ ] Resolver C-01: catálogo de estados sin transiciones a estados inexistentes.
- [ ] Resolver C-02: aprobar fuente del calendario y orden de dependencias de fases.
- [ ] Resolver C-03: aprobar regla de asignación/confirmación y el evento que comunica compromiso.
- [ ] Acordar cardinalidad conceptual de solicitudes, intenciones y celebraciones, sin fijar cupos canónicos.
- [ ] Acordar alcance exacto de fase 2 frente al Portal pendiente de fase 7.
- [ ] Aprobar los criterios de demostración local separados de autorización/seguridad real.

### Requeridas antes de activar funciones especiales o datos reales

- [ ] Para Misas gregorianas: fuente normativa, autoridad, jurisdicción y política aprobadas; mientras tanto, mantener la capacidad deshabilitada.
- [ ] Para dinero: definición local de ofrendas/estipendios, entidad contable, recibos y responsables; mientras tanto, sin cobros ni montos/reglas precargados.
- [ ] Para Portal: mecanismo de verificación, consentimiento y acceso propio aprobado; mientras tanto, sin mostrar datos personales reales.
- [ ] Para historial y permisos reales: autenticación/autorización, auditoría, correcciones y retención aprobadas; mientras tanto, solo demostración.

## 10. Dictamen final

### **NO APTO PARA IMPLEMENTAR**

La arquitectura general es adecuada y el documento evita acertadamente inventar reglas pastorales y económicas. Sin embargo, el proceso completo no tiene una máquina de estados cerrada y depende de una fuente de calendario que el plan implementa después del proceso. La transición entre asignación y confirmación también está explícitamente pendiente. Estas tres condiciones afectan el comportamiento central, los datos y las pruebas de aceptación; no son ajustes meramente visuales.

Tras resolver C-01 a C-03 y aclarar el alcance Portal/Fase 2, la implementación de un prototipo local puede reevaluarse. Las reglas Gregorianas, económicas, los permisos reales, pagos y comunicaciones seguirán bloqueados hasta aprobación competente e integración/fase correspondiente. Este dictamen no autoriza implementación.
