# Implementación del ecosistema A&O

## Rama de trabajo

`integration/ao-ecosystem-foundation`, creada desde `main`.

## Estado comprobado al iniciar

- Monorepo con `apps/erp`, `apps/saas`, `apps/diocesano` y `packages/utilities`.
- ERP conserva la aplicación más avanzada, pero sus datos principales siguen siendo demostrativos.
- SaaS y Diocesano tienen scaffolds de aplicación, no operaciones productivas.
- El PR #1 de Archivo y Gestión Documental está abierto como draft y no está fusionado.
- No se ha ejecutado build, typecheck ni pruebas en esta sesión.

## Primera implementación

Se incorpora `@ao/platform-contracts` como contrato técnico mínimo de interoperabilidad. No crea acceso cruzado ni sustituye la autenticación/autorización propia de cada producto.

## Secuencia de implementación

1. Inventariar código fuente reutilizable y licencias exactas por versión.
2. Definir los límites de persistencia PostgreSQL por producto y sus migraciones.
3. Integrar identidad técnica y autorización independiente por producto.
4. Incorporar módulos OSS por dominio, conservando trazabilidad de origen y cambios.
5. Sustituir datos demostrativos del ERP por servicios y repositorios persistentes.
6. Convertir SaaS y Diocesano de scaffolds en productos operativos.
7. Automatizar pruebas, seguridad, respaldos, observabilidad y despliegues.

## Restricciones

- No modificar `main` ni fusionar PRs automáticamente.
- No copiar código de terceros antes de verificar licencia, avisos y obligaciones.
- No conectar bases de datos de los proyectos de origen.
- No declarar una funcionalidad terminada sin persistencia, autorización, pruebas y
  evidencia de ejecución.
