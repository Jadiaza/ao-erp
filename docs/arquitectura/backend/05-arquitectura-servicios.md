# Arquitectura de servicios

Estado: diseño propuesto.

## Estructura

```text
packages/domain/                  tipos y esquemas compartidos, sin UI
apps/erp/src/server/auth/         sesión y contexto institucional
apps/erp/src/server/db/           cliente server-only de Supabase
apps/erp/src/server/repositories/ repositorios por agregado
apps/erp/src/server/services/     reglas de negocio y auditoría
apps/erp/src/server/functions/    createServerFn y contratos de entrada
apps/saas/src/server/             organizaciones, planes y licencias
apps/diocesano/src/server/        jurisdicción y alcance diocesano
supabase/migrations/              SQL versionado, cuando se apruebe
```

No se debe compartir un servicio de negocio entre aplicaciones solo para evitar
duplicación: se compartirán tipos y contratos, mientras cada producto conserva
su autorización y dominio. Los repositorios documentales serán reutilizables
solo si reciben explícitamente el contexto autorizado.

## Servicios documentales

`DocumentService`, `ArchiveStructureService`, `ExpedientService`,
`RegisterBookService`, `InstrumentService`, `TransferService` y
`AuditService`. Cada operación valida esquema, contexto, relaciones, duplicados,
permisos, estado de retención y luego registra el evento.

Paperless se encapsulará en `PaperlessGateway` server-only. A&O seguirá siendo
fuente de verdad archivística; el gateway solo resolverá OCR, texto, binarios o
metadatos externos cuando exista autorización y configuración.

Los componentes React no importarán clientes privilegiados ni realizarán reglas
de negocio. Las respuestas deben excluir campos sensibles y diferenciar errores
de validación, autorización, no encontrado e indisponibilidad externa.
