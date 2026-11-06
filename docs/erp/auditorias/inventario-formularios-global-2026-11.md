# Inventario global de formularios A&O ERP

**Fecha:** 2026-11-05  
**Alcance:** biblioteca compartida, variantes visuales y migración funcional progresiva.

## Biblioteca compartida

| Componente | Ubicación | Estado |
| --- | --- | --- |
| Modal estándar | `apps/erp/src/components/forms/form-modal.tsx` | Disponible y usado por el piloto visual. |
| Formulario ampliado | `apps/erp/src/components/forms/form-page.tsx` | Disponible y usado por el piloto visual. |
| Panel lateral | `apps/erp/src/components/forms/form-drawer.tsx` | Disponible y usado por el piloto visual. |
| Secciones | `apps/erp/src/components/forms/form-section.tsx` | Disponible. |
| Campos con RHF y mensajes | `apps/erp/src/components/forms/form-field.tsx` | Disponible para texto, correo, teléfono, número, fecha, selector y textarea. |
| Acciones y estados de submit | `apps/erp/src/components/forms/form-actions.tsx`, `use-form-submit.ts` | Disponible; previene doble submit y expone error. |
| Wizard configurable | `apps/erp/src/components/forms/form-wizard.tsx` | Disponible; valida campos del paso, conserva valores y permite anterior/siguiente. |
| Contador y validación | `form-character-counter.tsx`, `form-validation-message.tsx` | Disponible. |
| Archivo local | `form-file-field.tsx` | Disponible como selector local; no simula carga remota ni persiste binarios por sí solo. |

## Matriz de migración

| Grupo | Formularios existentes | Estado |
| --- | --- | --- |
| Gobierno e institución | Formularios legados y panel operativo institucional | PARCIAL; el adaptador compartido ya aplica la carcasa estándar y protección de cambios, pero quedan migraciones específicas a RHF. |
| Comunidad y pastoral | Formación, grupos, planificación y portal | PARCIAL; el adaptador compartido unifica la experiencia visual, pero quedan migraciones específicas a RHF. |
| Liturgia y celebraciones | Piloto de Intenciones de Misa | MIGRADO como referencia de las tres variantes. |
| Gestión sacramental | Solicitudes y preparación | MIGRADO parcialmente; la solicitud principal usa `FormModal`, `FormSection` y campos RHF; el resto recibe la carcasa estándar mediante el adaptador. |
| Documentos y certificados | Solicitudes documentales | PARCIAL; conserva `FormDialog` legado por compatibilidad. |
| Gestión documental | Alta de documento y detalle | PARCIAL; metadata local funcional, carga binaria pendiente. |
| Inventarios y patrimonio | Alta de bienes | PARCIAL; componente operativo funcional, movimientos patrimoniales pendientes. |
| Compras y obligaciones | Solicitud de compra | PARCIAL; formulario local funcional, ciclo completo pendiente. |
| Usuarios y permisos | Invitación demostrativa | PARCIAL; no crea cuentas reales. |
| Servicios y configuración | Preferencias y portal | PARCIAL. |
| Contabilidad | Comprobante y libro diario | EXCEPCIÓN FINANCIERA; no se migra al patrón estándar. |
| Presupuestos | Rubros y ejecución | EXCEPCIÓN FINANCIERA; no se migra al patrón estándar. |

## Decisión visual

La imagen suministrada se usa como referencia de composición, agrupación, acciones y variantes. Se conservan los tokens reales de A&O ERP definidos en `styles.css`, Plus Jakarta Sans para el cuerpo y Montserrat únicamente donde ya forma parte de la jerarquía de encabezados. No se reemplaza la identidad institucional vigente por los colores o tipografía de la imagen.

## Pendientes

- Migrar gradualmente los formularios legados a React Hook Form sin perder sus operaciones.
- Añadir confirmación de cierre con cambios sin guardar a modal, wizard y drawer.
- Implementar persistencia IndexedDB para archivos binarios cuando el módulo documental lo requiera.
- Completar formularios financieros especializados de Contabilidad y Presupuestos de forma independiente.

## Fase 7.2 — auditoría funcional de formularios legados

La auditoría inicial identificó 23 archivos con referencias a `FormDialog`. Después de migrar la
solicitud sacramental principal, Comunidad y Grupos, quedan 17 archivos con referencias directas.
El adaptador visual compartido no se contabiliza como migración funcional.

| Grupo | Módulo / operación | Complejidad | Variante recomendada | Estado real |
| --- | --- | --- | --- | --- |
| A | Institución y sedes/dependencias | Complejo | `FormModal` / `FormDrawer` | MIGRADO; crea y edita sedes, dependencias y responsables con relaciones locales |
| A | Estructura eclesiástica / vínculo | Intermedio | `FormModal` | Pendiente; prepara solicitud, no ejecuta cambio persistente |
| A | Administración institucional / responsable | Sencillo | `FormModal` | Pendiente; vista previa, no crea responsable |
| A | Usuarios y permisos / invitación | Intermedio | `FormModal` | Pendiente; no crea usuario local |
| A | Agenda institucional / reserva | Intermedio | `FormDrawer` | Pendiente; no persiste reservas |
| B | Planificación pastoral / objetivos y actividades | Complejo | `FormWizard` | Pendiente; operaciones locales, falta tipado RHF |
| B | Formación / inscripción | Intermedio | `FormModal` | Pendiente; falta edición y validación completa |
| B | Acción pastoral / registro comunitario | Intermedio | `FormModal` | Pendiente; CRUD parcial |
| C | Liturgia / celebración | Intermedio | `FormModal` | Pendiente; acción actual de vista previa |
| C | Libros sacramentales / consulta | Sencillo | `FormModal` | Pendiente; es filtro, no CRUD |
| D | Documentos y certificados / solicitud | Intermedio | `FormWizard` | Pendiente; falta edición y relaciones |
| D | Gestión documental / metadatos | Complejo | `FormModal` | MIGRADO parcialmente; crea fichas con validación, el binario sigue pendiente |
| D | Portal del feligrés / solicitud | Intermedio | `FormModal` | MIGRADO; crea solicitudes locales con validación y sincroniza el repositorio de Documentos y certificados |
| D | Compras y obligaciones / solicitud | Intermedio | `FormWizard` | Pendiente; falta conversión y edición integrada |
| E | Comunicaciones / programación | Sencillo | `FormModal` | Pendiente; solo vista previa |
| E | Tesorería / movimiento | Intermedio | `FormModal` | Pendiente; CRUD local, falta migración RHF |
| E | Inventarios y patrimonio / bien | Complejo | `FormModal` | MIGRADO parcialmente; registra bienes con valoración y custodio, movimientos pendientes |

Migrados funcionalmente en esta revisión: Comunidad, Grupos, Institución y sedes/dependencias,
Gestión documental (alta), Portal del feligrés, Inventarios (alta) y la solicitud principal de
Gestión sacramental usando `FormModal` + RHF. Contabilidad y
Presupuestos permanecen fuera de esta migración estándar por su modelo financiero especializado.
