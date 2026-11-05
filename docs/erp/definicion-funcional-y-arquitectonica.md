# A&O ERP — definición funcional y arquitectónica

**Estado:** definición aprobada para orientar fases posteriores. Este documento no autoriza cambios de rutas, pantallas, componentes ni datos. La aplicación continúa siendo demostrativa: no contiene persistencia, autenticación ni servicios productivos.

## 1. Propósito y mapa funcional definitivo

A&O ERP es la aplicación para la gestión integral de una institución parroquial. Su uso no depende de que la diócesis adopte A&O Diocesano. Una relación canónica no crea por sí sola una relación comercial con A&O ni permisos de acceso.

La estructura funcional objetivo conserva la agrupación reconocible del ERP y establece estos límites:

| Área | Módulos ERP objetivo | Responsabilidad principal |
|---|---|---|
| General | Dashboard | Resumen del trabajo de la propia institución. |
| Gobierno e institución | Institución; Estructura eclesiástica; Administración institucional; Gobierno y normativa; Usuarios y permisos | Identidad, referencias eclesiásticas propias, operación institucional, referencias normativas y responsabilidades internas. |
| Comunidad y pastoral | Feligreses y familias; Gestión sacramental; Libros sacramentales; Documentos y certificados; Catequesis y formación; Grupos, movimientos y ministerios; Acción pastoral y social; Liturgia y celebraciones; Planificación pastoral | Comunidad, preparación y registros sacramentales, formación, organización pastoral y celebraciones. |
| Finanzas y recursos | Finanzas y tesorería; Contabilidad; Presupuestos; Inventarios y patrimonio; Compras y obligaciones | Efectivo, registros contables por entidad, presupuesto, bienes físicos, adquisiciones y obligaciones. |
| Gestión y control | Informe anual parroquial; Agenda e infraestructura; **Archivo y Gestión Documental**; Auditoría y trazabilidad | Informe propio, calendario y espacios, archivo institucional, digitalización, clasificación, preservación y eventos de trazabilidad. |
| Servicios | Portal del feligrés; Comunicaciones; Inteligencia artificial | Autoservicio parroquial, preparación de comunicaciones y asistencia demostrativa. |
| Sistema | Configuración | Parámetros institucionales y preferencias del ERP. |

El alcance funcional y la navegación parroquial de ERP comprenden **27 módulos más Dashboard**. Administración de plataforma corresponde a SaaS y la supervisión territorial corresponde a Diocesano. En esta Fase 1 sus dos accesos se retiran del menú de ERP, pero sus rutas TanStack y pantallas se conservan temporalmente para continuidad directa y preservación del código. No se cuentan como módulos funcionales de ERP. Su traslado y transición compatible quedan pendientes; Gestión diocesana no se elimina ni se traslada en esta fase. Véase [la tabla de inventario y transición](#2-inventario-actual-de-módulos-y-dashboard) y [el documento de transición](transicion-modulos-saas-diocesano.md).

## 2. Inventario actual de módulos y Dashboard

El inventario distingue la pantalla existente de una función productiva. Todas las pantallas y datos de esta tabla son demostrativos; los controles disponibles son interacciones locales de interfaz y no guardan cambios institucionales.

| Pantalla/ruta | Finalidad y contenido actual | Datos y acciones demostrativas | Estado, relaciones y destino |
|---|---|---|---|
| Dashboard — `/` | Resumen parroquial con comunidad, familias, sacramentos, solicitudes, actividades, economía y pendientes. | Datos escritos directamente en `routes/index.tsx`; enlaces y tareas visuales. | No deriva de los módulos. Debe resumir fuentes definidas y mostrar periodo, entidad y fecha de corte. Área General. |
| Institución — `/app/institucion` | Identidad institucional, canónica y civil; autoridades, organización, sedes y parámetros identificadores. | Perfil ficticio; vista de vinculación local. `institution-profile-demo.ts`. | Se solapa parcialmente con Administración institucional. Mantener identidad y constitución aquí; responsabilidades y operación en Administración institucional. Gobierno e institución. |
| Estructura eclesiástica — `/app/estructura-eclesiastica` | Referencias de entidades eclesiásticas y adscripción. | Relaciones y entidades de muestra; búsqueda y consulta. `governance-demo.ts`. | ERP representa la adscripción propia y referencias autorizadas, no administra territorio ni consulta otras parroquias. Gobierno e institución. |
| Administración institucional — `/app/administracion-institucional` | Responsables, dependencias, contactos, canales, sedes y documentación operativa. | Listados, filtros, fichas e historial ficticios. `governance-demo.ts`. | Coordinar con Institución para no duplicar identidad canónica/civil ni volver a capturar sedes y autoridades sin relación. Gobierno e institución. |
| Gobierno y normativa — `/app/gobierno-normativa` | Referencias normativas, documentos y criterios de consulta. | Catálogo demostrativo y consulta local. `governance-demo.ts`. | No equivale a asesoría ni debe inventar o presentar referencias no verificadas como autoridad. Gobierno e institución. |
| Usuarios y permisos — `/app/usuarios-permisos` | Usuarios institucionales, perfiles y matriz demostrativa de permisos. | Directorio, invitaciones, matriz y actividad; sin autenticación efectiva. `governance-demo.ts`, `system-demo.ts`. | En alcance ERP solo usuarios y responsabilidades internas. Roles globales de producto pertenecen a SaaS. Gobierno e institución. |
| Feligreses y familias — `/app/feligreses-familias` | Directorio, fichas, familias, contactos, participación y referencias comunitarias. | Personas ficticias, filtros, pestañas y fichas. `community-demo.ts`. | Requiere privacidad reforzada y distinción entre hogar, familia, domicilio y pertenencia. Comunidad y pastoral. |
| Gestión sacramental — `/app/gestion-sacramental` | Solicitudes, preparación, requisitos, responsables y programación celebrativa. | Procesos y estados ficticios, calendario y diálogos. `community-demo.ts`. | Solicitud, preparación, celebración y partida son etapas distintas. Relaciona Comunidad, Agenda y Libros sacramentales. Comunidad y pastoral. |
| Libros sacramentales — `/app/libros-sacramentales` | Gestión de libros, tomos, folios y registros de bautismo, confirmación, matrimonio y defunción; consulta y referencia a imágenes digitalizadas. | Folios y detalles ficticios, búsqueda avanzada. `community-demo.ts`. | Mantiene la responsabilidad pastoral y registral del asiento sacramental. Se integra con Archivo y Gestión Documental para conservación, digitalización y consulta de la imagen fuente; no duplica el registro ni convierte una imagen en partida emitida. Comunidad y pastoral. |
| Documentos y certificados — `/app/documentos-certificados` | Solicitudes, verificación de referencias y consulta/representación de documentos emitidos. | Solicitudes y certificados de muestra, estados y vista de detalle. `community-demo.ts`. | Vincular a referencia válida de libro sin duplicar la partida; no atribuir validez oficial al prototipo. Comunidad y pastoral. |
| Catequesis y formación — `/app/catequesis-formacion` | Programas, itinerarios, grupos, catequistas, participantes, encuentros y seguimiento. | Asistencia, avance y calendarios ficticios. `pastoral-demo.ts`. | Vincular participantes con Comunidad y encuentros con la Agenda común. Comunidad y pastoral. |
| Grupos, movimientos y ministerios — `/app/grupos-ministerios` | Directorio de comunidades, equipos, integrantes, responsables y actividades. | Fichas, filtros y actividad ficticia. `pastoral-demo.ts`. | Fuente de referencia para los grupos; Liturgia y Planificación deben enlazar sus actividades, no duplicar la composición. Comunidad y pastoral. |
| Acción pastoral y social — `/app/accion-pastoral-social` | Proyectos pastorales/sociales, voluntariado, recursos e indicadores. | Iniciativas y resultados agregados ficticios; sin exposición de beneficiarios. `pastoral-demo.ts`. | Distinguir acción evangelizadora de atención social y proteger datos sensibles. Relación con Planificación y Tesorería. Comunidad y pastoral. |
| Liturgia y celebraciones — `/app/liturgia-celebraciones` | Calendario litúrgico, programación, intenciones y equipos de servicio. | Eventos, responsables y horarios ficticios. `pastoral-demo.ts`. | La celebración litúrgica es un tipo de actividad; no equivale a solicitud sacramental ni reserva de espacio. Comunidad y pastoral. |
| Planificación pastoral — `/app/planificacion-pastoral` | Objetivos, líneas de acción, programas, proyectos, metas e indicadores. | Avances y cronogramas predefinidos. `pastoral-demo.ts`. | Los porcentajes no son mediciones productivas. Proporciona objetivos a los módulos de actividad. Comunidad y pastoral. |
| Finanzas y tesorería — `/app/finanzas-tesoreria` | Caja, bancos, ingresos, egresos, conciliación y flujo de efectivo. | Movimientos, cuentas y conciliación ficticios. `economy-demo.ts`. | Responsable de movimientos de efectivo; sus movimientos no son automáticamente asientos contables. Finanzas y recursos. |
| Contabilidad — `/app/contabilidad` | Catálogo configurable, comprobantes, asientos, libros y estados. | Débitos, créditos, saldos y entidades ficticias; pestañas y filtros. `economy-demo.ts`. | Cada entidad conserva catálogo, periodos y libros. No consolidar parroquias ni contabilizar automáticamente sin reglas y autorización. Finanzas y recursos. |
| Presupuestos — `/app/presupuestos` | Apropiaciones, proyecciones, ejecución y variaciones. | Líneas, comparativos y alertas ilustrativas. `economy-demo.ts`. | La ejecución debe referenciar movimientos contables según reglas acordadas; evitar una segunda fuente de gasto/ingreso. Finanzas y recursos. |
| Inventarios y patrimonio — `/app/inventarios-patrimonio` | Existencia física, ubicación, custodio, conservación, mantenimiento y soportes. | Bienes y movimientos ficticios; detalle y filtros. `economy-demo.ts`. | Separar inventario físico del reconocimiento, depreciación y valor contable. Finanzas y recursos. |
| Compras y obligaciones — `/app/compras-obligaciones` | Solicitud, cotizaciones, orden, recepción y cuenta por pagar. | Proveedores, ofertas y obligaciones de muestra; vistas del flujo. `economy-demo.ts`. | Vincular recepción, obligación y eventual asiento sin crear duplicados ni aprobación real. Finanzas y recursos. |
| Informe anual parroquial — `/app/informe-anual-parroquial` | Identificación y memoria pastoral, sacramental, administrativa, económica, patrimonial, anexos y presentación. | Secciones con avance y estados ficticios. `institutional-demo.ts`. | Compilación del informe propio con datos de sus áreas y referencias a fuentes; no es un módulo de supervisión territorial. Gestión y control. |
| Gestión diocesana y supervisión — `/app/gestion-diocesana` | Directorio territorial, vicarías, responsables, informes y compromisos de varias parroquias. | Entidades y métricas agregadas ficticias, consulta y detalle. `institutional-demo.ts`. | **Destino funcional aprobado: A&O Diocesano.** La ruta y pantalla actual permanecen intactas temporalmente; la transición y compatibilidad se definirán antes de moverla. ERP conserva seguimiento del informe propio dentro de Informe anual. |
| Agenda e infraestructura — `/app/agenda-infraestructura` | Eventos, reservas, espacios, mantenimiento y fichas de infraestructura. | Calendario, espacios y reservas ficticios. `institutional-demo.ts`. | Consumirá la fuente común definida en la sección 5; una reserva no es una actividad ni una solicitud. Gestión y control. |
| Portal del feligrés — `/app/portal-feligres` | Vista de autoservicio con perfil, solicitudes, certificados, actividades y notificaciones. | Perfil y servicios ficticios sin sesión real. `services-demo.ts`. | Interfaz para persona feligresa; no exponer datos de terceros y no atribuir aislamiento real antes de tener controles efectivos. Servicios. |
| Comunicaciones — `/app/comunicaciones` | Composición, audiencias, plantillas, programación e historial. | Vista previa y estados locales; no envía comunicaciones. `services-demo.ts`. | Distinguir interno, parroquial y comunitario. Una difusión diocesana exige consentimiento, finalidad y canal autorizados. Servicios. |
| Inteligencia artificial — `/app/inteligencia-artificial` | Conversación de ayuda, historial, categorías, preguntas y contexto. | Respuestas predefinidas ficticias, sin proveedor ni consulta real. `services-demo.ts`. | Continuará identificando las respuestas como demostrativas; no afirmar que leyó datos reales. Servicios. |
| Archivo y Gestión Documental — `/app/archivo-gestion-documental` | Archivo institucional parroquial: recepción, clasificación, expedientes, metadatos, digitalización, OCR, instrumentos archivísticos, transferencias y conservación. | Interfaz y datos demostrativos; sin persistencia, OCR ni almacenamiento productivo. | Módulo transversal de ERP. Administra documentos institucionales y sus objetos digitales; se relaciona con Libros sacramentales sin absorber su función registral. Debe aplicar permisos por serie, expediente y sensibilidad documental. Gestión y control. |
| Auditoría y trazabilidad — `/app/auditoria-trazabilidad` | Cronología de usuarios, módulo, acción, entidad y fecha. | Eventos ficticios de consulta, cambio y revisión. `system-demo.ts`. | No constituye auditoría real ni se mezcla con notificaciones, actividad pastoral o bitácoras editables. Gestión y control. |
| Administración de plataforma — `/app/administracion-plataforma` | Organizaciones, planes/servicios, recursos y actividad global. | Métricas y organizaciones ficticias. `system-demo.ts`. | **Destino funcional aprobado: A&O SaaS.** Sale del mapa objetivo de ERP y de su navegación funcional en una fase específica; conservar código e historial hasta su traslado. La ruta no se altera en esta fase. |
| Configuración — `/app/configuracion` | Preferencias regionales, contables, sacramentales, documentales, notificaciones e interfaz. | Valores de ejemplo y estado local de vista previa. | Configuración por entidad/país y preferencias personales deben distinguirse. No imponer catálogos universales. Sistema. |

**Estado del inventario al cerrar la Fase 1:** 27 módulos parroquiales visibles en navegación y Dashboard; dos pantallas/rutas de transición conservadas fuera del menú. Administración de plataforma queda reservada a SaaS; la supervisión territorial queda reservada a Diocesano. Retirar un elemento de menú no convierte su pantalla conservada en un módulo funcional de ERP.

Las rutas se definen por TanStack Router en `apps/erp/src/routes`; el archivo generado `routeTree.gen.ts` es derivado y no se edita manualmente. La lista de navegación funcional está en `apps/erp/src/data/navigation.ts`. Componentes por pantalla: `apps/erp/src/components/modules/*-screen.tsx`. Los datos agrupados están en `apps/erp/src/data/*-demo.ts`.

## 3. Límites entre productos

| Producto | Propiedad funcional | Exclusiones y límites |
|---|---|---|
| **A&O SaaS** | Clientes, organizaciones contratantes, franquicias, licencias, contratos, planes, soporte y operación comercial/técnica de la plataforma. Los usuarios y permisos globales de plataforma también son de SaaS. | No administra la vida parroquial ni ejerce autoridad eclesiástica. |
| **A&O ERP** | Operación de cada institución parroquial: identidad propia, comunidad, pastoral, sacramentos, finanzas, patrimonio, informes y servicios parroquiales. | No administra licencias comerciales ni territorio diocesano. Usuarios, perfiles y permisos se limitan a la institución. |
| **A&O Diocesano** | Directorio territorial, parroquias y vicarías, seguimiento interparroquial de informes, requerimientos, compromisos e indicadores agregados. | No recibe acceso automático a registros personales, sacramentales, contables o administrativos del ERP. |

El vínculo comercial con A&O, la adscripción canónica y el vínculo técnico entre aplicaciones son relaciones distintas. Cualquier intercambio futuro requiere autorización expresa, propósito definido, alcance mínimo, trazabilidad y reglas de integridad histórica. Una parroquia puede operar ERP sin activar A&O Diocesano.

## 4. Modelo conceptual institucional

Las siguientes entidades son conceptos separados; su cardinalidad se configura según la realidad civil y canónica, no por una regla universal de uno a uno:

- **Institución parroquial:** contexto organizativo del ERP, con identificador propio, estado, periodo y datos de identificación.
- **Entidad canónica:** naturaleza, erección, autoridad competente, adscripción y referencias eclesiásticas. Puede existir una relación de adscripción sin que la jurisdicción use A&O Diocesano.
- **Entidad jurídica civil:** razón social, naturaleza, identificación tributaria, representación y documentos civiles, cuando aplique. No se presupone una forma jurídica única ni su correspondencia uno a uno con la entidad canónica.
- **Entidad contable:** unidad que conserva catálogo, moneda/configuración aplicable, periodo, comprobantes, libros y estados propios. Una institución puede organizar su gestión contable en más de una entidad; no se agregan saldos automáticamente.
- **Sede/templo/espacio:** ubicación física, uso, custodia y estado; una institución puede tener varias. Sede, comunidad y entidad contable no son sinónimos.
- **Comunidad/dependencia:** agrupación pastoral u operativa, vinculada a una o más sedes según la estructura local.
- **Usuario/responsabilidad:** persona operadora con responsabilidades limitadas por institución, módulo, finalidad y datos necesarios. Un cargo o pertenencia no concede acceso universal.
- **Feligres/familia:** personas y relaciones familiares/comunitarias. Las relaciones pueden ser múltiples y cambiantes; los datos familiares no equivalen a grupo pastoral.
- **Evento/actividad/registro sacramental:** actividad planificada, evento celebrado y partida documental son conceptos diferentes. La partida remite a un acto celebrado y sus datos autorizados.
- **Registro económico y bien físico:** caja/banco, comprobante, partida presupuestal, obligación y bien inventariado tienen identidades distintas aunque se relacionen.

Los identificadores deben ser propios y las relaciones importantes conservar historial de cambios. La futura implementación deberá decidir qué cambios son corregibles, versionables o requieren una nueva relación; esta definición no prescribe una base de datos.

## 5. Fuente común de agenda y actividades

Se establece un concepto compartido de **actividad institucional programada** y un calendario común para su consulta. Los módulos de Liturgia, Catequesis, Grupos, Acción pastoral y social y Planificación pastoral podrán referenciar una actividad, con vista y campos específicos por finalidad.

Tipos y estados que no deben confundirse:

| Concepto | Significado funcional |
|---|---|
| Actividad programada | Elemento de agenda propuesto para una fecha, responsable y contexto. |
| Celebración litúrgica | Actividad de culto con datos litúrgicos y equipo propio; puede ocupar un espacio. |
| Encuentro formativo | Sesión vinculada a programa, grupo, formador y participantes. |
| Reserva de espacio | Solicitud de uso de un recurso físico y un intervalo; no crea por sí sola una actividad confirmada. |
| Solicitud pendiente | Petición aún no confirmada, incluyendo solicitudes sacramentales o reservas, cada una con su flujo propio. |
| Evento confirmado | Actividad aceptada y programada; no implica que se haya celebrado. |

La fuente común evita duplicar fechas, responsables y lugares. Cada módulo mantiene su semántica, participantes, requisitos y permisos. El historial debe distinguir propuesta, aprobación, cambio, cancelación y realización. La confirmación de una actividad no debe inscribir una partida sacramental ni bloquear recursos sin una regla explícita.

## 6. Modelo financiero y referencias entre módulos

| Módulo | Fuente de responsabilidad | Relaciones a definir |
|---|---|---|
| Finanzas y tesorería | Caja, bancos, ingresos, egresos y movimientos de efectivo. | Movimiento con cuenta, fuente, soporte y, si aplica, referencia a comprobante contable; conciliación como cotejo, no duplicación del movimiento. |
| Contabilidad | Comprobantes, asientos, libros, catálogo y estados de cada entidad contable. | Catálogo y periodo pertenecen a su entidad. Débitos/créditos y estados no se mezclan entre entidades automáticamente. |
| Presupuestos | Apropiaciones, proyecciones, ejecución y variaciones por periodo/dimensión. | Ejecución referenciada a registros contables acordados; presupuesto no es otra caja ni asiento. |
| Compras y obligaciones | Solicitudes, ofertas, órdenes, recepción y cuentas por pagar. | Identificadores de solicitud/orden/recepción/obligación y soportes; reconocimiento contable sujeto a regla y aprobación. |
| Inventarios y patrimonio | Existencia física, ubicación, custodia, conservación, soportes y mantenimiento. | Referencia opcional al tratamiento contable del activo; el valor físico y el valor en libros siguen siendo campos de propósitos diferentes. |

Cada entidad contable conserva su propio catálogo y periodo. Una vista consolidada futura solo puede existir con alcance, reglas, moneda, ajustes y autorización definidos; no se suman automáticamente recursos de varias parroquias. No se presuponen contabilizaciones, pagos ni aprobación automática por crear una solicitud o registrar recepción.

El Informe anual puede incluir cifras y soportes agregados de fuentes aprobadas, con periodo y entidad explícitos. No debe convertirse en un segundo libro financiero.

## 7. Privacidad y matriz conceptual de permisos

La política de producto debe aplicar mínimo privilegio, finalidad, contexto institucional, limitación por campo cuando sea necesaria y registro de acceso/cambio. La matriz siguiente es conceptual; no implementa autenticación ni sustituye una política jurídica local.

| Categoría | Ejemplos | Criterio de acceso |
|---|---|---|
| Identidad y contacto personal | Identificación, dirección, correo y teléfono | Solo funciones que requieren mantener o atender el registro; mostrar solo campos necesarios. |
| Familiar | Parentescos y relaciones del hogar | Acceso justificado por la tarea y limitado a personas relacionadas; no inferir acceso de un familiar a otro. |
| Sacramental | Solicitudes, preparación, celebraciones, partidas y certificados | Acceso restringido por responsabilidad y necesidad; consulta, emisión y modificación son acciones distintas y trazables. |
| Pastoral/social | Participación, acompañamiento, voluntariado y atención a población vulnerable | Acceso limitado al equipo y finalidad de acompañamiento; evitar exposición de beneficiarios en informes agregados. |
| Financiera/contable | Cajas, movimientos, comprobantes, presupuestos y obligaciones | Alcance por entidad contable, función y periodo; el acceso diocesano no es implícito. |
| Administrativa/documental | Identidad institucional, contratos locales, soportes, documentos reservados | Clasificación del documento y responsabilidad institucional; los documentos sacramentales llevan clasificación más restrictiva. |
| Plataforma/comercial | Contratos A&O, licencias, facturación SaaS, soporte e infraestructura global | Exclusivo de procesos y personal autorizado de SaaS; fuera de ERP parroquial. |
| Datos agregados compartidos | Estado del informe o indicadores aprobados | Compartir solo con consentimiento/autoridad aplicable, propósito definido, alcance mínimo y trazabilidad. |

Ni contratación con A&O, ni adscripción canónica, ni cargo, ni existencia de una cuenta de usuario conceden por sí solos acceso a todos los datos. La delegación debe ser expresa, acotada y revocable conforme a reglas que preserven la trazabilidad histórica.

## 8. Criterios para datos demostrativos

Se adopta como **contexto canónico de demostración** la institución ya descrita en `institution-profile-demo.ts`:

- Institución: **Parroquia Santa María del Camino** (nombre corto: Parroquia Santa María; identificador de muestra PAR-014).
- Referencia canónica ficticia: **Diócesis de San Gabriel**. Es una relación de demostración, no una conexión a una diócesis real ni un requisito para usar ERP.
- País y presentación económica: **Colombia / COP**, según parámetros demostrativos locales.
- Periodo ilustrativo actual: **2026**.
- Sedes de referencia: Templo Santa María, Centro pastoral La Esperanza, oficina parroquial y demás espacios que se indiquen como propios.
- Contactos, documentos, autoridades, cifras, actividades y personas son inventados. Identificadores como PAR-014 y documentos DEMO deben rotularse como muestra y no aparentar validez civil, canónica, sacramental o contable.

Al implementar una futura actualización documental o de datos, Dashboard, Comunidad, Sacramentos, Pastoral, Agenda, Finanzas e Informe anual deben usar ese mismo contexto. Los registros actualmente rotulados como Parroquia San Gabriel, Diócesis de Montería u otra institución deben normalizarse o explicarse como entidad relacionada antes de mostrarse juntos. La entidad contable secundaria “Obra Social Santa Clara” solo se mantiene si se documenta explícitamente su relación y alcance; de otro modo, no se presenta como parte de la institución común. Los datos del directorio diocesano son un conjunto territorial ficticio aparte y no se mezclan con los registros internos de la parroquia.

Todos los valores son ilustrativos, no deben describirse como indicadores reales y no representan un registro oficial. Debe mostrarse en cada área la entidad y periodo al que se refieren. Los totales del Dashboard no se considerarán consistentes hasta enlazarlos a fuentes de ejemplo conciliadas.

## 9. Plan de implementación por fases

Este plan no se ejecuta con la aprobación documental actual; cada fase posterior tendrá su alcance de implementación y validación.

1. **Preparación funcional:** acordar fuentes de actividad, modelo de entidades, permisos por datos y criterios de consistencia económica; conservar las decisiones de este documento como referencia.
2. **Salida física de Administración de plataforma:** su presencia en la navegación ERP ya fue retirada en Fase 1. En una fase dedicada, trasladar su código e historial a SaaS y definir la transición de `/app/administracion-plataforma`; hasta entonces se conserva la ruta directa y la pantalla.
3. **Transición de Gestión diocesana:** su presencia en la navegación parroquial ya fue retirada en Fase 1. Trasladar/directorizar el alcance territorial en A&O Diocesano y mantener en ERP el envío y seguimiento del informe de la parroquia. Especificar compatibilidad de `/app/gestion-diocesana`, conservación de estado e información antes de cualquier movimiento.
4. **Contexto institucional y datos de ejemplo:** alinear los datasets de ERP con una sola parroquia de referencia, sus sedes, jurisdicción ficticia, país, periodo y contexto económico; separar claramente datos territoriales diocesanos.
5. **Agenda y actividad común:** definir tipos, estados, participantes, espacios y referencias entre Liturgia, Formación, Grupos, Acción pastoral, Planificación e Infraestructura.
6. **Relaciones financieras:** acordar identificadores y referencias entre Tesorería, Contabilidad, Presupuestos, Compras, Obligaciones e Inventario; verificar límites por entidad contable y evitar duplicidad.
7. **Modelo de privacidad y responsabilidades:** diseñar alcance por institución, finalidad, módulo y categoría sensible; separar permisos parroquiales, diocesanos y SaaS. No activar datos reales en esta fase sin autorización específica.
8. **Integración del Informe anual:** definir qué fuentes agregadas alimentan cada sección, su periodo, estado y referencia; mantener la autoría de cada área fuente.
9. **Dashboard funcional:** después de disponer de fuentes coherentes, definir indicadores, alertas, tareas, agenda, accesos y actividad reciente con trazabilidad a su origen.
10. **Rediseño visual y verificación:** rediseñar por grupos funcionales sobre límites ya acordados; comprobar rutas, navegación, roles conceptuales, accesibilidad, consistencia de datos demostrativos y compilación sin introducir backend no autorizado.

## 10. Decisiones registradas y restricciones vigentes

Se registran como aprobadas: propiedad de Administración de plataforma por SaaS; destino diocesano de la supervisión territorial; alcance parroquial de ERP y su independencia de la adopción de Diocesano; modelo institucional no uno-a-uno; agenda común con tipos diferenciados; separación de responsabilidades financieras; mínimo privilegio y autorización expresa; y contexto ficticio único para ERP.

Esta definición no cambia rutas, navegación, módulos existentes, carpetas, pantallas ni componentes. Tampoco autoriza bases de datos, backend, autenticación, integraciones ni servicios productivos. La pantalla de Gestión diocesana y la pantalla de Administración de plataforma se mantienen en su ubicación actual hasta las fases de transición aprobadas.
