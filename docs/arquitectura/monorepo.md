# Arquitectura del monorepositorio A&O

## Alcance actual

En la primera extracción, la única aplicación implementada es A&O ERP. Sus 29 rutas de módulos bajo `/app`, la ruta `/` del Dashboard, sus componentes, datos demostrativos, estilos y comportamiento se conservan juntos en `apps/erp`. A&O SaaS y A&O Diocesano serán aplicaciones independientes; no comparten navegación, dashboard, roles, permisos ni datos de negocio.

## Límites entre productos

- **A&O SaaS** administra comercial y técnicamente organizaciones, planes y licencias de los productos A&O.
- **A&O ERP** administra la operación institucional parroquial. Una parroquia puede usarlo sin estar vinculada a una diócesis dentro de A&O.
- **A&O Diocesano** administra funciones propias de una jurisdicción eclesiástica, con aplicación, navegación, dashboard, configuración y permisos propios.
- La relación comercial con A&O es distinta de la relación canónica con una diócesis. Ninguna aplicación obtiene acceso automático e indiscriminado a datos de otra.
- Cualquier integración futura deberá tener autorización explícita, alcance mínimo y contratos de intercambio documentados. No se implementa integración en esta migración.

## Definición aprobada: límites de producto y gestión diocesana

La pantalla actual de ERP en `/app/gestion-diocesana` presenta un directorio territorial de parroquias ficticias, vicarías, responsables, estado de informes anuales, observaciones y compromisos. Presenta indicadores agregados y aclara que no concede acceso a información personal, sacramental ni contable. Es una demostración, no una conexión real con parroquias.

La distribución funcional está aprobada y se documenta en `docs/erp/definicion-funcional-y-arquitectonica.md`. La implementación y la transición de la pantalla siguen pendientes de una fase específica:

1. A&O ERP conserva la gestión del informe anual propio de la parroquia y la constancia/estado de su envío dentro del módulo Informe anual parroquial.
2. A&O Diocesano es propietario del directorio territorial, seguimiento agregado de informes, requerimientos institucionales y compromisos entre parroquias y jurisdicción.
3. En la Fase 1 de reorganización funcional, el acceso territorial se retiró de la navegación parroquial. El contenido actual de `/app/gestion-diocesana` no se elimina, duplica ni traslada; la pantalla y ruta permanecen temporalmente accesibles por URL directa.
4. La transición física de la ruta y pantalla se conserva pendiente hasta definir compatibilidad, permisos y preservación del historial. No habrá acceso cruzado ni consulta de registros parroquiales sin autorización y finalidad definidas.

Administración de plataforma pertenece exclusivamente a SaaS. Su código e historial se conservarán para un traslado futuro; no se elimina ni se mueve durante una fase documental. ERP conserva los usuarios y permisos internos de cada institución parroquial. El inventario definitivo, el modelo institucional, las relaciones funcionales, privacidad y plan de fases constan en la definición funcional de ERP enlazada arriba.

La Fase 1 retiró de la navegación ERP tanto Administración de plataforma como Gestión diocesana y supervisión. Sus fuentes de ruta y pantallas siguen temporalmente disponibles por URL directa y no se cuentan entre los 27 módulos parroquiales visibles. Los detalles de dependencias y transición están en `docs/erp/transicion-modulos-saas-diocesano.md`.

## Paquetes compartidos

`packages/utilities` contiene únicamente `cn`, una función neutral para combinar clases y resolver utilidades Tailwind. ERP la consume mediante la dependencia de workspace `@ao/utilities`. No se trasladaron botones, tablas, layouts ni otras primitivas de `src/components/ui`: las aplicaciones SaaS y Diocesano todavía no las necesitan y conservar sus shells y estilos locales evita acoplamiento visual. Se reconsiderarán paquetes UI y tokens base cuando exista un consumidor real en más de una aplicación.

No se comparten layouts funcionales, navegación, dashboards, permisos, datos ni modelos propios de operación parroquial o diocesana.

## Gestor de paquetes

El repositorio ya contiene `bun.lock` y Bun 1.2.22 está disponible en el entorno. Se utilizará Bun como gestor único del workspace. La documentación heredada de Lovable que indica npm deberá actualizarse durante la migración.
