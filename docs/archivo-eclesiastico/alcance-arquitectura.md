# A&O Archivo Eclesiástico

## Ubicación en el monorepositorio

A&O Archivo Eclesiástico es una cuarta aplicación independiente del workspace:

`apps/archivo-eclesiastico`

No es un módulo interno de A&O ERP ni una sección de A&O Diocesano. Tiene rutas, navegación, shell, estilos y ciclo de construcción propios. Comparte únicamente el workspace y podrá consumir paquetes neutrales comunes cuando estos existan y estén justificados.

## Límites funcionales

- **A&O ERP:** operación diaria de la parroquia, incluyendo gestión documental de apoyo a sus procesos y gestión de libros sacramentales en su contexto pastoral.
- **A&O Diocesano:** gobierno y acompañamiento territorial de la jurisdicción eclesiástica.
- **A&O Archivo Eclesiástico:** organización, descripción, preservación, consulta y disposición archivística de los fondos de una institución autorizada.
- **A&O SaaS:** administración comercial y técnica de las organizaciones, planes y licencias de la plataforma.

La pertenencia a una diócesis no otorga acceso automático al archivo de una parroquia. El intercambio entre aplicaciones requerirá identidad institucional, autorización explícita, alcance mínimo, finalidad documentada y auditoría.

## Estructura funcional inicial

- Dashboard.
- Recepción documental.
- Centro de digitalización.
- Documentos y consulta.
- Clasificación archivística: fondo, sección, serie y subserie.
- Expedientes y libros, incluidos libros sacramentales e históricos.
- Instrumentos archivísticos: CCD, TRD, TVD e inventarios.
- Transferencias documentales.
- Conservación y preservación digital.

Las pantallas de esta primera incorporación son un scaffold visual con datos ilustrativos. No existe persistencia, OCR ni procesamiento de documentos conectado.

## Estrategia de reutilización de Paperless-ngx

Paperless-ngx se considera una base de código para auditoría y posible adaptación bajo control de A&O, no una API externa ni un producto que se instalará como dependencia remota. La incorporación de componentes deberá hacerse después de una auditoría de código, arquitectura y licencias.

Candidatos a evaluar: recepción y consumo, pipeline de procesamiento asíncrono, OCR PDF, extracción de texto, reglas de correspondencia, indexación/búsqueda, checksum y manejo de versiones. No se importan todavía fuentes de Paperless-ngx en este repositorio.

A&O conservará su propio dominio archivístico: jerarquía de fondos y series, expedientes y libros, folios y caras, CCD/TRD/TVD versionados, transferencias, disposición, trazabilidad y restricciones de consulta sacramental. Los permisos de Paperless no sustituirán el aislamiento multiinstitución.

## Arquitectura objetivo por definir

- Aplicación: React, TypeScript y TanStack Start/Router.
- API y servicios de dominio: por definir, con integración explícita y contratos versionados.
- Datos estructurados: PostgreSQL, con separación institucional y autorización a nivel de fila.
- Binarios: Object Storage compatible con S3; no guardar imágenes maestras ni PDF en columnas de PostgreSQL.
- Procesamiento: workers asíncronos desacoplados de las peticiones web.
- Digitalización/OCR: evaluar componentes Paperless-ngx, OCRmyPDF y Tesseract; manuscritos requerirán una vía HTR con revisión humana.
- Preservación: original inalterable, derivados vinculados, checksums, versiones, bitácora y copias independientes verificadas.

## Estado y límites de esta entrega

Se incorpora únicamente la aplicación base y su interfaz inicial. No se conectan servicios externos, escáneres, autenticación, base de datos, object storage, OCR o inteligencia artificial. No se importó código de Paperless-ngx. La licencia GPL-3.0 de Paperless-ngx y las licencias de dependencias deberán revisarse antes de incorporar código derivado o distribuir el producto.
