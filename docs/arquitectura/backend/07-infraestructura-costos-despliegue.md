# Infraestructura, costos y despliegue

Estado: evaluación; sin presupuesto aprobado.

## Desarrollo y pruebas

La fase local actual no necesita servicios externos. Una vez aprobada la
infraestructura, se recomienda un proyecto Supabase separado para desarrollo y
otro para pruebas, con datos sintéticos y secretos independientes. Producción
debe tener proyecto, región, backups y observabilidad propios.

## Costos

No se fijan cifras porque Supabase, Vercel, almacenamiento, egreso, MAU y
Paperless cambian por plan, región y consumo. El presupuesto debe calcular:

- usuarios activos y autenticación;
- CPU/RAM, tamaño y crecimiento de PostgreSQL;
- almacenamiento de archivos y egreso;
- backups y retención;
- invocaciones server-side y observabilidad;
- Paperless, PostgreSQL, Redis/Valkey, OCR y almacenamiento si se autoadministra.

Supabase administrado reduce operación de PostgreSQL, Auth, API y backups, pero
introduce límites y dependencia de proveedor. PostgreSQL autoadministrado exige
operar alta disponibilidad, parches, Auth, backups, monitoreo y recuperación.

## Vercel y TanStack Start

El build actual de ERP está configurado por el preset de Lovable/Nitro con salida
Cloudflare, no como una configuración Vercel validada. Antes de desplegar se debe
seleccionar un preset compatible y probar cookies, server functions, variables
secretas, límites de ejecución y caching. No se hará ese cambio en Fase 5.

La caché/CDN no debe servir respuestas autenticadas entre usuarios; las rutas con
refresco de sesión deben ser dinámicas y enviar correctamente cookies.

## Paperless

Debe ser un servicio separado con versión fijada, PostgreSQL, broker compatible,
volúmenes, backups y workers OCR. El backend central será el único intermediario;
los tokens permanecen en secretos server-side.

Referencias: [Supabase pricing](https://supabase.com/pricing),
[Vercel pricing](https://vercel.com/pricing), [Paperless setup](https://docs.paperless-ngx.com/setup/).
