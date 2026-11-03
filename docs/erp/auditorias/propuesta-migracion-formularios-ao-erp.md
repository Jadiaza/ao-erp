# Propuesta de migración progresiva de formularios A&O ERP

**Estado:** propuesta para revisión; no autoriza implementación.  
**Base:** `docs/erp/estandar-formularios.md` y `docs/erp/auditorias/inventario-formularios-ao-erp.md`.

## Principios

- Conservar la identidad azul marino y dorado, Plus Jakarta Sans en el cuerpo y las jerarquías tipográficas actuales. La imagen aprobada guía composición, no la paleta ni el sistema tipográfico.
- Migrar por entregables pequeños y módulos aprobados. No hacer una sustitución masiva de formularios.
- Reutilizar `FormDialog`, `DetailDrawer`, `FieldGroup`, componentes UI y `ui/form.tsx`; crear abstracciones nuevas solo cuando un primer piloto pruebe una necesidad compartida.
- Mantener datos y acciones demostrativos claramente identificados. Un patrón de formulario no habilita backend, persistencia, autenticación, pagos, envío de comunicaciones ni reglas de dominio.
- Actualizar el inventario únicamente al terminar y revisar cada migración.

## Secuencia propuesta

| Etapa | Alcance | Dependencias | Criterios de salida |
|---|---|---|---|
| 0. Preparación del patrón | Resolución visual ya aprobada; detallar contrato mínimo de campo, etiqueta, error, botones, foco, tamaño y cancelación. Comparar piezas existentes con el estándar. | Estándar aprobado; no requiere cambio de identidad. | Revisión de diseño confirma uso exclusivo de tokens institucionales y define casos de prueba para modal, página amplia y panel lateral. Sin cambiar pantallas todavía. |
| 1. Piloto: Intenciones de Misa 2A | Aplicar el patrón al subconjunto de captura presencial demostrativa. Esta es la primera pantalla piloto del estándar. | Aprobación independiente de implementación y aclaración de alcance 2A. La segunda auditoría indica que 2A completa, como está redactada, no está lista; recomienda autorizar primero un subconjunto estrecho. | Solo incluir los campos, canal y preferencia de fecha que se aprueben para captura local; rotular todo como demostración y permitir revisar la vista previa. No declarar recepción oficial ni activar estados/transiciones no aprobados. Diseño revisado en ambas variantes de escritorio/móvil y teclado. |
| 2. Modal breve de bajo riesgo | Migrar un formulario existente corto, propuesto: “Agregar responsable institucional” o, alternativamente, “Agregar persona de muestra”. | Resultado visual/funcional aceptado del piloto; elección del módulo y datos de muestra confirmados. | Etiquetas persistentes, campos requeridos y errores verificables, estado de submit, cancelación, cierre y prevención de doble envío demostrados sin persistencia real. Inventario actualizado. |
| 3. Modal estándar en módulos | Migrar por entregas: estructura eclesiástica, usuarios/permisos, solicitudes de documentos y formularios de compras simples. Mantener las acciones como vistas previas salvo autorización distinta. | Etapa 2 aceptada; alcance de cada formulario definido por su módulo. | Cada acción refleja exactamente su efecto de prototipo; conserva valores ante errores; controles accesibles; sin mezclar permisos reales, relaciones institucionales o dinero. |
| 4. Formulario ampliado | Casos de feligreses/familias, sacramentos, Liturgia y celebraciones, compras complejas, inventario, finanzas, contabilidad, presupuesto e informe anual, según priorización aprobada. | Inventario actualizado; decisiones de contenido, privacidad y división por secciones aprobadas por responsables funcionales. | La modalidad extensa conserva el contexto, organiza secciones, permite navegación sin perder datos y presenta errores por sección/campo. No se inventan reglas pastorales, canónicas, económicas o contables. |
| 5. Edición en panel lateral | Migrar solo fichas que necesiten edición breve: contacto, responsable, ubicación u otros campos acotados. | Modal y formulario ampliado validados; definición de si cada drawer es consulta o edición. | El panel conserva el contexto, distingue consulta de edición, tiene acciones al pie y explica el cierre/descarte. Las fichas largas permanecen como página. |
| 6. Revisión transversal | Revisar los formularios migrados en ambos temas, escritorio/tableta/móvil, teclado, lectores de pantalla, validación y límites de módulo. | Etapas migradas y aprobadas. | Lista de aceptación documentada por formulario; ningún registro oficial, acceso sensible o efecto externo se simula como real. |

## Alcance propuesto del primer piloto

La fase 2A de Intenciones de Misa sería el primer uso real del estándar, pero no queda autorizada por esta propuesta. La segunda auditoría distingue un subconjunto técnicamente representable de la fase 2A completa y advierte que la semántica de `En revisión`, los actores de cambio/cancelación, el historial completo y la interpretación de “recibida” todavía requieren definición.

Por ello, antes de codificar el piloto deben aprobarse por separado:

1. La delimitación del formulario presencial de muestra y qué significa su resultado local.
2. Los campos y etiquetas permitidos. Como base para la decisión, la segunda auditoría menciona canal, categoría de muestra, contacto ficticio y preferencia opcional de fecha; cualquier cambio debe aprobarse antes de implementarse.
3. Qué botones y estados visuales se muestran y cuáles quedan explícitamente fuera.
4. Criterios de aceptación que no impliquen persistencia, recepción institucional real, ciclo de estados, historial operativo, cambio/cancelación, asignación, celebrante, calendario, finanzas, Portal con identidad ni comunicación automatizada.

La propuesta visual no resuelve las decisiones funcionales pendientes ni amplía el alcance autorizado. Si se autoriza el piloto, puede aplicar Modal estándar o Formulario ampliado según el número de secciones aprobado; la modalidad final se decide en el diseño del caso y se revisa contra el estándar.

## Pruebas por cada formulario migrado

- Presentación de etiquetas visibles, indicador requerido y ayuda, con asociación accesible de control y mensaje.
- Campo requerido vacío, valor inválido y error de sección/campo.
- Conservación de valores al fallar y al navegar pasos; cancelación y confirmación de descarte cuando corresponda.
- Submit repetido, estado de acción pendiente y salida de demostración correctamente rotulada.
- Navegación completa por teclado, foco visible, cierre accesible y retorno de foco.
- Diseño adaptable y funcionamiento en los temas institucional y esencial.
- Revisión de que no aparecen rutas, persistencia, datos reales, reglas o efectos no autorizados.

Las pruebas de integración con backend, autenticación, autorización efectiva, correos, pagos y seguridad de datos requieren autorización y fases independientes.
