# @ao/platform-contracts

Contratos de integración entre A&O ERP, A&O SaaS y A&O Diocesano.

## Límites

- Los contratos transportan identidad técnica, correlación y eventos autorizados.
- No comparten tablas, permisos, sesiones ni modelos de negocio.
- El producto receptor vuelve a autorizar cada operación.
- El contexto confiable se construye en servidor; nunca se acepta directamente
  desde campos enviados por el navegador.
- Los eventos deben transportar el mínimo de información necesario. No deben
  incluir expedientes personales, sacramentales, contabilidad detallada ni
  documentos privados salvo que exista un contrato específico aprobado.

## Estado

Paquete inicial de interoperabilidad. Aún no conecta una cola, un proveedor de
identidad ni una base de datos. Esas conexiones se implementarán con adaptadores
y código reutilizado cuya licencia y compatibilidad hayan sido verificadas.
