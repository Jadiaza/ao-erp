# Auditoría local y completitud A&O ERP

**Fecha:** 2026-11-05 · **Alcance:** interfaz, navegación, datos demostrativos y estado local. No se conectó ninguna base de datos.

## Resumen ejecutivo

El monorepositorio contiene tres aplicaciones independientes: `apps/erp`, `apps/saas` y `apps/diocesano`. ERP tenía el mapa parroquial documentado y pantallas de consulta para los módulos aprobados; SaaS tenía Dashboard y Configuración, pero no sus pantallas operativas. En esta intervención se completó el circuito visual principal de SaaS, se corrigió la navegación ERP para registrar Configuración y se incorporó una capa reutilizable de CRUD local para las operaciones demostrativas prioritarias.

Las interacciones locales usan estado React y, en los CRUD nuevos, `localStorage`. Esto no equivale a persistencia institucional, autenticación, autorización ni procesamiento en servidor.

## Matriz ERP

| Módulo                            | Ruta                                | Pantalla/componentes                                    | Acciones y datos                                        | Estado  | Pendiente                                                       |
| --------------------------------- | ----------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------- | --------------------------------------------------------------- |
| Dashboard                         | `/`                                 | Dashboard, tarjetas, actividades, economía y pendientes | Navegación, tareas y datos parroquiales demo            | PARCIAL | Conectar indicadores a fuentes de módulo cuando exista servicio |
| Institución                       | `/app/institucion`                  | Perfil, identidad y sedes                               | Consulta y paneles locales                              | PARCIAL | Edición estructurada con formulario ampliado                    |
| Estructura eclesiástica           | `/app/estructura-eclesiastica`      | Relaciones y entidades                                  | Búsqueda, filtros, formulario demo y detalle            | PARCIAL | CRUD persistido en servicio futuro                              |
| Administración institucional      | `/app/administracion-institucional` | Responsables, contactos y operación                     | Filtros, alta demo y detalle                            | PARCIAL | Edición completa y validaciones de dominio                      |
| Gobierno y normativa              | `/app/gobierno-normativa`           | Catálogo normativo                                      | Consulta y filtros                                      | PARCIAL | Versionado y edición documental                                 |
| Usuarios y permisos               | `/app/usuarios-permisos`            | Directorio y matriz                                     | Invitación y consulta demo                              | PARCIAL | Aplicación real de permisos                                     |
| Feligreses y familias             | `/app/feligreses-familias`          | Directorio, familias y fichas                           | Búsqueda, pestañas, detalle y CRUD local adicional      | PARCIAL | Expediente ampliado y privacidad efectiva                       |
| Gestión sacramental               | `/app/gestion-sacramental`          | Procesos, preparación y calendario                      | Alta de solicitud, consulta y CRUD local adicional      | PARCIAL | Flujo por etapas y reglas pastorales aprobadas                  |
| Libros sacramentales              | `/app/libros-sacramentales`         | Consulta de libros y partidas demo                      | Consulta avanzada, filtros y detalle                    | PARCIAL | Acceso documental y validación oficial futura                   |
| Documentos y certificados         | `/app/documentos-certificados`      | Solicitudes y certificados                              | Búsqueda, filtros, alta demo y detalle                  | PARCIAL | Relación con partidas y emisión controlada                      |
| Catequesis y formación            | `/app/catequesis-formacion`         | Programas, grupos y avance                              | Consulta, indicadores y detalle                         | PARCIAL | Editor de programas, encuentros y asistencia                    |
| Grupos, movimientos y ministerios | `/app/grupos-ministerios`           | Directorio de grupos                                    | Búsqueda, filtros y detalle                             | PARCIAL | Alta/edición de grupos e integrantes                            |
| Acción pastoral y social          | `/app/accion-pastoral-social`       | Proyectos, progreso e indicadores                       | Tabs, seguimiento y detalle                             | PARCIAL | Editor de proyectos y resultados agregados                      |
| Liturgia y celebraciones          | `/app/liturgia-celebraciones`       | Agenda e piloto visual de intenciones                   | FormPage, FormModal, FormDrawer, consulta y agenda demo | PARCIAL | Operación de celebraciones fuera del piloto                     |
| Planificación pastoral            | `/app/planificacion-pastoral`       | Objetivos y avances                                     | Indicadores y detalle                                   | PARCIAL | Editor ampliado de objetivos y cronograma                       |
| Finanzas y tesorería              | `/app/finanzas-tesoreria`           | Caja, bancos, flujo y conciliación                      | Filtros, detalle y CRUD local de movimientos            | PARCIAL | Reglas de conciliación y cierres                                |
| Contabilidad                      | `/app/contabilidad`                 | Plan contable, diario, mayor y estados                  | Tabs, entidad, detalle y CRUD local de comprobantes     | PARCIAL | Asientos balanceados y reglas contables configurables           |
| Presupuestos                      | `/app/presupuestos`                 | Líneas, ejecución y alertas                             | Indicadores y CRUD local de rubros                      | PARCIAL | Fórmulas, aprobaciones y relación con contabilidad              |
| Inventarios y patrimonio          | `/app/inventarios-patrimonio`       | Bienes, ubicaciones y custodia                          | Filtros, detalle y CRUD local de bienes                 | PARCIAL | Movimientos, soportes y tratamiento contable                    |
| Compras y obligaciones            | `/app/compras-obligaciones`         | Solicitudes, ofertas y obligaciones                     | Flujo visual, alta y CRUD local                         | PARCIAL | Ciclo completo de compra y cuentas por pagar                    |
| Informe anual parroquial          | `/app/informe-anual-parroquial`     | Secciones y avance                                      | Navegación y detalle demo                               | PARCIAL | Editor por sección y compilación desde fuentes                  |
| Agenda e infraestructura          | `/app/agenda-infraestructura`       | Calendario, espacios y reservas                         | Alta demo, filtros y detalle                            | PARCIAL | Conflictos, fuente común y mantenimiento                        |
| Gestión documental                | `/app/gestion-documental`           | Repositorio y metadatos                                 | Exploración, filtros y detalle                          | PARCIAL | Carga, versiones y permisos documentales                        |
| Auditoría y trazabilidad          | `/app/auditoria-trazabilidad`       | Eventos de auditoría                                    | Filtros y detalle; sin captura manual                   | PARCIAL | Registro automático cuando exista backend                       |
| Portal del feligrés               | `/app/portal-feligres`              | Autoservicio y solicitudes demo                         | Vistas, navegación y detalle                            | PARCIAL | Autenticación, aislamiento y solicitudes                        |
| Comunicaciones                    | `/app/comunicaciones`               | Composición, audiencia e historial                      | Búsqueda, vista previa y programación demo              | PARCIAL | Envío y consentimiento reales                                   |
| Inteligencia artificial           | `/app/inteligencia-artificial`      | Conversación de respuestas predefinidas                 | Consulta local y categorías                             | PARCIAL | Proveedor, contexto autorizado y trazabilidad                   |
| Configuración                     | `/app/configuracion`                | Preferencias institucionales                            | Categorías, controles y vista previa                    | PARCIAL | Persistencia y políticas institucionales                        |

Las rutas de transición `/app/gestion-diocesana` y `/app/administracion-plataforma` se mantienen fuera de la navegación ERP conforme a la arquitectura aprobada; no se clasifican como módulos parroquiales.

## Matriz SaaS

| Área                           | Ruta                | Resultado                                                                                      |
| ------------------------------ | ------------------- | ---------------------------------------------------------------------------------------------- |
| Dashboard administrativo       | `/`                 | Indicadores de organizaciones, instituciones, usuarios y planes; accesos rápidos y estado demo |
| Organizaciones                 | `/organizaciones`   | Tabla, búsqueda, filtro, detalle y creación local                                              |
| Instituciones                  | `/instituciones`    | Tabla, búsqueda, filtro, detalle y creación local                                              |
| Usuarios                       | `/usuarios`         | Tabla, búsqueda, filtro, detalle y creación local                                              |
| Roles y permisos               | `/roles-permisos`   | Catálogo de perfiles y alcance; detalle y creación local                                       |
| Planes y licencias             | `/planes-licencias` | Catálogo de planes, estado, detalle y creación local                                           |
| Configuración general/interfaz | `/configuracion`    | Tema, densidad, alcance, organización y vista previa                                           |
| Catálogo de módulos            | `/configuracion`    | Grupos, disponibilidad por alcance y restablecimiento local                                    |

## Cambios principales

- Se creó el modelo de datos demo SaaS en `apps/saas/src/data/demo.ts`.
- Se creó `apps/saas/src/components/admin-screen.tsx`, reutilizado por las cinco áreas operativas nuevas.
- Se añadieron las rutas SaaS de organizaciones, instituciones, usuarios, roles/permisos y planes/licencias.
- Se ampliaron el Dashboard, la navegación y los estilos responsive de SaaS.
- Se creó `apps/erp/src/components/modules/demo-crud-panel.tsx` con validación de campos, alta, edición, eliminación confirmada y `localStorage` de demo.
- `ModuleLayout` activa el CRUD local en Contabilidad, Tesorería, Presupuestos, Inventarios, Feligreses, Compras y Gestión sacramental.
- `DataTable` ahora ofrece paginación accesible y conteo de registros.
- Se corrigió el uso de Zod en el piloto visual de intenciones para que Vitest no falle al importar la ruta.
- Se registró Configuración como el módulo 27 de ERP en `data/navigation.ts`.

## Validación ejecutada

- ERP typecheck: aprobado.
- ERP tests: aprobado, 3 archivos y 10 pruebas.
- ERP build: aprobado.
- SaaS typecheck: aprobado.
- SaaS tests: aprobado, 1 archivo y 1 prueba.
- SaaS build: aprobado.
- ERP desarrollo: HTTP 200 verificado en `/app/contabilidad` en `http://localhost:8080`.
- Lint completo ERP: pendiente por deuda preexistente de formato Prettier/CRLF en el repositorio; la ejecución reporta 9.776 errores de formato y 6 advertencias Fast Refresh. No se desactivaron reglas.

## Segunda revisión de cumplimiento — Fase 2

La inyección automática de `DemoCrudPanel` fue retirada de `ModuleLayout`: los módulos deben operar sobre sus propias colecciones y tablas. Se implementó `apps/erp/src/data/local-repository.ts` para lectura inicial, alta, edición, eliminación y persistencia local.

### Estado actualizado

| Módulo | Estado real | Evidencia de esta fase | Pendiente principal |
| --- | --- | --- | --- |
| SaaS: organizaciones, instituciones, usuarios, roles/permisos, planes/licencias | COMPLETO en modo demostración | CRUD integrado en tabla, búsqueda, filtro, detalle, edición, eliminación confirmada y `localStorage` | API, autenticación y permisos reales |
| Feligreses y familias | PARCIAL avanzado | Alta y eliminación actualizan el directorio; relación familiar visible y persistencia local | Edición completa del expediente y relaciones ampliadas |
| Gestión sacramental | PARCIAL avanzado | Alta y eliminación actualizan solicitudes y preparación; persistencia local | Flujo pastoral por etapas y vínculos registrales |
| Documentos y certificados | PARCIAL avanzado | Alta y eliminación actualizan solicitudes; persistencia local | Relación con partida sacramental y emisión controlada |
| Tesorería | PARCIAL avanzado | Nuevo movimiento actualiza tabla, filtros y resumen; persistencia local | Edición, eliminación y conciliación integrada |
| Contabilidad | PARCIAL avanzado | Nuevo comprobante crea débitos/créditos balanceados en el libro diario | Edición/eliminación y actualización completa del plan contable |
| Presupuestos | PARCIAL | Tabla lee colección persistida y conserva filtros | Alta/edición y ejecución derivada de movimientos |
| Inventarios y patrimonio | PARCIAL | Tabla lee colección persistida y conserva filtros | Alta/edición, movimientos y soportes |
| Compras y obligaciones | PARCIAL avanzado | Nueva solicitud actualiza el flujo principal; persistencia local | Conversión solicitud → orden y cuentas por pagar |
| Institución, catequesis, grupos, planificación pastoral, informe anual, gestión documental y portal | PARCIAL | Pantallas y navegación existentes | Formularios CRUD conectados a tablas principales |

No se marca ningún módulo ERP como COMPLETO porque todavía hay acciones de edición/eliminación o relaciones de negocio pendientes. La clasificación COMPLETO aplica únicamente a las cinco áreas administrativas SaaS en modo demostración.

## Fase 4 — integración funcional

### Matriz de dependencias

| Origen | Colección local | Consumidores relacionados | Estado |
| --- | --- | --- | --- |
| Portal del feligrés | `ao-erp:documents:requests` | Portal, Documentos y certificados | INTEGRADA |
| Catequesis y formación | `ao-erp:formation:participants` | Formación y grupos formativos | LOCAL |
| Grupos y ministerios | `ao-erp:pastoral:groups` | Directorio de grupos | LOCAL |
| Gestión documental | `ao-erp:document-management` | Explorador y detalle documental | LOCAL |
| Feligreses | `ao-erp:community:parishioners` | Directorio y relaciones familiares | LOCAL |
| Sacramentos | `ao-erp:sacramental:requests` | Solicitudes y preparación | LOCAL |
| Tesorería | `ao-erp:treasury:movements` | Movimientos, filtros y resumen | LOCAL |
| Contabilidad | `ao-erp:accounting:journal` | Libro diario y balance demostrativo | LOCAL |
| Presupuestos | `ao-erp:budget:lines` | Líneas y filtros presupuestales | LOCAL |
| Inventarios | `ao-erp:assets` | Bienes y filtros patrimoniales | LOCAL |

El repositorio local emite eventos de colección y escucha cambios del evento `storage`, permitiendo que pantallas montadas que comparten una clave reflejen altas, cambios y eliminaciones sin duplicar la colección en memoria.

### Estado de cierre Fase 4

| Módulo | Estado real | Resultado |
| --- | --- | --- |
| Portal del feligrés + Documentos y certificados | PARCIAL AVANZADO | Una solicitud creada desde el portal aparece en el módulo administrativo al compartir `ao-erp:documents:requests`; faltan edición de estado y responsable. |
| Gestión documental | PARCIAL AVANZADO | Registro local de documento, clasificación, responsable, fecha, estado, versión inicial e historial; no existe carga física a servidor. |
| Catequesis y formación | PARCIAL AVANZADO | Inscripciones persistidas y visibles; faltan encuentros, asistencia, edición y seguimiento completo. |
| Grupos, movimientos y ministerios | PARCIAL AVANZADO | Alta local visible en el directorio y filtros; faltan integrantes, reuniones e historial operativo. |
| Institución y estructura | PARCIAL | Persistencia local del perfil; faltan CRUD de sedes, dependencias, responsables y relaciones. |
| Planificación pastoral | PARCIAL | Objetivos leen repositorio local; falta editor de actividades, responsables, grupos, metas e indicadores. |
| Presupuestos | PARCIAL | Colección persistente y tabla conectada; faltan modificaciones, traslados, compromisos, ejecución y saldos trazables. |
| Inventarios y patrimonio | PARCIAL | Colección persistente y tabla conectada; faltan entradas, salidas, traslados, ajustes, existencias y valoración automática. |
| Informe anual parroquial | PARCIAL | Continúa con datos de demostración y aún no consolida todas las colecciones locales. |

### Pruebas Fase 4

- ERP typecheck, pruebas y build: aprobados.
- SaaS typecheck, pruebas y build: aprobados.
- Lint dirigido de los archivos modificados: aprobado.
- Rutas de Fase 4 verificadas con HTTP 200: institución, formación, grupos, planificación, gestión documental, portal, presupuestos e inventarios.
- Los flujos completos de presupuesto e inventario no se declaran aprobados porque todavía no existe la operación de movimiento requerida.

## Fase 5 — cierre operativo y estado verificable

| Proceso | Estado | Resultado |
| --- | --- | --- |
| Solicitudes del feligrés | PARCIAL AVANZADO | Portal y administración comparten `ao-erp:documents:requests`; el alta desde portal aparece en Documentos y certificados. Asignación, estados administrativos, observaciones e historial aún requieren cierre. |
| Gestión documental | PARCIAL AVANZADO | Alta de ficha, metadatos, responsable, versión inicial e historial local. La carga binaria IndexedDB y edición de versiones anteriores quedan pendientes. |
| Presupuestos | PARCIAL AVANZADO | Alta de rubros persistida, gráficos basados en la colección local y tabla actualizada. Modificaciones, traslados, compromisos y saldos trazables quedan pendientes. |
| Inventarios | PARCIAL AVANZADO | Alta de bienes persistida y visible en inventario. Entradas, salidas, traslados, ajustes y existencias automáticas quedan pendientes. |
| Repositorio local | PARCIAL AVANZADO | Claves estables, sincronización entre pantallas y evento `storage`; no es multiusuario ni remoto. No existe migración formal de esquema. |

### Pruebas Fase 5

- ERP typecheck, pruebas, lint dirigido y build: aprobados.
- SaaS typecheck, pruebas y build: aprobados.
- Rutas operativas principales verificadas con HTTP 200.
- No se declara cierre completo de presupuesto, inventario, institución ni planificación pastoral por falta de operaciones esenciales de ciclo completo.

## Fase 6.1 — gestión institucional y planificación pastoral

| Módulo | Estado | Operaciones verificadas | Pendientes |
| --- | --- | --- | --- |
| Institución y estructura | PARCIAL AVANZADO | CRUD local de sedes, responsables y dependencias; relaciones `siteId`/`responsibleId`; edición; confirmación de eliminación; bloqueo de borrado con relaciones activas. | Integración con todas las pantallas institucionales y cargos históricos. |
| Planificación pastoral | PARCIAL AVANZADO | Alta/edición de objetivos; metas; indicadores; responsable por ID; actividades anidadas al objetivo; grupo por ID; fechas; observaciones; cálculo de cumplimiento desde actividades. | Edición individual de actividades, estados avanzados y vista consolidada en informe anual. |
| Grupos y ministerios | PARCIAL AVANZADO | La planificación consulta la colección `ao-erp:pastoral:groups` existente, sin duplicarla. | Integrantes y responsables todavía requieren integración adicional. |
| Formación | PARCIAL AVANZADO | Participantes persistidos en su colección existente; disponible como fuente relacionada. | Vinculación directa de participantes con objetivos y actividades. |

### Pruebas Fase 6.1

- Typecheck ERP: aprobado.
- Pruebas ERP existentes: 3 archivos, 10 pruebas aprobadas en la última ejecución.
- Lint dirigido de los componentes institucionales y pastorales: aprobado; no se desactivaron reglas.
- Build ERP/SaaS: aprobado.
- La verificación navegador automatizada quedó limitada por la indisponibilidad del conector de navegador integrado; las rutas se mantienen servibles por Vite.

No se marca ningún módulo como COMPLETO hasta ejecutar en navegador los diez escenarios solicitados y comprobar persistencia de las relaciones después de recargar.

## Limitaciones fuera de alcance

## Fase 3 — revisión de avance

| Bloque | Estado | Implementación verificada |
| --- | --- | --- |
| Institución y estructura eclesiástica | PARCIAL | Perfil institucional recuperable desde localStorage; sedes, dependencias y responsables continúan siendo datos de referencia sin CRUD completo. |
| Catequesis y formación | PARCIAL AVANZADO | Inscripción de participantes en colección local y actualización de la tabla principal. Programas, niveles, encuentros y asistencia aún requieren edición integrada. |
| Grupos, movimientos y ministerios | PARCIAL AVANZADO | Alta de grupos en el directorio principal, búsqueda, filtros y persistencia local. Integrantes, reuniones e historial aún requieren CRUD. |
| Planificación pastoral | PARCIAL | Objetivos leen colección local; el editor completo de líneas, metas, indicadores, cronograma y actividades relacionadas permanece pendiente. |
| Informe anual parroquial | PARCIAL | Vista consolidada existente; editor por secciones y cálculo respaldado por módulos aún pendientes. |
| Gestión documental | PARCIAL | Explorador y detalle leen colección local; alta, versiones, metadatos y carga local de archivos pendientes. |
| Portal del feligrés | PARCIAL | Solicitudes del portal leen una colección local; autoservicio completo y creación relacionada con módulos internos pendiente. |
| Presupuestos e inventarios | PARCIAL | Colecciones locales conectadas a las tablas; altas, modificaciones, ejecución, movimientos y valoración relacionados pendientes. |

No se marcan módulos de esta fase como COMPLETO. Las rutas y pantallas permanecen navegables y las validaciones de compilación se mantienen como condición de entrega.

No se configuraron Supabase, MySQL ni PostgreSQL; no hay migraciones, credenciales, autenticación, autorización efectiva, pagos, envío de comunicaciones, proveedor de IA ni persistencia de servidor. Los datos son explícitamente ficticios y las acciones locales no representan operaciones institucionales reales.
