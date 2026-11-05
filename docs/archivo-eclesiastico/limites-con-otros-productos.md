# Límites funcionales de A&O Archivo Eclesiástico

A&O Archivo Eclesiástico se incorpora como producto independiente. No reemplaza ni absorbe todas las funciones documentales de ERP.

- ERP conserva los documentos que soportan sus procesos parroquiales y la operación pastoral de los libros sacramentales.
- Archivo Eclesiástico gestiona el tratamiento archivístico institucional de fondos, series, expedientes, libros, unidades documentales, folios, preservación, transferencias e instrumentos.
- Diocesano no obtiene acceso automático a los archivos de parroquias. Solo podrá recibir información cuando exista autorización específica y un propósito legítimo documentado.
- SaaS administra clientes y licencias, pero no tiene acceso al contenido documental por el solo hecho de administrar la suscripción.

La aplicación de Archivo Eclesiástico se integra en `apps/archivo-eclesiastico`; sus comandos de desarrollo, construcción, pruebas y tipado se exponen como scripts `*:archivo` en el package.json raíz.

La primera entrega es una estructura de interfaz demostrativa. La auditoría de Paperless-ngx y la definición de arquitectura de datos, seguridad, procesamiento y almacenamiento preceden la conexión de servicios reales.
