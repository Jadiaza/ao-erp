# Estándar institucional de formularios A&O ERP — Gestión Eclesial

**Estado:** estándar aprobado para A&O ERP; adopción gradual.  
**Ámbito:** `apps/erp`. No aplica a A&O SaaS ni A&O Diocesano sin aprobación específica.  
**Referencia visual:** imagen “Sistema unificado de formularios A&O ERP – Gestión Eclesial” adjunta por el usuario en la conversación que acompaña esta directriz. La imagen no está disponible como archivo local en el workspace y no se ha recreado ni alterado.

## 1. Propósito y alcance

Este documento establece las convenciones de presentación y composición para formularios nuevos y para la migración progresiva de formularios existentes en A&O ERP. No define procesos de negocio, reglas pastorales, canónicas, financieras ni permisos; cada módulo conserva esas decisiones bajo su propia responsabilidad.

Aplica a los 27 módulos de gestión parroquial y al Dashboard cuando incluya captura o edición. El Dashboard continúa siendo principalmente una pantalla de consulta. No altera las rutas, los datos demostrativos existentes ni el alcance funcional aprobado de cada módulo.

La adopción es gradual. Una pantalla solo se considera migrada cuando sus campos, validación, acciones, accesibilidad y comportamiento adaptable cumplen los criterios de este estándar. El uso de un diálogo compartido por sí solo no demuestra conformidad.

## 2. Identidad visual

- Reutilizar las familias y jerarquías tipográficas ya aprobadas en A&O ERP: Plus Jakarta Sans para el cuerpo de la aplicación y los estilos vigentes para encabezados, mediante `--font-sans` y `--font-heading`.
- Reutilizar tokens semánticos existentes como `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-secondary`, `border-border`, `ring` y `text-destructive`.
- Mantener la paleta vigente y los dos temas de ERP. No escribir códigos de color nuevos en cada formulario ni sobrescribir los tokens globales desde una pantalla.
- Usar fondos blancos o superficies semánticas, bordes discretos, radios existentes y sombras moderadas. Los encabezados de sección pueden usar la superficie secundaria existente cuando mejore la agrupación.
- Mantener iconografía contextual de Lucide, con tamaño y peso coherentes con los controles del módulo.

### Decisión aprobada sobre la referencia visual

Se mantienen obligatoriamente los tokens institucionales vigentes: paleta azul marino y dorado, Plus Jakarta Sans para el cuerpo y las familias/jerarquías actuales para encabezados. No sustituirlos por el azul brillante, el verde ni la aplicación de Montserrat a toda la interfaz que aparecen en la imagen conceptual.

La imagen se utiliza como referencia para la distribución de campos, jerarquía de encabezado, agrupación por secciones, composición de las tres modalidades, ubicación de acciones, espaciado y adaptación a dispositivos. Estos aspectos se adaptan a los tokens y la identidad visual reales de A&O ERP. No se introducen códigos de color particulares de la captura ni se cambian variables globales.

## 3. Modalidades oficiales

### 3.1 Modal estándar

Usar para registros breves y operaciones frecuentes: responsables, contactos, categorías, solicitudes sencillas y conceptos.

- Diálogo centrado con overlay y ancho adaptable.
- Encabezado con icono opcional, título, descripción breve y cierre accesible.
- Una o dos columnas según ancho y relación entre campos; una columna en móvil.
- Pie consistente con Cancelar y una acción primaria cuyo texto describa el resultado (por ejemplo, Guardar o Continuar).
- Mantener el diálogo dentro de la altura disponible, con desplazamiento del contenido cuando sea necesario.

No usar el modal estándar para expedientes o procesos que requieren demasiadas secciones o contexto.

### 3.2 Formulario ampliado

Usar para feligreses y familias, expedientes sacramentales, registros institucionales complejos, proveedores e información económica con varias secciones.

- Página o superficie de trabajo amplia con contexto del módulo y del registro.
- Secciones con título y agrupación lógica; pasos o pestañas solo cuando ayuden a completar una secuencia real.
- Si hay pasos, comunicar avance, permitir regresar sin perder entradas y validar cada sección antes de continuar.
- Mantener acciones principales visibles o fácilmente accesibles en escritorio y móvil.
- No reducir formularios extensos a modales pequeños.

### 3.3 Panel lateral

Usar para consulta contextual, edición breve de campos existentes y cambios puntuales.

- Abrir lateralmente sobre la pantalla de origen y conservar su contexto.
- Mostrar título y descripción o identidad del registro.
- Mantener campos compactos pero legibles; desplazar el contenido del panel, no la página subyacente.
- Ubicar acciones al pie del panel cuando se edite.
- El cierre debe funcionar con botón visible, teclado y comportamiento accesible del componente.

No usar el panel lateral para expedientes extensos.

## 4. Estructura y composición

Cada formulario incorpora únicamente las partes pertinentes:

1. **Encabezado:** título descriptivo, descripción de propósito, icono opcional y cierre cuando corresponda.
2. **Contexto:** institución, persona, familia o registro relacionado si ayuda a evitar errores de edición.
3. **Secciones:** encabezado legible y campos agrupados por significado, no por tipo de control.
4. **Campos:** etiqueta visible permanente, obligatoriedad explícita, ayuda opcional, valor inicial cuando proceda y error asociado al control.
5. **Acciones:** Cancelar y una acción primaria clara; Continuar/Regresar en pasos; Eliminar solo con confirmación explícita.
6. **Estado:** indicar carga, deshabilitado, éxito o error. El prototipo debe llamar a una acción “vista previa” o “demostración” si no persiste datos; no anunciar un guardado real.

Usar etiquetas encima del campo. El placeholder es una ayuda de formato o ejemplo y nunca reemplaza la etiqueta. Un asterisco debe acompañarse de semántica accesible (por ejemplo, `required` o `aria-required`) y una indicación comprensible de qué significa.

## 5. Componentes compartidos y responsabilidades

La infraestructura aprobada vive en apps/erp/src/components/forms y compone las primitivas de components/ui con React Hook Form. La lógica de dominio y las decisiones institucionales permanecen en cada módulo.

| Componente              | Archivo                               | Responsabilidad                                                                                                                                                                                               |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FormModal               | form-modal.tsx                        | Modal estándar con control abierto, encabezado, contenido desplazable y acciones. Recibe form, title, description, onSubmit y children; admite icon, trigger, open, onOpenChange, etiquetas y closeOnSuccess. |
| FormPage                | form-page.tsx                         | Superficie ampliada con form, encabezado, secciones y acciones visibles; el callback no agrega persistencia.                                                                                                  |
| FormDrawer              | form-drawer.tsx                       | Panel lateral contextual controlado mediante open y onOpenChange, con encabezado, contenido y acciones al pie.                                                                                                |
| FormHeader              | form-header.tsx                       | Título, descripción, icono y contexto opcional; admite elementos semánticos para los títulos de Radix.                                                                                                        |
| FormSection             | form-section.tsx                      | Sección semántica con title, description, icon, children y className; usa useId para asociar encabezado y sección.                                                                                            |
| FormActions             | form-actions.tsx                      | Acciones primaria/secundaria, etiquetas, estado pending, deshabilitado y cancelación.                                                                                                                         |
| FormField y adaptadores | form-field.tsx                        | Etiqueta, obligatoriedad, ayuda y error asociados al control. Incluye texto, texto largo, selector, correo, teléfono, número y fecha. Las reglas de dominio se definen en el módulo.                          |
| useFormSubmit           | use-form-submit.ts                    | Validación RHF, prevención de envíos simultáneos y errores del callback; no implementa backend.                                                                                                               |
| ConfirmDialog           | components/modules/confirm-dialog.tsx | Confirmación existente reexportada; usar cuando el efecto de dominio esté definido.                                                                                                                           |

Dialog, Sheet, ui/form.tsx, Input, Select, Textarea y Button continúan como primitivas. FormModal y FormDrawer las componen sin duplicar Radix. FormDialog y DetailDrawer legados permanecen intactos para evitar migraciones implícitas.

### Criterios de uso

- Modal estándar: captura breve con campos acotados.
- Formulario ampliado: varias secciones y necesidad de conservar contexto.
- Panel lateral: consulta contextual o edición breve, no expedientes extensos.
- Mantener etiquetas visibles, ayudas y errores asociados; el placeholder nunca sustituye la etiqueta.
- Los adaptadores no deciden reglas pastorales, canónicas, financieras ni institucionales.
- Nombrar la acción según su efecto real. Las demostraciones deben decir vista previa y nunca afirmar que guardaron o procesaron registros.
- En móvil, usar una columna, contenido desplazable y acciones alcanzables sin desbordamiento.

## 6. Contrato de comportamiento

- Los valores ingresados permanecen en pantalla cuando una validación falla. En el prototipo se pueden conservar en estado local mientras el formulario esté abierto; no implica persistencia entre sesiones.
- Deshabilitar o cambiar el estado de la acción primaria durante un submit pendiente para prevenir envíos repetidos. Si no hay operación real, no representar una petición pendiente ficticia como real.
- Mostrar error junto al campo, asociarlo con `aria-describedby`, marcar el campo inválido con `aria-invalid` y mover el foco al primer error cuando sea practicable.
- No limpiar los valores al fallar. Al cancelar, confirmar el descarte si perder cambios no guardados tendría consecuencias relevantes en la interacción.
- Las acciones destructivas usan `ConfirmDialog` y explican el elemento y el resultado.
- El orden del DOM coincide con el orden lógico de lectura y tabulación. Debe poder usarse sin ratón, con foco visible, Escape para cerrar cuando la modalidad lo permita y foco contenido/restaurado por los componentes accesibles existentes.
- Contraste, objetivos táctiles y espaciado deben conservar legibilidad en escritorio, tableta y móvil.
- Los controles decorativos no reciben foco. Iconos sin texto accesible llevan nombre accesible cuando sean acciones.

## 7. Ejemplos de composición

### Modal estándar

```tsx
<FormDialog
  title="Agregar responsable"
  description="Completa los datos de contacto institucional."
  submitLabel="Guardar responsable"
  onSubmit={handleSubmit}
>
  <FormSection title="Datos de contacto">
    {/* Etiquetas visibles, controles y mensajes asociados */}
  </FormSection>
</FormDialog>
```

`FormSection` en este ejemplo describe una responsabilidad deseada; no existe todavía como componente. Mientras no se cree en una fase autorizada, componer el contenido con elementos semánticos locales y no importar un componente inexistente.

### Formulario ampliado

Componer una página con `ModuleLayout`, `PageHeader`, secciones con encabezados semánticos, controles del sistema `ui/form.tsx`, y acciones persistentes según el diseño aprobado. No agregar persistencia ni reglas de negocio como parte del patrón visual.

### Panel lateral

Usar `DetailDrawer` para conservar el contexto. Si la ficha se vuelve editable, incluir un `<form>` semántico, etiquetas relacionadas, mensajes de error, acciones al pie y confirmación de cierre ante cambios sin aplicar. El componente actual no implementa por sí solo esa lógica.

## 8. Reglas para formularios nuevos y revisión

Antes de implementar un formulario nuevo:

1. Revisar el inventario vigente y las piezas disponibles.
2. Identificar el actor y el objetivo de captura sin asumir permisos, reglas o procesos no aprobados.
3. Escoger Modal estándar, Formulario ampliado o Panel lateral, y justificar la elección en la revisión del cambio.
4. Definir campos, etiquetas, obligatoriedad, ayuda, errores y qué ocurre al cancelar.
5. Confirmar si la acción es demostrativa o real; en el prototipo, presentar explícitamente la acción demostrativa.
6. Verificar teclado, foco, lector de pantalla, móvil y ambos temas existentes.
7. Probar campos requeridos, valores inválidos, errores, conservación de entradas, submit repetido y cierre/cancelación.
8. Actualizar el inventario después de una migración.

No migrar formularios existentes en bloque. Hacerlo por módulo, revisar visual y funcionalmente el resultado y mantener fuera los procesos no autorizados. La fase 2A de Intenciones de Misa podrá ser un primer caso de aplicación del estándar solo después de su autorización independiente y dentro de su alcance aprobado.

## 9. Referencias de implementación

- Aplicación: `apps/erp`.
- Navegación vigente: `apps/erp/src/data/navigation.ts`.
- Primitivas UI: `apps/erp/src/components/ui`.
- Componentes de módulo: `apps/erp/src/components/modules`.
- Tokens y familias tipográficas: `apps/erp/src/styles.css`.
- Inventario inicial: `docs/erp/auditorias/inventario-formularios-ao-erp.md`.
- Imagen principal: captura adjunta a la directriz del usuario; no se encontró una copia como archivo independiente en el directorio de adjuntos consultado.

## 10. Registro de implementación visual

La infraestructura compartida y el piloto visual de Intenciones de Misa se implementaron en una fase autorizada. El piloto está visible al abrir Liturgia y celebraciones y utiliza FormPage, FormModal y FormDrawer para presentar el mismo formulario ficticio en las tres modalidades. La pestaña inicial es el formulario ampliado; la consulta y el detalle también son demostrativos. La vista previa solo mantiene valores en memoria mientras la pantalla está abierta y no representa una solicitud, partida, asignación, celebración, pago ni estado operativo.

Las capturas reales del piloto en escritorio y móvil, junto con las modalidades abiertas, están en `docs/erp/auditorias/evidencias/`. El registro y sus límites están en `docs/erp/auditorias/implementacion-estandar-formularios.md`. Esta actualización no declara migrados formularios de otros módulos ni autoriza la fase funcional 2A.
