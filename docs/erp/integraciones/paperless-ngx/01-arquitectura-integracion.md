# Arquitectura de integración A&O ERP + Paperless-NGX

**Estado:** diseño, sin implementación
**Fecha de consulta:** 2026-11-06
**Versión de Paperless analizada:** documentación oficial consultada para la línea 3.x; la versión exacta deberá fijarse antes del despliegue.

## Decisión

A&O ERP conserva la interfaz, el dominio institucional y el modelo archivístico. Paperless-NGX se incorpora como servicio externo para recepción, OCR, indexación, búsqueda y recuperación documental. El usuario no accederá directamente a la interfaz de Paperless.

```text
Navegador → A&O ERP → backend autorizado → API REST Paperless-NGX
                  └→ repositorio archivístico y auditoría de A&O
```

El token de Paperless debe permanecer en el servidor. La API oficial documenta autenticación por token y permisos de objetos; A&O debe validar además institución, expediente, serie y finalidad antes de cada consulta.

## Fronteras de responsabilidad

Paperless: archivo digital técnico, OCR, texto indexado, búsqueda, procesamiento asíncrono, etiquetas auxiliares y recuperación.

A&O: institución, fondo, sección, serie, subserie, expediente, unidad documental, libros, tomos, folios, CCD, TRD, TVD, transferencias, conservación, permisos de negocio, relaciones sacramentales y trazabilidad.

Paperless no será fuente de verdad de asientos sacramentales, certificados ni estructura archivística.

## Alternativas de despliegue

| Alternativa | Ventajas | Riesgos | Decisión provisional |
|---|---|---|---|
| Instancia compartida | Menor costo y operación centralizada | Aislamiento complejo; una mala regla puede exponer documentos | Solo con separación fuerte en A&O y validación independiente |
| Instancia por institución | Aislamiento claro y menor radio de impacto | Mayor costo, actualizaciones y respaldos | Adecuada para instituciones con documentos sensibles o exigencias propias |
| Híbrida | Ajusta costo y aislamiento al perfil | Mayor complejidad operativa | Recomendada como estrategia comercial futura |

La primera implementación debe privilegiar un piloto controlado, no una decisión irreversible de multi-tenencia.

## Fuentes oficiales

- [Paperless-NGX REST API](https://docs.paperless-ngx.com/api/)
- [Paperless-NGX setup](https://docs.paperless-ngx.com/setup/)
- [Paperless-NGX configuration](https://docs.paperless-ngx.com/configuration/)
- [Paperless-NGX permissions and usage](https://docs.paperless-ngx.com/usage/)
