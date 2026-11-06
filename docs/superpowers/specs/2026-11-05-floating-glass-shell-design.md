# Marco flotante de vidrio, paleta afinada y vista móvil — diseño

Fecha: 2026-11-05 · Versión objetivo del paquete: **2.0.0** (cambio mayor: reemplaza reglas de la 1.x)

Bocetos aprobados (referencia visual, no código de producción), en
`docs/superpowers/specs/2026-11-05-floating-glass-shell-mockups/` (fragmentos HTML: se ven abriéndolos en el navegador; usan Google Fonts, MDI por CDN y una foto de Unsplash): `vidrio.html` (marco escritorio),
`movil.html` (celular), `login-final-v2.html` (acceso) y `acceso-y-avisos.html` (secciones 2–4:
confirmación, notificaciones, toasts y avisos; su sección 1 de login quedó **descartada**).

## Intención

El equipo de desarrollo revisó referencias de tableros (Donezo, Vertix, un tablero oscuro y una app
móvil tipo «bento») y quiere que los sistemas internos de Grupo CAP se vean así: marco flotante en
vez de pegado a los bordes, sidebar colapsable, tarjetas más suaves y una vista móvil pensada para
el celular, no un escritorio encogido. Hoy la paleta CAP (rojo, negro, gris) se siente dura y
plana; se quiere una versión más rica **sin salir de la marca**.

Este repo es la fuente única que cada sistema instala (`install.sh`) y que los agentes de IA de
cada programador leen (`AGENTS.md`, skill `cap-design`). Lo que aquí quede escrito es lo que se
construirá en todos los sistemas, así que el marco debe ser difícil de implementar mal.

## Metas

1. **Marco flotante de vidrio**: sidebar y header como piezas sueltas, con 12 px de aire entre sí y
   con los bordes de la ventana, esquinas de 24 px, en vidrio ahumado (oscuro translúcido con
   difuminado). El contenido se desplaza **por debajo** del header.
2. **Sidebar colapsable**: panel (~236 px) ↔ riel de íconos (~66 px) con un botón redondo en el
   borde; tooltip con el nombre al pasar sobre un ícono colapsado; el estado se recuerda.
3. **Paleta afinada** (mezcla «piedra cálida» + «escala de rojos»), con el rojo CAP `#B12530`
   intacto.
4. **Tarjetas** más redondeadas, tarjeta de cifra con flecha ↗, tarjeta destacada en vino sólido.
5. **Vista móvil** con barra superior de vidrio, barra de pestañas flotante abajo, menú completo
   como hoja desde abajo, listados como tarjetas y botón flotante de crear.
6. **Funciona en todos los stacks de CAP**: Laravel + Vue, Laravel + Blade, React y Astro.

## No metas

- Cambiar las **reglas de comportamiento** de modales, toasts y avisos de la 1.x (tiempos, foco,
  vocabulario «Anular»/«Eliminar», máximo 3 toasts, etc.): se conservan; solo cambia el aspecto.
- Componentes listos para tarjetas, KPIs, listas o gráficas: siguen como **recetas** en la guía.
- Cambiar el rojo de marca, las fuentes (Inter / Poppins) o el set de íconos (MDI).
- Un modo «vidrio claro» (marco blanco). Se evaluó y se descartó (opción B del primer boceto).

## Anti-metas (sería un fracaso aunque funcione)

- Que cada stack termine con un sidebar visualmente distinto. Todos deben compartir **el mismo
  CSS** del marco.
- Que el vidrio afecte la lectura: texto del marco por debajo de 4.5:1 en cualquier fondo, o
  menús que «bailan» sobre contenido muy contrastado.
- Que el marco se vea roto en navegadores sin `backdrop-filter` o con «reducir transparencia».
- Que el modo oscuro quede como afterthought.

## Decisiones tomadas con el usuario

| Tema | Decisión |
|---|---|
| Dirección del marco | Marco **oscuro** flotante (opción A), no blanco |
| Paleta | Recomendación aceptada: fondo piedra cálido + marco negro con toque café + escala de rojos (vino → rosado). Rojo CAP intacto |
| Vidrio | Sí, estilo «liquid glass» de iPhone, un poco transparente, en sidebar, header, barra móvil, hoja «Más» y tooltips |
| Nivel de transparencia | **Ahumado** (el más opaco de los dos probados); el usuario no eligió y se tomó el que se lee mejor |
| Vista móvil | Aprobada tal cual el boceto `movil.html` |
| Entregable | Punto intermedio: **componentes listos solo para el marco**; tarjetas, cifras, listas y gráficas como recetas |
| Multi-framework | El repo debe permitir construir el marco en cualquier framework, no solo Vue |
| Stacks en uso | Laravel + Blade, Laravel + Vue, algunos React, a veces Astro |
| Instalador | `install.sh` soporta también React y Astro |
| Acceso | Foto de faena a la izquierda + formulario abierto en tarjeta de vidrio blanco; Microsoft y Google abajo |
| Modales, notificaciones, toasts | Aprobados como en el boceto |

## Paleta 2.0

Valores de partida tomados del boceto aprobado. El constructor debe verificar contraste (AA) de
cada par texto/fondo y puede ajustar ±1 paso de luminosidad para cumplirlo, nunca el tono.

**Claro**

| Rol | Valor | Reemplaza |
|---|---|---|
| Fondo de página (`page`) | `#F1EDE9` piedra | `#F3F2F1` |
| Tarjeta (`card`) | `#FFFDFB` blanco hueso | `#FFFFFF` |
| Superficie secundaria (`card-2`) | `#F1EDE9` | `#F3F2F1` |
| Divisor (`divider`) | `#E6DFD8` | `#E2E0DE` |
| Marco sólido (`chrome`, respaldo sin vidrio) | `#1E1B1A` | `#212121` |
| Vidrio del marco | `rgba(30,27,26,.62)` + `blur(22px) saturate(170%)` como punto de partida; ver «Contraste del vidrio» | — |
| Hover/realce dentro del marco | `rgba(255,255,255,.10)` · activo `.16` con borde `.22` | `#2B2B2B` |
| Texto secundario sobre marco | `#D2CAC3` | `#B2B2B2` |
| Texto secundario sobre tarjeta | `#7A6F67` | `gray-500` |
| Topo (series neutras, avatar sin foto) | `#A89C91` | — |

**Escala de rojos** (nueva; el `500` es el rojo de marca):

| Paso | Valor | Uso |
|---|---|---|
| vino (`red-800`) | `#6E1219` | tarjeta destacada sólida, serie principal oscura |
| rojo CAP (`red-600`) | `#B12530` | acento, contadores urgentes, filo del ítem activo, botón flotante móvil, destructivo |
| rojo medio (`red-400`) | `#DB7F87` | series secundarias |
| rosado (`red-200`) | `#F2D3D6` | series de fondo, chips de ícono |
| tinte (`red-50`) | `#FBEDEE` | tarjeta de alerta (borde `#F3DADD`), badge «Vencida» |

Los nombres exactos de los pasos y si se suman pasos intermedios quedan al constructor; deben
quedar en `tokens.json` como escala y en el preset como `cap-red-*` o equivalente. `chartColors()`
pasa a usar la escala de rojos + topo en lugar de negro y grises.

Los estados (`status.*`) no cambian.

**Contraste del vidrio** (llamada del diseñador): con `.62` de opacidad, una tarjeta blanca bajo el
header deja el fondo efectivo en ~`#737070` y el texto secundario `#D2CAC3` cae a 3.0:1. Manda el
contraste: la opacidad del vidrio sube hasta que, **en el peor caso (tarjeta `card` detrás)**, el
texto principal del marco cumpla 4.5:1 y el secundario también (se espera ~`.78–.82`; el
constructor la calcula y la deja como token). El aspecto «ahumado» se conserva con el difuminado y
el borde de luz; si la diferencia con el boceto se nota mucho, se informa antes de cerrar.

**Fondo con manchones**: el lienzo lleva 2–3 manchones radiales muy suaves (rojo al ~20 %, vino al
~16 %, topo al ~25 %, ver `.frame::before` en el boceto) **solo detrás del marco de la app**, para
que el vidrio tenga qué difuminar. Es la única excepción a «sin degradados»: no se usan degradados
en tarjetas, botones ni texto.

**Oscuro** (llamada del diseñador, no validada visualmente por el usuario): mismo tono cálido.
Página ~`#151312`, tarjeta ~`#211D1C`, `card-2` ~`#2B2624`, divisor ~`#3A3431`; vidrio del marco
más denso (~`rgba(20,18,17,.70)`) con borde `rgba(255,255,255,.10)`; manchones a la mitad de
opacidad; tarjeta destacada vino se mantiene; el tinte rojo pasa a `rgba(177,37,48,.16)`. El
constructor debe producir una vista de verificación en oscuro y validar contraste.

## El marco (lo que se entrega como componente)

Piezas: **Layout**, **Sidebar**, **Header**, **TabBar móvil**, **Hoja «Más»**, **Tooltip de
riel**. Las medidas vienen del boceto `vidrio.html`/`movil.html`; lo que sigue es lo que no se ve
en el boceto o que es regla.

### Escritorio (≥ `lg`, 1024 px)

- Lienzo con relleno de 12 px; sidebar y columna principal separados 12 px. Header alto 64 px,
  radio 24 px, `position: sticky; top: 12px` dentro de la columna principal. **Hace scroll la
  ventana, no un contenedor interno** (llamada del diseñador: conserva restauración de scroll del
  navegador e Inertia, anclas, `window.scrollY` y el ocultado de la barra del navegador en móvil).
  El sidebar es `sticky` con alto `100dvh - 24px`. El contenido pasa bajo el header al
  desplazarse.
- Sidebar: altura completa del lienzo, radio 24 px. Contenido de arriba abajo: marca (logo
  circular rojo + nombre del sistema + «Grupo CAP»), buscador con atajo ⌘K / Ctrl K, grupos con
  etiqueta en minúscula normal (no mayúsculas espaciadas), ítems de 38 px con ícono MDI 20 px,
  contadores en píldora (rojo sólido si es urgente), submenús desplegables con línea de árbol y
  cuadradito de color, espacio flexible, switch de modo oscuro, usuario (avatar con indicador de
  conectado, nombre, correo, menú de cuenta).
- Ítem activo: píldora de vidrio más clara con borde sutil + **filo rojo de 3 px a la izquierda**.
  Ícono en variante rellena. Ya no es bloque rojo sólido.
- Colapsar: botón circular blanco de 26 px montado sobre el borde derecho del sidebar. Transición
  de ancho con `duration-cap-base ease-cap`. En riel: solo íconos; los contadores se vuelven un
  punto rojo sobre el ícono; tooltip de vidrio claro a la derecha al pasar el mouse **o al recibir
  foco de teclado**; los submenús se abren como popover a la derecha.
- Estado colapsado persistido por usuario (localStorage, con `try/catch`; falla silenciosa =
  expandido). Entre `lg` y `xl` el valor por defecto es colapsado; desde `xl`, expandido.
- Header: migas de pan (secundario) sobre el título de la página (Poppins 17–18), buscador global
  en píldora, espacio flexible, botones circulares de 38 px (mensajes, notificaciones con punto
  rojo), avatar. Acciones de la página (primario/secundario) **no** van en el header: van en la
  barra de título del contenido, como en el boceto.

### Móvil (< `lg`)

- Barra superior de vidrio flotante (10 px de margen, alto 52, radio 20): logo o «volver», título,
  buscar, notificaciones/filtro.
- TabBar de vidrio flotante abajo (margen 10 px + safe-area, alto 64, radio 24): hasta **4
  destinos principales + «Más»**. Cuáles son los 4 lo define cada sistema (prop/config).
  Activo = píldora de vidrio clara con ícono relleno.
- «Más» abre una hoja de vidrio desde abajo con el menú completo del sidebar (mismos grupos,
  contadores, modo oscuro, usuario y cerrar sesión), overlay oscuro, cierre con arrastre, toque
  fuera o Escape.
- Botón flotante rojo de 52 px para la acción de crear de la pantalla, sobre la TabBar. Opcional
  por pantalla.
- El contenido lleva relleno superior e inferior para no quedar tapado por las barras.

### Comportamiento transversal

- Accesibilidad: `nav` con `aria-label`, `aria-current="page"` en el activo, botón de colapsar
  con `aria-expanded` y `aria-label`, hoja «Más» con `role="dialog"` + foco atrapado + retorno
  de foco, tooltips no son el único portador del nombre (`aria-label` en el enlace). Áreas de toque
  ≥ 40 px en móvil.
- `@supports not (backdrop-filter: blur(1px))` y `prefers-reduced-transparency: reduce` ⇒ marco
  sólido `chrome` (`#1E1B1A`), sin perder legibilidad. `prefers-reduced-motion` ⇒ sin transición
  de ancho.
- Capas: usar los `z-cap-*` existentes; no inventar otros.
- ⌘K / Ctrl K enfoca el buscador; qué busca lo decide cada sistema (evento/slot).

## Regla del vidrio

**Vidrio para lo que flota sobre la app** (marco, panel de notificaciones, toasts, tooltips, hoja
«Más», etiquetas sobre fotos). **Superficie sólida para lo que se lee o se decide con calma**
(tarjetas de contenido, modales, avisos en línea, inputs). Única excepción: la tarjeta del
formulario de acceso, en vidrio blanco (ver abajo).

## Pantalla de acceso (reemplaza la sección 1.2.0)

Boceto: `login-final-v2.html`. Sigue sin marco de navegación.

- **Escritorio**: lienzo piedra con 12 px de relleno y manchones (más intensos que en la app: rojo
  ~30 %, vino ~26 %, topo ~35 %). Dos paneles del mismo alto y radio 28 px separados 12 px:
  - Izquierda (~52 %): **foto de faena** a sangre con velo oscuro inferior; arriba a la izquierda
    etiqueta de vidrio oscuro en píldora (logo + nombre del sistema); abajo, tarjeta de vidrio
    oscuro con una frase de qué hace el sistema (Poppins 22) y «Grupo CAP · Uso interno».
  - Derecha: **tarjeta de vidrio blanco** (`rgba(255,253,251,.58)`, `blur(26px)
    saturate(180%)`, borde blanco ~75 %, brillo interior superior) con el formulario centrado
    (~380 px) y el botón de tema arriba a la derecha.
- **Formulario abierto por defecto**: título «Ingresa a {sistema}», subtítulo, Correo y
  Contraseña con etiqueta arriba (campos sólidos blancos de 46 px, radio 14, ver contraseña),
  «Mantener la sesión» (casilla) + «¿Olvidaste tu contraseña?» en una fila, botón primario negro en
  píldora de ancho completo, divisor «o continúa con», **Microsoft y Google lado a lado abajo**
  (solo los proveedores configurados; con uno, ancho completo), ayuda «¿Problemas para entrar?» con
  correo de mesa de ayuda.
- **Estados**: ingresando (botón con spinner y bloqueado), error de credenciales (aviso en línea
  tinte rojo arriba del formulario, campo marcado, intentos restantes si el backend lo informa),
  recuperar contraseña (mismo panel, aviso verde «Te enviamos el enlace», «Volver a ingresar»).
  Nunca toasts en esta pantalla.
- **Celular**: foto a sangre en el tercio superior con etiqueta de marca y botón de tema en
  vidrio oscuro; la tarjeta de vidrio blanco sube sobre la foto (desde ~150 px) hasta abajo, con
  10 px de margen y radio 30.
- **Foto**: la provee cada sistema (de su área: acería, mina, puerto…) como prop/slot/config. Sin
  foto ⇒ el panel izquierdo usa fondo `chrome` con manchones vino/rojo. La foto de ejemplo del
  boceto (Unsplash) no se incluye en el paquete.
- Respaldo sin `backdrop-filter`: tarjeta `card` sólida. En oscuro: la tarjeta pasa a vidrio
  oscuro (como el marco) con campos `card`.
- El acceso se entrega como componente/plantilla en los mismos stacks que el marco.

## Confirmaciones, notificaciones y avisos

Boceto: `acceso-y-avisos.html`, secciones 2–4. Comportamiento igual al de la 1.x.

- **Modal de confirmación**: tarjeta sólida `card`, radio 24, relleno 24, ~440 px; overlay
  `rgba(30,27,26,.35)` con `blur(6px)` sobre toda la app. Ícono de 48 px en círculo de tinte del
  estado (rojo para destructivo), título con verbo y objeto, consecuencia en una frase, casilla
  obligatoria si es irreversible (botón rojo deshabilitado hasta marcarla), «Cancelar» (secundario
  en píldora, foco inicial) a la izquierda del destructivo (rojo en píldora). `×` arriba a la
  derecha.
- **Panel de notificaciones**: popover de vidrio oscuro bajo la campana (~360 px, radio 24),
  título + «Marcar todo como leído», filtros Todas / No leídas (con contador rojo), grupos «Hoy» /
  «Ayer», ítem con ícono en cuadrado de 36 px (rojo para alertas, vidrio para el resto), título,
  detalle, hora relativa y punto rojo si no está leída; «Ver todas» al pie. Se entrega con el marco
  (la campana es del header).
- **Toasts**: píldoras de vidrio oscuro (radio 20, ~380 px), ícono en círculo de color del estado,
  título, detalle, acción opcional («Deshacer»), cierre `×`; los que se cierran solos muestran una
  barra de tiempo restante. Posición y reglas de la 1.x. Se entregan con el marco
  (contenedor + API para disparar).
- **Avisos en línea**: sólidos con el tinte del estado (radio 18), ícono 20 px, título y detalle.

## Cómo se entrega para cada stack

Un solo origen visual, varias envolturas:

1. **`design/shell.css`**: todo el estilo del marco en clases `cap-shell-*` (vidrio, sidebar, riel,
   header, tabbar, hoja, tooltip, fondo con manchones, respaldos sin vidrio y oscuro), usando solo
   `var(--cap-*)`. CSS plano, sin depender de Tailwind, para que sirva a cualquier stack. Lo
   importa `install.sh` igual que hoy `tokens.css`.
2. **`design/shell.js`**: comportamiento sin framework (colapsar y recordar, tooltip de riel,
   abrir/cerrar hoja «Más» con foco atrapado, ⌘K) que se engancha por atributos `data-cap-shell-*`.
   Lo usan Blade y Astro directamente.
3. **`design/shell/SHELL_SPEC.md`**: especificación agnóstica del marco (anatomía, medidas,
   estados, puntos de quiebre, persistencia, teclado, accesibilidad, respaldos) + el **HTML de
   referencia** completo de cada pieza. Es lo que lee un agente o programador para portarlo.
4. **Vue**: componentes `<script setup>` con props tipadas y defaults (`CapAppLayout`,
   `CapSidebar`, `CapHeader`, `CapTabBar`, `CapMoreSheet`), menú definido por una prop de ítems
   (etiqueta, ícono, href, contador, urgente, activo, hijos). Reutilizan `shell.css`; no duplican
   estilos. *(Llamada del diseñador, porque no se sabe si cada sistema usa Inertia, vue-router o
   enlaces normales:)* el componente de enlace es inyectable (prop `linkComponent`, por defecto
   `<a>`; con Inertia se pasa `Link`, con vue-router `RouterLink`) y el ítem activo lo marca el
   sistema con `active` en cada ítem; el componente no detecta rutas por su cuenta. Con Inertia se
   documenta su uso como layout persistente.
5. **Blade**: componentes anónimos (`<x-cap.app-layout>`, `<x-cap.sidebar>`…) que generan el HTML
   de referencia y cargan `shell.js`. *(Llamada del diseñador: Blade es stack principal en CAP, así
   que va listo y no solo documentado.)* El activo se marca con `request()->routeIs()` por nombre
   de ruta en cada ítem.
6. **React y Astro**: sin componentes listos. `SHELL_SPEC.md` trae una sección «Portar a React» y
   «Portar a Astro» con el mapa de piezas → componentes, qué estado vive dónde y qué partes de
   `shell.js` reemplazar por hooks (React) o usar tal cual (Astro, que puede incluir el HTML y
   `shell.js` casi sin cambios).

**Instalador** (decisión del usuario): `install.sh` soporta **Laravel (Blade y/o Vue), React y
Astro** con el mismo comando. Detecta el stack (`artisan`; `package.json` con `react` /
`astro`), copia `design/` a la carpeta propia de cada stack, importa `tokens.css` y `shell.css`
en la hoja global, configura el preset de Tailwind si existe, agrega fuentes y script de modo
oscuro al layout raíz que encuentre (o lo lista como pendiente) y la línea para el agente. Sigue
siendo idempotente y listando lo que no pudo resolver. En Laravel coloca además los componentes
Vue y Blade donde el proyecto los encuentre (rutas a decidir por el constructor). Ningún stack debe
romperse por la presencia de archivos de otro (`.vue` en un proyecto React, etc.).

## Cambios en la guía y documentación

- `DESIGN_GUIDE.md`: reescribir «En una frase», «Paleta», «Estructura de página» (marco flotante,
  medidas, móvil), radios (tarjeta ~20–22 px, controles del marco y botones en píldora donde el
  boceto lo muestra), elevación (el vidrio como nivel propio), «Tableros y tarjetas de datos»
  (tarjeta destacada vino permitida, una por fila de KPIs; flecha ↗), «Gráficas» (escala de rojos +
  topo), «Lo que no se hace» (quitar degradados/tarjeta sólida en la medida justa de las
  excepciones de arriba). El recetario de navegación pasa a remitir a los componentes.
- Recetas nuevas: tarjeta de cifra (normal, destacada vino, alerta con tinte), tarjeta de lista
  móvil (ícono + título + monto + badge), chips de filtro, contadores de estado en mosaico.
- `AGENTS.md` y `skills/cap-design/SKILL.md`: el marco **siempre** con el componente del stack o,
  si no hay, siguiendo `SHELL_SPEC.md`; nunca rearmarlo a mano con Tailwind.
- `README.md`: tabla de contenido del paquete, uso por stack.
- `CHANGELOG.md`: entrada 2.0.0 con lista de reglas reemplazadas (guía de migración breve para
  sistemas en 1.x).
- `tokens.json` (+ `scripts/build-tokens-css.mjs`, `tailwind.preset.js`, `design.php`,
  `chart-colors.js`): nuevos valores y escala de rojos; mantener los nombres actuales donde sea
  posible para no romper clases ya usadas (`cap-page`, `cap-card`, `cap-chrome`…).

## Lo que queda al constructor

- Nombres exactos de tokens nuevos y de las clases `cap-shell-*`.
- Ubicación de los componentes Vue/Blade en el proyecto instalado y cómo los registra
  `install.sh`.
- API concreta de los componentes (nombres de props/slots/eventos) dentro de lo descrito.
- Ajustes finos de color para cumplir contraste.
- Una página de demostración HTML (sin build) que muestre el marco en claro/oscuro, escritorio y
  móvil, usada para verificar.
