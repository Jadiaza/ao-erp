# Auditoría de pantallas actuales

**Fecha:** 2026-11-06

## Hallazgos

`document-management-screen.tsx` contiene explorador, carpetas, categorías, búsqueda, filtros, tabla, versiones, responsables y acceso restringido. `documents-screen.tsx` contiene solicitudes de documentos y certificados. `sacramental-books-screen.tsx` conserva la consulta separada de libros sacramentales. `system-demo.ts` y `community-demo.ts` contienen fixtures. `local-repository.ts` persiste JSON en `localStorage` y sincroniza pestañas mediante eventos del navegador.

Estos datos son demostrativos. La creación de una ficha documental es funcional únicamente dentro del navegador; no existe carga binaria, OCR, API, servidor ni búsqueda de texto completo.

## Matriz de subáreas

| Área | Existe | Conservar | Fuente futura | Falta |
|---|---|---|---|---|
| Recepción documental | Tarjeta y alta de metadatos | Indicadores y flujo visual | Paperless + A&O | Upload, remitente, duplicados, estado de recepción |
| Digitalización y OCR | Tarjeta conceptual | Área OCR | Paperless | Tareas, texto, errores, revisión humana |
| Repositorio | Tabla, carpetas, búsqueda local | Explorador completo | Paperless técnico + A&O archivístico | Consulta remota, paginación y sincronización |
| Clasificación archivística | Categorías y carpetas demostrativas | Navegación y filtros | A&O | Fondo-sección-serie-subserie-expediente |
| Expedientes, libros y folios | Libros sacramentales separados | Separación registral | A&O + referencia digital | Tomos, folios, caras, imagen y asiento |
| Instrumentos archivísticos | No implementado | Pendiente de diseño | A&O | CCD, TRD, TVD, inventarios y versionado |
| Transferencias | No implementado | Pendiente de diseño | A&O | Inventarios, actas, integridad y recepción |
| Conservación | Estado y acceso visual | Alertas y restricción | A&O | Retención, preservación, checksum y disposición |

## Adaptaciones requeridas

Conservar la estructura actual de Archivo y Gestión Documental. Añadir estados de conexión, sincronización y servicio no disponible sin sustituir la interfaz por la de Paperless. La vista restringida debe seguir ocultando contenido sensible aunque Paperless devuelva metadatos.

## Relación sacramental

El asiento, la imagen digital, el documento archivístico y el certificado son objetos distintos. La integración solo debe guardar referencias estables entre ellos.
