# Transición de módulos entre ERP, SaaS y Diocesano

**Estado:** destinos funcionales aprobados; traslado físico pendiente. Esta nota documenta la Fase 1 de reorganización de A&O ERP. No implementa SaaS ni Diocesano.

## 1. Resultado de la Fase 1 en ERP

- La navegación funcional de ERP contiene Dashboard y 27 módulos parroquiales.
- Se retiraron del menú `Administración de plataforma` y `Gestión diocesana y supervisión`.
- Se conservaron las fuentes de ruta, pantallas, datos y componentes. Las dos URLs aún se pueden abrir directamente mientras se prepara una transición compatible.
- Las rutas de transición no se contabilizan como módulos funcionales parroquiales.
- No se modificó la pantalla de Informe anual parroquial ni se creó una pantalla en A&O Diocesano.

## 2. Administración de plataforma → A&O SaaS

### Alcance que se trasladará

Administración comercial y técnica de organizaciones/clientes, franquicias, licencias, contratos, planes, soporte, recursos y actividad global de la plataforma. Los roles globales de plataforma también corresponden a SaaS. No es una función parroquial.

### Implementación existente que se conserva en ERP

| Elemento | Ubicación actual | Dependencias y tratamiento futuro |
|---|---|---|
| Ruta TanStack | `apps/erp/src/routes/app/administracion-plataforma.tsx` | Conservada; URL `/app/administracion-plataforma` excluida del menú. Definir redirección, retirada o página de transición solo al trasladar la función. |
| Pantalla | `apps/erp/src/components/modules/platform-admin-screen.tsx` | Conservada íntegra. Depende de componentes genéricos de módulo, primitivas `Card`/`Progress` y `lucide-react`. |
| Datos de muestra | `platformOrganizations` y `platformActivity` en `apps/erp/src/data/system-demo.ts` | El archivo también contiene datos usados por Gestión documental y Auditoría. No moverlo completo sin separar las exportaciones de plataforma de las compartidas. |
| Componentes potencialmente reutilizables | `DemoNotice`, `DetailDrawer`, `InfoItem`, `ModuleLayout`, `Progress`, `StatCard`, `StatusBadge`, `Tabs` y componentes `Card` | Son primitivas neutrales de interfaz. No se copian automáticamente a paquetes compartidos; SaaS puede adaptarlas o reconstruir su presentación local cuando tenga un consumidor concreto. |

La pantalla actual es demostrativa: sus organizaciones, planes, usuarios, telemetría y actividad no reflejan clientes ni infraestructura reales. El futuro módulo de SaaS debe tener navegación, roles, datos y diseño propios.

## 3. Gestión diocesana y supervisión → A&O Diocesano

### Funciones territoriales reservadas a Diocesano

- Directorio territorial de parroquias y vicarías.
- Estado interparroquial de informes anuales.
- Requerimientos, compromisos y seguimiento entre jurisdicción y parroquias.
- Indicadores institucionales agregados.

Estas capacidades requieren un ámbito y autorizaciones diocesanas explícitas. No abren acceso automático a datos personales, sacramentales, contables o administrativos del ERP.

### Funciones que permanecen en ERP

El módulo **Informe anual parroquial** conserva la preparación, revisión interna, presentación, estado de recepción y respuesta a observaciones dirigidas a la propia parroquia. La parroquia puede completar y conservar su informe aunque su diócesis no utilice A&O Diocesano.

### Implementación existente que se conserva en ERP

| Elemento | Ubicación actual | Dependencias y tratamiento futuro |
|---|---|---|
| Ruta TanStack | `apps/erp/src/routes/app/gestion-diocesana.tsx` | Conservada; URL `/app/gestion-diocesana` excluida del menú. La estrategia de redirección/compatibilidad se resolverá antes del traslado. |
| Pantalla | `apps/erp/src/components/modules/diocesan-management-screen.tsx` | Conservada sin cambios. Usa componentes genéricos de módulo, `Card`, `Progress` y `lucide-react`. |
| Datos territoriales | Exportación `dioceseParishes` de `apps/erp/src/data/institutional-demo.ts` | Comparte archivo con secciones del informe parroquial, eventos y espacios. Extraer únicamente el conjunto territorial al preparar la aplicación Diocesano; no trasladar todo el archivo. |
| Componentes potencialmente reutilizables | `DataTable`, `DemoNotice`, `DetailDrawer`, `InfoItem`, `ModuleLayout`, `SearchInput`, `StatCard`, `StatusBadge`, `Progress` y `Card` | Primitivas neutrales; no contienen autorización diocesana ni reglas de negocio. Su reutilización visual requiere evaluación separada. |

La pantalla usa directorio y conteos ficticios; no recibe datos de otras parroquias. Sus valores no representan supervisión ni reportes reales.

## 4. Política de preservación y transición

1. No borrar las rutas, pantallas ni datos de muestra de ERP durante esta fase.
2. Mantener sus rutas registradas para preservar el acceso directo mientras se prepara el traslado; no mostrarlas en navegación parroquial.
3. Antes de mover código, identificar importaciones compartidas, extraer solo los datos de cada producto y definir el nuevo destino de URL.
4. Decidir compatibilidad de enlaces guardados y marcadores, incluidas redirección o página informativa, antes de cambiar la ruta actual.
5. Preservar el historial de trabajo; no sustituir la interfaz de ejemplo por operaciones productivas ni crear acceso entre aplicaciones.
6. Validar que ERP mantenga las 27 rutas funcionales visibles, Dashboard y ambas rutas de transición mientras la transferencia no se complete.

## 5. Archivos tocados en la Fase 1

La Fase 1 modifica solo `apps/erp/src/data/navigation.ts` para delimitar el menú, `apps/erp/src/test/app-routing.test.tsx` para probar el inventario y las URLs de transición, y documentación funcional/arquitectónica. No se modifican `routeTree.gen.ts`, las rutas fuente ni las pantallas reservadas.
