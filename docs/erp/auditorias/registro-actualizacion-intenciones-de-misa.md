# Registro de actualización documental — Intenciones de Misa

**Estado:** actualización documental completada; pendiente de revisión funcional e institucional. No autoriza implementación.

## 1. Archivos

### Modificados

- [`docs/erp/plan-implementacion-funcional.md`](../plan-implementacion-funcional.md)
- [`docs/erp/procesos/intenciones-de-misa.md`](../procesos/intenciones-de-misa.md)

### Creado

- `docs/erp/auditorias/registro-actualizacion-intenciones-de-misa.md` (este registro).

La actualización se limitó a esos tres archivos. No se modificó código fuente, rutas, componentes, servicios ni las aplicaciones SaaS y Diocesano.

## 2. Apartados actualizados

### Plan de implementación

- Fases 2 y 3: subdivididas en 2A (captura y ciclo local demostrativo), 3A (calendario mínimo), 2B (asignación) y 3B (ampliación del calendario).
- Dependencias: incorporada la secuencia de ejecución `1 → 2A → 3A → 2B → 3B → 4` para evitar que asignación dependa de una función futura o cree una segunda agenda.
- Fase 6: dependencia explícita de 2A y 2B según el tipo de referencia financiera.
- Fases 2 y 7: separado el prototipo de seguimiento del solicitante de las capacidades reales del Portal, que requieren privacidad, identidad y controles implementados.
- Hitos B y C y pruebas transversales: agregadas verificaciones para estados, calendario, confirmación y distinción entre demostración y reserva efectiva.

### Especificación de Intenciones de Misa

- Estado, propósito y responsabilidades de Liturgia, Agenda, Portal, Tesorería, Contabilidad y Auditoría.
- Datos conceptuales de asignación para referencia a una ocurrencia, sin copiar su horario.
- §6: ciclo de solicitud y separación de asignación, celebración, finanzas y comunicación.
- §6.2: alternativas para `En revisión`, marcadas **PENDIENTE DE APROBACIÓN** y sin transición operativa hasta que se elija una.
- §6.3: distinción entre disponibilidad, propuesta, aprobación y confirmación efectiva; actor y condición de confirmación permanecen abiertos.
- §7: capacidad mínima de calendario, relación entre fuente Liturgia y recursos de Agenda, fases 2A/3A/2B/3B y manejo de cambios.
- Vistas de captura presencial y Portal posterior; excepciones por conflicto, cancelación, comunicación y no celebración.
- Criterios de aceptación segmentados por fase y con resultados observables; decisiones no aprobadas se validan por no habilitación/no inferencia.
- Decisiones pendientes ampliadas para estado, autoridad, cardinalidad, Portal, calendario, reportes y cierre/reapertura.

## 3. Cambios y justificación

1. **Calendario antes de asignación:** 3A ofrece la capacidad mínima que 2B consume. 3B completa esa misma fuente. Esto elimina el ciclo de dependencia sin mantener dos calendarios editables.
2. **Intenciones por entregas:** 2A permite revisar captura e historial sin disponibilidad real; 2B queda condicionado a 3A y a las aprobaciones funcionales aplicables.
3. **`En revisión` no se inventa:** el estado que faltaba sigue como alternativa pendiente entre estado, tarea/indicador y evento de historial. Ninguna opción fue elegida por esta actualización.
4. **Asignación no equivale a confirmación:** una consulta de disponibilidad no reserva; seleccionar celebrante no aprueba; la confirmación efectiva requiere autorización aprobada, nueva comprobación y compromiso en fuente maestra cuando exista la capacidad. El usuario/celebrante que participa en la confirmación continúa pendiente.
5. **Ciclos separados:** solicitud, celebración, finanzas y comunicación mantienen estados independientes; cancelaciones y no celebración no producen reversos o cambios monetarios automáticos.
6. **Portal por etapa:** fase 2A cubre recepción presencial y datos demostrativos; solicitud pública y seguimiento propio reales quedan en la fase 7 tras controles de privacidad/identidad. La maqueta no representa autenticación efectiva.
7. **Pruebas acordes al alcance:** los mocks comprueban presentación, no persistencia, exclusión concurrente, acceso seguro ni entrega de comunicaciones.
8. **Límites de producto conservados:** ERP mantiene la operación parroquial; SaaS sigue separado para administración comercial/técnica global; Diocesano conserva el ámbito territorial. No se habilita transferencia ni acceso automático.

## 4. Decisiones que continúan pendientes

Todas las siguientes deben tratarse como **PENDIENTE DE APROBACIÓN**:

- `En revisión`: estado, tarea/indicador o evento; actor, alcance, entradas y salidas. Responsable: producto ERP, secretaría y párroco/responsable pastoral.
- Autoridad para aprobar una intención/asignación, condiciones de compromiso y aceptación del solicitante o celebrante; reglas de rechazo, vencimiento y liberación. Responsable: autoridad pastoral/institucional competente y producto.
- Contrato final del calendario, conflictos bloqueantes/advertencias y disponibilidad de sacerdote, sede, equipo y espacios. Responsable: arquitectura ERP, Liturgia, Agenda y autoridad pastoral para reglas de aplicación.
- Cardinalidad entre solicitudes, intenciones, ocurrencias y series; cualquier regla de cupo. Responsable: autoridad eclesiástica competente, producto y arquitectura.
- Categorías, publicación, consentimiento revocable y tratamiento de material ya difundido. Responsable: responsables pastorales e institucionales de privacidad.
- Misas gregorianas: fuente, versión, jurisdicción, duración, continuidad, excepciones, responsable y comunicación. Responsable: autoridad eclesiástica competente y asesoría canónica si procede.
- Ofrendas/estipendios, importes, límites, monedas, recibos, tratamiento fiscal, reversos, reembolsos y registros contables. Responsable: autoridad institucional, Tesorería y Contabilidad; asesoría local aplicable.
- Identidad, acceso, visibilidad del Portal, permisos productivos y datos personales reales. Responsable: institución y responsables de privacidad/arquitectura; previsto para fase 5/7.
- Consecuencias de cancelación, no celebración, reprogramación, cierre, reapertura e informes. Responsable: autoridad pastoral, secretaría, producto y áreas financieras según ámbito.

No se añadieron montos, cuotas, reglas canónicas ni autoridad final por inferencia.

## 5. Relación entre fases

| Orden de ejecución | Entrega | Dependencia/resultado |
|---|---|---|
| 1 | Datos demostrativos coherentes | Contexto ficticio y referencias institucionales consistentes. |
| 2A | Captura y ciclo inicial demostrativos | Puede revisarse sin calendario, persistencia ni Portal real. |
| 3A | Calendario mínimo | Fuente de ocurrencias y referencias, validada antes de asignar. |
| 2B | Disponibilidad y asignación | Consume 3A; no confirma sin reglas aprobadas ni mecanismo de compromiso. |
| 3B | Calendario y Agenda ampliados | Recurrencias, excepciones, recursos y publicación sobre la misma fuente. |
| 4 | Ciclo sacramental | Depende de fases 1 y 3, según plan. |
| 5 | Privacidad y permisos | Se define desde fases 2–4; controles reales antes de datos reales/Portal. |
| 6 | Integración financiera | Depende de 1, 2A y de 2B para referencias de asignación; requiere política de entidad y aprobación financiera. |
| 7 | Portal público y formularios | Depende de 1–6 y de controles de fase 5; envío/pagos requieren aprobación separada. |

Las fases 8 y 9 conservan sus límites y dependencias actuales respecto de la separación/desarrollo de SaaS y Diocesano. La secuencia no altera la autonomía de las tres aplicaciones.

## 6. Comprobación de consistencia

- **Estados:** `En revisión` ya no aparece como transición operativa sin definición. `Asignada` y `Confirmada` siguen visibles como estados candidatos expresamente pendientes; no se les asigna significado definitivo.
- **Fases:** ambas fuentes usan 2A → 3A → 2B → 3B; la fase 3 amplía, no duplica, la fuente mínima de calendario.
- **Calendario:** Liturgia es una propuesta de fuente maestra de ocurrencias; queda sujeta a aprobación arquitectónica. Agenda conserva recursos/espacios y los referencia cuando corresponda. No se declara vigente hasta esa aprobación.
- **Portal:** la captura presencial y demo local se distinguen de captura pública y seguimiento reales de fase 7, que esperan los controles de privacidad/identidad.
- **Finanzas y pastoral:** los ciclos permanecen separados; la especificación no deriva un movimiento, reverso, asiento o recibo de una transición pastoral.
- **ERP/SaaS/Diocesano:** permanecen los límites previos; no se añadió acceso automático o intercambio de datos.
- **Criterios:** se separan los criterios comprobables con fixtures de los que requieren persistencia, autorización o integraciones futuras; decisiones pendientes se verifican como no habilitadas, no como reglas ya adoptadas.
- **Codificación:** los tres archivos fueron guardados en UTF-8 y revisados en busca de caracteres de reemplazo o mojibake; no se encontraron.

## 7. Validación humana requerida

Antes de autorizar una segunda auditoría funcional, producto y responsables parroquiales deben escoger las alternativas de `En revisión` y confirmación; arquitectura/Liturgia/Agenda deben validar la fuente y el contrato 3A; y las autoridades competentes deben ratificar las reglas pastorales, económicas, de privacidad y de jurisdicción que se quieran habilitar. Los temas que todavía no correspondan a la fase de prototipo pueden seguir abiertos, pero deben permanecer explícitamente fuera de su alcance.

## 8. Dictamen

### **APTO PARA SEGUNDA AUDITORÍA DOCUMENTAL**

Los dos documentos originales ya presentan una propuesta coherente y trazan sus decisiones abiertas sin convertirlas en reglas. Se recomienda una segunda auditoría documental para comprobar especialmente la matriz de estados, el contrato 3A, el punto de confirmación y la frontera Portal demo/Portal real. El resultado de esa auditoría determinará qué entregable, si alguno, puede someterse a autorización de implementación.

Este dictamen no declara resueltas las decisiones pendientes ni autoriza iniciar desarrollo.
