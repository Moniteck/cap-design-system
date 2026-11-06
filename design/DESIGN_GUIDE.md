# Guía de diseño Grupo CAP

Cómo debe verse cualquier sistema interno de Grupo CAP (manual de marca 2026). Es la referencia
para programadores y para los agentes de IA que generen interfaz. Los valores viven en
`tokens.json`; nunca se escriben hex a mano en una pantalla.

## En una frase

Marco de vidrio ahumado flotando sobre un lienzo piedra, tarjetas blanco hueso, Inter y Poppins, y
la escala de rojos de la marca con el rojo CAP como acento.

## Paleta

Dos formas de nombrar cada color, para dos usos:

- **Alias de rol** (`cap-page`, `cap-card`, `cap-card-2`, `cap-divider`, `cap-head`,
  `cap-input-line`, `cap-text-soft`): cambian solos con el tema. No llevan `dark:` ni admiten
  `/opacidad`. Son la opción por defecto.
- **Colores físicos** (`cap-paper`, `cap-raised`, `cap-line`, `cap-brand`, `cap-red-*`,
  `cap-status-*`…): valor fijo; admiten `/opacidad` y necesitan su par `dark:`. Solo cuando haga
  falta opacidad o un valor que no cambie.

Dos formas de escribir `cap-*`: las **piezas del marco** (sidebar, header, tabbar, hoja «Más»,
notificaciones, toasts, confirmación, acceso) se hacen con los componentes del stack y su CSS plano
`.cap-*` de `shell.css`; el **contenido de la página** (tarjetas, tablas, formularios, botones) se
escribe con las clases de Tailwind `cap-*` del recetario.

| Uso | Clase Tailwind | Variable CSS | Claro | Oscuro |
|---|---|---|---|---|
| Marco sólido (respaldo sin vidrio), botón primario | `bg-cap-chrome` | `--cap-chrome` | `#1E1B1A` | igual (el marco no cambia de tema) |
| Riel o barra más oscura dentro del marco | `bg-cap-rail` | `--cap-rail` | `#171717` | igual |
| Cabecera de tabla, barra de título de panel | `bg-cap-head` | `--cap-head` | `#1E1B1A` | `#2B2B2B` (con `border-b border-cap-divider`, si no se funde con la tarjeta) |
| Fondo de página (lienzo piedra) | `bg-cap-page` | `--cap-page` | `#F1EDE9` | `#151312` |
| Tarjetas, paneles, modales (blanco hueso) | `bg-cap-card` | `--cap-card` | `#FFFDFB` | `#211D1C` |
| Superficie secundaria: chips, hover de fila, esqueletos, solo lectura | `bg-cap-card-2` | `--cap-card-2` | `#F1EDE9` | `#2B2624` |
| Divisores y bordes decorativos | `border-cap-divider` | `--cap-divider` | `#E6DFD8` | `#3A3431` |
| Borde de inputs y controles | `border-cap-input-line` | `--cap-input-line` | `#8C8985` (3.4:1) | `#808080` |
| Texto secundario sobre tarjeta | `text-cap-text-soft` | `--cap-text-soft` | `#695F58` (6.1:1 sobre tarjeta) | `#A89C91` (6.2:1 sobre tarjeta) |
| Texto sobre el marco | `text-cap-on-chrome` | `--cap-on-chrome` | `#E9E4E0` | igual |
| Texto secundario sobre el marco | `text-cap-on-chrome-soft` | `--cap-on-chrome-soft` | `#D2CAC3` (5.2:1 sobre el vidrio en el peor caso) | igual |
| Gris de marca (acentos menores sobre el marco) | `text-cap-brand-gray` | `--cap-gray` | `#B2B2B2` | igual |
| Topo: series neutras, avatar sin foto | `bg-cap-taupe` | `--cap-taupe` | `#A89C91` | igual |
| Rojo de marca como **texto, ícono o borde**: enlaces de tabla, error, filo del ítem activo | `text-cap-brand dark:text-cap-brand-soft` | `--cap-brand` | `#B12530` (6.6:1 sobre blanco) | `#E8707A` (5.6:1 sobre tarjeta) |
| Rojo de marca como **relleno**: destructivo, contador urgente, botón flotante | `bg-cap-brand text-white hover:bg-cap-brand-hover` | `--cap-red` | `#B12530` | igual (6.6:1 con texto blanco en los dos temas) |

**Escala de rojos** (el `600` es el rojo de marca; todos son físicos y llevan su par `dark:`):

| Paso | Clase | Valor | Uso |
|---|---|---|---|
| vino (`red-800`) | `bg-cap-red-800` | `#6E1219` | tarjeta destacada (texto blanco, 11.9:1), serie principal de gráficas en claro |
| rojo CAP (`red-600`) | `bg-cap-red-600` | `#B12530` | acento, contadores urgentes, filo del ítem activo, botón flotante, destructivo |
| rojo medio (`red-400`) | `bg-cap-red-400` | `#DB7F87` | series secundarias de gráficas |
| rosado (`red-200`) | `bg-cap-red-200` | `#F2D3D6` | series de fondo, chips de ícono |
| rosado suave (`red-100`) | `border-cap-red-100` | `#F3DADD` | borde de la tarjeta de alerta |
| tinte (`red-50`) | `bg-cap-red-50` | `#FBEDEE` | tarjeta de alerta, badge «Vencida» (el rojo sobre el tinte: 5.8:1) |

**Vidrio**: `--cap-glass-bg` (tinte del marco con opacidad 0.78, algo más denso en oscuro),
`--cap-glass-blur`, `--cap-glass-border` y `--cap-glass-highlight`. Se aplica con la clase `cap-glass`
de `shell.css`, nunca con `rgba(` a mano. La opacidad la fija el contraste: con la tarjeta `card`
detrás (el peor caso) el texto del marco cumple 4.5:1; `npm run contrast` lo verifica.

Texto: `text-gray-900 dark:text-gray-100`; secundario `text-cap-text-soft`; deshabilitado por
opacidad, no por color. Las escalas `gray`, `slate` y `zinc` están unificadas en la neutra para que
nada tiña de azul el modo oscuro.

Todos los pares de la tabla cumplen WCAG AA (4.5:1 texto, 3:1 controles). Nunca
`dark:bg-cap-brand-soft` con texto blanco (4.4:1): el rojo suave es solo para texto.

### Estados

Una sola escala semántica para badges, chips, avisos y gráficas; mismo significado en los dos temas.
Patrón de clases: `{text|bg|border}-cap-status-{estado}` en claro y
`dark:{…}-cap-status-dark-{estado}` en oscuro.

| Estado | Uso | Variable | Claro | Oscuro |
|---|---|---|---|---|
| `ok` | completado, pagado, activo | `--cap-status-ok` | `#276B2B` | `#81C784` |
| `error` | anulado, vencido, rechazado, fallo | `--cap-status-error` | `#B12530` | `#E8707A` |
| `warning` | pendiente, por vencer, requiere atención | `--cap-status-warning` | `#A85300` | `#FFA726` |
| `info` | en proceso, informativo | `--cap-status-info` | `#1565C0` | `#64B5F6` |
| `neutral` | borrador, inactivo, archivado | `--cap-status-neutral` | `#616161` | `#9E9E9E` |

Un badge es texto del color del estado sobre el mismo color al 10 % (15 % en oscuro), con un punto
`bg-current` a la izquierda; las clases exactas salen de `statuses.js`
(`statusBadgeClass('ok')`), nunca se escriben a mano. Los estados del dominio (`pending`,
`approved`, `void`…) se mapean a uno de estos cinco en un archivo de constantes del proyecto.
Todos los pares texto/tinte cumplen ≥ 4.5:1 sobre tarjeta. Un chip de color sólido solo en claro
con texto blanco; en oscuro, el texto sobre un sólido de estado es `text-gray-900`.

### Reglas de color

- **Botones del sistema en píldora** (`rounded-full`, 44 px de alto), igual que `.cap-button` del
  marco y del acceso. Los controles de formulario no: son `rounded-cap-control`.
- **Primario** negro: `bg-cap-chrome text-white hover:bg-cap-rail`, invertido en oscuro
  `dark:bg-cap-on-chrome dark:text-cap-chrome dark:hover:bg-white`. Uno por pantalla o formulario.
- **Secundario** con contorno: `border border-gray-300 bg-cap-card text-gray-800 hover:bg-cap-card-2
  hover:border-gray-400 dark:border-gray-600 dark:text-gray-100`. El hover oscurece el fondo,
  nunca pasa a rojo: el rojo en un botón significa destructivo. Exportar PDF/Excel, filtros,
  «Cancelar» y acciones de menú son secundarias.
- **Terciario / solo ícono**: sin borde, `text-gray-600 hover:bg-cap-card-2 dark:text-gray-400`,
  36 × 36 px con `aria-label`.
- **Destructivo**: `bg-cap-brand text-white hover:bg-cap-brand-hover`, igual en los dos temas.
- **Enlaces**: en tablas, rojo de marca sin subrayado (`text-cap-brand dark:text-cap-brand-soft
  hover:underline`). En texto corrido, avisos y pies: color del texto con subrayado
  (`underline underline-offset-2 decoration-gray-400 hover:decoration-current`). Enlaces externos
  con `mdi-open-in-new` 16 px. El rojo no es color de enlace genérico.
- **Foco visible** en todo elemento interactivo, con `focus-visible` (el clic con ratón no muestra
  anillo): `focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  focus-visible:ring-cap-chrome focus-visible:ring-offset-cap-card dark:focus-visible:ring-gray-100`.
  En inputs el foco es borde y anillo de 1 px: `focus:border-cap-chrome focus:ring-1
  focus:ring-cap-chrome dark:focus:border-gray-100 dark:focus:ring-gray-100`. Nunca azul ni rojo
  como anillo.
- El rojo CAP **nunca** es fondo de cabeceras, barras de título ni superficies grandes. La única
  superficie grande en color es la tarjeta destacada en vino (`cap-red-800`), una por fila de
  tarjetas de cifra. El azul solo existe como `info`. Sin degradados salvo los manchones del lienzo
  detrás del marco (los pone `shell.css`); sin sombras de color fuera de los tokens
  `--cap-shadow-*`; sin otros colores de acento.
- **Logos de terceros** (proveedores de acceso, bancos) van con sus colores oficiales, desde
  `logos/` de esta carpeta. Es la única excepción a la paleta: un logo ajeno no se recolorea ni se
  pone en monocromo, y sus colores no salen del logo.

## Tipografía

- **Inter** para todo el texto (`font-sans`). Es la fuente de interfaz; el manual pide Montserrat
  para textos impresos, pero en pantalla Inter se lee mejor en tablas y cifras.
- **Poppins**, la corporativa del manual, para títulos, cifras destacadas y cabeceras de tabla
  (`font-display`). Los `h1`–`h6` ya la llevan con `tokens.css`.
- Carga: `https://fonts.bunny.net/css?family=` + `fonts.webfont` de `tokens.json`.

Escala cerrada; no se usan tamaños intermedios ni `text-[…px]`:

| Nivel | Clases | Uso |
|---|---|---|
| Título de página | `font-display text-2xl font-semibold` (24/32) | uno por pantalla, en el header |
| Título de sección o modal | `font-display text-lg font-semibold` (18/28) | tarjetas, modales |
| Subtítulo | `font-display text-base font-semibold` (16/24) | grupos dentro de una tarjeta |
| Texto | `text-sm` (14/20) | cuerpo, celdas, inputs, botones |
| Texto denso | `text-cap-dense` (13/18) | tablas en densidad compacta |
| Etiqueta | `text-xs font-medium` (12/16) | labels, cabecera de tabla, badges, metadatos, migas |
| Cifra destacada | `font-display text-3xl font-semibold tabular-nums` (30/36) | tarjetas KPI |

Nada por debajo de `text-xs`. Sin mayúsculas forzadas con espaciado amplio; sentence case. Sin
monoespaciada salvo códigos. Las cifras en tablas van en Inter con `tabular-nums` y alineadas a la
derecha; Poppins solo para la cifra grande de una tarjeta, donde no hay alineación vertical.

## Cifras, moneda y fechas

- Moneda: `Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' })` → «L 12,345.67».
  Siempre dos decimales, miles con coma, decimal con punto. Dólares «US$ 1,234.00». Negativos con
  signo menos («-L 1,234.00»), nunca paréntesis ni rojo, salvo que el valor sea un estado (vencido).
  En tablas el símbolo puede ir solo en la cabecera («Total (L)») y las celdas solo cifra.
- Cantidades sin decimales innecesarios («12», «12.5»); porcentajes con un decimal y espacio
  («12.5 %»). Códigos, años, RTN, números de factura y teléfonos **sin** separador de miles.
- Fechas: `dd/mm/yyyy` en tablas y formularios («05/03/2026»); «5 mar 2026» en texto corrido y
  tarjetas; hora «2:05 p. m.». Fechas relativas («hace 3 min») solo en notificaciones. Rangos con
  guion y espacios: «01/03/2026 – 31/03/2026».
- Celdas sin valor: «—», nunca «0», «null» ni en blanco.

## Estructura de página

El marco (sidebar, header, tabbar, hoja «Más», notificaciones, toasts, confirmación y acceso) lo
define `shell/SHELL_SPEC.md` y se hace **siempre** con el componente del stack (`<x-cap.*>` en
Blade, `design/vue/Cap*.vue` en Vue) o, en React y Astro, siguiendo esa especificación. Esta
sección solo resume las medidas; si algo difiere, manda la especificación.

- **Marco flotante de vidrio** sobre el lienzo `bg-cap-page`: sidebar y header son piezas sueltas,
  con 12 px de aire entre sí y con los bordes de la ventana, y radio de 24 px. El contenido pasa
  por debajo del header al desplazarse. **Hace scroll la ventana**, nunca un contenedor interno
  (el header es `position: sticky; top: 12px`).
- **Sidebar**: panel de 236 px o riel de íconos de 66 px, con un botón redondo en el borde para
  colapsar; el estado se recuerda. Riel por defecto entre 1024 y 1279 px; panel desde 1280 px.
  Ítem de 38 px; el activo es una píldora de vidrio con filo rojo de 3 px a la izquierda, no un
  bloque rojo. Etiquetas de grupo en minúscula normal.
- **Header** de 64 px: migas de pan sobre el título de la página, buscador, notificaciones y avatar.
  Las acciones de la página (primario, secundario) van en la barra de título del contenido, no en el
  header.
- **Móvil (por debajo de `lg`, 1024 px)**: no es un escritorio encogido. Barra superior de vidrio de
  52 px, tabbar de vidrio abajo de 64 px con hasta 4 destinos más «Más» (hoja con el menú completo),
  listados como tarjetas (receta «Tarjeta de lista móvil») y botón flotante rojo de 52 px opcional
  para crear. El contenido lleva relleno para no quedar tapado por las barras.
- **Pantallas**: escritorio primero (uso principal 1366–1920 px), mínimo 360 px. Puntos de quiebre
  de Tailwind: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
- **Contenido**: margen de 24–36 px en escritorio y 16 px en celular; `max-w-7xl` para formularios y
  lectura, ancho completo para tablas y tableros.
- **Espaciado** en múltiplos de 4 px: 4 ícono–texto, 8 chips y celdas compactas, 12 celdas y entre
  campos de una fila, 16 relleno de tarjeta en celular y entre campos, 20 relleno de tarjeta, 24
  relleno de modal y entre tarjetas y secciones, 32 entre bloques de formulario. Nunca 6, 10, 14 ni
  18 (los 12 px del aire del marco son múltiplo de 4).
- **Radios**: `rounded-md` (6) chips y badges; `rounded-cap-control` (14) inputs, selects, menús y
  popovers; `rounded-cap-card` (20) tarjetas; `rounded-cap-shell` (24) marco y modales;
  `rounded-cap-sheet` (28) hoja «Más» y paneles del acceso. Los botones del sistema son
  `rounded-full` (píldora), igual que avatares y el punto del badge.
- **Elevación**: cuatro niveles; en oscuro la sombra no se ve, así que cada nivel sube de superficie.

  | Nivel | Qué | Claro | Oscuro |
  |---|---|---|---|
  | 0 | tarjetas, tablas, inputs | `border-cap-divider`, sin sombra | igual, superficie `cap-card` |
  | 1 | dropdown, menú `⋮`, popover | `border-cap-divider shadow-md` | superficie `cap-card-2` |
  | 2 | modal, cajón lateral | `shadow-xl` sobre el overlay | superficie `cap-card-2`, mismo overlay |
  | Vidrio | marco, notificaciones, toasts, tooltips, hoja «Más» | `cap-glass`: tinte translúcido, difuminado y borde de luz | tinte más denso |

- **Capas** fijas: `z-cap-header` 30, `z-cap-sidebar` 40, `z-cap-dropdown` 50, `z-cap-drawer` 60,
  `z-cap-modal` 70, `z-cap-toast` 80. Ningún otro `z-index`.
- **Área de interacción** mínima 40 × 40 px en celular y 32 × 32 px en escritorio, con 8 px entre
  objetivos. Un ícono de 20 px siempre vive dentro de un botón de 36 px o más.

## Regla del vidrio

**Vidrio para lo que flota sobre la app**: el marco, el panel de notificaciones, los toasts, los
tooltips, la hoja «Más» y las etiquetas sobre fotos. **Superficie sólida para lo que se lee o se
decide con calma**: tarjetas de contenido, modales, avisos en línea e inputs. Única excepción: la
tarjeta del formulario de acceso, en vidrio blanco.

- El vidrio se escribe con `cap-glass` (o `cap-glass--light` el blanco del acceso) y las variables
  `--cap-glass-*`; nunca con `rgba(` ni `backdrop-filter` a mano.
- Sin `backdrop-filter`, o con `prefers-reduced-transparency: reduce`, el marco pasa a `--cap-chrome`
  sólido y el acceso a `--cap-card`. `shell.css` ya lo resuelve; no lo repitas.
- Nunca vidrio sobre vidrio, ni sobre una tarjeta de contenido que el usuario deba leer.

## Pantalla de acceso

Iniciar sesión y recuperar contraseña comparten una misma pantalla. Es la única sin marco de
navegación. Se hace **siempre** con `<x-cap.login>` o `CapLogin` (React y Astro: `SHELL_SPEC.md`).

- **Escritorio (`lg` en adelante)**: lienzo piedra con 12 px de relleno y manchones más intensos que
  en la app. Dos paneles del mismo alto y radio 28 px, separados 12 px. A la izquierda (~52 %) una
  **foto de faena** a sangre con velo oscuro inferior, una etiqueta de vidrio oscuro arriba (logo y
  nombre del sistema) y, abajo, una tarjeta de vidrio oscuro con una frase de qué hace el sistema
  y «Grupo CAP · Uso interno». A la derecha, la **tarjeta de vidrio blanco** con el formulario
  centrado (~380 px) y el botón de tema arriba a la derecha. Es la única tarjeta de vidrio.
- **Foto**: la provee cada sistema, de su propia área (acería, mina, puerto…), con `photoUrl`. El
  paquete no trae ninguna. Sin foto, el panel izquierdo usa el fondo del marco con manchones vino y
  rojo.
- **Formulario abierto por defecto**: título «Ingresa a {sistema}» y subtítulo; Correo y Contraseña
  con la etiqueta arriba (campos sólidos de 46 px, radio 14, ver contraseña); «Mantener la sesión» y
  «¿Olvidaste tu contraseña?» en una fila; un solo primario negro en píldora de ancho completo;
  divisor «o continúa con»; **Microsoft y Google lado a lado** abajo (solo los proveedores
  configurados; con uno, ancho completo); y la ayuda «¿Problemas para entrar?» con el correo de
  la mesa de ayuda. Los logos de terceros van a color, desde `logos/`.
- **Estados**: ingresando (botón con spinner y bloqueado), error de credenciales (aviso en línea con
  tinte rojo arriba del formulario y el campo marcado) y recuperar contraseña (mismo panel, aviso
  verde «Te enviamos el enlace» y «Volver a ingresar»). Nunca toasts en esta pantalla.
- **Celular (por debajo de `lg`)**: la foto ocupa el tercio superior con la etiqueta de marca y el
  botón de tema en vidrio oscuro; la tarjeta de vidrio blanco sube sobre la foto hasta abajo.
- **En oscuro** la tarjeta pasa a vidrio oscuro, como el marco, con campos `cap-card`.

## Componentes

**Tablas**: cabecera `bg-cap-head` con texto blanco, `font-display text-xs font-semibold`,
alineada igual que su columna. Dos densidades: **normal**, filas de 44 px con `px-3 py-2.5`
(listados), y **compacta**, 36 px con `px-2 py-1.5 text-cap-dense` (reportes, detalle de
documentos, nómina). Alineación por tipo de dato: texto e identificadores a la izquierda; cifras,
montos y porcentajes a la derecha con `tabular-nums`; fechas a la izquierda con ancho fijo;
badges a la izquierda; columna de acciones a la derecha, sin título, 48 px, con un menú `⋮`
secundario. Enlace de la fila en rojo de marca. Cabecera fija (`sticky top-0`) en tablas de más de
20 filas. Hover de fila `hover:bg-cap-card-2`; fila seleccionada con filo izquierdo de 3 px rojo y
el mismo fondo. Sin filas alternas. Textos largos en una línea con `truncate` y `title`; nunca
crece la altura de fila. Paginación: 25 por defecto, opciones 25/50/100, contador «1–25 de 1,240»
a la izquierda. Orden: `mdi-arrow-up`/`mdi-arrow-down` 16 px solo en la columna activa.
Por debajo de `md`: desplazamiento horizontal dentro de la tarjeta con la primera columna
`sticky left-0`; nunca ocultar columnas sin aviso.

**Formularios**: etiqueta `text-xs font-semibold` encima del campo; input de 40 px, `rounded-cap-control`, fondo
`bg-cap-card`, borde `border-cap-input-line`, foco en borde y anillo negros. Placeholder
`placeholder:text-gray-500 dark:placeholder:text-gray-400`; es un ejemplo, nunca sustituye a la
etiqueta. Ayuda y error debajo en `text-xs`, el error en `status-error` y el input con
`border-cap-status-error`. Disposición: una columna por debajo de `md`, dos desde `md`
(`grid-cols-2 gap-x-6 gap-y-4`), nunca más de tres. Anchos fijos por tipo: fecha 160 px, monto
160 px (texto a la derecha, prefijo «L» dentro del campo), código/RTN 200 px, porcentaje 112 px;
texto libre a columna completa. Obligatorio: asterisco `text-cap-brand` tras la etiqueta y
`aria-required`; si casi todos lo son, marcar los opcionales con «(opcional)». Solo lectura: sin
borde, fondo `cap-card-2`, texto normal. Contraseñas: botón de ícono dentro del campo para verla
(`mdi-eye-outline` / `mdi-eye-off-outline`, `aria-label` «Mostrar contraseña» / «Ocultar
contraseña»). Un ícono `-outline` a la izquierda del campo (`pl-10`) solo en pantallas de pocos
campos. Al enviar con errores: scroll y foco en el primer campo
con error; resumen arriba solo si hay más de tres. El primario se deshabilita y muestra
`mdi-loading animate-spin` mientras envía; nunca doble envío. Botones al pie, a la derecha:
«Cancelar» secundario y el primario con el verbo («Guardar cambios», no «Enviar»).

**Modales**: superficie sólida (no vidrio), `rounded-cap-shell`, cabecera con título `text-lg` y
cierre `×`, cuerpo con 24 px, acciones al pie a la derecha, sobre un overlay oscuro con
difuminado suave. `role="dialog" aria-modal="true" aria-labelledby`; foco atrapado dentro, foco
inicial en el primer campo (o en «Cancelar» si es destructivo), `Esc` cierra y el foco vuelve al
elemento que lo abrió. Un modal no abre otro modal; usar un paso dentro del mismo. Por debajo de
`md` ocupa toda la pantalla con las acciones fijas al pie.

**Confirmaciones y acciones destructivas**: toda acción que anule, elimine, cierre un período o
mueva dinero pide confirmación con `<x-cap.confirm-dialog>` o `CapConfirmDialog`, nunca con un modal
armado a mano. Es una tarjeta sólida de ~440 px, radio 24 y relleno 24, con ícono de 48 px en
círculo de tinte del estado (rojo si es destructivo). Título con verbo y objeto («¿Anular la
factura 001-0001234?»), cuerpo con la consecuencia en una frase («Se generará una nota de crédito
y la cuenta por cobrar quedará cancelada. No se puede deshacer.»). «Cancelar» (secundario en
píldora) a la izquierda del destructivo, que repite el verbo («Anular factura»); nunca «Sí/No»,
«Aceptar» ni «OK». Foco inicial en «Cancelar»; `Esc` y `×` cancelan; clic fuera **no** cierra. Si
es irreversible y masivo, el botón rojo queda deshabilitado hasta marcar una casilla (o escribir
el número de documento). Al confirmar: botón con spinner, toast de resultado y la fila cambia de
estado sin recargar. Vocabulario: los documentos fiscales se **anulan**; «Eliminar» solo para
registros sin efecto contable.

**Notificaciones y toasts**: son vidrio y vienen con el marco (`<x-cap.notifications>`,
`<x-cap.toaster>` y `window.capToast(...)` en Blade; `CapNotifications`, `CapToaster` y
`useToasts()` en Vue). El panel de notificaciones es un popover de vidrio oscuro bajo la campana
(~360 px, radio 24): título y «Marcar todo como leído», filtros Todas / No leídas, grupos «Hoy» y
«Ayer», punto rojo en lo no leído y «Ver todas» al pie. El toast es una píldora de vidrio oscuro
(~380 px, radio 20) con ícono en círculo del color del estado, título, detalle, acción opcional
(«Deshacer») y cierre `×`; los que se cierran solos muestran una barra de tiempo restante. En la
esquina inferior derecha en escritorio y arriba a ancho completo en celular. Éxito e info se cierran
a los 5 s (pausa al pasar el cursor); aviso y error persisten. Máximo 3 apilados, el más nuevo
abajo. `role="status" aria-live="polite"` para éxito/info, `role="alert"` para error. Un toast
confirma el resultado de una acción; **no** sustituye la validación en línea ni el estado de error
de una pantalla. Para lo que condiciona la pantalla («Este período ya está cerrado») va un **aviso
en línea**, sólido con el tinte del estado, sin cierre automático (`<x-cap.alert>` o receta
«Aviso en línea de error»). Nunca un toast con fondo de color sólido.

**Navegación**: el sidebar, la barra superior, la tabbar y la hoja «Más» **son componentes del
marco** (`<x-cap.sidebar>`, `CapSidebar`…): se usan, no se arman con clases de Tailwind. El ítem
activo es una píldora de vidrio con filo rojo de 3 px, el resto `text-cap-on-chrome-soft`. Íconos
de 20 px antes del texto. En React y Astro se sigue `shell/SHELL_SPEC.md`.

**Íconos**: solo Material Design Icons (`mdi-*`). Tres tamaños: 16 px (`text-base`) en badges,
chips y celdas; 20 px (`text-xl`) en botones, menú e inputs; 40 px en estados vacíos. Variante
`-outline` por defecto; la rellena solo para el ítem activo del menú y para estados
(`mdi-check-circle`, `mdi-alert-circle`). El ícono hereda el color del texto. Botón de solo ícono
con `aria-label` y tooltip; ícono decorativo junto a texto con `aria-hidden="true"`. Un ícono
nunca es el único portador de significado. Sin emojis ni otro set.

**Tableros y tarjetas de datos**: cifra `font-display text-3xl font-semibold tabular-nums`, etiqueta
`text-xs` en `text-cap-text-soft` y una flecha `mdi-arrow-top-right` (↗) en un círculo arriba a la
derecha cuando la tarjeta lleva a un detalle. Tres variantes de la tarjeta de cifra (receta «Tarjeta
de cifra»): **normal** (`cap-card`), **destacada** en vino sólido (`cap-red-800`, texto blanco) y
**de alerta** con el tinte rojo (`cap-red-50`, borde `cap-red-100`). La destacada es la única
tarjeta de color sólido permitida: **una por fila** de tarjetas de cifra y para lo principal, nunca
para decorar. Los contadores de estado van en mosaico, los filtros como chips y, en celular, los
listados como tarjetas (recetas más abajo).

**Gráficas**: colores con `chartColors()` de `chart-colors.js`: la escala de rojos y el topo
(en claro vino, rojo CAP, rojo medio y topo; en oscuro rojo suave, rosado, topo y divisor), con
`series[0]` como la principal; `status.*` para series con significado de estado. Recalcular al
cambiar de tema. Máximo cuatro series; si hay más, agrupar en «Otros» o dividir. Rejilla en `grid`,
ejes y etiquetas en `text` a 12 px con `tabular-nums`, tooltips con elevación 1. Relleno de área
plano al 12 %, sin degradados ni 3D.

**Estados transversales**: deshabilitado `opacity-50 cursor-not-allowed pointer-events-none`
sobre el mismo diseño, con tooltip del motivo cuando no sea obvio; nunca ocultar el control.
Seleccionado (fila, chip de filtro, tarjeta): `bg-cap-card-2` más filo o borde de 2 px en rojo de
marca; nunca fondo rojo.

## Recetario

Clases exactas para lo más común. Copiar tal cual; cambiar solo texto, íconos y el estado.

**Botón primario** (uno por pantalla)
```html
<button class="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-cap-chrome px-5 text-sm font-medium text-white transition-colors duration-cap-fast ease-cap hover:bg-cap-rail focus:outline-none focus-visible:ring-2 focus-visible:ring-cap-chrome focus-visible:ring-offset-2 focus-visible:ring-offset-cap-card disabled:pointer-events-none disabled:opacity-50 dark:bg-cap-on-chrome dark:text-cap-chrome dark:hover:bg-white dark:focus-visible:ring-gray-100">Guardar cambios</button>
```

**Botón secundario**
```html
<button class="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-cap-card px-5 text-sm font-medium text-gray-800 transition-colors duration-cap-fast ease-cap hover:border-gray-400 hover:bg-cap-card-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cap-chrome focus-visible:ring-offset-2 focus-visible:ring-offset-cap-card dark:border-gray-600 dark:text-gray-100 dark:focus-visible:ring-gray-100">Cancelar</button>
```

**Botón de ícono** (36 × 36 px, con `aria-label` y `title`)
```html
<button type="button" aria-label="Cerrar" title="Cerrar" class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cap-text-soft transition-colors duration-cap-fast ease-cap hover:bg-cap-card-2 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cap-chrome focus-visible:ring-offset-2 focus-visible:ring-offset-cap-card dark:hover:text-gray-100 dark:focus-visible:ring-gray-100"><i class="mdi mdi-close text-xl leading-none" aria-hidden="true"></i></button>
```
Sobre el marco oscuro: `text-cap-on-chrome-soft hover:text-white focus-visible:ring-white focus-visible:ring-offset-cap-chrome` (los botones del header ya vienen en el componente).

**Botón destructivo**
```html
<button class="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-cap-brand px-5 text-sm font-medium text-white transition-colors duration-cap-fast ease-cap hover:bg-cap-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-cap-chrome focus-visible:ring-offset-2 focus-visible:ring-offset-cap-card disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-gray-100">Anular factura</button>
```

**Tarjeta / panel**
```html
<section class="rounded-cap-card border border-cap-divider bg-cap-card p-5">…</section>
```

**Tabla**
```html
<div class="overflow-hidden rounded-cap-card border border-cap-divider bg-cap-card">
  <table class="w-full text-sm text-gray-900 dark:text-gray-100">
    <thead>
      <tr>
        <th class="bg-cap-head px-3 py-2.5 text-left font-display text-xs font-semibold text-white">Factura</th>
        <th class="bg-cap-head px-3 py-2.5 text-right font-display text-xs font-semibold text-white">Total (L)</th>
      </tr>
    </thead>
    <tbody>
      <tr class="transition-colors duration-cap-fast ease-cap hover:bg-cap-card-2">
        <td class="h-11 border-t border-cap-divider px-3"><a href="#" class="font-medium text-cap-brand hover:underline dark:text-cap-brand-soft">F-000123</a></td>
        <td class="h-11 border-t border-cap-divider px-3 text-right tabular-nums">1,250.00</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Badge de estado** (`statusBadgeClass('ok' | 'error' | 'warning' | 'info' | 'neutral')`)
```html
<span :class="statusBadgeClass('ok')"><span class="h-1.5 w-1.5 rounded-full bg-current"></span>Pagado</span>
```

**Campo de formulario** (etiqueta, input, ayuda, error)
```html
<label for="name" class="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre <span class="text-cap-brand dark:text-cap-brand-soft">*</span></label>
<input id="name" aria-required="true" class="block h-10 w-full rounded-cap-control border border-cap-input-line bg-cap-card px-3 text-sm text-gray-900 placeholder:text-gray-500 transition-colors duration-cap-fast ease-cap focus:border-cap-chrome focus:outline-none focus:ring-1 focus:ring-cap-chrome disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-gray-100 dark:focus:ring-gray-100">
<p class="mt-1 text-xs text-cap-text-soft">Como aparece en el RTN.</p>
<p class="mt-1 text-xs text-cap-status-error dark:text-cap-status-dark-error">El nombre es obligatorio.</p>
```
Con error, el input añade `border-cap-status-error focus:border-cap-status-error
focus:ring-cap-status-error`. Si el proyecto usa `@tailwindcss/forms`, estas clases anulan su
anillo azul.

**Campo con ícono y ver contraseña** (el input es el del campo de formulario con `pl-10` y, si hay botón, `pr-10`; la pantalla de acceso ya lo trae en su componente)
```html
<div class="relative">
  <i class="mdi mdi-lock-outline pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl leading-none text-cap-text-soft" aria-hidden="true"></i>
  <input id="password" type="password" class="[campo de formulario] pl-10 pr-10">
  <button type="button" aria-label="Mostrar contraseña" title="Mostrar contraseña" class="[botón de ícono] absolute right-0.5 top-1/2 -translate-y-1/2"><i class="mdi mdi-eye-outline text-xl leading-none" aria-hidden="true"></i></button>
</div>
```
Al mostrarla, el input pasa a `type="text"`, el ícono a `mdi-eye-off-outline` y el `aria-label` a «Ocultar contraseña».

**Modal** (formularios y contenido; las confirmaciones usan el componente)
```html
<div class="fixed inset-0 z-cap-modal bg-cap-chrome/35 backdrop-blur-sm animate-cap-fade-in"></div>
<div role="dialog" aria-modal="true" aria-labelledby="modal-title" class="fixed inset-x-4 top-[10vh] z-cap-modal mx-auto w-full max-w-lg animate-cap-rise-in rounded-cap-shell border border-cap-divider bg-cap-card shadow-xl">
  <header class="flex items-center justify-between border-b border-cap-divider px-6 py-4">
    <h2 id="modal-title" class="font-display text-lg font-semibold text-gray-900 dark:text-gray-100">Anular factura</h2>
    <button aria-label="Cerrar" class="rounded-full p-1 text-cap-text-soft transition-colors duration-cap-fast ease-cap hover:bg-cap-card-2 hover:text-gray-900 dark:hover:text-gray-100"><i class="mdi mdi-close text-xl" aria-hidden="true"></i></button>
  </header>
  <div class="p-6 text-sm text-gray-700 dark:text-gray-300">…</div>
  <footer class="flex justify-end gap-2 border-t border-cap-divider px-6 py-4">[secundario] [primario o destructivo]</footer>
</div>
```

**Estado vacío**
```html
<div class="flex flex-col items-center justify-center rounded-cap-card border border-dashed border-cap-divider px-6 py-12 text-center">
  <i class="mdi mdi-inbox-outline text-[40px] leading-none text-gray-400" aria-hidden="true"></i>
  <p class="mt-3 font-display text-base font-semibold text-gray-900 dark:text-gray-100">Aún no hay facturas</p>
  <p class="mt-1 text-sm text-cap-text-soft">Crea la primera para empezar a cobrar.</p>
  <div class="mt-4">[botón primario]</div>
</div>
```

**Esqueleto de carga** (repetir con la forma del contenido)
```html
<div class="h-4 w-40 animate-cap-pulse rounded-md bg-cap-card-2"></div>
```

**Aviso en línea de error**
```html
<div role="alert" class="flex gap-3 rounded-cap-control border border-cap-status-error/30 bg-cap-status-error/10 px-4 py-3 text-sm text-cap-status-error dark:border-cap-status-dark-error/30 dark:bg-cap-status-dark-error/15 dark:text-cap-status-dark-error"><i class="mdi mdi-alert-circle text-xl" aria-hidden="true"></i>No se pudo guardar: el RTN ya existe. Corrígelo e intenta de nuevo.</div>
```

**Tarjeta de cifra** normal, destacada y de alerta (una destacada por fila; la flecha ↗ solo si la tarjeta lleva a un detalle)
```html
<a href="#" class="block rounded-cap-card border border-cap-divider bg-cap-card p-5 transition-transform duration-cap-fast ease-cap hover:-translate-y-0.5">
  <div class="flex items-start justify-between">
    <p class="text-xs font-medium text-cap-text-soft">Cobrado este mes</p>
    <span class="flex h-8 w-8 items-center justify-center rounded-full bg-cap-card-2 text-cap-text-soft" aria-hidden="true"><i class="mdi mdi-arrow-top-right text-base leading-none"></i></span>
  </div>
  <p class="mt-3 font-display text-3xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">L 48,300</p>
</a>
```
Destacada (vino sólido): cambiar el contenedor por `rounded-cap-card bg-cap-red-800 p-5 text-white`, la etiqueta por `text-cap-red-200` y el círculo de la flecha por `bg-white/15 text-white`.
Alerta (tinte rojo): `rounded-cap-card border border-cap-red-100 bg-cap-red-50 p-5 dark:border-cap-brand-soft/30 dark:bg-cap-red-600/15`, la cifra en `text-cap-brand dark:text-cap-brand-soft` y la etiqueta con su ícono `mdi-alert-circle-outline` en el mismo color.

**Tarjeta de lista móvil** (ícono, título, monto y badge; reemplaza a la fila de tabla por debajo de `lg`)
```html
<a href="#" class="flex min-h-16 items-center gap-3 rounded-cap-card border border-cap-divider bg-cap-card p-4">
  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-cap-control bg-cap-red-200 text-cap-red-800 dark:bg-cap-red-600/20 dark:text-cap-brand-soft" aria-hidden="true"><i class="mdi mdi-file-document-outline text-xl leading-none"></i></span>
  <span class="min-w-0 flex-1">
    <span class="block truncate text-sm font-semibold text-gray-900 dark:text-gray-100">F-000123 · Cliente de ejemplo</span>
    <span class="block text-xs text-cap-text-soft">5 mar 2026</span>
  </span>
  <span class="flex shrink-0 flex-col items-end gap-1">
    <span class="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">L 1,250.00</span>
    <span :class="statusBadgeClass('ok')"><span class="h-1.5 w-1.5 rounded-full bg-current"></span>Pagado</span>
  </span>
</a>
```

**Chips de filtro** (fila con desplazamiento horizontal; el seleccionado con borde de 2 px, nunca fondo rojo)
```html
<div class="flex gap-2 overflow-x-auto" role="group" aria-label="Filtrar por estado">
  <button type="button" aria-pressed="true" class="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border-2 border-cap-brand bg-cap-card-2 px-4 text-sm font-medium text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cap-chrome dark:text-gray-100 dark:focus-visible:ring-gray-100">Todas<span class="text-xs tabular-nums text-cap-text-soft">24</span></button>
  <button type="button" aria-pressed="false" class="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-cap-divider bg-cap-card px-4 text-sm font-medium text-gray-800 transition-colors duration-cap-fast ease-cap hover:bg-cap-card-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cap-chrome dark:text-gray-100 dark:focus-visible:ring-gray-100">Vencidas<span class="text-xs tabular-nums text-cap-text-soft">3</span></button>
</div>
```

**Contadores de estado en mosaico** (2 columnas en celular, 4 desde `md`; cada baldosa filtra la lista)
```html
<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
  <a href="#" class="rounded-cap-card border border-cap-divider bg-cap-card p-4 transition-transform duration-cap-fast ease-cap hover:-translate-y-0.5">
    <p class="font-display text-3xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">12</p>
    <p class="mt-1 flex items-center gap-1.5 text-xs text-cap-text-soft"><span class="h-1.5 w-1.5 rounded-full bg-cap-status-warning dark:bg-cap-status-dark-warning" aria-hidden="true"></span>Pendientes</p>
  </a>
</div>
```

## Movimiento

El movimiento muestra qué cambió; nunca decora. Una pantalla sin animación es correcta; una con
animaciones gratuitas no lo es. Tokens en `tokens.json` (`motion`): clases
`duration-cap-fast|base|slow` y `ease-cap|cap-enter|cap-exit`, animaciones `animate-cap-fade-in`,
`animate-cap-rise-in` y `animate-cap-pulse`; variables `--cap-duration-*` y `--cap-ease-*` en CSS.

| Token | Valor | Para qué |
|---|---|---|
| `fast` | 120 ms | hover, foco, cambios de color, menús pequeños, salidas |
| `base` | 180 ms | aparecer: modales, dropdowns, toasts, chips |
| `slow` | 260 ms | desplazamientos grandes: cajones laterales, paneles que se expanden |
| `ease-cap` | `cubic-bezier(0.2, 0, 0, 1)` | transiciones de estado (color, borde, ancho) |
| `ease-cap-enter` | `cubic-bezier(0, 0, 0.2, 1)` | lo que entra: desacelera al llegar |
| `ease-cap-exit` | `cubic-bezier(0.4, 0, 1, 1)` | lo que sale: acelera al irse |

Reglas:

- Solo `duration-cap-*`, `ease-cap*` y `animate-cap-*`. Nunca `duration-300`, `duration-[…]`,
  `animate-pulse`, `animate-bounce` ni otra animación de Tailwind.
- Solo se animan `opacity`, `transform`, `color`, `background-color`, `border-color`,
  `grid-template-rows` (acordeones) y, en barras de progreso, `width`. Nunca `height`,
  `max-height`, `margin`, `box-shadow` ni `filter`.
- La salida es un escalón más corta que la entrada: entra `base`, sale `fast`; entra `slow`, sale
  `base`.
- Desplazamientos pequeños: 8 px al aparecer, 2 px al levantar una baldosa. Sin rebotes ni escalas
  mayores a 2 %.
- Como máximo un `animate-cap-rise-in` orquestado por pantalla: al cargar un tablero, hasta 6
  tarjetas con retraso de 30 ms entre cada una (`[animation-delay:30ms]`, `60ms`…), total ≤ 300 ms.
  Nada más se escalona; nada se anima al hacer scroll.
- `tokens.css` anula transiciones y animaciones para quien pide `prefers-reduced-motion`. Nunca
  comunicar algo solo con movimiento: todo cambio tiene también un estado visible estático.

Patrones por componente:

| Componente | Entrada | Salida | Interacción |
|---|---|---|---|
| Botones, enlaces, filas, ítems de menú | — | — | `transition-colors duration-cap-fast ease-cap` |
| Baldosas y tarjetas clicables | — | — | `transition-transform duration-cap-fast ease-cap hover:-translate-y-0.5` |
| Modal | overlay `animate-cap-fade-in`, panel `animate-cap-rise-in` | `opacity-0`, `fast`, `ease-cap-exit` | — |
| Dropdown, menú `⋮`, combobox | `opacity-0 scale-[0.98] origin-top` → normal, `fast`, `ease-cap-enter` | `opacity-0`, `fast` | — |
| Cajón lateral, panel colapsable | `translate-x`, `slow`, `ease-cap-enter` | `translate-x`, `base`, `ease-cap-exit` | — |
| Acordeón, sección colapsable vertical | `grid-rows-[0fr]` → `grid-rows-[1fr]`, `transition-[grid-template-rows] duration-cap-base ease-cap` | igual, `fast`, `ease-cap-exit` | — |
| Toast | `opacity-0 translate-x-2` → normal, `base`, `ease-cap-enter` | `opacity-0`, `fast` | — |
| Listas y tableros (insertar, mover) | `animate-cap-rise-in` en el ítem nuevo | `opacity-0 -translate-y-2`, `fast` | `TransitionGroup` con `move-class="transition-transform duration-cap-base ease-cap"`; el que sale va `absolute` |
| Tabla al ordenar, filtrar o paginar | ninguna; las filas se reemplazan al instante, atenuadas con `opacity-50` mientras carga | — | — |
| Barra de progreso, medidor | — | — | `transition-[width] duration-cap-slow ease-cap` |
| Esqueleto de carga | `animate-cap-pulse` | — | — |
| Cambio de tema claro/oscuro | ninguno (instantáneo) | — | — |
| Navegación entre páginas | ninguna; el contenido aparece al instante | — | — |

Vue: usar `<Transition>` y `<TransitionGroup>` con clases de Tailwind:

```vue
<Transition
  enter-active-class="transition duration-cap-base ease-cap-enter"
  enter-from-class="opacity-0 translate-y-2"
  leave-active-class="transition duration-cap-fast ease-cap-exit"
  leave-to-class="opacity-0"
>
  <div v-if="open" class="…">…</div>
</Transition>
```

## Los cinco estados de una pantalla

- **Vacío (sin datos aún)**: la receta de estado vacío: ícono `-outline` de 40 px en gris, título,
  una línea de explicación y el botón primario que crea el primer registro.
- **Sin resultados (hay filtro o búsqueda)**: mismo bloque sin borde punteado, texto «Ningún
  registro coincide con los filtros» y acción secundaria «Limpiar filtros». Nunca el botón de crear.
- **Cargando**: esqueleto `animate-cap-pulse` con la forma del contenido, mostrado solo si la carga
  supera 200 ms para evitar parpadeo; nunca un spinner a pantalla completa. Al recargar una tabla ya
  cargada, atenuar el contenido (`opacity-50`) en vez de reemplazarlo por esqueleto.
- **Error**: qué pasó y cómo seguir, en `status-error`, con botón secundario «Reintentar» y, si
  aplica, el código o id para soporte. «Ocurrió un error» no basta; sin disculpas.
- **Parcial**: si una sección falla y el resto no, la sección muestra su error en línea; la página
  no se cae completa.

## Modo oscuro obligatorio

Tailwind en `darkMode: 'class'`. La clase `dark` va en `<html>`, la pone un script en el `<head>`
(antes de cualquier CSS, para que no parpadee) y la preferencia se guarda en `localStorage.theme`
(`'light'` | `'dark'`); la del sistema solo decide la primera vez. No usar `prefers-color-scheme`
en CSS.

```blade
<script>
    const theme = localStorage.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
</script>
```

Toggle: `document.documentElement.classList.toggle('dark', isDark); localStorage.theme = isDark ?
'dark' : 'light';`. El cambio es instantáneo, sin transición. Las gráficas leen el tema con
`document.documentElement.classList.contains('dark')` y recalculan `chartColors()`.

Toda clase de color física lleva su variante `dark:`; los alias de rol y las variables `--cap-*`
cambian solos. Verificar las dos variantes antes de dar por terminada una pantalla.

## PDF y correos

- Cabeceras de tabla y barra de título en `config('design.chrome.surface')` con texto blanco; el
  rojo `config('design.brand.red')` solo en el nombre de la empresa, totales a destacar y sellos de
  estado (ANULADA, VENCIDA). Nunca el hex en el blade.
- PDF (wkhtmltopdf): Inter y Poppins instaladas en el servidor; si no, `Helvetica, Arial,
  sans-serif`. Fondo blanco, sin modo oscuro, tablas con borde `config('design.chrome.paperLine')`,
  cifras a la derecha, fechas `dd/mm/yyyy`.
- Correos: fondo `config('design.chrome.paper')`, tarjeta blanca de 600 px, un solo botón primario
  negro; estilos inline (los clientes de correo no cargan Tailwind).

## Lo que no se hace

- Hex a mano: ni el rojo, ni los grises del marco, ni los estados. Ni `rgb(` ni `text-[…px]`.
- Grises azulados o `bg-slate-*` fuera del preset.
- Cabeceras, barras o superficies rojas; rojo como enlace genérico; rojo suave como fondo con
  texto blanco. Tarjetas de color sólido que no sean la destacada en vino (una por fila de cifras).
- Degradados fuera de los manchones del lienzo detrás del marco; sombras de color fuera de los
  tokens `--cap-shadow-*`; bordes de neón, emojis como íconos, otro set de íconos.
- Rearmar el marco (sidebar, header, tabbar, hoja «Más», confirmación, toasts, acceso) a mano con
  Tailwind o con `rgba(` y `backdrop-filter` propios: se usa el componente del stack o
  `shell/SHELL_SPEC.md`.
- Vidrio en tarjetas de contenido, modales, avisos en línea o inputs (la tarjeta del acceso es la
  única excepción).
- Logos de terceros recoloreados o en monocromo.
- Etiquetas en mayúsculas con espaciado, monoespaciada para texto, tamaños menores a `text-xs`.
- `duration-*`, `animate-pulse` o `animate-bounce` de Tailwind; animaciones por sección, efectos
  al hacer scroll, rebotes, parallax, spinners sueltos donde cabe un esqueleto.
- Botones «Sí/No», «Aceptar» u «OK» en confirmaciones; foco inicial en el botón rojo.
- Otra fuente, otro color de acción, otro `z-index`.
