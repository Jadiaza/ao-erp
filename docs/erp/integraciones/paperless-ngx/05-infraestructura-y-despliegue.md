# Infraestructura y despliegue

**Estado:** evaluación; no se creó Compose ni se instalaron servicios.

## Hallazgo local

El repositorio no contiene Docker Compose, variables de entorno Paperless, volúmenes, PostgreSQL, Redis/Valkey, workers OCR ni backups documentales.

## Componentes a evaluar

La documentación oficial recomienda PostgreSQL para instalaciones nuevas. Paperless utiliza un broker compatible con Redis; la documentación actual menciona Valkey como opción predeterminada en Compose y Redis como alternativa compatible. La instalación oficial se distribuye normalmente con Docker Compose.

Componentes de producción a definir:

- Paperless-NGX con versión fijada, no `latest` sin control.
- PostgreSQL independiente de cualquier futura base de A&O.
- Valkey/Redis compatible.
- Volúmenes separados para datos, medios, consumo y exportación.
- OCRmyPDF, Tesseract y paquetes de idioma necesarios.
- Backups probados de base de datos y documentos.
- Monitoreo de tareas, espacio, errores OCR y disponibilidad.
- Recuperación ante desastre y procedimiento de actualización.

## Decisiones pendientes

- Versión exacta e imagen aprobada.
- Infraestructura por cliente o compartida.
- Cifrado en tránsito y reposo.
- Retención de originales y derivados.
- Capacidad de CPU, RAM, almacenamiento y crecimiento.
- Ubicación de datos y backups.
- RTO/RPO.

No se deben fijar recursos ni versiones definitivas hasta completar un piloto con volumen representativo.

Fuentes: [Setup oficial](https://docs.paperless-ngx.com/setup/), [Configuración oficial](https://docs.paperless-ngx.com/configuration/), [Administración y actualizaciones](https://docs.paperless-ngx.com/administration/), [Troubleshooting OCR](https://docs.paperless-ngx.com/troubleshooting/).
