# Informe inicial del estándar de formularios A&O ERP

**Fecha:** 3 de noviembre de 2026  
**Fase:** definición, documentación e inventario; no incluye migración de pantallas.

## 1. Documentos creados o actualizados

- Creado `docs/erp/estandar-formularios.md`, referencia técnica institucional para formularios de A&O ERP.
- Creado `docs/erp/auditorias/inventario-formularios-ao-erp.md`, inventario del Dashboard y los 27 módulos de gestión parroquial.
- Creado este informe.
- Actualizado `AGENTS.md`, documento maestro de instrucciones presente en la raíz del workspace.

## 2. Regla incorporada a las instrucciones

`AGENTS.md` ahora establece que todo formulario nuevo o modificado en `apps/erp` debe respetar `docs/erp/estandar-formularios.md`, revisar el inventario y reutilizar las piezas disponibles. La regla excluye expresamente SaaS y Diocesano salvo aprobación específica. Se preservó íntegro el aviso existente de sincronización con Lovable.

## 3. Componentes existentes identificados

Se localizaron:

- `FormDialog` y primitivas `Dialog` para modales estándar.
- `DetailDrawer` y `Sheet` para consulta lateral; no constituyen hoy un formulario lateral de edición completo.
- `ConfirmDialog` y `AlertDialog` para confirmaciones.
- `FieldGroup`, además de `Label`, `Input`, `Select`, `Textarea`, `Calendar`, `Checkbox`, `RadioGroup` y `Switch`.
- `ui/form.tsx` con soporte de React Hook Form, labels, descripciones y mensajes de error. Las pantallas de módulos no lo utilizan en los formularios revisados.
- `ModuleLayout` y `PageHeader`, piezas composables para formularios ampliados.

No se añadieron componentes ni dependencias. No existen componentes dedicados `FormPage`, `FormDrawer`, `FormSection` o `FormActions`; su necesidad debe validarse durante una migración autorizada antes de crearlos.

## 4. Inventario

El inventario incluye las 28 pantallas del alcance (Dashboard y 27 módulos), con su componente, captura observada, modalidad recomendada, adecuación y complejidad. Se detectaron 11 pantallas que importan `FormDialog`; todas son parciales respecto del estándar integral, ya que varias son vistas demostrativas y la pieza compartida no ofrece por sí misma validación, estados de carga ni prevención de doble envío. Se distinguieron formularios de consulta, controles de filtros, fichas de detalle y captura inexistente.

## 5. Conflictos encontrados

1. **Paleta:** la imagen de referencia rotula azul `#0B3D91`, secundario `#1565C0` y acento verde `#00B567`; los tokens vigentes de ERP representan los azules institucionales aprobados y el dorado. Los tonos no son intercambiables sin cambiar la identidad visual.
2. **Tipografía:** la imagen presenta Montserrat para toda la interfaz, mientras que los estilos actuales usan Montserrat para encabezados y Plus Jakarta Sans para el cuerpo.
3. **Disponibilidad de la referencia:** la captura se recibió en la conversación, pero no se encontró como archivo independiente dentro del directorio adjunto ni del workspace. El estándar la identifica por su título/contexto, sin generar una copia aproximada.

El estándar resuelve provisionalmente estas diferencias por precedencia: utiliza los tokens y tipografías actuales y considera la imagen una guía de composición. **La resolución definitiva de paleta y tipografía requiere aprobación del usuario**. No se cambiaron tokens, interfaz ni marca en esta fase.

## 6. Recomendaciones de adopción progresiva

1. Aprobar cómo resolver la diferencia entre los colores/tipografía rotulados en la imagen y los tokens actuales.
2. Validar primero el patrón modal con un formulario breve y de bajo riesgo.
3. Revisar después un caso de edición lateral y uno ampliado.
4. Probar teclado, foco, asociación label/error, errores, conservación de entradas, doble envío y tamaños móvil/escritorio.
5. Migrar por módulos, conservar explícitamente los modos demostrativos y actualizar el inventario después de cada fase.
6. No iniciar Intenciones de Misa ni migrar formularios de módulos hasta autorización independiente; este trabajo no añade ese proceso.

## 7. Archivos modificados

- `AGENTS.md` — regla institucional de formularios.
- `docs/erp/estandar-formularios.md` — creado.
- `docs/erp/auditorias/inventario-formularios-ao-erp.md` — creado.
- `docs/erp/auditorias/estandar-formularios-ao-erp.md` — creado.

No se modificó código, rutas ni pantallas, y no se alteraron A&O SaaS o A&O Diocesano.
