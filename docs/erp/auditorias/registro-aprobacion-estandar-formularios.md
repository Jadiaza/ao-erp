# Registro de actualización: aprobación del estándar de formularios

**Fecha:** 3 de noviembre de 2026  
**Base de actualización:** aprobación del usuario sobre identidad visual y composición del estándar de formularios de A&O ERP.

## 1. Archivos actualizados o creados

- Actualizado `docs/erp/estandar-formularios.md`.
- Actualizado `AGENTS.md`.
- Creado `docs/erp/auditorias/propuesta-migracion-formularios-ao-erp.md`.
- Creado este registro.
- `docs/erp/auditorias/inventario-formularios-ao-erp.md` se conservó sin cambios, conforme a la instrucción.

## 2. Decisión visual incorporada

El estándar ahora declara como obligatorios la paleta institucional azul marino y dorado, Plus Jakarta Sans en el cuerpo y las familias y jerarquías tipográficas actuales en encabezados. Prohíbe sustituirlos por el azul brillante, el verde o Montserrat para toda la interfaz que aparecen en la imagen conceptual.

La imagen queda como guía de composición: campos, jerarquía del encabezado, secciones, modalidades, botones, espaciado y adaptación responsive. En `AGENTS.md` se incluyó la misma regla para futuras tareas, limitada a `apps/erp`.

La diferencia visual queda resuelta conforme a la aprobación recibida; ya no se marca como decisión pendiente. No se modificó la imagen, tokens CSS, marca ni apariencia de las pantallas.

## 3. Propuesta de migración

Se preparó una secuencia por etapas: preparación del patrón, piloto de Intenciones de Misa, modal breve de bajo riesgo, migración de modales estándar, formularios ampliados, edición lateral y revisión transversal.

Intenciones de Misa se mantiene como primer caso práctico, pero la propuesta no autoriza código. La segunda auditoría advierte que la fase 2A completa aún tiene cuestiones funcionales sin resolver y que solo un subconjunto estrecho de captura local podría considerarse después de definirlo y aprobarlo separadamente. Por tanto, la propuesta excluye explícitamente estados no aprobados, recepción institucional real, asignación, calendario, efectos financieros, Portal autenticado y comunicaciones automatizadas.

## 4. Componentes y alcance preservado

No se crearon ni modificaron componentes de interfaz. Se conservan como base `FormDialog`, `DetailDrawer`, `FieldGroup`, `ConfirmDialog`, las primitivas UI y `ui/form.tsx` ya identificadas. El inventario permanece intacto.

No se modificaron rutas ni pantallas, no se instalaron dependencias y no se tocaron A&O SaaS o A&O Diocesano. No se iniciaron fase 2A ni migraciones de formularios.

## 5. Aspectos sujetos a autorización posterior

- Aprobación independiente para implementar el piloto 2A y delimitación de su subconjunto, resultado local y criterios.
- Autorización separada de cada migración de formularios existentes.
- Cualquier decisión funcional, pastoral, canónica, financiera, de acceso o persistencia que exceda el patrón visual.

## 6. Validación documental

Se revisó que el inventario no se editara y que la regla del estándar quede en el `AGENTS.md` existente, preservando el bloque de instrucciones de Lovable. El documento del estándar, la propuesta, este registro y `AGENTS.md` se guardaron en UTF-8. No se ejecutaron pruebas ni compilación porque no se modificó código.

## 7. Dictamen

La aprobación visual quedó incorporada en los documentos institucionales y la propuesta está lista para revisión. **No se inicia implementación** hasta recibir autorización expresa para el alcance de 2A o para la migración de otro formulario.
