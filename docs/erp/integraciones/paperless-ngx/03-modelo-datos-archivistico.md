# Modelo de datos archivístico propuesto

**Estado:** conceptual; no crea tablas ni migraciones.

## Entidades y relaciones

| Entidad | Relación principal |
|---|---|
| Institución | Tiene fondos, usuarios y políticas |
| Fondo | Pertenece a una institución; contiene secciones |
| Sección | Pertenece a un fondo; contiene series |
| Serie | Pertenece a una sección; contiene subseries o expedientes |
| Subserie | Pertenece a una serie; contiene expedientes |
| Expediente | Pertenece a una clasificación; contiene unidades documentales |
| Unidad documental | Pertenece a un expediente; puede tener versiones y archivos digitales |
| Libro/Tomo/Folio | Estructura registral A&O; puede relacionarse con una unidad o imagen |
| Archivo digital | Referencia al objeto técnico externo y a sus hashes |
| Versión documental | Pertenece a una unidad; conserva autor, fecha, hash y estado |
| Metadato archivístico | Pertenece a una unidad o expediente y es administrado por A&O |
| Instrumento archivístico | Versión de CCD, TRD, TVD o inventario |
| Transferencia | Agrupa unidades, acta, origen, destino, fechas e integridad |
| Auditoría | Registra consulta, cambio, sincronización y resultado |

## Identificadores

Cada unidad conserva un `a_o_document_id` estable. La relación externa debe ser explícita:

```text
a_o_document_id
paperless_document_id
paperless_correspondent_id (opcional)
paperless_document_type_id (opcional)
sync_status
last_synced_at
```

Los metadatos técnicos de Paperless no sustituyen los campos archivísticos de A&O. No se duplica el binario salvo que la política de preservación lo exija; se conserva referencia, tamaño, MIME, checksum, versión y ubicación controlada.

## Integridad y versionado

Cada archivo debe registrar hash criptográfico, tamaño, MIME, fecha de recepción y origen. Los cambios de clasificación deben ser versionables y auditables. La eliminación física no debe ejecutarse desde una operación ordinaria sin regla de retención, autorización y registro.

## Sacramentos

`SacramentalEntry` mantiene la responsabilidad registral. `DigitalAsset` referencia imagen o derivado. `Certificate` referencia el asiento y conserva su propio estado de emisión. Ninguno de estos objetos debe inferirse solo desde etiquetas de Paperless.
