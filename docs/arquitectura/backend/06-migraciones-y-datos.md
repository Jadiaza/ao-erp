# Migraciones y ciclo de vida de datos

Estado: plan; no ejecutado.

## Herramienta y estructura

Si se aprueba Supabase, se utilizará Supabase CLI con SQL versionado:

```text
supabase/config.toml
supabase/migrations/<timestamp>_<descripcion>.sql
supabase/seed.sql                  # solo datos técnicos no institucionales
```

Las migraciones deben ser pequeñas, ordenadas, reproducibles e idempotentes
donde sea posible. Se revisan en pull request, se aplican primero en desarrollo,
luego en pruebas y finalmente en producción con respaldo previo. No se usará
una migración para corregir manualmente producción sin registrar el cambio.

## Secuencia propuesta

1. Extensiones, esquemas privados y roles.
2. instituciones, diócesis, parroquias y perfiles.
3. membresías, roles, permisos y auditoría.
4. fondos, secciones, series y subseries.
5. documentos, expedientes, libros, tomos y folios.
6. instrumentos, transferencias y conservación.
7. índices, RLS, funciones y pruebas negativas.

Los datos demo permanecen en fixtures/localStorage durante la transición. No se
importan automáticamente a instituciones reales. Se requiere una herramienta
explícita de inicialización por institución y un respaldo exportable antes de
retirar el modo demo.

## Rollback y respaldo

Toda migración debe indicar compatibilidad hacia atrás, riesgo, rollback lógico
y plan de restauración. Las eliminaciones físicas se excluyen del flujo normal.
La frecuencia, retención, cifrado, región y prueba de restauración deben aprobarse
con el proveedor y la política institucional.

## Datos Paperless

El modelo conserva `a_o_document_id`, `paperless_document_id`, estado de
sincronización, versión, MIME, tamaño, checksum y ubicación controlada. No se
duplica el binario ni la base interna de Paperless por defecto.
