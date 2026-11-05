# A&O ERP — Archivo y Gestión Documental

**Ubicación funcional:** A&O ERP → Gestión y control → Archivo y Gestión Documental.  
**Estado:** definición funcional del módulo; la interfaz actual sigue siendo demostrativa y no implica persistencia ni servicios productivos.

## 1. Decisión de producto

Archivo y Gestión Documental es un módulo interno de A&O ERP, no una aplicación comercial independiente. Su finalidad es administrar el archivo institucional de cada parroquia y ofrecer servicios de digitalización, clasificación, preservación y consulta documental.

El módulo comparte el contexto institucional, la sesión y el sistema de autorización de ERP. No crea un segundo directorio de usuarios ni una administración de clientes paralela. Sus permisos deben especializarse por función, serie, expediente y nivel de sensibilidad.

## 2. Relación con los módulos existentes

- **Libros sacramentales** permanece en Comunidad y pastoral. Es responsable del registro y consulta pastoral de los asientos sacramentales, libros, tomos, folios y referencias registrales.
- **Documentos y certificados** mantiene el flujo de solicitudes, verificación y emisión de documentos. Una partida expedida debe referenciar el asiento de origen; no debe duplicarlo.
- **Archivo y Gestión Documental** conserva y organiza los documentos institucionales, las imágenes maestras de libros y folios, los expedientes, metadatos, versiones y trazabilidad archivística.
- **Auditoría y trazabilidad** registra los eventos de acceso y operación que se implementen. No debe confundirse con el historial archivístico del documento.
- **Gestión sacramental** conserva los flujos de solicitud, preparación y celebración. No se reemplaza por el archivo.

La relación entre registro sacramental, imagen digital del folio y certificado expedido debe ser explícita. Son objetos distintos vinculados mediante identificadores y referencias verificables.

## 3. Estructura del módulo

### 3.1 Archivo institucional

- Recepción y registro de documentos.
- Correspondencia recibida y enviada.
- Clasificación por fondo, sección, serie y subserie.
- Expedientes, unidades documentales y anexos.
- Metadatos, responsables, fechas, estado y nivel de acceso.
- Búsqueda, consulta y recuperación documental.

### 3.2 Libros y documentos históricos

El módulo de Libros sacramentales conserva su función registral en Comunidad y pastoral. Archivo y Gestión Documental aporta el soporte archivístico:

- Identificación de libro, tomo, folio, cara y secuencia de captura.
- Imagen maestra vinculada al folio y al asiento correspondiente.
- Relación entre libro físico, digitalización y derivados de consulta.
- Control de integridad, procedencia, fecha de captura y responsable.
- Consulta restringida de fondos históricos y sacramentales.

No se debe asumir que todos los documentos históricos son sacramentales ni que todas las parroquias manejan exactamente los mismos libros.

### 3.3 Digitalización y procesamiento

- Recepción de archivos digitales y lotes de escaneo.
- Registro de dispositivo, parámetros de captura y operador cuando aplique.
- Conservación de imagen maestra sin alteración.
- Generación de derivados para consulta.
- OCR para documentos impresos y PDFs compatibles.
- HTR para manuscritos solo mediante motor especializado y revisión humana.
- Control de calidad, orientación, orden, integridad y vinculación de folios.
- Procesamiento asíncrono mediante workers.

El OCR/HTR es una ayuda de recuperación y transcripción; no modifica el original ni constituye por sí mismo una validación del contenido.

### 3.4 Gestión archivística

- Cuadro de Clasificación Documental (CCD).
- Tablas de Retención Documental (TRD) y, cuando aplique, Tablas de Valoración Documental (TVD).
- Inventarios documentales.
- Transferencias y actas de entrega.
- Conservación, disposición y evidencias de autorización.
- Versionado de instrumentos y conservación de la regla aplicada a cada expediente.

Ningún vencimiento de retención debe provocar eliminación automática. La disposición requiere revisión, competencia, autorización y evidencia. Debe conservarse el contexto histórico de las decisiones.

## 4. Arquitectura técnica objetivo

El módulo vive dentro de la experiencia ERP, pero los procesos intensivos se separan técnicamente:

- **Frontend:** rutas y componentes de `apps/erp`, con navegación y diseño consistentes con el ERP.
- **Dominio:** modelos propios de archivo, clasificación, expedientes, folios, instrumentos y eventos.
- **Persistencia:** PostgreSQL, con aislamiento lógico por institución y controles de acceso por objeto.
- **Binarios:** almacenamiento de objetos S3-compatible; no usar el filesystem local del frontend como repositorio documental.
- **Procesamiento:** workers especializados para OCR, conversión, extracción, miniaturas y validaciones.
- **Colas:** ejecución asíncrona y reintentos controlados.
- **Búsqueda:** metadatos y texto OCR indexado, con filtros y permisos aplicados también en resultados.
- **Auditoría:** eventos de consulta, descarga, modificación de metadatos, versionado, transferencia y disposición.

La separación de workers y almacenamiento no convierte el módulo en otro producto ni exige una aplicación web independiente.

## 5. Modelo conceptual mínimo

- Institución propietaria del archivo.
- Fondo, sección, serie y subserie.
- Expediente y unidad documental.
- Libro, tomo, folio y cara.
- Documento lógico y archivo digital.
- Imagen maestra y derivados.
- Metadatos y clasificación.
- Instrumento archivístico y versión.
- Regla de retención aplicada.
- Transferencia y disposición.
- Evento de acceso y cambio.

Los identificadores de los objetos documentales deben ser estables. Los archivos binarios se vinculan mediante referencias controladas, checksum, formato, tamaño y fechas. La sustitución de una imagen no debe sobrescribir silenciosamente la evidencia anterior.

## 6. Seguridad y protección de datos

- Aplicar mínimo privilegio y finalidad de acceso.
- Restringir libros sacramentales, datos personales y documentos sensibles por responsabilidad y necesidad.
- Separar permisos de consulta, descarga, edición de metadatos, certificación, transferencia y disposición.
- Registrar accesos relevantes y cambios, sin permitir que un usuario ordinario altere la bitácora.
- Evitar enlaces públicos permanentes a documentos.
- Proteger respaldos y verificar restauraciones.
- Mantener aislamiento entre instituciones; la relación canónica con una diócesis no concede acceso automático a los archivos parroquiales.

El diseño debe considerar la Ley 1581 de 2012 y el marco archivístico aplicable, incluida la Ley 594 de 2000, el Decreto 1080 de 2015 y el Acuerdo 001 de 2024 del AGN, verificando las obligaciones concretas según la naturaleza de la institución. No se presume que todas las parroquias tengan el mismo régimen jurídico que una entidad pública.

## 7. Límites y decisiones pendientes

1. Definir CCD y TRD iniciales configurables, sin imponer una clasificación universal.
2. Precisar tipos de libro y metadatos según prácticas y normas eclesiásticas aplicables.
3. Seleccionar almacenamiento, cifrado, política de respaldos y recuperación.
4. Evaluar OCR impreso y HTR manuscrito con muestras reales y validación humana.
5. Definir el conector de escáner local (TWAIN/WIA/SANE) como componente opcional; el navegador no accede libremente a todos los escáneres.
6. Auditar licencias y código de cualquier motor open source antes de incorporarlo.
7. Definir periodos de conservación, restricciones de consulta y autoridades de disposición.
8. Diseñar migración desde archivos físicos y repositorios digitales existentes.

## 8. Criterios de aceptación funcional

- Un usuario puede ubicar un documento por clasificación, expediente y metadatos autorizados.
- Cada documento conserva su institución propietaria y su historial.
- Un folio digital puede vincularse a un libro y asiento sin duplicar el registro sacramental.
- Los originales y derivados se distinguen y verifican por integridad.
- La búsqueda respeta permisos y restricciones de acceso.
- Los instrumentos archivísticos tienen versiones y reglas trazables.
- Transferencias y disposiciones requieren autorización y evidencia.
- La operación documental no depende de iniciar sesión en una aplicación separada de ERP.

## 9. Alcance de la implementación actual

La pantalla principal `/app/gestion-documental` integra en una sola experiencia dos bloques complementarios:

- **Repositorio documental:** conserva el explorador anterior, las carpetas y categorías, búsqueda, filtro por clasificación, tabla de documentos, ficha de detalle, responsables, versiones, niveles de acceso y estados.
- **Procesos de Archivo Eclesiástico:** incorpora accesos a recepción documental, digitalización y OCR, repositorio, clasificación archivística, expedientes/libros/folios, instrumentos archivísticos, transferencias y conservación/preservación.

La integración mantiene los enlaces a Libros sacramentales y Documentos y certificados, sin duplicar sus responsabilidades. Los datos del repositorio siguen siendo demostrativos. No declara implementados PostgreSQL, autenticación productiva, almacenamiento S3, OCR, HTR, colas, escáneres ni procesos archivísticos reales.
