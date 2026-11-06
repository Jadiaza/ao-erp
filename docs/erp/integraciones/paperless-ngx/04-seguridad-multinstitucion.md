# Seguridad y multiinstitución

## Principio

Paperless puede ofrecer permisos globales y por objeto, pero no debe ser el único control de aislamiento. Cada solicitud debe autorizarse primero en A&O ERP.

## Flujo obligatorio

1. Autenticar al operador en A&O.
2. Resolver institución activa y alcance del usuario.
3. Autorizar módulo, expediente, serie y acción.
4. Resolver el `a_o_document_id`.
5. Consultar Paperless desde el servidor con credenciales protegidas.
6. Verificar que la respuesta corresponda a la institución y relación esperada.
7. Registrar consulta, descarga o cambio.
8. Entregar solo los datos autorizados, preferiblemente mediante URL temporal o proxy controlado.

## Controles mínimos

- Tokens solo en variables de entorno del servidor o gestor de secretos.
- Nunca enviar tokens al navegador ni almacenarlos en `localStorage`.
- Separación por institución en A&O y, si corresponde, por instancia Paperless.
- Permisos por expediente, serie y clasificación sensible.
- Protección especial para registros sacramentales y datos personales.
- Auditoría de consultas, descargas, sincronizaciones y errores.
- Rate limiting, timeouts, reintentos acotados y circuit breaker.
- No confiar en una etiqueta Paperless para autorizar una operación de negocio.
- Pruebas negativas de acceso cruzado entre instituciones.

La autenticación, autorización real y aislamiento multiinstitución no existen todavía en el repositorio auditado.

## Referencias normativas

La Ley 1581 de 2012 establece el marco colombiano de protección de datos personales. La Ley 594 de 2000 y el Acuerdo 001 de 2024 del AGN deben analizarse según el tipo de institución y función ejercida; no se presenta aquí una conclusión jurídica definitiva.

- [Ley 1581 de 2012 — SIC](https://sedeelectronica.sic.gov.co/transparencia/normativa/ley-estatutaria-1581-de-2012)
- [Ley 594 de 2000 — AGN](https://normativa.archivogeneral.gov.co/ley-594-de-2000/)
- [Acuerdo 001 de 2024 — AGN](https://normativa.archivogeneral.gov.co/wp-content/uploads/2024/04/2024-02_29_AcuerdoAGN-FIRMADO.pdf)
- [Decreto 1080 de 2015 — AGN](https://normativa.archivogeneral.gov.co/decreto-1080-de-2015/)
