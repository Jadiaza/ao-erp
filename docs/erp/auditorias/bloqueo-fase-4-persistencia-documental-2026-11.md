# A&O ERP — Bloqueo de implementación de Fase 4

Fecha: 6 de noviembre de 2026

## Resultado

La Fase 4 no puede implementarse de forma segura sobre el repositorio actual. La
interfaz documental está preparada para demostración local, pero el proyecto no
contiene una infraestructura institucional de persistencia en servidor sobre la
cual crear servicios, migraciones o aislamiento multiinstitución.

No se modificaron las pantallas ni se instaló una base de datos adicional.

## Evidencia encontrada

| Requisito de la Fase 4 | Estado actual | Evidencia |
|---|---|---|
| Base de datos institucional | Ausente | No hay cliente, esquema ni configuración de base de datos en `apps/erp` |
| Migraciones | Ausentes | No existen directorios ni archivos de migración del proyecto |
| Acceso a datos de servidor | Ausente | `apps/erp/src/data/local-repository.ts` persiste únicamente en `localStorage` |
| Autenticación real | Ausente | El cierre de sesión y los usuarios están marcados como demostrativos |
| Autorización/RLS | Ausente | La matriz de permisos actual es conceptual y no ejecuta controles |
| Institución activa validada en servidor | Ausente | La institución y parroquia provienen de fixtures locales |
| Auditoría persistente | Ausente | No existe entidad ni servicio de auditoría en servidor |
| Backend Paperless intermediario | Ausente | No hay cliente servidor, credenciales, variables ni conexión Paperless |

La documentación de seguridad existente también registra que la autenticación,
la autorización y el aislamiento multiinstitución todavía no existen en el
repositorio auditado.

## Alcance que sí está implementado

Las ocho áreas documentales cuentan actualmente con rutas y pantallas de modo
demostración. Usan registros iniciales y colecciones aisladas por clave de
`localStorage`; esto no equivale a persistencia institucional, control de
pertenencia ni seguridad entre parroquias.

La referencia futura a Paperless debe seguir separada del identificador interno
de A&O ERP y no debe exponerse ningún token en el navegador.

## Decisiones requeridas para desbloquear la fase

Antes de crear migraciones o servicios debe definirse y aprobarse:

1. Motor y entorno de base de datos institucional.
2. Sistema de autenticación y resolución de institución/parroquia activa.
3. Modelo de autorización y, si corresponde, políticas RLS.
4. Convenciones de migraciones, claves, índices y eliminación lógica.
5. Contrato de backend para documentos, expedientes, clasificación, instrumentos,
   transferencias y auditoría.
6. Política de almacenamiento de binarios y futura integración Paperless.

Cuando estas decisiones y su infraestructura estén disponibles, la migración
debe hacerse detrás de interfaces de repositorio, conservando los fixtures para
modo demostración y sin importar automáticamente datos ficticios a una
institución real.

## Estado de cierre

**Fase 4: bloqueada por infraestructura pendiente.** No es correcto declarar
implementadas la persistencia institucional, la seguridad multiinstitución ni
las ocho pantallas conectadas a servicios reales.

## Validación del estado actual

- Typecheck ERP: aprobado.
- Pruebas ERP: aprobadas, 3 archivos y 10 pruebas.
- Build ERP: aprobado.
- Lint global ERP: no aprobado por 7.992 problemas de formato de finales de
  línea (`Delete ␍`) distribuidos en archivos existentes. No se aplicó una
  normalización masiva porque no forma parte de esta fase.
