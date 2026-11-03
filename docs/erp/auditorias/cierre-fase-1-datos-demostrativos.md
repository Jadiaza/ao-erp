# Cierre de la fase 1: datos demostrativos

**Alcance:** preparación de una base ficticia coherente para A&O ERP, conforme a la fase 1 del plan funcional. No se implementaron procesos operativos.

## 1. Archivos creados y modificados

Se creó `apps/erp/src/data/parish-demo.ts` y este informe; se modificaron 23 archivos fuente existentes de A&O ERP. En total, la fase afectó 24 archivos fuente: 1 creado y 23 modificados.

- Datos: `apps/erp/src/data/parish-demo.ts` (nuevo), `institution-profile-demo.ts`, `community-demo.ts`, `governance-demo.ts`, `institutional-demo.ts`, `economy-demo.ts`, `pastoral-demo.ts`, `system-demo.ts`, `demo.ts` y `services-demo.ts`.
- Pantallas: `apps/erp/src/routes/index.tsx`; `apps/erp/src/components/layout/app-shell.tsx`; y `apps/erp/src/components/modules/institutional-administration-screen.tsx`, `institution-screen.tsx`, `settings-center-screen.tsx`, `sacramental-books-screen.tsx`, `parishioner-portal-screen.tsx`, `sacramental-screen.tsx`, `parish-report-screen.tsx`, `communications-screen.tsx`, `users-permissions-screen.tsx`, `accounting-screen.tsx`, `liturgy-screen.tsx` y `treasury-screen.tsx`.

No se modificaron archivos de A&O SaaS ni A&O Diocesano, rutas, ni archivos generados de TanStack Router. No se instalaron dependencias.

**Nota de trazabilidad:** el workspace no dispone de metadatos de Git, por lo que no fue posible verificar este inventario mediante un diff independiente. La clasificación de 1 archivo creado y 23 modificados se basa en el registro de cambios de la sesión y en la verificación documentada en `docs/erp/auditorias/verificacion-cierre-fase-1.md`.

## 2. Datos demostrativos creados o ajustados

Se creó `parish-demo.ts` como referencia central con identificador `PAR-DEMO-014`, nombre **Parroquia Santa María del Camino**, sedes ficticias, contactos de ejemplo, responsables y la entidad contable `ENT-DEMO-PAR-014`. Los correos usan el dominio reservado `.example.test`; direcciones, teléfonos, números de identificación y documentos se marcan como ficticios o ilustrativos.

El conjunto relacionado quedó conectado así:

- Institución, administración operativa, informe anual, directorio de personas, usuarios de muestra y perfil del usuario usan la misma identidad parroquial y sus referencias compartidas.
- Templos, capilla, oficinas, casa cural, centro pastoral, archivo, parqueadero y bodega tienen identificadores estables. Agenda, liturgia e inventario reutilizan esos nombres de sede.
- Los responsables pastorales, celebrantes, custodios, contactos y usuarios de ejemplo proceden del contexto compartido cuando representan a la misma persona o función.
- Feligreses, solicitudes y referencias sacramentales conservan nombres e identificadores sintéticos; las referencias sacramentales continúan rotuladas como ficticias y no representan partidas oficiales.
- Tesorería y contabilidad muestran una sola entidad parroquial. Los ingresos y egresos del resumen financiero se derivan de los movimientos demostrativos; las cuentas y asientos pertenecen al identificador contable parroquial. El balance demostrativo mantiene activos iguales a pasivos más patrimonio.
- Dashboard, tesorería, inventarios, libros, portal, informe y administración institucional ahora muestran la misma parroquia y sedes donde comparten esa información.
- Las respuestas cuantitativas del asistente demostrativo para estados territoriales y grupos parroquiales se derivan ahora de sus respectivos conjuntos de muestra, evitando cifras contradictorias y sin consultar fuentes externas.

## 3. Módulos afectados

Dashboard; Institución; Administración institucional; Usuarios y permisos; Feligreses y familias; Gestión sacramental; Libros sacramentales; Catequesis y formación; Grupos, movimientos y ministerios; Liturgia y celebraciones; Acción pastoral y social; Planificación pastoral; Finanzas y tesorería; Contabilidad; Presupuestos; Inventarios y patrimonio; Compras y obligaciones; Informe anual parroquial; Agenda e infraestructura; Portal del feligrés; Comunicaciones; Auditoría y trazabilidad; Configuración; y el conjunto demostrativo legado sin consumidor identificado.

Las pantallas de supervisión diocesana y administración global de plataforma conservan fixtures territoriales o comerciales aislados, como datos de transición. No se conectaron con los datos operativos de la parroquia ni se habilitó acceso entre aplicaciones.

## 4. Validaciones ejecutadas

- TypeScript (`bun.cmd run --filter @ao/erp typecheck`): **aprobado**.
- Pruebas (`bun.cmd run --filter @ao/erp test`): **1 archivo y 3 pruebas aprobadas**.
- Build (`bun.cmd run --filter @ao/erp build`): **aprobado**.
- Rutas: comprobación HTTP directa de las 30 rutas generadas —Dashboard y las 29 rutas `/app` existentes—: **30 respuestas HTTP 200**, sin marcadores de error de renderizado.
- ESLint con la regla de formato Prettier desactivada: **0 errores** y 6 advertencias de Fast Refresh en componentes `src/components/ui`.
- Lint estándar: **no pasa**; informa 1.321 errores de formato de Prettier y 6 advertencias de Fast Refresh en componentes `src/components/ui`. No se reformateó el proyecto completo porque habría producido cambios extensos ajenos al alcance. ESLint con la regla Prettier desactivada termina con 0 errores y las mismas 6 advertencias.
- UTF-8: los 24 archivos fuente modificados se pudieron decodificar como UTF-8; no se detectaron caracteres de reemplazo.
- Consistencia: se revisaron las referencias compartidas de parroquia, sedes, responsables, feligreses, cifras y entidad contable. También se comprobaron las rutas del menú y las rutas transicionales que siguen en el árbol existente.

## 5. Limitaciones conocidas

- Las agendas de Agenda institucional, Liturgia, celebraciones sacramentales y Portal siguen siendo fixtures separados del prototipo. Sus sedes y responsables utilizan las referencias compartidas, pero no se creó una fuente maestra ni una publicación pública común. Resolver fuente de verdad, conflictos y qué eventos son publicables corresponde a la fase 3A y a sus aprobaciones.
- Los fixtures de administración de plataforma y supervisión diocesana siguen representando ámbitos separados y de transición. Son datos estáticos; no demuestran permisos, intercambio autorizado ni acceso a datos parroquiales.
- Los datos financieros son ilustrativos y no constituyen cálculos productivos ni asientos reales. Las cifras agregadas y los saldos pueden representar cortes distintos cuando así lo indica la pantalla.
- No existe persistencia: los datos compartidos son fixtures de compilación y las interacciones existentes continúan siendo visuales.
- El lint estándar requiere una normalización de formato de alcance general que queda fuera de esta fase.

## 6. Confirmación de alcance

La fase 1 queda implementada con datos ficticios y referencias comunes. **No se implementó la fase 2A ni ninguna funcionalidad posterior de Intenciones de Misa**: no se añadió captura de intenciones, ciclo ni estados de solicitud, asignación o confirmación, gestión de ofrendas o estipendios, calendario litúrgico nuevo, pagos, notificaciones automatizadas, autenticación, permisos nuevos, persistencia ni integraciones externas.

No se cambiaron SaaS ni Diocesano, no se crearon rutas y no se modificó manualmente `routeTree.gen.ts`. La siguiente fase requiere autorización independiente.
