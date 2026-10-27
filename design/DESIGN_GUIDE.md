# Guía de diseño Grupo CAP

Cómo debe verse cualquier sistema interno de Grupo CAP (manual de marca 2026). Es la referencia
para programadores y para los agentes de IA que generen interfaz. Los valores viven en
`tokens.json`; nunca se escriben hex a mano en una pantalla.

## En una frase

Marco negro, lienzo gris cálido, tarjetas blancas, texto en Inter, títulos en Poppins, y el rojo
de marca solo donde deba llamar la atención.

## Paleta

| Uso | Clase Tailwind | Variable CSS | Claro | Oscuro |
|---|---|---|---|---|
| Marco: sidebar, header, cabeceras de tabla, botón primario | `bg-cap-chrome` | `--cap-chrome` | `#212121` | `#2B2B2B` en cabeceras; sidebar y header siguen `#212121` |
| Riel o barra más oscura dentro del marco | `bg-cap-rail` | `--cap-rail` | `#171717` | igual |
| Fondo de página | `bg-cap-paper` / `dark:bg-cap-canvas` | `--cap-page` | `#F3F2F1` | `#151515` |
| Tarjetas y paneles | `bg-white` / `dark:bg-cap-chrome` | `--cap-card` | `#FFFFFF` | `#212121` |
| Superficie secundaria (inputs, chips, filas alternas) | `bg-cap-paper` / `dark:bg-cap-raised` | `--cap-card-2` | `#F3F2F1` | `#2B2B2B` |
| Divisores y bordes | `border-cap-paper-line` / `dark:border-cap-line` | `--cap-divider` | `#E2E0DE` | `#3A3A3A` |
| Rojo de marca: enlaces de tabla, destructivo, ítem activo, acentos | `text-cap-brand` / `dark:text-cap-brand-soft` | `--cap-brand` | `#B12530` | `#D9414D` |
| Hover del rojo | `hover:bg-cap-brand-hover` | `--cap-red-hover` | `#951F28` | — |
| Gris de marca: texto secundario sobre el marco | `text-cap-brand-gray` | `--cap-gray` | `#B2B2B2` | igual |

Texto: `text-gray-900` sobre claro y `text-gray-100` sobre oscuro; secundario `text-gray-500` /
`dark:text-gray-400`. Las escalas `gray`, `slate` y `zinc` están unificadas en la neutra para que
nada tiña de azul el modo oscuro.

### Estados

Una sola escala semántica para badges, chips, avisos y gráficas; mismo significado en los dos temas.

| Estado | Clase | Variable | Claro | Oscuro |
|---|---|---|---|---|
| ok / completado / pagado | `cap-status-ok` · `dark:cap-status-dark-ok` | `--cap-status-ok` | `#2E7D32` | `#81C784` |
| error / anulado / vencido | `cap-status-error` | `--cap-status-error` | `#B12530` | `#D9414D` |
| aviso / pendiente | `cap-status-warning` | `--cap-status-warning` | `#EF6C00` | `#FFA726` |
| info / en proceso | `cap-status-info` | `--cap-status-info` | `#1565C0` | `#64B5F6` |
| neutro / borrador | `cap-status-neutral` | `--cap-status-neutral` | `#757575` | `#9E9E9E` |

Un badge de estado es texto del color del estado sobre un tinte del mismo color al 12 %
(`color-mix(in srgb, var(--cap-status-ok) 12%, transparent)`), con un punto a la izquierda.

### Reglas de color

- **Botón primario negro** (`bg-cap-chrome text-white`), invertido a blanco en oscuro
  (`dark:bg-gray-100 dark:text-gray-900`). Uno por pantalla o por formulario.
- **Secundario**: contorno neutro (`border border-gray-300 bg-white text-gray-800`), rojo al pasar
  el cursor. Exportar PDF/Excel, filtros y acciones de menú son secundarias.
- **Destructivo**: rojo de marca relleno (`bg-cap-brand text-white hover:bg-cap-brand-hover`).
- El rojo **nunca** es fondo de cabeceras, barras de título ni superficies grandes: solo acentos,
  enlaces de tabla, el ítem activo del menú y lo destructivo.
- El azul solo existe como `info` semántico. No es color de acción, ni de enlaces, ni de botones.
- Sin degradados, sin sombras de color, sin otros colores de acento.

## Tipografía

- **Inter** para todo el texto (`font-sans`). Es la fuente de interfaz; el manual pide Montserrat
  para textos impresos, pero en pantalla Inter se lee mejor en tablas y cifras.
- **Poppins**, la corporativa del manual, para títulos, cifras destacadas y cabeceras de tabla
  (`font-display`). Los `h1`–`h6` ya la llevan con `tokens.css`.
- Escala: títulos de página 20–24 px semibold; secciones 14–16 px semibold; texto 13–14 px;
  etiquetas y metadatos 11–12 px. Nada por debajo de 11 px.
- Sin mayúsculas forzadas con espaciado amplio en etiquetas; sentence case. Sin monoespaciada
  salvo códigos; para cifras usar `tabular-nums`.
- Carga: `https://fonts.bunny.net/css?family=` + `fonts.webfont` de `tokens.json`.

## Estructura de página

- **Marco** oscuro en los dos temas: sidebar a la izquierda (riel de 64 px o panel de 224–288 px)
  y header de 56–64 px del mismo negro. El contenido va sobre el lienzo gris cálido.
- Título de página en el header (Poppins), con migas de pan arriba en gris claro.
- Contenido con margen de 24–36 px en escritorio y 16 px en celular; `max-width` 1280 px para
  formularios y lectura, ancho completo para tablas y tableros.
- Tarjetas blancas con borde `divider`, radio 10 px, sin sombra (o `shadow-sm` como máximo).
- Radios: 6 px en chips y badges, 8 px en inputs y botones, 10 px en tarjetas y modales.

## Componentes

**Tablas**: cabecera en el marco (`bg-cap-chrome`, texto blanco, Poppins 600, 11.5 px, sin
mayúsculas forzadas), filas de 40–44 px, divisores finos, columna de enlace en rojo de marca,
acciones en un menú `⋮` con contorno neutro. Paginación y filtros arriba, exportar a la derecha.

**Formularios**: etiqueta 12 px semibold arriba del campo; input de 36–40 px con borde `divider`
y foco en borde negro (no azul); ayuda y errores debajo en 12 px, el error en `status-error`.
Botones al pie, alineados a la derecha: secundario «Cancelar», primario con el verbo de la acción
(«Guardar cambios», no «Enviar»).

**Modales**: 12 px de radio, cabecera con título Poppins y cierre `×`, cuerpo con 20 px de
relleno, acciones al pie a la derecha.

**Navegación**: ítem activo con fondo rojo de marca y texto blanco; el resto en gris de marca
sobre el negro. Íconos Material Design Icons (`mdi-*`), 18–20 px, antes del texto.

**Tableros y tarjetas de datos**: cifra en Poppins semibold, etiqueta en gris 12 px debajo. Para
destacar una tarjeta, filo izquierdo de 3–4 px y tinte del color al 9 %; nunca una tarjeta de
color sólido.

**Gráficas**: serie principal en rojo de marca, secundarias en negro y grises neutros; estados con
la escala semántica. Colores desde `tokens.json` (`import tokens from './tokens.json'`), no hex.

## Tres estados siempre

Toda pantalla diseña **vacío**, **cargando** y **error**, no solo el camino feliz:

- Vacío: borde punteado `divider`, texto en gris y una acción para empezar.
- Cargando: esqueleto (`animate-pulse`) con la forma del contenido, no un spinner suelto.
- Error: qué pasó y cómo seguir, en `status-error`, sin disculpas ni vaguedades.

## Modo oscuro obligatorio

Tailwind en `darkMode: 'class'` (clase `dark` en `<html>` o `<body>`). Toda clase de color lleva
su variante `dark:`; las variables `--cap-*` ya cambian solas. Verificar las dos variantes antes
de dar por terminada una pantalla. No usar `prefers-color-scheme`.

## Lo que no se hace

- Hex a mano: ni el rojo, ni los grises del marco, ni los estados.
- Grises azulados (`#111827`, `#0f172a`, `bg-slate-*` sin el preset).
- Cabeceras, barras o botones rojos como fondo; rojo como enlace genérico.
- Degradados, sombras de color, bordes de neón, emojis como íconos.
- Etiquetas en mayúsculas con espaciado, fuentes monoespaciadas para texto, tamaños menores a 11 px.
- Otra fuente, otro color de acción, otro set de íconos.
