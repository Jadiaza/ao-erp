# Plan de implementación backend

Estado: roadmap para aprobación.

## Fases

| Fase | Entregable | Criterio de salida |
|---|---|---|
| 0 | Aprobación de proveedor, región, datos y costo | Decisiones aprobadas y secretos fuera de Git |
| 1 | Proyecto Supabase, CLI, entornos y Auth SSR | Login, cookies, PKCE y recuperación probados |
| 2 | Instituciones, membresías, roles y auditoría | Cambio de contexto y pruebas de acceso cruzado |
| 3 | Migraciones documentales y RLS | Tablas, índices, políticas y pruebas negativas |
| 4 | Repositorios y servicios server-side | CRUD documental con autorización y auditoría |
| 5 | Conexión gradual de las ocho pantallas | Loading/error/empty, operaciones y persistencia reales |
| 6 | Paperless gateway | OCR/sincronización sin exponer tokens ni mezclar fuentes |
| 7 | Operación | Backups restaurables, alertas, límites y runbooks |

## Orden documental

Primero repositorio y recepción; después clasificación y expedientes; luego
instrumentos, transferencias y conservación; finalmente digitalización/OCR.
Libros, folios, sacramentos y certificados conservarán sus límites actuales.

## Calidad y seguridad

Cada servicio debe tener pruebas unitarias de reglas, integración contra una
base aislada y pruebas negativas multiinstitución. Cada mutación debe producir
un evento de auditoría. Se ejecutarán typecheck, lint dirigido, pruebas y build
en cada grupo.

## Riesgos

- RLS mal configurado puede producir exposición de datos.
- Claims obsoletos pueden conservar permisos hasta renovar el JWT.
- Cookies y CDN mal configurados pueden mezclar sesiones.
- Documentos sacramentales requieren controles y retención especiales.
- Paperless no debe convertirse en fuente de verdad de A&O.
- El preset de despliegue actual debe validarse antes de elegir Vercel.

## Aprobaciones requeridas

Proveedor y plan, región, política de datos, autenticación/MFA, esquema de
roles diocesanos, almacenamiento de binarios, estrategia de backups, destino de
despliegue y presupuesto operativo. Hasta entonces el ERP debe conservar el modo
demostración local y no declarar persistencia institucional.
