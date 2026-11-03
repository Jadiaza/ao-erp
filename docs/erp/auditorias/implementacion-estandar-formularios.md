# Implementación visual del estándar de formularios A&O ERP

**Ámbito:** infraestructura visual compartida y piloto de Intenciones de Misa.  
**Resultado:** formularios visibles en la aplicación, con datos ficticios y sin operaciones de dominio.

## Resultado

El módulo **Liturgia y celebraciones** abre inicialmente la pestaña del piloto visual de Intenciones de Misa en `/app/liturgia-celebraciones`. El formulario ampliado aparece de inmediato; los controles del piloto permiten abrir la misma composición como modal estándar o panel lateral, y alternar a consulta y detalle demostrativos.

Las tres modalidades utilizan la identidad institucional vigente, tokens semánticos, Plus Jakarta Sans, campos etiquetados y bandas de sección. En escritorio el modal queda centrado y el formulario ampliado aprovecha el espacio. En un viewport móvil de 390 px, los campos se presentan en una columna y el modal y el panel usan el ancho disponible.

## Componentes compartidos

- `FormModal`: diálogo centrado, encabezado, contenido desplazable y acciones al pie.
- `FormPage`: superficie amplia con encabezado, contenido por secciones y acciones.
- `FormDrawer`: panel lateral con contexto, contenido desplazable y acciones al pie.
- `FormHeader`, `FormSection` y `FormActions`: jerarquía, agrupación y acciones comunes.
- `FormField` y adaptadores: campos de texto, texto largo, selector, correo, teléfono, número y fecha; reúnen etiqueta, ayuda y mensaje de validación.
- `useFormSubmit`: integración con React Hook Form, validación del esquema suministrado y prevención de envíos simultáneos.
- `components/forms/index.ts`: exportación de la infraestructura.

Se reutilizan las primitivas existentes Dialog, Sheet, `ui/form`, Input, Select, Textarea y Button. No se añadieron dependencias.

## Piloto de Intenciones de Misa

El mismo constructor de campos se presenta en formulario ampliado, modal y panel lateral. Contiene únicamente ejemplos ficticios de:

- Nombre y medio de contacto preferido, con un dato de contacto de ejemplo.
- Categoría y texto breve de la intención.
- Fecha preferida opcional, franja horaria preferida, sede preferida y observaciones de muestra.

Los controles no marcan campos como obligatorios ni imponen reglas pastorales, canónicas o económicas. No incluyen identificación personal ni crean, consultan o modifican registros reales. La acción principal se limita a presentar una vista previa local de los valores temporales. La consulta y el detalle muestran referencias ficticias, no partidas sacramentales.

## Evidencia visual

Capturas PNG tomadas del DOM real de la aplicación local mediante Chrome headless. El capturador utiliza un iframe del ancho indicado para revisar el layout móvil; Chrome de este entorno entrega una imagen exterior de 500 px, por lo que las capturas móviles incluyen un margen vacío a la derecha. El viewport de la aplicación dentro del iframe es de 390 px.

- [Formulario ampliado, escritorio](evidencias/intenciones-formulario-ampliado-escritorio.png)
- [Modal estándar abierto, escritorio](evidencias/intenciones-modal-estandar-escritorio.png)
- [Panel lateral abierto, escritorio](evidencias/intenciones-panel-lateral-escritorio.png)
- [Formulario ampliado, viewport móvil de 390 px](evidencias/intenciones-formulario-ampliado-movil.png)
- [Modal estándar abierto, viewport móvil de 390 px](evidencias/intenciones-modal-estandar-movil.png)
- [Panel lateral abierto, viewport móvil de 390 px](evidencias/intenciones-panel-lateral-movil.png)

## Archivos

### Infraestructura de formularios

- `apps/erp/src/components/forms/form-actions.tsx`
- `apps/erp/src/components/forms/form-drawer.tsx`
- `apps/erp/src/components/forms/form-field.tsx`
- `apps/erp/src/components/forms/form-header.tsx`
- `apps/erp/src/components/forms/form-modal.tsx`
- `apps/erp/src/components/forms/form-page.tsx`
- `apps/erp/src/components/forms/form-section.tsx`
- `apps/erp/src/components/forms/index.ts`
- `apps/erp/src/components/forms/use-form-submit.ts`

### Piloto e integración visual

- `apps/erp/src/components/modules/mass-intentions-visual-pilot.tsx`: formulario inicial visible, campos demostrativos y ajustes de adaptación a anchos pequeños.
- `apps/erp/src/components/modules/liturgy-screen.tsx`: integra el piloto en la pantalla existente y lo selecciona al abrir el módulo; mantiene las pestañas de agenda existentes.
- `apps/erp/src/components/ui/dialog.tsx`: extensión opcional para clases del overlay y nombre accesible del cierre.
- `apps/erp/src/components/ui/sheet.tsx`: nombre accesible del cierre.

### Documentación y evidencia

- `docs/erp/estandar-formularios.md`
- `docs/erp/auditorias/implementacion-estandar-formularios.md`
- Los seis archivos PNG enlazados arriba.

## Validaciones

Validaciones ejecutadas para esta corrección:

- TypeScript ERP: aprobado.
- Pruebas ERP: 3/3 aprobadas.
- Build ERP: aprobado. Vite/Nitro mostraron avisos existentes sobre `vite-tsconfig-paths` y `inlineDynamicImports`.
- ESLint focalizado en los componentes y pantallas del estándar, desactivando únicamente la regla Prettier: cero errores y advertencias.
- ESLint completo ERP: no aprobado; reporta 1.306 errores Prettier y 6 advertencias en el proyecto.
- Prettier `--check` sobre los archivos fuente y documentos de esta intervención: aprobado.
- Ruta del piloto: HTTP 200 en el servidor de desarrollo local.
- Revisión visual: capturas reales de las tres modalidades en escritorio y móvil generadas e inspeccionadas.

La captura móvil usa un iframe con viewport de 390 px. Chrome headless en este entorno produce un lienzo exterior de 500 px, así que los PNG móviles conservan un margen vacío de 110 px a la derecha; el contenido del ERP dentro del iframe sí se renderiza con el breakpoint móvil.

## Límites y pendientes

- No hay persistencia, llamadas a API, operaciones reales, autenticación ni permisos efectivos.
- No se implementaron captura operativa, estados de proceso, asignación, confirmación pastoral, calendario nuevo, reglas económicas, pagos, comunicaciones ni Portal del Feligrés.
- No se migraron formularios de otros módulos ni se modificaron SaaS o Diocesano.
- La prueba automatizada de teclado y lectores de pantalla, así como la inspección interactiva de consola y foco restaurado, requieren una sesión de navegador interactiva y permanecen pendientes.

La fase termina aquí; cualquier migración de formularios o implementación funcional de Intenciones de Misa requiere autorización independiente.
