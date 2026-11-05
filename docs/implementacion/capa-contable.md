# Capa funcional contable de A&O ERP

## Ubicación dentro del sistema

La lógica contable pertenece a la aplicación única A&O ERP. Su código de dominio está en `apps/erp/src/modules/accounting/domain/`; no se distribuye como paquete ni producto independiente. La interfaz existente de Contabilidad se conserva.

## Reglas de dominio incorporadas

- Partida doble: suma de débitos igual a suma de créditos.
- Importes expresados en unidades menores enteras para evitar errores de coma flotante.
- Mínimo dos movimientos por comprobante.
- Una línea no puede tener débito y crédito al mismo tiempo ni ambos importes en cero.
- La cuenta debe existir, estar activa y aceptar movimientos.
- Solo se permite contabilizar en periodos abiertos y dentro de sus fechas.
- La reversión produce líneas inversas y conserva intacto el comprobante original.
- Validación previa con códigos de error estables.

## Decisiones pendientes

- Plan de cuentas por marco técnico normativo y entidad contable.
- Moneda funcional y política de redondeo.
- Tipos de comprobante, numeración y consecutivos.
- Causación, impuestos, retenciones y documentos soporte.
- Centros de costos, fondos, proyectos y dimensiones analíticas.
- Apertura, cierre, bloqueo y reapertura de periodos con permisos y auditoría.

## Estado y límites

La lógica de dominio está incorporada y cuenta con pruebas Vitest. La migración PostgreSQL inicial está en `apps/erp/database/migrations/0001_accounting_foundation.sql`, pero aún no se ha ejecutado contra una base real. No hay todavía repositorio conectado ni endpoint de producción, y la pantalla sigue usando datos de demostración. Por tanto, esta capa todavía no debe considerarse contabilidad productiva.

La siguiente etapa es integrar un repositorio PostgreSQL transaccional con contexto de organización obtenido de la sesión autenticada en servidor; nunca desde un identificador enviado por el navegador. Después se conectará a la pantalla actual sin modificar su presentación.
