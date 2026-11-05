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
