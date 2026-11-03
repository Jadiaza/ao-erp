# A&O Diocesano — alcance y límites iniciales

A&O Diocesano se prepara como una aplicación independiente para funciones propias de la autoridad diocesana. En este scaffold solo se incluyen su manifest, configuración, router, layout, navegación, Dashboard y prueba de ruta; todavía no se implementan funciones de negocio.

La aplicación no consulta ERP ni recibe acceso automático a datos parroquiales. Los vínculos e intercambios futuros deberán ser voluntarios, autorizados, reversibles conforme a reglas de integridad histórica y de alcance mínimo.

## Pantalla existente en ERP

`/app/gestion-diocesana` permanece íntegra y operativa en `apps/erp`. Su pantalla actual presenta un directorio territorial ficticio, estados agregados de informes, responsables y compromisos, sin acceso a información personal, sacramental o contable.

La distribución funcional está aprobada y se detalla en `docs/erp/definicion-funcional-y-arquitectonica.md` y `docs/arquitectura/monorepo.md`: ERP conserva la elaboración, presentación y seguimiento del informe de la propia parroquia; Diocesano es el destino funcional del directorio territorial y del seguimiento interparroquial agregado. La pantalla `/app/gestion-diocesana` no se mueve, divide ni duplica en esta fase documental. Antes de trasladarla se definirá una transición compatible y sus límites de autorización; no habrá acceso cruzado automático.
