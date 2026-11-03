# Ecosistema A&O

Monorepositorio de las aplicaciones independientes A&O ERP, A&O SaaS y A&O Diocesano. Cada aplicación tendrá su propio router, shell, dashboard, estilos, datos y configuración.

## Requisitos

- Bun 1.2.22 o compatible.
- Node.js requerido por las herramientas Vite/TanStack.

## Preparación

```sh
bun install
```

## A&O ERP

```sh
bun run dev:erp
bun run typecheck:erp
bun run lint:erp
bun run test:erp
bun run build:erp
bun run preview:erp
```

A&O ERP es la primera aplicación extraída. A&O SaaS y A&O Diocesano se prepararán en fases posteriores, después de validar ERP.

## A&O SaaS

```sh
bun run dev:saas
bun run typecheck:saas
bun run lint:saas
bun run test:saas
bun run build:saas
bun run preview:saas
```

El scaffold de A&O SaaS es independiente y no incluye operaciones comerciales o técnicas reales.
## A&O Diocesano

```sh
bun run dev:diocesano
bun run typecheck:diocesano
bun run lint:diocesano
bun run test:diocesano
bun run build:diocesano
bun run preview:diocesano
```

El scaffold no incluye módulos de gestión activos ni integración con A&O ERP.