# Arquitectura del monorepositorio A&O

## Aplicaciones

- `apps/erp`: operación institucional parroquial.
- `apps/saas`: administración comercial y técnica de la plataforma A&O.
- `apps/diocesano`: gobierno y acompañamiento de una jurisdicción eclesiástica.
- `apps/archivo-eclesiastico`: gestión archivística, descripción, preservación y consulta de fondos institucionales.

Cada aplicación mantiene navegación, dashboard, configuración, permisos, rutas y ciclo de construcción independientes. No se comparten automáticamente datos o permisos entre productos. Cualquier integración requiere contrato explícito, autorización, alcance mínimo y auditoría.

## Paquetes compartidos

`packages/utilities` mantiene utilidades neutrales. No trasladar componentes específicos ni modelos de dominio a paquetes comunes sin consumidores reales y límites claros.

## A&O Archivo Eclesiástico

La ubicación aprobada es `apps/archivo-eclesiastico`, como cuarta aplicación del monorepo. Su definición funcional y los límites con ERP, Diocesano y SaaS están en `docs/archivo-eclesiastico/alcance-arquitectura.md`.

## Gestor de paquetes

El repositorio utiliza Bun y workspaces declarados en el package.json raíz.
