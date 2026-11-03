# Integración de ORDO Colombia

## Alcance

La pestaña **Calendario litúrgico** de Liturgia y celebraciones consulta en modo de solo lectura los servicios públicos de ORDO Colombia, publicado por la Conferencia Episcopal de Colombia. La consulta no crea ni modifica datos parroquiales. La programación local de celebraciones y equipos permanece separada, y el piloto visual de Intenciones de Misa no se conecta a estos servicios.

Fuente oficial: [ORDO Colombia – Calendario](https://web-ordo-colombiano.cec.org.co/fiestas).

## Servicios y contrato observado

Se hicieron solicitudes `GET` sin parámetros de consulta, sin credenciales y sin encabezados de autorización. En la verificación del 3 de noviembre de 2026 los cuatro servicios respondieron `HTTP 200` con JSON y un sobre de la forma `{ message, code, success, data }`. La interfaz requiere `success: true` y `data` como arreglo. No se copiaron encabezados internos del cliente oficial ni se añadieron secretos.

| Servicio | Ruta | Estructura relevante observada | Resultado de la consulta de verificación |
|---|---|---|---|
| Fiestas principales | `/api-app/fiestas-principales` | `fecha`, `nombre_celebracion`, `DESCRIPCION` | 45 registros, 44 fechas distintas; los registros observados abarcaron 2023–2026. En 2026 solo aparecía el 11 de enero (dos variantes). |
| Información de tiempo litúrgico | `/api-app/ediciones/listar-informacion-tiempo-liturgico` | `ANO_ANO`, `NOMBRE`, `TEXTO_INTRODUCTORIO`, textos de periodos y fechas `FECHA_*` | Un objeto del año 2026, ciclo “CICLO A PAR”; `FECHA_CRISTO_REY_II` correspondía al 29 de noviembre de 2026. Los contadores y porcentajes observados estaban en cero y no se presentan como progreso calculado. |
| Contenido principal | `/api-app/ediciones/obtener-contenido-principal` | `id`, `fecha`, `tiempo_liturgico`, encabezados, color y lecturas (`primera_lectura`, `salmo`, `evangelio`, entre otros) | 16 fechas consecutivas del 28 de octubre al 12 de noviembre de 2026. Incluía el 1 de noviembre (`id` 640047) y el 3 de noviembre (`id` 640049); no el 29 de noviembre. |
| Contenido completo | `/api-app/ediciones/obtener-contenido-completo` | `id`, `fecha`, `tiempo_liturgico`, celebración, color, misa, oficio, notas, lecturas, reflexión y otros campos | 371 registros, 364 fechas distintas, del 30 de noviembre de 2025 al 28 de noviembre de 2026. Se observaron fechas con más de un registro; se conservan todos. |

Las rutas completas están centralizadas en `apps/erp/src/lib/ordo/config.ts`. No se asumió que los nombres o la cobertura de estos datos constituyan un contrato estable; si ORDO cambia su sobre, campos o cobertura, la normalización y esta nota deben revisarse.

## Normalización y visualización

- `normalize.ts` valida fechas ISO, convierte textos `null`, `undefined` y vacíos en ausencia de valor y adapta los campos conocidos.
- El contenido completo y el principal se unen por `id` ORDO. Se priorizan valores no vacíos del contenido principal y se mantienen los valores completos cuando el registro complementario está vacío. No se fusiona ni elimina por fecha: dos celebraciones distintas del mismo día permanecen separadas.
- Los campos HTML se convierten a nodos React con una lista permitida de etiquetas; se eliminan atributos, etiquetas activas y contenido ejecutable. No se usa `dangerouslySetInnerHTML`. El enlace de audio solo se habilita para direcciones HTTPS.
- Las fechas se manejan como fechas de calendario local para evitar desplazamientos por zona horaria.
- El componente presenta contenido litúrgico, fiestas, ciclo/periodo y referencias de tiempo por separado. No inventa una celebración cuando no hay registro; un hito como Cristo Rey tampoco se representa como contenido de celebración.
- La programación parroquial ficticia y sus ministros siguen en la pestaña **Programación y equipos**. No se confunden con información ORDO.

## Solicitud, cache y errores

`client.ts` realiza solicitudes GET desde el navegador con `Accept: application/json`, `credentials: omit` y señal de cancelación. El CORS observado por el navegador permitió origen comodín. Cada respuesta se conserva en memoria por una hora, acorde con el `Cache-Control: max-age=3600` observado. El control **Reintentar** vacía ese cache en memoria e inicia de nuevo las consultas.

Los cuatro servicios se consultan de forma independiente y concurrente. Si uno falla, los demás datos disponibles permanecen visibles y el módulo explica la limitación. La aplicación no mantiene una copia local persistente ni garantiza disponibilidad cuando ORDO no responde.

## Cobertura y límites verificados

- En la respuesta probada, el 1 y el 3 de noviembre de 2026 tenían contenido de ORDO. Las respuestas principal y completa compartían identificador para los registros correspondientes; los campos complementarios de lecturas se combinaron.
- El servicio de fiestas principales no ofrecía una cobertura contemporánea completa para 2026 en esa consulta; su resultado no debe interpretarse como inventario exhaustivo de fiestas.
- La respuesta de contenido completo terminaba el 28 de noviembre de 2026. El 29 de noviembre no tenía partida de contenido en ninguno de los dos servicios de contenido consultados. El servicio de tiempos sí indicaba para esa fecha la referencia “Cristo Rey”. La interfaz muestra esa referencia de tiempo por separado y deja explícita la ausencia de contenido recibido.
- El 3 de noviembre de 2026 el campo de color devolvía la alternativa “Verde o Blanco”. La aplicación conserva ese texto tal cual, sin seleccionar una opción.
- Se observaron nombres nulos y fragmentos HTML con valores vacíos. Se normalizan y sanitizan para que no aparezcan como texto “null” ni se ejecuten como HTML activo.

Estas observaciones describen respuestas puntuales verificadas el 3 de noviembre de 2026, no una garantía para años, fechas o respuestas futuras.

## Archivos de integración

- `apps/erp/src/lib/ordo/config.ts`: rutas y duración del cache.
- `apps/erp/src/lib/ordo/types.ts`: tipos adaptados al contrato observado.
- `apps/erp/src/lib/ordo/client.ts`: consultas GET, validación del sobre y cache en memoria.
- `apps/erp/src/lib/ordo/normalize.ts`: normalización y combinación por identificador.
- `apps/erp/src/hooks/use-ordo-calendar.ts`: ciclo de consulta, cancelación, errores parciales y reintento.
- `apps/erp/src/components/modules/ordo-calendar-view.tsx`: calendario, contenido, referencias y detalle.
- `apps/erp/src/components/modules/ordo-html-content.tsx`: representación segura del HTML recibido.
- `apps/erp/src/lib/ordo/normalize.test.tsx`: pruebas de normalización, combinación y sanitización.

## Pruebas funcionales recomendadas

Al cambiar la fuente o normalización, verificar nuevamente fechas con contenido (incluidos 1 y 3 de noviembre de 2026), una fecha con registros duplicados, una fecha con variantes de color, una respuesta con valores nulos, contenido HTML y una fecha sin contenido pero con hito de tiempo (29 de noviembre de 2026). Confirmar también que un fallo parcial no oculte las otras respuestas y que reintentar vuelva a consultar.
