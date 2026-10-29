# Guía de diseño Grupo CAP

Cómo debe verse cualquier sistema interno de Grupo CAP (manual de marca 2026). Es la referencia
para programadores y para los agentes de IA que generen interfaz. Los valores viven en
`tokens.json`; nunca se escriben hex a mano en una pantalla.

## En una frase

Marco negro, lienzo gris cálido, tarjetas blancas, texto en Inter, títulos en Poppins, y el rojo
de marca solo donde deba llamar la atención.

## Paleta

Dos formas de nombrar cada color, para dos usos:

- **Alias de rol** (`cap-page`, `cap-card`, `cap-card-2`, `cap-divider`, `cap-head`,
  `cap-input-line`): cambian solos con el tema. No llevan `dark:` ni admiten `/opacidad`. Son la
  opción por defecto.
- **Colores físicos** (`cap-paper`, `cap-raised`, `cap-line`, `cap-brand`, `cap-status-*`…): valor
  fijo; admiten `/opacidad` y necesitan su par `dark:`. Solo cuando haga falta opacidad o un valor
  que no cambie.

| Uso | Clase Tailwind | Variable CSS | Claro | Oscuro |
|---|---|---|---|---|
| Marco: sidebar, header, botón primario | `bg-cap-chrome` | `--cap-chrome` | `#212121` | igual (el marco no cambia de tema) |
| Riel o barra más oscura dentro del marco | `bg-cap-rail` | `--cap-rail` | `#171717` | igual |
| Cabecera de tabla, barra de título de panel | `bg-cap-head` | `--cap-head` | `#212121` | `#2B2B2B` (con `border-b border-cap-divider`, si no se funde con la tarjeta) |
| Fondo de página | `bg-cap-page` | `--cap-page` | `#F3F2F1` | `#151515` |
| Tarjetas, paneles, modales | `bg-cap-card` | `--cap-card` | `#FFFFFF` | `#212121` |
| Superficie secundaria: chips, hover de fila, esqueletos, solo lectura | `bg-cap-card-2` | `--cap-card-2` | `#F3F2F1` | `#2B2B2B` |
| Divisores y bordes decorativos | `border-cap-divider` | `--cap-divider` | `#E2E0DE` | `#3A3A3A` |
| Borde de inputs y controles | `border-cap-input-line` | `--cap-input-line` | `#8C8985` (3.5:1) | `#808080` (3.6:1) |
| Rojo de marca como **texto, ícono o borde**: enlaces de tabla, error, ítem activo | `text-cap-brand dark:text-cap-brand-soft` | `--cap-brand` | `#B12530` (6.6:1 sobre blanco) | `#E8707A` (5.4:1 sobre tarjeta) |
| Rojo de marca como **relleno**: destructivo, ítem activo del menú, filo de tarjeta | `bg-cap-brand text-white hover:bg-cap-brand-hover` | `--cap-red` | `#B12530` | igual (6.6:1 con texto blanco en los dos temas) |
| Gris de marca: texto secundario sobre el marco | `text-cap-brand-gray` | `--cap-gray` | `#B2B2B2` (7.6:1 sobre el marco) | igual |

Texto: `text-gray-900 dark:text-gray-100`; secundario `text-gray-500 dark:text-gray-400`;
deshabilitado por opacidad, no por color. Las escalas `gray`, `slate` y `zinc` están unificadas en
la neutra para que nada tiña de azul el modo oscuro.

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

- **Primario** negro: `bg-cap-chrome text-white hover:bg-cap-rail`, invertido en oscuro
  `dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white`. Uno por pantalla o formulario.
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
- El rojo **nunca** es fondo de cabeceras, barras de título ni superficies grandes. El azul solo
  existe como `info`. Sin degradados, sin sombras de color, sin otros colores de acento.
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
| Titular de portada | `font-display text-4xl font-semibold leading-tight` (36/45) | solo el panel de marca de la pantalla de acceso |

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

- **Marco** oscuro en los dos temas: sidebar a la izquierda y header de 56–64 px del mismo negro.
  El contenido va sobre `bg-cap-page`. Título de página en el header, con migas de pan encima en
  `text-cap-brand-gray`, separador `mdi-chevron-right` 16 px y el último nivel en blanco.
- **Pantallas**: escritorio primero (uso principal 1366–1920 px), mínimo 360 px. Puntos de quiebre
  de Tailwind: `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Sidebar: panel de 256 px desde `xl`; riel
  de 64 px entre `lg` y `xl`; cajón sobre el contenido por debajo de `lg`, abierto desde el botón
  de menú del header.
- **Contenido**: margen de 24–36 px en escritorio y 16 px en celular; `max-w-7xl` para formularios y
  lectura, ancho completo para tablas y tableros.
- **Espaciado** en múltiplos de 4 px: 4 ícono–texto, 8 chips y celdas compactas, 12 celdas y entre
  campos de una fila, 16 relleno de tarjeta en celular y entre campos, 20 relleno de tarjeta y
  modal, 24 entre tarjetas y secciones, 32 entre bloques de formulario y como relleno de la tarjeta de la
  pantalla de acceso (la única tarjeta sola en pantalla). Nunca 6, 10, 14 ni 18.
- **Radios**: `rounded-md` (6) chips y badges; `rounded-lg` (8) inputs, botones e ítems de menú;
  `rounded-cap-card` (10) tarjetas; `rounded-xl` (12) modales, cajones y popovers. `rounded-full`
  solo en avatares y el punto del badge.
- **Elevación**, tres niveles; en oscuro la sombra no se ve, así que cada nivel sube de superficie:

  | Nivel | Qué | Claro | Oscuro |
  |---|---|---|---|
  | 0 | tarjetas, tablas, inputs | `border-cap-divider`, sin sombra | igual, superficie `cap-card` |
  | 1 | dropdown, menú `⋮`, popover, tooltip | `border-cap-divider shadow-md` | superficie `cap-card-2` |
  | 2 | modal, cajón lateral, toast | `shadow-xl` y overlay `bg-cap-rail/60` | superficie `cap-card-2`, overlay `bg-black/60` |

- **Capas** fijas: `z-cap-header` 30, `z-cap-sidebar` 40, `z-cap-dropdown` 50, `z-cap-drawer` 60,
  `z-cap-modal` 70, `z-cap-toast` 80. Ningún otro `z-index`.
- **Área de interacción** mínima 40 × 40 px en celular y 32 × 32 px en escritorio, con 8 px entre
  objetivos. Un ícono de 20 px siempre vive dentro de un botón de 36 px o más.

## Pantalla de acceso

Iniciar sesión, recuperar contraseña y crear contraseña nueva comparten una misma pantalla: la
portada del sistema. Es la única sin marco de navegación y la única con un titular grande. Las
clases están en el recetario: «Panel de marca de la pantalla de acceso», «Botón de proveedor»,
«Divisor con texto» y «Campo con ícono y ver contraseña».

- **Escritorio (`lg` en adelante)**: dos columnas iguales. A la izquierda el panel de marca sobre
  el negro del marco: logo y nombre del sistema arriba; en medio un chip de contexto («Portal
  corporativo de Grupo CAP»), el titular de portada con el remate en rojo suave, una línea de
  apoyo y hasta tres tarjetas de módulo; abajo «© año Grupo CAP · Uso interno». A la derecha,
  sobre `bg-cap-page`, la tarjeta del formulario (`max-w-md`, relleno 32) centrada y el toggle de
  tema arriba a la derecha.
- **Celular (por debajo de `lg`)**: el panel se reduce a una cabecera oscura con logo, nombre,
  toggle de tema, chip y titular en `text-2xl`; la tarjeta va debajo con relleno 20 y 16 px de
  margen, y su título baja a `text-lg`. Línea de apoyo, tarjetas de módulo y copyright se ocultan.
- **Tarjeta**: título `font-display text-2xl font-semibold` y subtítulo gris; botones de proveedor
  (uno por proveedor configurado, máximo dos por fila; con uno solo, ancho completo); divisor «o
  con tu correo»; campos con ícono a la izquierda y ver contraseña; «Recordarme» y «¿Olvidaste tu
  contraseña?» en una misma fila; un solo primario negro de ancho completo; bajo la tarjeta, una
  línea de ayuda en `text-xs`. Errores y estados («Te enviamos el enlace») como aviso en línea
  arriba del formulario, nunca como toast.
- Sin animación de entrada, ilustraciones, fotografías, degradados ni manchas de color: el panel
  de marca es el mismo negro del marco. En oscuro el panel no cambia y la tarjeta pasa a
  `cap-card`, igual que el resto del sistema.

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

**Formularios**: etiqueta `text-xs font-semibold` encima del campo; input de 40 px, fondo
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
campos, como la de acceso. Al enviar con errores: scroll y foco en el primer campo
con error; resumen arriba solo si hay más de tres. El primario se deshabilita y muestra
`mdi-loading animate-spin` mientras envía; nunca doble envío. Botones al pie, a la derecha:
«Cancelar» secundario y el primario con el verbo («Guardar cambios», no «Enviar»).

**Modales**: `rounded-xl`, cabecera con título `text-lg` y cierre `×`, cuerpo con 20 px, acciones
al pie a la derecha. `role="dialog" aria-modal="true" aria-labelledby`; foco atrapado dentro, foco
inicial en el primer campo (o en «Cancelar» si es destructivo), `Esc` cierra y el foco vuelve al
elemento que lo abrió. Un modal no abre otro modal; usar un paso dentro del mismo. Por debajo de
`md` ocupa toda la pantalla con las acciones fijas al pie.

**Confirmaciones y acciones destructivas**: toda acción que anule, elimine, cierre un período o
mueva dinero pide confirmación en un modal de 440 px. Título con verbo y objeto («¿Anular la
factura 001-0001234?»), cuerpo con la consecuencia en una frase («Se generará una nota de crédito
y la cuenta por cobrar quedará cancelada. No se puede deshacer.»). «Cancelar» a la izquierda del
destructivo, que repite el verbo («Anular factura»); nunca «Sí/No», «Aceptar» ni «OK». Foco
inicial en «Cancelar»; `Esc` y `×` cancelan; clic fuera **no** cierra. Si es irreversible y masivo,
exigir escribir el número de documento o marcar una casilla antes de habilitar el botón rojo. Al
confirmar: botón con `mdi-loading`, toast de resultado y la fila cambia de estado sin recargar.
Vocabulario: los documentos fiscales se **anulan**; «Eliminar» solo para registros sin efecto
contable.

**Avisos y toasts**: toast en la esquina inferior derecha (16 px de margen) en escritorio y arriba
a ancho completo en celular; 360 px, `bg-cap-card border-cap-divider`, filo izquierdo de 3 px del
color del estado, ícono `mdi-*` del estado a 20 px, título `text-sm font-semibold` y una línea de
detalle `text-xs`; cierre `×`. Éxito e info se cierran a los 5 s (pausa al pasar el cursor); aviso
y error persisten. Máximo 3 apilados, el más nuevo abajo. `role="status" aria-live="polite"`
para éxito/info, `role="alert"` para error. Un toast confirma el resultado de una acción; **no**
sustituye la validación en línea ni el estado de error de una pantalla. Aviso en línea dentro de
la tarjeta, sin cierre automático, para lo que condiciona la pantalla («Este período ya está
cerrado»). Nunca un toast con fondo de color sólido.

**Navegación**: ítem activo `bg-cap-brand text-white`; el resto `text-cap-brand-gray
hover:bg-cap-raised hover:text-white`. Íconos 20 px antes del texto.

**Íconos**: solo Material Design Icons (`mdi-*`). Tres tamaños: 16 px (`text-base`) en badges,
chips y celdas; 20 px (`text-xl`) en botones, menú e inputs; 40 px en estados vacíos. Variante
`-outline` por defecto; la rellena solo para el ítem activo del menú y para estados
(`mdi-check-circle`, `mdi-alert-circle`). El ícono hereda el color del texto. Botón de solo ícono
con `aria-label` y tooltip; ícono decorativo junto a texto con `aria-hidden="true"`. Un ícono
nunca es el único portador de significado. Sin emojis ni otro set.

**Tableros y tarjetas de datos**: cifra `font-display text-3xl font-semibold tabular-nums`,
etiqueta `text-xs` en gris debajo. Para destacar una tarjeta, filo izquierdo de 4 px y tinte del
color al 10 %; nunca una tarjeta de color sólido.

**Gráficas**: colores con `chartColors()` de `chart-colors.js` (`series[0]` es la principal, en
rojo de marca; secundarias negro y grises neutros, invertidos en oscuro; `status.*` para series con
significado de estado); recalcular al cambiar de tema. Máximo cuatro series; si hay más, agrupar en
«Otros» o dividir. Rejilla en `grid`, ejes y etiquetas en `text` a 12 px con `tabular-nums`,
tooltips con elevación 1. Relleno de área plano al 12 %, sin degradados ni 3D.

**Estados transversales**: deshabilitado `opacity-50 cursor-not-allowed pointer-events-none`
sobre el mismo diseño, con tooltip del motivo cuando no sea obvio; nunca ocultar el control.
Seleccionado (fila, chip de filtro, tarjeta): `bg-cap-card-2` más filo o borde de 2 px en rojo de
marca; nunca fondo rojo.

## Recetario

Clases exactas para lo más común. Copiar tal cual; cambiar solo texto, íconos y el estado.

**Botón primario** (uno por pantalla)
```html
<button class="inline-flex h-10 items-center gap-2 rounded-lg bg-cap-chrome px-4 text-sm font-medium text-white transition-colors duration-cap-fast ease-cap hover:bg-cap-rail focus:outline-none focus-visible:ring-2 focus-visible:ring-cap-chrome focus-visible:ring-offset-2 focus-visible:ring-offset-cap-card disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white dark:focus-visible:ring-gray-100">Guardar cambios</button>
```

**Botón secundario**
```html
<button class="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-cap-card px-4 text-sm font-medium text-gray-800 transition-colors duration-cap-fast ease-cap hover:border-gray-400 hover:bg-cap-card-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cap-chrome focus-visible:ring-offset-2 focus-visible:ring-offset-cap-card dark:border-gray-600 dark:text-gray-100 dark:focus-visible:ring-gray-100">Cancelar</button>
```

**Botón de ícono** (36 × 36 px, con `aria-label` y `title`)
```html
<button type="button" aria-label="Cerrar" title="Cerrar" class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors duration-cap-fast ease-cap hover:bg-cap-card-2 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cap-chrome focus-visible:ring-offset-2 focus-visible:ring-offset-cap-card dark:text-gray-400 dark:hover:text-gray-100 dark:focus-visible:ring-gray-100"><i class="mdi mdi-close text-xl leading-none" aria-hidden="true"></i></button>
```
Sobre el marco negro: `text-cap-brand-gray hover:bg-cap-raised hover:text-white focus-visible:ring-white focus-visible:ring-offset-cap-chrome`.

**Botón destructivo**
```html
<button class="inline-flex h-10 items-center gap-2 rounded-lg bg-cap-brand px-4 text-sm font-medium text-white transition-colors duration-cap-fast ease-cap hover:bg-cap-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-cap-chrome focus-visible:ring-offset-2 focus-visible:ring-offset-cap-card disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-gray-100">Anular factura</button>
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
<input id="name" aria-required="true" class="block h-10 w-full rounded-lg border border-cap-input-line bg-cap-card px-3 text-sm text-gray-900 placeholder:text-gray-500 transition-colors duration-cap-fast ease-cap focus:border-cap-chrome focus:outline-none focus:ring-1 focus:ring-cap-chrome disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-gray-100 dark:focus:ring-gray-100">
<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Como aparece en el RTN.</p>
<p class="mt-1 text-xs text-cap-status-error dark:text-cap-status-dark-error">El nombre es obligatorio.</p>
```
Con error, el input añade `border-cap-status-error focus:border-cap-status-error
focus:ring-cap-status-error`. Si el proyecto usa `@tailwindcss/forms`, estas clases anulan su
anillo azul.

**Botón de proveedor** (acceso con un tercero: el secundario con su logo oficial a color)
```html
<a href="/auth/microsoft/redirect" class="[botón secundario] w-full justify-center"><img src="logos/microsoft.svg" alt="" class="h-5 w-5">Microsoft</a>
```
En Vue: `import microsoft from '@/../design/logos/microsoft.svg?inline'` (el `?inline` lo embebe en
el JS y ahorra una petición) y `<img :src="microsoft" alt="" class="h-5 w-5">`.

**Divisor con texto**
```html
<div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400" aria-hidden="true"><span class="h-px flex-1 bg-cap-divider"></span>o con tu correo<span class="h-px flex-1 bg-cap-divider"></span></div>
```

**Campo con ícono y ver contraseña** (el input es el del campo de formulario con `pl-10` y, si hay botón, `pr-10`)
```html
<div class="relative">
  <i class="mdi mdi-lock-outline pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl leading-none text-gray-500 dark:text-gray-400" aria-hidden="true"></i>
  <input id="password" type="password" class="[campo de formulario] pl-10 pr-10">
  <button type="button" aria-label="Mostrar contraseña" title="Mostrar contraseña" class="[botón de ícono] absolute right-0.5 top-1/2 -translate-y-1/2"><i class="mdi mdi-eye-outline text-xl leading-none" aria-hidden="true"></i></button>
</div>
```
Al mostrarla, el input pasa a `type="text"`, el ícono a `mdi-eye-off-outline` y el `aria-label` a «Ocultar contraseña».

**Panel de marca de la pantalla de acceso** (columna izquierda desde `lg`; el texto es del proyecto)
```html
<aside class="flex flex-col justify-between bg-cap-chrome px-16 py-14 text-white">
  <div class="flex items-center gap-3"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white font-display text-xs font-semibold text-cap-chrome" aria-hidden="true">CAP</span><span class="font-display text-base font-semibold">Nombre del sistema</span></div>
  <div>
    <p class="inline-flex items-center gap-2 rounded-md border border-cap-line bg-cap-raised px-2.5 py-1 text-xs font-medium text-cap-brand-gray"><span class="h-1.5 w-1.5 rounded-full bg-cap-brand-soft" aria-hidden="true"></span>Portal corporativo de Grupo CAP</p>
    <h1 class="mt-3 font-display text-4xl font-semibold leading-tight">Titular de portada, <span class="text-cap-brand-soft">con el remate en rojo suave.</span></h1>
    <p class="mt-4 max-w-md text-sm leading-relaxed text-cap-brand-gray">Una línea de apoyo.</p>
    <div class="mt-8 flex gap-3 rounded-cap-card border border-cap-line bg-cap-raised p-4"><i class="mdi mdi-chart-box-outline text-xl leading-none text-cap-brand-soft" aria-hidden="true"></i><div><p class="text-sm font-semibold">Módulo</p><p class="mt-0.5 text-xs text-cap-brand-gray">Qué hace, en una línea.</p></div></div>
  </div>
  <p class="text-xs text-cap-brand-gray">© 2026 Grupo CAP · Uso interno</p>
</aside>
```

**Modal**
```html
<div class="fixed inset-0 z-cap-modal bg-cap-rail/60 animate-cap-fade-in"></div>
<div role="dialog" aria-modal="true" aria-labelledby="modal-title" class="fixed inset-x-4 top-[10vh] z-cap-modal mx-auto w-full max-w-lg animate-cap-rise-in rounded-xl border border-cap-divider bg-cap-card shadow-xl">
  <header class="flex items-center justify-between border-b border-cap-divider px-5 py-4">
    <h2 id="modal-title" class="font-display text-lg font-semibold text-gray-900 dark:text-gray-100">Anular factura</h2>
    <button aria-label="Cerrar" class="rounded-md p-1 text-gray-500 transition-colors duration-cap-fast ease-cap hover:bg-cap-card-2 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"><i class="mdi mdi-close text-xl" aria-hidden="true"></i></button>
  </header>
  <div class="p-5 text-sm text-gray-700 dark:text-gray-300">…</div>
  <footer class="flex justify-end gap-2 border-t border-cap-divider px-5 py-4">[secundario] [primario o destructivo]</footer>
</div>
```

**Estado vacío**
```html
<div class="flex flex-col items-center justify-center rounded-cap-card border border-dashed border-cap-divider px-6 py-12 text-center">
  <i class="mdi mdi-inbox-outline text-[40px] leading-none text-gray-400" aria-hidden="true"></i>
  <p class="mt-3 font-display text-base font-semibold text-gray-900 dark:text-gray-100">Aún no hay facturas</p>
  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Crea la primera para empezar a cobrar.</p>
  <div class="mt-4">[botón primario]</div>
</div>
```

**Esqueleto de carga** (repetir con la forma del contenido)
```html
<div class="h-4 w-40 animate-cap-pulse rounded-md bg-cap-card-2"></div>
```

**Aviso en línea de error**
```html
<div role="alert" class="flex gap-3 rounded-lg border border-cap-status-error/30 bg-cap-status-error/10 px-4 py-3 text-sm text-cap-status-error dark:border-cap-status-dark-error/30 dark:bg-cap-status-dark-error/15 dark:text-cap-status-dark-error"><i class="mdi mdi-alert-circle text-xl" aria-hidden="true"></i>No se pudo guardar: el RTN ya existe. Corrígelo e intenta de nuevo.</div>
```

**Ítem de navegación** (sobre `bg-cap-chrome`)
```html
<a class="flex items-center gap-3 rounded-lg bg-cap-brand px-3 py-2 text-sm font-medium text-white"><i class="mdi mdi-file-document text-xl" aria-hidden="true"></i>Facturas</a>
<a class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-cap-brand-gray transition-colors duration-cap-fast ease-cap hover:bg-cap-raised hover:text-white"><i class="mdi mdi-account-outline text-xl" aria-hidden="true"></i>Clientes</a>
```

**Tarjeta de cifra** (para destacarla: `border-l-4 border-l-cap-brand bg-cap-brand/10 dark:border-l-cap-brand-soft dark:bg-cap-brand-soft/10`)
```html
<div class="rounded-cap-card border border-cap-divider bg-cap-card p-4">
  <p class="font-display text-3xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">L 48,300</p>
  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Cobrado este mes</p>
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
- Grises azulados (`#111827`, `#0f172a`) o `bg-slate-*` fuera del preset.
- Cabeceras, barras o superficies rojas; rojo como enlace genérico; rojo suave como fondo con
  texto blanco.
- Degradados, sombras de color, bordes de neón, emojis como íconos, otro set de íconos.
- Logos de terceros recoloreados o en monocromo.
- Etiquetas en mayúsculas con espaciado, monoespaciada para texto, tamaños menores a `text-xs`.
- `duration-*`, `animate-pulse` o `animate-bounce` de Tailwind; animaciones por sección, efectos
  al hacer scroll, rebotes, parallax, spinners sueltos donde cabe un esqueleto.
- Botones «Sí/No», «Aceptar» u «OK» en confirmaciones; foco inicial en el botón rojo.
- Otra fuente, otro color de acción, otro `z-index`.
