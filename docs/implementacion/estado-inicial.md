# Implementación de A&O ERP

## Principio de arquitectura

A&O es un único sistema y una única aplicación funcional: **A&O ERP**. Los dominios se organizan en módulos internos de la aplicación; no se crean aplicaciones ni productos separados para contabilidad, SaaS, gestión diocesana u otras capacidades. Las carpetas y capas internas sirven para ordenar el código, no para fragmentar el sistema.

## Rama de trabajo

`integration/ao-ecosystem-foundation`, creada desde `main`. Los cambios permanecen en la rama y en el PR #2; no se han fusionado a `main`.

## Estado comprobado

- La aplicación principal está en `apps/erp`.
- La interfaz y navegación actuales se conservan.
- Las pantallas de negocio aún contienen datos demostrativos.
- La capa de partida doble se encuentra ahora dentro de `apps/erp/src/modules/accounting/domain/`.
- Los contratos técnicos compartidos se encuentran dentro de `apps/erp/src/shared/`.
- La migración PostgreSQL inicial está dentro de `apps/erp/database/migrations/`; no se ha ejecutado.
- Las carpetas scaffold heredadas de SaaS y Diocesano no constituyen sistemas funcionales ni se usarán como destino de nuevas funcionalidades. Sus capacidades se integrarán como módulos internos del ERP.

## Secuencia

1. Revisar el servidor y la autenticación actuales antes de abrir operaciones persistentes.
2. Implementar repositorios PostgreSQL transaccionales y autorización basada en sesión de servidor.
3. Conectar progresivamente los módulos existentes, sustituyendo datos demo sin alterar la interfaz.
4. Incorporar las operaciones entre módulos mediante servicios internos y eventos.
5. Integrar funciones OSS solo después de revisar código, dependencias y licencias.
6. Automatizar pruebas, controles de seguridad, respaldos y despliegues.

## Restricciones

- No modificar `main` ni fusionar PRs automáticamente.
- No cambiar la identidad visual, navegación o diseño aprobado.
- No copiar código de terceros antes de verificar licencias y obligaciones.
- No conectar bases de datos paralelas de proyectos de origen.
- No declarar una funcionalidad terminada sin persistencia, autorización, pruebas y evidencia de ejecución.
