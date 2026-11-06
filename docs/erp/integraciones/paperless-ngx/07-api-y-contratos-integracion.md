# API y contratos de integración

**Estado:** contrato conceptual; no se han creado endpoints.

## Principios

- El navegador solo consume A&O ERP.
- El servidor de A&O consume Paperless.
- Los contratos públicos de A&O no deben exponer estructuras internas innecesarias de Paperless.
- Toda operación debe incluir institución, actor, finalidad y correlación.

## Operaciones futuras de A&O

| Operación | Resultado esperado |
|---|---|
| `GET /documental/status` | Estado de conexión sin revelar credenciales |
| `POST /documental/inbox` | Crea recepción local y encola envío |
| `GET /documental/documents` | Consulta autorizada, paginada y filtrada |
| `GET /documental/documents/:id` | Metadatos A&O y estado técnico externo |
| `POST /documental/documents/:id/sync` | Solicita sincronización idempotente |
| `GET /documental/documents/:id/content` | Recuperación controlada y auditada |
| `POST /documental/documents/:id/retry` | Reintento autorizado de procesamiento |

Los nombres son propuestas y no representan endpoints existentes.

## Identificador y correlación

Cada solicitud debe transportar un `correlation_id`. La relación mínima es:

```json
{
  "a_o_document_id": "DOC-LOCAL-001",
  "institution_id": "PAR-014",
  "paperless_document_id": 123,
  "sync_status": "pending|processing|succeeded|failed|conflict",
  "checksum": "sha256:...",
  "last_synced_at": null
}
```

El contrato real deberá definir paginación, errores, idempotencia, límites de tamaño, MIME permitidos, estados y política de reintentos.

## Seguridad del cliente Paperless

El cliente server-side utilizará configuración de entorno, timeout, allowlist de host, autenticación por token y logs sin secretos. Debe traducir errores HTTP y validar respuestas antes de persistir relaciones.

La API oficial de Paperless está documentada en [REST API](https://docs.paperless-ngx.com/api/), incluyendo autenticación, permisos por objeto y endpoints de documentos. Antes de implementar se debe fijar la versión y generar pruebas contra esa versión.
