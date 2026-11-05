# Capa funcional contable A&O

## Primera unidad de dominio: libro mayor

Se incorpora `@ao/ledger-core` como módulo TypeScript independiente de la interfaz. La pantalla actual de Contabilidad no se rediseña ni se reemplaza; esta capa prepara reglas de negocio que podrán consumir los servicios del ERP.

## Reglas incluidas

- Partida doble: suma de débitos igual a suma de créditos.
- Importes expresados en unidades menores enteras para evitar errores de coma flotante.
- Mínimo dos movimientos por comprobante.
- Una línea no puede tener débito y crédito al mismo tiempo.
- Una línea no puede tener ambos importes en cero.
- La cuenta debe existir, estar activa y aceptar movimientos.
- Solo se permite contabilizar en periodos abiertos y dentro de sus fechas.
- La reversión produce líneas inversas y conserva intacto el comprobante original.
- Validación previa a la contabilización con códigos de error estables.

## Decisiones de dominio pendientes de configuración

- Plan de cuentas por marco técnico normativo y entidad contable.
- Moneda funcional y política de redondeo por entidad.
- Catálogo de tipos de comprobante y numeración.
- Reglas de causación, impuestos, retenciones y documentos soporte.
- Centros de costos, fondos, proyectos y dimensiones analíticas.
- Apertura/cierre, bloqueo y reapertura de periodos con permisos y auditoría.

## Lo que aún no hace

Esta capa no persiste datos, no genera asientos automáticos, no autoriza usuarios, no calcula impuestos ni sustituye la contabilidad colombiana configurada para cada entidad. Debe conectarse a repositorios PostgreSQL y servicios de aplicación antes de usarse en producción.

## Pruebas

Las pruebas del paquete usan `bun:test`. Deben ejecutarse desde el workspace con `bun test packages/ledger-core/src/index.test.ts` en un entorno que tenga Bun instalado.
