# Matriz funcional y roadmap

| Funcionalidad | Situación actual | Responsabilidad | Acción requerida | Prioridad |
|---|---|---|---|---|
| Recepción documental | Alta local de metadatos | Integración + A&O | Upload, remitente, duplicados y estado | Alta |
| OCR | Ausente | Paperless | Conectar tarea, resultado y revisión | Alta |
| Repositorio | Tabla y búsqueda local | Ambos | Sincronizar metadatos y consulta | Alta |
| Texto completo | Ausente | Paperless | Consultar API y paginar | Alta |
| Clasificación archivística | Demostrativa | A&O ERP | Implementar CCD, fondos, series y expedientes | Alta |
| Expedientes/libros/folios | Libros separados; relaciones ausentes | A&O ERP | Modelar referencias sin duplicar asientos | Alta |
| Versiones | Fixtures visuales | A&O + Paperless | Reglas de versión, hash y sincronización | Media |
| CCD/TRD/TVD | Ausente | A&O ERP | Diseñar instrumentos y versionado | Media |
| Transferencias | Ausente | A&O ERP | Inventarios, actas, integridad y recepción | Media |
| Conservación | Estados visuales | A&O ERP | Retención, preservación y disposición | Media |
| Auditoría | Eventos ficticios | A&O ERP | Auditoría persistente y no editable | Alta |
| Multiinstitución | No implementada | A&O ERP | Autorización por institución y pruebas negativas | Crítica |
| Descargas | No implementadas | Integración | Proxy o URL temporal auditada | Alta |
| Disponibilidad | No existe estado externo | Integración | Health check y modo degradado | Alta |
| Licenciamiento | No evaluado en el producto | Revisión legal | Revisar GPL-3.0 y distribución comercial | Crítica |

## Roadmap propuesto

1. **Infraestructura controlada:** piloto aislado, versión fijada, backups y health check.
2. **Cliente API server-side:** autenticación, timeouts, errores, reintentos y contratos.
3. **Persistencia A&O:** entidades archivísticas, referencias externas, hash y auditoría.
4. **Recepción y OCR:** upload, bandeja, estados, duplicados y revisión humana.
5. **Repositorio integrado:** búsqueda, filtros, metadatos y recuperación controlada.
6. **Clasificación e instrumentos:** CCD, TRD, TVD, expedientes y folios.
7. **Transferencia y preservación:** actas, checksums, conservación y disposición.
8. **Seguridad y puesta en producción:** aislamiento, pruebas de autorización, carga, respaldo y recuperación.

Cada etapa requiere pruebas de aceptación y no debe ocultar la indisponibilidad de Paperless.
