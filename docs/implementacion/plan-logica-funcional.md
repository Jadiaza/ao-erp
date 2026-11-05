# A&O ERP · Plan de integración de lógica funcional

## Orden de construcción aprobado

La etapa actual desarrolla la lógica de negocio de todos los módulos dentro de `apps/erp`. No se implementan en esta fase conexiones PostgreSQL, repositorios productivos, endpoints ni integraciones externas. La persistencia se abordará después de validar los procesos y reglas funcionales.

Las pantallas, componentes, navegación e identidad visual existentes se conservan. Los datos demostrativos se utilizan únicamente como fixtures temporales para validar cálculos y flujos.

## Principios transversales

- Cada operación de negocio debe tener reglas, precondiciones, resultado y transiciones de estado explícitas.
- Los importes monetarios se representan con enteros en unidades menores y moneda explícita.
- Las fechas se validan como fechas reales de calendario.
- Las operaciones contables se generan desde los hechos económicos que corresponda; no se duplican manualmente.
- Toda operación relevante debe poder explicar su origen, responsable, estado y documentos de soporte.
- Los módulos comparten conceptos y contratos internos, pero cada dominio conserva sus reglas.
- Los datos personales, sacramentales y pastorales requieren separación de responsabilidades y acceso mínimo.
- Ningún flujo puede dar por aprobada, contabilizada, certificada o presentada una operación sin cumplir sus condiciones.

## Mapa de módulos y lógica por construir

| Dominio | Módulos incluidos | Lógica que debe quedar definida |
|---|---|---|
| Gobierno institucional | Institución, estructura eclesial, administración institucional, normas y gobierno | Entidades, sedes, jurisdicciones, vigencias, responsables, autorizaciones y jerarquías |
| Identidad y seguridad | Usuarios y permisos, administración de plataforma | Roles, permisos por acción y alcance, delegaciones, estados de usuario, políticas de acceso |
| Comunidad | Comunidad/feligreses, familias, portal parroquial | Identidad, relaciones familiares, afiliaciones, consentimientos, solicitudes y trazabilidad |
| Sacramentos | Gestión sacramental, libros, partidas, notas marginales, certificados | Solicitud, preparación, validación, celebración, asiento, folio, correcciones, notas, expedición y custodia |
| Pastoral | Grupos, formación, acción social, planificación pastoral, liturgia | Inscripciones, responsables, asistencia, programas, metas, actividades, recursos y seguimiento |
| Finanzas | Contabilidad, tesorería, presupuesto, activos, compras | Hechos económicos, partida doble, causación, recaudo, pagos, conciliación, ejecución presupuestal, inventario y depreciación |
| Operaciones | Agenda institucional, gestión documental, comunicaciones | Reservas, disponibilidad, radicación, clasificación, versiones, retención, distribución y notificaciones |
| Supervisión | Informe anual parroquial, gestión diocesana | Consolidación autorizada, cortes, validaciones, presentación, observaciones, respuestas y compromisos |
| Inteligencia | Asistente IA, auditoría y trazabilidad | Herramientas permitidas, contexto mínimo, fuentes, aprobaciones humanas y registro de acciones |

## Dependencias funcionales principales

1. Institución y estructura eclesial definen el contexto institucional de los demás módulos.
2. Usuarios y permisos gobiernan quién puede ejecutar cada operación.
3. Comunidad aporta referencias de personas y familias; no sustituye libros sacramentales.
4. Solicitudes sacramentales se relacionan con comunidad, agenda, documentos, formación y libros; la partida oficial se registra solo después de la celebración y validaciones correspondientes.
5. Compras generan obligaciones y entradas de inventario cuando aplique; los pagos se ejecutan en tesorería y los hechos económicos generan comprobantes contables.
6. Tesorería administra recaudos, pagos, caja, bancos y conciliaciones; contabilidad recibe movimientos por reglas de contabilización, no por duplicación.
7. Presupuesto controla apropiaciones, compromisos, causaciones y ejecución contra operaciones reales.
8. Activos se relacionan con compras, inventarios, ubicación, custodios, mantenimiento y depreciación.
9. Gestión documental conserva soportes de procesos y controla versiones y acceso.
10. Informe anual consume información validada de los módulos; no inventa ni reemplaza registros fuente.
11. Gestión diocesana recibe información institucional autorizada y versionada; no modifica datos fuente parroquiales.
12. Auditoría registra quién hizo qué, cuándo, sobre qué objeto y cuál fue el resultado.

## Criterio de terminación de esta etapa

Un módulo se considera funcionalmente integrado cuando tiene:
- entidades y tipos de dominio definidos;
- operaciones principales implementadas;
- validaciones y reglas de negocio explícitas;
- estados y transiciones controlados;
- cálculos deterministas;
- manejo de errores de dominio;
- pruebas unitarias de reglas y escenarios límite;
- contratos claros con los módulos que lo consumen;
- pantallas existentes preparadas para usar la lógica sin rediseño.

La etapa termina cuando todos los módulos incluidos en el mapa cumplen estos criterios y los flujos intermodulares principales pueden recorrerse con datos de prueba. Solo entonces se diseña y conecta la persistencia definitiva.


## Avance de implementación en la rama de integración

Se incorporaron primeras reglas ejecutables y pruebas para los siguientes dominios:

- **Compartido:** importes enteros con moneda, fechas ISO de calendario, resultados de dominio, eventos, metadatos de auditoría y transiciones.
- **Gobierno institucional:** jerarquía eclesial, detección de ciclos, vigencias y delegaciones.
- **Seguridad:** autorización por rol, organización, unidad y atributos; estado de cuenta y requisito MFA.
- **Comunidad:** validación de persona y vínculos familiares, consentimiento y decisión de contacto por finalidad.
- **Sacramentos:** flujo de solicitud, control documental, programación, validación de partida y notas marginales.
- **Pastoral y formación:** actividades, cupos, inscripciones, asistencia y requisitos de finalización.
- **Liturgia:** validación de celebraciones, ministros y conflictos de sede/horario.
- **Tesorería y presupuesto:** movimientos, aprobación, contabilización, conciliación, saldos, transferencias y control de compromisos/causaciones/pagos presupuestales.
- **Compras:** solicitud, aprobación separada del solicitante, orden de compra y recepción parcial o completa.
- **Inventarios y activos:** entradas/salidas, costo promedio ponderado, control de existencias y depreciación lineal.
- **Gestión documental:** estados, versiones, clasificación de acceso y revisión de retención.
- **Agenda:** reservas y conflictos de recursos.
- **Comunicaciones:** consentimiento, aprobación, cola y resultado de envío.
- **Informe anual:** validación de secciones, revisión, presentación y devolución.
- **IA:** control de herramientas por rol, finalidad, sensibilidad, riesgo y aprobación humana.
- **Flujos entre módulos:** compromiso de compra contra presupuesto, recepción de compra hacia inventario y conversión de movimiento de tesorería en propuesta de comprobante contable balanceado.

### Pendiente para cerrar la etapa funcional

Esta entrega es una primera implementación de dominio, no la integración completa de todos los módulos. Falta ampliar reglas específicas, cubrir casos límite con pruebas, conectar las pantallas existentes a los casos de uso, completar flujos de compras/cuentas por pagar/tesorería/contabilidad, cubrir fondos y proyectos, completar procesos sacramentales y documentales, y validar todo mediante ejecución de typecheck, lint, build y Vitest. La persistencia permanece deliberadamente aplazada.


## Segunda ampliación funcional

Se añadieron dominios de fondos con restricciones y trazabilidad de movimientos; cuentas por pagar y por cobrar con saldos y pagos/recaudos parciales; y auditoría con validaciones de contexto, correlación y orden temporal.

También se reforzó la integración entre módulos: un pago a proveedor solo se aplica a la obligación cuando se presenta un movimiento de tesorería contabilizado, de egreso, con moneda e importe coincidentes. Un recaudo solo se aplica a la cuenta por cobrar cuando existe un movimiento contabilizado de ingreso con los mismos datos. Se añadieron pruebas de estos recorridos.

Se corrigieron referencias de tipos entre compras e inventario y validaciones de fecha. La compilación y las pruebas siguen pendientes de ejecución local; no se debe interpretar el código incorporado como validado por CI.


## Tercera ampliación y endurecimiento de reglas

- Fondos: validación de fechas reales de calendario, referencias obligatorias y fecha de corte al calcular saldos.
- Cuentas por pagar y por cobrar: fechas reales de calendario, identificación obligatoria y validación de la fecha de cada pago o recaudo.
- Inventarios: no se aplica un movimiento sin validar previamente artículo, estado, cantidad, costo, almacén, referencias y fecha. Se controlan también los parámetros de depreciación acumulada.
- Compras y presupuesto: cada línea de compra reserva contra la apropiación que coincide con su cuenta de gasto y centro de costos. La recepción requiere identificador propio para distinguir recepciones parciales y rechaza líneas desconocidas.
- Tesorería y cartera: el pago/recaudo debe coincidir también en fecha con el movimiento contabilizado.
- Espacio de trabajo: los scripts y workspaces raíz quedan orientados a una única aplicación ejecutable, `apps/erp`; los paquetes compartidos permanecen como librerías internas.

Estas reglas siguen siendo lógica de dominio sin persistencia. La unicidad de identificadores de recepción/pago/recaudo, la idempotencia transaccional, la atomicidad entre módulos y la ejecución de pruebas/build deben verificarse al incorporar el backend y el entorno de CI. No se declara esta entrega compilada ni probada localmente.


## Cuarta ampliación: ciclo de compras, factura, tesorería y presupuesto

Se extendió el flujo económico de compras para cubrir los hitos siguientes:

1. La solicitud aprobada compromete presupuesto por cuenta de gasto y centro de costos. La reserva valida que exista una única apropiación coincidente y que el valor sea seguro.
2. La recepción parcial o completa genera movimientos de inventario trazables por identificador de recepción.
3. La factura del proveedor solo puede registrarse contra cantidades efectivamente recibidas. Cada asignación de factura convierte el compromiso presupuestal correspondiente en causación y genera la cuenta por pagar.
4. Los pagos parciales o totales requieren un movimiento de tesorería contabilizado, coincidente en valor, moneda, fecha y referencia. El importe se distribuye entre las asignaciones de la factura y actualiza la ejecución pagada del presupuesto.
5. Se genera una propuesta de comprobante contable para el pago, con mapeo explícito de entidad, organización y cuenta por pagar. No se inventan cuentas contables ni se contabiliza automáticamente desde esta capa.
6. La cancelación de una compra no recibida por completo libera únicamente el compromiso correspondiente a las cantidades pendientes de recibir. Lo recibido permanece trazable y puede facturarse posteriormente.
7. Los reversos de tesorería se proponen como movimientos nuevos en borrador; nunca se modifica el movimiento original contabilizado. Las transferencias tienen identificador común estable para sus dos lados.

### Reglas de presupuesto utilizadas

La disponibilidad se calcula descontando los compromisos pendientes y las obligaciones causadas de la apropiación. Al registrar una factura, el importe pasa de compromiso a causación; el pago aumenta el valor pagado sin reducir la causación. Así se evita contar dos veces el mismo importe como compromiso y obligación.

### Controles adicionales

Se añadieron validaciones de duplicidad para identificadores de factura y pago cuando el llamador aporta el historial existente, correspondencia de asignaciones con el saldo de la factura, fechas, valores recibidos y mapeos presupuestales. La idempotencia definitiva requiere persistir esas claves y aplicar restricciones únicas/transacciones en la siguiente etapa.

No se declara ejecución satisfactoria de Vitest, typecheck, lint o build: esta rama se ha actualizado mediante GitHub y todavía no presenta ejecuciones de CI asociadas al commit consultado.
