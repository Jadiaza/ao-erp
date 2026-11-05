# Arquitectura del monorepositorio A&O

## Aplicaciones

- `apps/erp`: operación institucional parroquial.
- `apps/saas`: administración comercial y técnica de la plataforma A&O.
- `apps/diocesano`: gobierno y acompañamiento de una jurisdicción eclesiástica.


Cada aplicación mantiene navegación, dashboard, configuración, permisos, rutas y ciclo de construcción independientes. No se comparten automáticamente datos o permisos entre productos. Cualquier integración requiere contrato explícito, autorización, alcance mínimo y auditoría.

## Paquetes compartidos

`packages/utilities` mantiene utilidades neutrales. No trasladar componentes específicos ni modelos de dominio a paquetes comunes sin consumidores reales y límites claros.

## Archivo y Gestión Documental en A&O ERP

Archivo y Gestión Documental es un módulo interno de `apps/erp`, dentro de Gestión y control. No constituye una aplicación independiente ni requiere navegación, autenticación o administración de clientes separadas. Su definición funcional está en `docs/erp/archivo-y-gestion-documental.md` y se complementa con `docs/erp/definicion-funcional-y-arquitectonica.md`.

El módulo se integra con Libros sacramentales, Documentos y certificados y Auditoría y trazabilidad. Los servicios intensivos de digitalización, OCR, almacenamiento y procesamiento pueden desplegarse por separado, manteniendo la experiencia y el dominio funcional dentro de ERP.

La carpeta `apps/archivo-eclesiastico` de esta rama contiene un scaffold de interfaz creado antes de confirmar esta decisión de producto. Es material de transición/prototipo y **no debe incorporarse como cuarta aplicación ni desplegarse de forma independiente**. Sus pantallas y componentes deberán trasladarse/adaptarse a `apps/erp` en una fase posterior, verificando primero las rutas, navegación, componentes y convenciones existentes de ERP.

## Gestor de paquetes

El repositorio utiliza Bun y workspaces declarados en el package.json raíz.
