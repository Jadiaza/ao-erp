# Registro de licencias y reutilización de código

Fecha de consulta: 5 de noviembre de 2026. Las ramas indicadas son las ramas por defecto que devolvió GitHub en la consulta. Este registro es una revisión inicial de los archivos de licencia y manifiestos; no sustituye una revisión legal ni un inventario archivo por archivo de dependencias y contribuciones.

| Proyecto | Rama revisada | Licencia comprobada | Compatibilidad preliminar con A&O | Decisión de ingeniería |
|---|---|---|---|---|
| [ERPsaas](https://github.com/andrewdwallo/erpsaas) | `3.x` | MIT (`LICENSE` y `composer.json`) | Favorable para reutilización con avisos de copyright. Es Laravel 12 / PHP 8.2 y Filament; no es compatible directamente con las aplicaciones React/TanStack, pero puede aportar módulos PHP o ser portado. | Priorizar revisión de contabilidad, compañías, permisos y procesos; identificar dependencias de Filament antes de extraer. |
| [Medici](https://github.com/flash-oss/medici) | `master`, paquete 7.3.0 | MIT (`LICENSE` y `package.json`) | Favorable en licencia. Su implementación depende de Mongoose/MongoDB, incompatible con el requisito de persistencia PostgreSQL propia. | Reutilizar y adaptar el código de reglas de partida doble, balances y validaciones; no instalar el motor original ni su persistencia Mongo. |
| [LedgerSMB](https://github.com/ledgersmb/LedgerSMB) | `master` | GPL-2.0 (archivo `LICENSE`; README identifica GPLv2) | Tiene PostgreSQL nativo y contabilidad de partida doble, pero es Perl y GPL-2.0. La reutilización de código en un producto propietario/comercial exige revisar cuidadosamente obligaciones de obra derivada y distribución. | Estudiar módulos y arquitectura. No copiar al monorepo hasta resolver el modelo de licencia y distribución. Evaluar portabilidad de lógica por separado. |
| [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) | `dev` | GPL-3.0 (`LICENSE`) | Funcionalmente muy valioso para recepción, OCR, indexación y archivo, pero la licencia copyleft exige revisión previa para cualquier incorporación o modificación. | Evaluar primero como servicio separado y documentar obligaciones; no copiar código al ERP sin aprobación legal. |
| [ERPNext](https://github.com/frappe/erpnext) | `develop` | GPL-3.0 (`license.txt`) | ERP integral con amplia cobertura funcional, pero está acoplado al framework Frappe y su licencia copyleft. | Analizar módulos concretos y dependencias. No integrar código hasta definir el modelo de cumplimiento GPL. |
| [Odoo Community](https://github.com/odoo/odoo) | `20.0` | LGPL-3.0 para el núcleo declarado en `LICENSE`; los archivos y addons externos pueden tener licencias diferentes. | Arquitectura modular y contabilidad madura. Python/ORM Odoo no se integra como librería directa en React; requiere adaptación o servicio separado. | Evaluar módulos por archivo y dependencias. No asumir que todo addon comparte LGPL. |
| [Dolibarr](https://github.com/Dolibarr/dolibarr) | `develop` | GPL-3.0 (`COPYING`) | Cobertura amplia de gestión empresarial, pero PHP y copyleft GPL-3.0. | Analizar módulos; no incorporar código sin definir obligaciones GPL y estrategia de distribución. |

## Hallazgos de compatibilidad

- El manifiesto de ERPsaas confirma PHP ^8.2, Laravel ^12.0, Filament ^3.2 y licencia MIT.
- El manifiesto de Medici confirma versión 7.3.0, TypeScript/Node y dependencia de Mongoose 5–9. Su licencia MIT permite adaptación con conservación de avisos, pero no resuelve la incompatibilidad de persistencia.
- LedgerSMB declara PostgreSQL como motor de datos y Perl 5.38+ como requisito de servidor. Es la referencia técnica más cercana a PostgreSQL, aunque su licencia y stack impiden tratarlo como una dependencia directa sin más análisis.
- El código de asientos de ERPNext depende de Frappe ORM, documentos y utilidades del framework. Copiar un archivo aislado no lo convierte en un módulo autónomo.
- El módulo contable de Odoo declara dependencias sobre módulos internos del framework. No es una librería independiente que pueda copiarse sin su grafo de dependencias.

## Reglas de incorporación

1. Registrar repositorio, rama, commit SHA, ruta y licencia de cada bloque incorporado.
2. Conservar avisos de copyright y textos de licencia exigidos.
3. Revisar también licencias de dependencias, assets, fuentes, iconos y contribuciones.
4. No combinar código GPL/AGPL con componentes propietarios sin revisión jurídica de la obra resultante y de las obligaciones de entrega de fuentes.
5. No ejecutar bases de datos paralelas de los proyectos de origen. Los modelos deben adaptarse a PostgreSQL A&O.
6. Separar el código original de A&O del código de terceros adaptado para facilitar auditoría, actualización y cumplimiento.
7. Una licencia MIT no elimina la obligación de conservar avisos y descargos.
8. Este registro no autoriza todavía la copia de código de ningún proyecto.

## Próxima inspección de código

- ERPsaas: modelos, servicios, migraciones, acciones y pruebas de contabilidad.
- Medici: creación de libros, transacciones, validación de balance, reversos, agregaciones y pruebas.
- LedgerSMB: esquema contable PostgreSQL, libro mayor, periodos, conciliación y controles.
- ERPNext/Odoo: flujos de compras, inventario, activos, presupuesto y contabilidad analítica.
- Paperless-ngx: pipeline de consumo, OCR, clasificación, indexación y preservación documental.
