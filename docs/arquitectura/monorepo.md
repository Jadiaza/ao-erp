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

La interfaz del módulo está integrada en `apps/erp`: su acceso principal se encuentra en `/app/gestion-documental` y sus áreas especializadas usan rutas `/app/archivo-*`. La aplicación autónoma provisional fue retirada del workspace y no se despliega como producto separado.

## Gestor de paquetes

El repositorio utiliza Bun y workspaces declarados en el package.json raíz.
