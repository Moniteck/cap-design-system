# Marco flotante de vidrio: especificación agnóstica

Qué hay que construir en cualquier framework (Vue, Blade, React, Astro, HTML plano) para que todos los sistemas de Grupo CAP tengan el mismo marco. El **CSS es único** (`design/shell.css`, que importa `design/shell/css/*.css`); lo que cambia por stack es solo cómo se genera el HTML y cómo se enlaza el comportamiento.

Fuentes de verdad, en este orden:

1. HTML de referencia: `design/shell/reference/app.html` (marco) y `design/shell/reference/login.html` (acceso). No se copia aquí: se abre y se replica su estructura y sus clases tal cual.
2. Comportamiento: `design/shell.js` (`initShell`) y `design/shell/js/*.js`.
3. Implementaciones: `design/vue/*.vue` y `design/blade/components/cap/*.blade.php`.

Reglas que no se negocian: solo tokens `var(--cap-*)` (ningún color literal), íconos MDI, capas con `z-cap-*`, textos en español, nada por debajo de 12 px, etiquetas de grupo en minúscula normal. **Hace scroll la ventana**, nunca un contenedor interno.

## Anatomía

### Puntos de quiebre

| Ancho | Marco | Sidebar por defecto |
|---|---|---|
| `< 1024px` | Móvil: topbar + tabbar + hoja «Más» + FAB. Sidebar y header de escritorio ocultos | no aplica |
| `1024–1279px` | Escritorio | riel colapsado (66px) |
| `>= 1280px` | Escritorio | panel expandido (236px) |

El valor por defecto lo calcula `defaultCollapsed(viewportWidth)` en `collapse.js`; una preferencia guardada manda sobre el defecto.

### Piezas

| Pieza | Clase raíz | Medidas y comportamiento |
|---|---|---|
| Lienzo | `.cap-shell` / `.cap-shell__main` / `.cap-shell__content` | Aire de 12px entre piezas y con la ventana. Manchones radiales solo detrás del marco |
| Sidebar | `.cap-shell-sidebar` (con `data-cap-sidebar`) | `position: sticky; top: 12px`, alto `100dvh - 24px`, radio de marco. 236px expandido; 66px con `data-collapsed="true"`. Orden: marca, buscador, navegación, espacio flexible, interruptor de modo oscuro, usuario |
| Botón de colapso | `.cap-shell-sidebar__collapse` (`data-cap-collapse`) | Círculo de 26px sobre el borde. `aria-expanded` y `aria-label` cambian entre «Contraer menú» y «Expandir menú» |
| Ítem | `.cap-shell-sidebar__item` | 38px de alto, ícono MDI. Activo: `aria-current="page"` (píldora y filo rojo de 3px). Contador en píldora; `--urgent` en rojo sólido |
| Rama con hijos | `details.cap-shell-sidebar__branch` | `summary` + `.cap-shell-sidebar__children`; hijos con `.cap-shell-sidebar__child` y cuadradito de color |
| Riel | mismo sidebar con `data-collapsed="true"` | Solo íconos. El contador pasa a punto. Con cursor o teclado se asoma: `bindSidebarPeek` pone `data-peek="open"` y el panel flota a 236 px sin mover el contenido ni cambiar la preferencia. Clic en la flecha lo deja fijo, Esc lo cierra. Con pantalla táctil (`any-pointer: coarse`) sigue el tooltip de vidrio a la derecha, y las ramas abren sus hijos al derecho. Allí la lista **no** hace scroll, porque recortaría tooltips y submenús: en pantallas muy bajas, expandir el panel |
| Header | `.cap-shell-header.cap-glass` | 64px, `position: sticky; top: 12px`. Migas, título (`h1`), buscador (máx. 320px), acciones, campana, avatar |
| Topbar móvil | `.cap-shell-topbar` | `position: fixed`, 52px. Sin `backHref`: logo y nombre del sistema. Con `backHref`: flecha «Volver» y título. Después, lupa (ocultable), acciones propias y campana. Siempre hay un `h1` con el título: `.cap-shell-topbar__title` si se ve, `.cap-shell-topbar__hidden-title` (oculto visualmente) si no. El `h1` del header y el de la topbar nunca se muestran al mismo ancho |
| Tabbar | `.cap-shell-tabbar` | `position: fixed`, 64px, abajo. **Máximo 4 destinos + «Más»**; los extra se ocultan por CSS y viven en la hoja |
| Hoja «Más» | `.cap-shell-sheet#cap-more-sheet` | Menú completo desde abajo. Estado en `data-open="true|false"`. El vidrio va en `__panel`, no en la raíz |
| FAB | `.cap-shell-fab` | 52px, rojo CAP, solo móvil, 88px sobre el borde inferior. Es un `button` (Vue) o un `a` (Blade, `fab-href`) |
| Notificaciones | `.cap-notifications#cap-notifications` | Vidrio, 360px, `position: fixed` (en móvil ocupa el ancho). **Hermano del header**, no hijo: un `backdrop-filter` dentro de otro no ve el contenido. Se muestra y oculta con `hidden` |
| Toasts | `.cap-toaster` | `position: fixed`, abajo a la derecha, 380px. Vidrio |
| Confirmación | `.cap-dialog` | Modal sólido (no vidrio). Raíz con `hidden`; panel `.cap-dialog__panel` |
| Aviso en línea | `.cap-alert` | Sólido. `role="alert"` si es `error`, `role="status"` en el resto |
| Acceso | `.cap-login` | Foto a la izquierda, tarjeta de vidrio blanco (`.cap-glass--light`, la única tarjeta en vidrio) a la derecha. Ver «Acceso» |

Capas: header 30, sidebar 40, notificaciones 50, hoja «Más» 60, confirmación 70, toasts 80 (`--cap-z-*`).

### Datos que consume el marco

- `menu`: grupos `{ label, items[] }`. Ítem: `{ label, icon, href, active?, count?, urgent?, children? }`. `icon` va sin el prefijo `mdi-`. Con ítem activo y un ícono `-outline`, se usa la variante rellena. Hijo: `{ label, href, active?, swatch? }` con `swatch` en `wine`, `red`, `red-400` o `taupe`.
- `aria-label` de un ítem con contador: «Facturas, 12 pendientes», «Cobranza, 3 urgentes» (singular sin «s» con `count === 1`).
- `user`: `{ name, email, avatarUrl? }`. Sin foto, el avatar muestra las iniciales de las dos primeras palabras.
- `notifications`: `{ id, title, detail?, time, group, unread, alert?, icon, href? }`. Con `href`, el ítem es un enlace. La campana dice «Notificaciones, N sin leer» y muestra el punto si N > 0.
- `breadcrumbs`: `{ label, href? }`. Sin `href`, es texto.
- Toast (`showToast`): `{ status, title, detail?, action? }` con `status` en `ok`, `info`, `warning`, `error` o `neutral` y `action` como `{ label, onSelect }`.

## Estado

| Estado | Dónde vive | Persistencia |
|---|---|---|
| Sidebar colapsado | Layout (o `data-collapsed` en el DOM) | `localStorage['cap-shell:sidebar-collapsed']` = `'true'`/`'false'`. Con `try/catch`: si falla, no hay preferencia y se usa el defecto por ancho |
| Modo oscuro | clase `dark` en `<html>` | `localStorage['theme']` = `'dark'`/`'light'`. `toggleTheme()` la alterna |
| Hoja «Más» abierta | Layout | No |
| Notificaciones abiertas | Layout / `hidden` del panel | No |
| Toasts | Cola global (`createToastQueue`) | No |
| Confirmación abierta | La app (Vue) o `hidden` del diálogo | No |

Cambiar el ancho de ventana **no** vuelve a evaluar el defecto: solo se aplica al montar.

## Comportamiento

### Teclado

| Tecla | Efecto |
|---|---|
| `Tab` / `Shift+Tab` | En hoja «Más» y confirmación el foco queda atrapado (`trapFocus`) y cicla |
| `Escape` | Cierra hoja, notificaciones (devuelve el foco a la campana) y confirmación |
| `⌘K` / `Ctrl K` | Enfoca el buscador del header (`bindCommandK`) y hace `preventDefault` |

El header de escritorio, y con él el buscador, se oculta bajo 1024px: **⌘K no aplica en móvil**.

Al cerrar hoja o confirmación el foco vuelve al elemento que lo tenía antes de abrir.

### Notificaciones (popover)

Se abre con la campana (`aria-controls="cap-notifications"`, `aria-expanded`). Se cierra con clic fuera, con `Escape` o volviendo a pulsar la campana. Hay dos campanas (header y topbar) que controlan el mismo panel; clic en una no se interpreta como «fuera» para la otra.

«Todas» / «No leídas» filtran en el navegador: se ocultan los ítems sin `data-unread="true"` y los grupos que quedan vacíos, y si no queda ninguno se muestra `data-cap-notification-empty`.

### Hoja «Más»

La abre «Más» en la tabbar. Se cierra con `Escape`, clic en el fondo (`data-cap-sheet-backdrop`) o arrastrando el asa (`data-cap-sheet-handle`) **más de 80px** hacia abajo. En Vue también se cierra al navegar (clic en un enlace dentro de la hoja).

### Toasts

- Estados: `ok`, `info`, `warning`, `error`, `neutral`.
- `ok` e `info` se cierran solos a los **5 s**, con barra de progreso y **pausa al pasar el cursor o enfocar** (el tiempo restante se conserva). `warning`, `error` y `neutral` persisten.
- **Máximo 3**; al llegar el cuarto se descarta el más antiguo. El más nuevo queda **abajo**.
- `role="alert"` para `error`; `role="status"` para el resto. Botón de cierre con `aria-label="Cerrar notificación"`.
- Opciones: `{ status, title, detail?, action?: { label, onSelect } }`. La acción ejecuta `onSelect` y cierra el toast.
- Toast «de servidor»: un hijo `[data-cap-toast]` con `data-status`, `data-title`, `data-detail` dentro de `[data-cap-toaster]` se convierte en toast al montar y el nodo se elimina (Blade lo usa con `session('cap_toast')`).

### Confirmación

- «Cancelar» a la **izquierda**, acción a la derecha. **Foco inicial en «Cancelar»**.
- `Escape`, `×` y «Cancelar» cancelan. **Clic fuera no cierra.**
- Con casilla de reconocimiento (`data-cap-confirm-ack`) el botón de aceptar queda deshabilitado hasta marcarla; se desmarca al reabrir.
- Al aceptar el botón recibe `aria-busy="true"`. En la versión vanilla se emite `cap:confirm` (`CustomEvent` con `detail.id`); no hay cierre automático, lo decide la app.
- Vocabulario: «Anular» / «Eliminar» según el caso, nunca «Aceptar».

### Acceso

- La **foto la define cada sistema** (`photoUrl` → `--cap-login-photo`); el paquete no trae ninguna. `login.html` usa una de ejemplo.
- Logos de Microsoft y Google: `design/logos/*.svg`. En Laravel se publican en `/cap/logos` (`logos-path`).
- Modos `login` y recuperación. Con `alert`, un `cap-alert` arriba del formulario; si es `error`, el campo de contraseña se marca con `cap-field--error`.
- Revelar contraseña con `data-cap-password-toggle` (`aria-controls` apunta al input; alterna `aria-label` y el ícono).
- Estado «ingresando»: en Vue, prop `loading`. En Blade y HTML, `data-cap-login-form="Ingresando…"` en el formulario: al enviar, el botón queda con `disabled`, `aria-busy="true"` y ese texto (evita el doble envío). Se restaura si el navegador vuelve atrás desde su caché.

## Accesibilidad

| Pieza | Contrato |
|---|---|
| Sidebar | `nav[aria-label="Menú principal"]`; activo con `aria-current="page"`; íconos `aria-hidden="true"` |
| Colapso | `aria-expanded` + `aria-label` dinámico |
| Campana | `aria-label` con conteo, `aria-expanded`, `aria-controls="cap-notifications"` |
| Notificaciones | `section[aria-label="Notificaciones"]` |
| Migas | `nav[aria-label="Migas de pan"]`; separadores `aria-hidden` |
| Tabbar | `nav[aria-label="Destinos principales"]`; «Más» con `aria-expanded` y `aria-controls="cap-more-sheet"` |
| Hoja | `role="dialog"`, `aria-modal="true"`, `aria-label="Menú completo"` |
| Confirmación | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` y `aria-describedby` |
| Toasts | `role="status"` / `role="alert"` (ver arriba) |
| Avisos | `role="alert"` (error) / `role="status"` |
| Tooltips del riel | `aria-hidden="true"`; el nombre accesible lo da el `aria-label` del ítem |
| Foco | Anillo visible en todos los controles; tooltips también con `:focus-visible` |

Contraste AA: texto 4.5:1 y controles 3:1, en claro y oscuro, incluido el vidrio con una tarjeta `card` detrás. Se verifica con `scripts/contrast.mjs`.

## Respaldos

| Condición | Resultado |
|---|---|
| Sin `backdrop-filter` (`@supports not`) | Superficies sólidas: `--cap-chrome` en el marco, `--cap-card` en el acceso |
| `prefers-reduced-transparency: reduce` | Igual que arriba |
| `prefers-reduced-motion: reduce` | Sin transición de ancho del sidebar, sin transición de la hoja «Más», sin la barra de progreso animada de los toasts, sin barrido de esqueletos ni entrada de vistas. El riel se sigue asomando, al instante |
| `localStorage` bloqueado | Preferencias no persisten; el marco sigue funcionando |

## Atributos `data-cap-*` y módulos

`initShell(root = document)` recorre `root`, enlaza cada atributo y devuelve **una función de limpieza**. `design/shell-auto.js` la invoca al cargar y expone `window.capToast`.

| Atributo | Módulo | Qué hace |
|---|---|---|
| `data-cap-sidebar` | `collapse.js` | Aplica el estado inicial (`resolveCollapsed`) y enlaza el colapso |
| `data-cap-collapse` | `collapse.js` | Botón dentro del sidebar que alterna y guarda |
| `data-cap-search` | `command-k.js` | Input que recibe el foco con ⌘K / Ctrl K |
| `data-cap-sheet-trigger` | `sheet.js` | Botón que abre la hoja; `aria-controls` apunta a su id |
| `data-cap-sheet-backdrop` | `sheet.js` | Fondo que cierra la hoja |
| `data-cap-sheet-handle` | `sheet.js` | Asa de arrastre |
| `data-cap-popover-trigger` | `popover.js` | Botón que abre el panel de `aria-controls` |
| `data-cap-toaster` | `toasts.js` | Contenedor de toasts; el último montado es el activo para `showToast` |
| `data-cap-toast` | `toasts.js` | Toast inicial servido por el servidor (ver «Toasts») |
| `data-cap-confirm` | `confirm.js` | Raíz del diálogo de confirmación (necesita `id`) |
| `data-cap-confirm-open` | `confirm.js` | Disparador; su valor es el `id` del diálogo |
| `data-cap-confirm-accept` | `confirm.js` | Botón de aceptar |
| `data-cap-confirm-cancel` | `confirm.js` | Botón «Cancelar» (foco inicial) |
| `data-cap-confirm-close` | `confirm.js` | Botón `×` |
| `data-cap-confirm-ack` | `confirm.js` | Casilla de reconocimiento |
| `data-cap-theme-toggle` | `theme.js` | Alterna la clase `dark` y guarda `theme` |
| `data-cap-password-toggle` | `password.js` | Revela u oculta la contraseña |
| `data-cap-notifications` | `notification-filter.js` | Panel cuyos ítems se filtran |
| `data-cap-notification-filter` | `notification-filter.js` | Botón de filtro: `all` o `unread` |
| `data-cap-notification-empty` | `notification-filter.js` | Mensaje oculto para «No leídas» sin resultados |
| `data-cap-login-form` | `login-form.js` | Formulario de acceso; su valor es el texto del botón mientras envía |

Módulos sin atributo: `collapse.js` exporta también `bindSidebarPeek(sidebar)`, que devuelve el liberador y que cada port debe llamar al montar el sidebar. `storage.js` (`readItem`/`writeItem` y la clave del riel), `on-escape.js` (`onEscape(document, handler)` devuelve el liberador), `popover.js` exporta también `belongsToPanel`, `sheet.js` exporta `createDragToClose`, `focus-trap.js` (`trapFocus(container, initialFocus)` devuelve el liberador), `toast-queue.js` (`createToastQueue`, sin DOM).

### Lo que la app debe cablear

El marco no adivina estas piezas:

- **`data-cap-search`** va en el input de búsqueda **de la app**, entregado por el slot `search`, en Blade y HTML. En Vue no hace falta: `CapHeader` enlaza ⌘K al input del slot. El slot es solo para búsqueda global (ver «Búsqueda» en `DESIGN_GUIDE.md`).
- **«Marcar todo como leído»**: Vue emite `mark-all-read`; Blade envía un formulario POST a `mark-read-action` y sin esa prop no muestra el botón; en HTML, React y Astro la app define el `action` del formulario. Los **filtros** ya funcionan solos (`data-cap-notifications`).
- **«Cerrar sesión»** (botón del usuario en sidebar y hoja): Vue emite `logout`; Blade envía un formulario POST con `@csrf` a `logout-action`, o a `route('logout')` si existe, o a `/logout`; en HTML, React y Astro la app define el `action` del formulario.
- **Lupa de la topbar**: Vue emite `search`; Blade y HTML enlazan a `search-href` (defecto `#`, sin destino real hasta que la app lo defina). Si el sistema no tiene búsqueda móvil, se oculta con `topbarSearch` / `topbar-search` en `false`.
- **`data-cap-confirm-open`**: el disparador lo pone la app donde corresponda; `confirm.js` solo escucha el clic en el documento.
- **`cap:confirm`** (vanilla): la app lo escucha y decide qué hacer y cuándo cerrar.
- **Enlace activo y tipo de enlace** (`a`, `Link` de Inertia, `<Link>` de Next, etc.): los decide la app. Con `RouterLink`, además, `linkProp="to"`.

## Props: Vue y Blade

`CapAppLayout` (`design/vue/CapAppLayout.vue` y `design/blade/components/cap/app-layout.blade.php`).

| Concepto | Vue (prop / evento / slot) | Blade (prop / slot) |
|---|---|---|
| Nombre del sistema | `systemName` (requerida) | `system-name` |
| Menú | `menu` (requerida) | `menu` |
| Pestañas móviles | `tabs` (máx. 4 visibles) | `tabs` (máx. 4) |
| Usuario | `user` (requerida) | `user` |
| Título | `title` (requerida) | `title` |
| Migas | `breadcrumbs` | `breadcrumbs` |
| Notificaciones | `notifications` | `notifications` |
| Componente de enlace | `linkComponent` (defecto `'a'`) | no existe: siempre `<a href>` |
| Prop del destino del enlace | `linkProp` (defecto `'href'`; `'to'` para vue-router) | no existe |
| Volver (topbar) | `backHref` (vacía = logo y nombre del sistema) | `back-href` |
| Lupa (topbar) | `topbarSearch` (defecto `true`) y evento `search` | `topbar-search` (defecto `true`) y `search-href` (defecto `#`) |
| Acciones de la topbar | slot `topbar-actions` | slot `topbarActions` (`<x-slot:topbar-actions>`) |
| Etiqueta del FAB | `fabLabel` (vacía = sin FAB) | `fab-label` (vacía = sin FAB) |
| Destino del FAB | evento `fab` | `fab-href` (defecto `#`) |
| «Ver todas» | `notificationsHref`; sin él, botón que emite `view-all` | `notifications-href`; sin él, no hay enlace |
| Marcar leído | evento `mark-all-read` | `mark-read-action` (POST con `@csrf`; vacía = sin botón) |
| Clic en notificación | evento `notification` (recibe el `id`); con `href` también navega | `href` en cada notificación |
| Cerrar sesión | evento `logout` | `logout-action` (defecto `route('logout')` si existe, si no `/logout`) |
| Buscador | slot `search` | slot `search` |
| Acciones del header | slot `header-actions` | slot `header-actions` |
| Contenido | slot por defecto | `$slot` |
| Ítem activo | `active` en cada ítem | `active`, o se deduce de `route` con `request()->routeIs()` |

Otros componentes:

| Componente | Vue | Blade |
|---|---|---|
| Confirmación | `CapConfirmDialog`: `open`, `title`, `message`, `confirmLabel`, `icon`, `acknowledgeLabel`, `loading`; eventos `confirm`, `cancel` | `x-cap.confirm-dialog`: `id`, `title`, `message`, `confirm-label`, `icon`, `acknowledge-label`, `action`, `method`. Envía un **formulario real** (`@csrf` y `@method`). Se abre con `data-cap-confirm-open="{id}"` |
| Acceso | `CapLogin`: `systemName`, `tagline`, `owner`, `photoUrl`, `providers`, `helpEmail`, `mode`, `alert`, `loading`; eventos `submit`, `provider`, `recover`, `back`, `forgot` | `x-cap.login`: `system-name`, `tagline`, `owner`, `photo-url`, `providers`, `help-email`, `mode`, `alert`, `logos-path` (defecto `/cap/logos`), `recover-url` (defecto `route('password.request')` si existe, si no `/forgot-password`). Envía formularios reales con rutas Laravel si existen |
| Aviso | `CapAlert`: `status`, `title`, `detail`, `icon` | `x-cap.alert`: `status`, `title`, `detail`, `icon` |
| Botón | `CapButton`: `variant`, `type`, `href`, `icon`, `disabled`, `loading`, `linkComponent`, `linkProp` | `x-cap.button`: `variant`, `type`, `href`, `icon`, `loading` |
| Toasts | `useToasts()` y `<CapToaster/>` (ya incluido en el layout) | `<x-cap.toaster/>` + `window.capToast(...)` + flash `session('cap_toast')` |

Notas de implementación:

- **Vue**: el estado de toasts es de **módulo** (una sola cola por aplicación). Con SSR (Nuxt) ese estado se comparte entre peticiones: no encolar toasts durante el render del servidor, solo en el cliente.
- **Vue y Blade**: el header solo muestra el buscador y su atajo ⌘K si el layout recibe el slot `search`.
- **Vue**: el panel de notificaciones se cierra al abrir una notificación o «Ver todas», aunque el layout persista entre páginas. Al portar a React, haz lo mismo.
- **Blade**: requiere cargar `shell-auto.js` (o `initShell`) para el comportamiento; el HTML se sirve completo desde el servidor. Única excepción a «sin `<script>`»: `sidebar.blade.php` trae un script en línea que aplica el estado del riel antes de pintar, para que no parpadee. Con una CSP sin `unsafe-inline` ese script no corre y `shell-auto.js` aplica el estado después, con el parpadeo.
- **Vue**: requiere Vue 3.5 o superior (`useId`).

## Portar a React

Estrategia: componentes propios que renderizan **las mismas clases y atributos** de `reference/app.html`; el comportamiento se importa de `design/shell/js/` tal cual dentro de hooks. **No reimplementar reglas** (tiempos de toast, atrapar foco, clave de storage, defectos por ancho).

| Pieza | Componente |
|---|---|
| Layout | `CapAppLayout` (lienzo, sidebar, header, tabbar, hoja, FAB, toaster) |
| Sidebar | `CapSidebar`, `CapSidebarItem` (hijos con `details`) |
| Header | `CapHeader` (incluye topbar móvil) |
| Notificaciones | `CapNotifications` |
| Tabbar y hoja | `CapTabBar`, `CapMoreSheet` |
| Toasts | `CapToaster` + función `showToast` |
| Confirmación | `CapConfirmDialog` |
| Acceso | `CapLogin` |

Estado que vive en el **layout**: `collapsed` (inicializado con `resolveCollapsed(window.innerWidth)` dentro de `useEffect`, no durante el render), `moreOpen` (hoja), `notificationsOpen`, y la lista de toasts.

Módulos a importar sin copiar:

- `collapse.js` y `storage.js`: `resolveCollapsed`, `writeCollapsed`. Al alternar, guardar con `writeCollapsed`.
- `toast-queue.js`: una sola cola a nivel de módulo, suscrita con `useSyncExternalStore` o `useEffect` + `useState`; `pause` y `resume` en `onMouseEnter`/`onMouseLeave` y `onFocus`/`onBlur`.
- `focus-trap.js`: dentro de `useEffect` cuando la hoja o el diálogo se abren; **devolver el liberador** como limpieza.
- `theme.js`: `onClick={toggleTheme}`.
- `command-k.js`: `useEffect(() => bindCommandK(inputRef.current), [])`; la función ya devuelve su limpieza.

Patrón:

```jsx
useEffect(() => {
  if (!open) return undefined;
  return trapFocus(panelRef.current, cancelRef.current);
}, [open]);
```

Para `Escape` y clic fuera, usar los mismos criterios de `sheet.js` / `popover.js` / `confirm.js` (ver «Comportamiento»); o, si el marco es estático, llamar `initShell()` en un `useEffect` del layout y usar su función de limpieza (con `React.StrictMode`, que monta dos veces, la limpieza es obligatoria).

Reglas de React: `className`, `htmlFor`, `aria-*` en kebab-case, `hidden` booleano; `data-collapsed={String(collapsed)}`. **El enlace activo y el tipo de enlace los decide la app** (como en Vue): el componente recibe `active` y un `linkComponent`/`as`. Los eventos `logout`, `mark-all-read`, `view-all`, `notification`, `search` y `fab` son callbacks (`onLogout`, etc.).

## Portar a Astro

1. Copiar el HTML de `design/shell/reference/app.html` a `src/components/cap/*.astro` (Sidebar, Header, TabBar, MoreSheet, Notifications, Toaster) y convertir lo repetido en props.
2. Cargar el CSS (`design/shell.css`) y, **una sola vez en el layout**:

```astro
<script>import '../../design/shell-auto.js'</script>
```

   `shell-auto.js` ejecuta `initShell()` y expone `window.capToast`. Astro empaqueta el script una vez por página aunque haya varios componentes.
3. Ítem activo con `Astro.url.pathname`: `aria-current={Astro.url.pathname === item.href ? 'page' : undefined}`, y la variante rellena del ícono cuando está activo.
4. Con View Transitions (`<ClientRouter />`) el DOM se reemplaza: volver a llamar `initShell()` en `astro:page-load` y guardar la función de limpieza para la página siguiente.
5. El resto es HTML estático: las piezas «que la app debe cablear» (búsqueda con `id="cap-global-search"`, `data-cap-confirm-open`, cierre de sesión, «Marcar todo como leído») se hacen con formularios, enlaces o un script propio.
