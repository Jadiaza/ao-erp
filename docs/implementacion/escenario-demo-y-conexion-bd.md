# Escenario integrado de demostración y conexión futura de base de datos

## Objetivo

A&O ERP debe funcionar ahora con un escenario completo de datos ficticios y, posteriormente, cambiar a PostgreSQL sin rediseñar las pantallas ni duplicar reglas de negocio.

## Fuente única del escenario demo

- Store: `src/demo/erp-demo-store.ts`
- Panel reutilizable: `src/components/modules/integrated-workflow-panel.tsx`
- Persistencia actual: localStorage del navegador, clave versionada `ao-erp:integrated-demo:v2`.
- Identificador de escenario: `PARROQUIA-DEMO-CO-001`.
- Identificador transversal del ciclo: `COM-DEMO-001`.

El estado inicial trae una compra, proveedor, recepción de 100 unidades, existencias iniciales y recibidas, factura de proveedor, cuenta por pagar, pago en tesorería, ejecución presupuestal, propuesta de comprobante contable, soportes documentales y eventos de auditoría. Los registros se enlazan por IDs de origen; no deben relacionarse por nombres o textos visibles.

## Recorrido de datos de muestra

| Módulo | Registro | Resultado |
|---|---|---|
| Compras | OC-DEMO-001 | Orden aprobada por $1.480.000 |
| Inventarios | REC-DEMO-001 | 100 kits recibidos; saldo demo 135 unidades |
| Cuentas por pagar | CXP-DEMO-001 / FE-DEMO-8841 | Factura $1.480.000; saldo $0 |
| Tesorería | TES-DEMO-001 | Egreso demo por $1.480.000 |
| Presupuesto | PRE-DEMO-02 | Aprobado $6.800.000; causado y pagado $1.480.000; disponible $5.320.000 |
| Contabilidad | CMP-DEMO-INT-001 | Débito 2205 / crédito 1110 por $1.480.000; queda en borrador |
| Gestión documental | DOC-DEMO-INT-001..003 | Factura, recepción y propuesta contable |
| Auditoría | AUD-DEMO-001..008 | Eventos de los pasos del ciclo |

Todas las cantidades y nombres son ilustrativos. El comprobante es una propuesta y no afecta un libro mayor contabilizado.

## Contrato de persistencia

La interfaz de persistencia vive en `src/application/ports/erp-repository.ts`. Los casos de uso deben depender de `ErpRepository` y `WorkflowCommand`, no del navegador ni del proveedor concreto.

El futuro adaptador PostgreSQL debe implementar:

1. `getOperationalSnapshot(scope)`: lectura consistente y limitada a organización y entidad contable.
2. `execute(command, scope, idempotencyKey)`: transacción atómica para el comando y todos sus efectos intermodulares.
3. `getRelatedRecords(source, scope)`: recuperar documentos, asientos, pagos, movimientos y auditoría por origen.

### Transacción esperada

- Validar autorización y tenant scope en servidor.
- Bloquear/validar versión de la entidad de origen para evitar concurrencia perdida.
- Aplicar la transición de dominio.
- Guardar la orden/recepción/factura/pago y sus relaciones.
- Actualizar presupuesto e inventario cuando corresponda.
- Crear movimiento de tesorería y propuesta de comprobante según el caso de uso.
- Vincular documentos y registrar auditoría dentro de la misma transacción.
- Registrar la clave de idempotencia con restricción única.
- Confirmar todo o revertir todo.

## Mapeo sugerido a PostgreSQL

- `procurement_requests`, `procurement_request_lines`, `purchase_orders`, `purchase_order_lines`
- `inventory_items`, `warehouses`, `inventory_receipts`, `inventory_movements`
- `suppliers`, `supplier_invoices`, `payables`, `payable_allocations`, `payable_payments`
- `treasury_accounts`, `cash_movements`, `bank_reconciliations`
- `budgets`, `budget_lines`, `budget_commitments`, `budget_accruals`, `budget_payments`
- `accounting_entities`, `accounting_periods`, `accounting_accounts`, `accounting_vouchers`, `accounting_voucher_lines`
- `documents`, `document_versions`, `document_source_links`
- `audit_events`, `idempotency_keys`, `outbox_events`

Todas las tablas de negocio deben incluir organización y, cuando aplique, entidad contable. Definir FKs compuestas para impedir relaciones cruzadas entre tenants o entidades. El rol de aplicación no debe tener BYPASSRLS. Los archivos deben permanecer en almacenamiento privado; PostgreSQL conserva metadatos y referencias, no binarios pesados.

## Regla de separación demo / producción

- El escenario demo debe identificarse por `scenarioId` y no enviarse al adaptador productivo.
- No usar localStorage como persistencia de negocio ni como mecanismo de autorización.
- La conexión real se configura en servidor mediante variables de entorno y secretos del entorno de despliegue; nunca exponer credenciales al bundle cliente.
- La UI consume contratos de aplicación. La implementación del repositorio se selecciona por configuración de servidor.
- No ejecutar migraciones ni conectar una base de datos hasta que el esquema, tenant isolation, constraints, transacciones y pruebas estén revisados.
