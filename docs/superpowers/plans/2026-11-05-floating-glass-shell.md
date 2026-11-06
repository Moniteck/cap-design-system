# Marco flotante de vidrio (CAP Design System 2.0.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar la 2.0.0 del paquete: paleta afinada, marco flotante de vidrio (sidebar colapsable, header, móvil), acceso, confirmaciones, notificaciones y toasts, con CSS y JS compartidos, componentes Vue y Blade listos, guía de porte para React/Astro e instalador para los cuatro stacks.

**Architecture:** Una sola fuente visual (`design/shell.css` + partes en `design/shell/css/`) que solo usa `var(--cap-*)` generadas desde `tokens.json`. Un núcleo de comportamiento sin framework (`design/shell/js/*.js`) que usan tanto el auto-init por atributos `data-cap-*` (Blade, Astro, HTML) como los composables de Vue. Vue y Blade solo generan el HTML de referencia (`design/shell/reference/`) y no duplican estilos ni reglas.

**Tech Stack:** CSS plano, JS ES modules, Vue 3 `<script setup>`, Blade (componentes anónimos), Bash + Node para el instalador. Pruebas: Vitest + happy-dom + @vue/test-utils (devDependencies del repo, nunca del paquete instalado) y PHP con `illuminate/view` para Blade.

**Spec:** `docs/superpowers/specs/2026-11-05-floating-glass-shell-design.md` (bocetos aprobados en `docs/superpowers/specs/2026-11-05-floating-glass-shell-mockups/`). Leer ambos antes de cada tarea.

## Global Constraints

- Versión del paquete `2.0.0` en `design/tokens.json`, `.claude-plugin/plugin.json` y `CHANGELOG.md`.
- Rojo de marca `#B12530` intacto. Fuentes Inter (texto) y Poppins (títulos). Íconos solo MDI (`mdi-*`).
- Ningún hex, `rgb(` ni `rgba(` literal fuera de `tokens.json` y `tokens.css` (generado). `shell.css`, componentes y JS usan `var(--cap-*)`.
- Contraste AA: texto ≥ 4.5:1, controles ≥ 3:1, en claro y en oscuro, incluido el vidrio en su peor caso (tarjeta `card` detrás).
- Vidrio para lo que flota (marco, notificaciones, toasts, tooltips, hoja «Más», etiquetas sobre fotos); sólido para tarjetas, modales, avisos en línea e inputs. Única excepción: tarjeta del acceso en vidrio blanco.
- Sin `backdrop-filter` o con `prefers-reduced-transparency: reduce` ⇒ superficies sólidas (`--cap-chrome` el marco, `--cap-card` el acceso). `prefers-reduced-motion` ⇒ sin transición de ancho.
- Capas solo con `z-cap-*` (30 header, 40 sidebar, 50 dropdown, 60 drawer, 70 modal, 80 toast).
- Puntos de quiebre: móvil `< 1024px`; riel colapsado por defecto en `1024–1279px`; panel expandido por defecto `≥ 1280px`.
- Hace scroll la ventana (header `position: sticky; top: 12px`), nunca un contenedor interno.
- Reglas de comportamiento 1.x intactas: toasts ok/info se cierran a los 5 s con pausa al pasar el cursor; warning/error persisten; máximo 3, el más nuevo abajo; `role="status"` (ok/info) y `role="alert"` (error); confirmación con «Cancelar» a la izquierda y foco inicial, `Esc`/`×` cancelan, clic fuera **no** cierra.
- Etiquetas de grupo en minúscula normal; nunca mayúsculas espaciadas. Nada por debajo de `text-xs` (12px).
- Textos de interfaz en español; identificadores, archivos y commits en inglés. Vue con `<script setup>` y props tipadas con defaults. Sin `console.log`, código muerto ni comentarios obvios.
- `package.json` del repo es privado y solo para pruebas; el instalador nunca lo copia.
- **Commits solo con autorización del usuario** (su CLAUDE.md lo exige). Los pasos «Commit» de cada tarea se ejecutan solo si el usuario autorizó commits para esta ejecución; si no, son puntos de control: se deja el trabajo sin commitear y se sigue. Trabajar en una rama, nunca en `main`. Nunca push ni tag.

## Review Focus

1. **`localStorage` bloqueado o lanzando excepción** (Safari privado, cookies bloqueadas) ⇒ el sidebar abre con el valor por defecto de su ancho y nada se rompe. Prueba en Task 4 (`storage`).
2. **Navegador sin `backdrop-filter` o con «reducir transparencia»** ⇒ marco y acceso sólidos y legibles. Prueba en Task 3 (reglas presentes en el CSS) y revisión visual en Task 10.
3. **Un sistema pasa más de 4 pestañas móviles** ⇒ se muestran las 4 primeras + «Más»; el resto vive en la hoja. Prueba en Task 5 (Vue) y Task 6 (Blade).
4. **Ráfaga de toasts** (5 seguidos) ⇒ quedan 3 visibles, se descarta el más antiguo, el más nuevo abajo. Prueba en Task 4 (`toast-queue`).
5. **Instalador corrido dos veces en el mismo proyecto** ⇒ ningún import, línea ni archivo duplicado, en los tres stacks. Prueba en Task 8.

---

## Mapa de archivos

```
package.json                         (nuevo, privado: vitest, happy-dom, vue, @vue/test-utils)
vitest.config.mjs                    (nuevo)
design/tokens.json                   (2.0.0: valores y escalas nuevas)
design/tokens.css                    (generado)
design/tailwind.preset.js            (escala cap-red-*, wine, taupe, radios)
design/chart-colors.js               (escala de rojos + topo)
design/shell.css                     (entrada: @import de design/shell/css/*.css)
design/shell/css/base.css            (lienzo, manchones, vidrio, respaldos)
design/shell/css/sidebar.css
design/shell/css/header.css
design/shell/css/mobile.css          (topbar, tabbar, hoja «Más», FAB)
design/shell/css/overlays.css        (modal, notificaciones, toasts, aviso en línea)
design/shell/css/login.css
design/shell.js                      (exporta initShell)
design/shell-auto.js                 (llama initShell al cargar; lo importan Blade/Astro)
design/shell/js/storage.js
design/shell/js/collapse.js
design/shell/js/focus-trap.js
design/shell/js/sheet.js
design/shell/js/popover.js
design/shell/js/command-k.js
design/shell/js/toast-queue.js
design/shell/js/toasts.js
design/shell/js/confirm.js
design/shell/js/theme.js
design/shell/js/password.js
design/shell/reference/app.html      (marco completo: HTML de referencia y demo)
design/shell/reference/login.html
design/shell/SHELL_SPEC.md           (agnóstica + «Portar a React» + «Portar a Astro»)
design/vue/*.vue, design/vue/composables/*.js
design/blade/components/cap/*.blade.php
scripts/build-tokens-css.mjs         (variables nuevas)
scripts/contrast.mjs                 (nuevo: funciones + CLI de verificación)
install.sh                           (multi-stack)
tests/**                             (pruebas; fuera de design/)
DESIGN_GUIDE.md, AGENTS.md, SKILL.md, README.md, CHANGELOG.md, .claude-plugin/*.json
```

---

### Task 1: Tokens 2.0 y verificación de contraste

**Files:**
- Create: `package.json`, `vitest.config.mjs`, `scripts/contrast.mjs`, `tests/tokens.test.mjs`
- Modify: `design/tokens.json`, `scripts/build-tokens-css.mjs`, `design/tokens.css` (regenerado), `.gitignore` (agregar `node_modules/` si falta, ya está)

**Interfaces:**
- Produces (tokens.json, claves nuevas o cambiadas; las demás se mantienen):
  - `version: "2.0.0"`
  - `brand.redScale: { "50": "#FBEDEE", "100": "#F3DADD", "200": "#F2D3D6", "400": "#DB7F87", "600": "#B12530", "800": "#6E1219" }`, `brand.wine: "#6E1219"`, `brand.taupe: "#A89C91"`
  - `chrome.surface: "#1E1B1A"`, `chrome.paper: "#F1EDE9"`, `chrome.paperLine: "#E6DFD8"`, `chrome.card: "#FFFDFB"`, `chrome.textSoft: "#6E645D"`, `chrome.onChromeSoft: "#D2CAC3"`, `chrome.onChrome: "#E9E4E0"`
  - `dark: { page: "#151312", card: "#211D1C", card2: "#2B2624", divider: "#3A3431", textSoft: "#A89C91", redTint: "rgba(177,37,48,.16)" }`
  - `glass: { dark: { tint: "30,27,26", alpha: 0.78, blur: "22px", saturate: "170%", border: "rgba(255,255,255,.14)", highlight: "rgba(255,255,255,.22)", hover: "rgba(255,255,255,.10)", active: "rgba(255,255,255,.16)", activeBorder: "rgba(255,255,255,.22)" }, darkMode: { tint: "20,18,17", alpha: 0.78, border: "rgba(255,255,255,.10)" }, light: { tint: "255,253,251", alpha: 0.58, blur: "26px", saturate: "180%", border: "rgba(255,255,255,.75)", highlight: "rgba(255,255,255,.95)" }, overlay: "rgba(30,27,26,.35)" }`
  - `blobs: { app: { red: 0.20, wine: 0.16, taupe: 0.25 }, login: { red: 0.30, wine: 0.26, taupe: 0.35 } }`
  - `radius: { control: "14px", card: "20px", shell: "24px", sheet: "28px" }`
- Produces (variables CSS nuevas en `tokens.css`, `:root` y `.dark`): `--cap-red-{50,100,200,400,600,800}`, `--cap-wine`, `--cap-taupe`, `--cap-text-soft`, `--cap-on-chrome`, `--cap-on-chrome-soft`, `--cap-glass-bg` (`rgba(tint, alpha)`), `--cap-glass-blur`, `--cap-glass-saturate`, `--cap-glass-border`, `--cap-glass-highlight`, `--cap-glass-hover`, `--cap-glass-active`, `--cap-glass-active-border`, `--cap-glass-light-bg`, `--cap-glass-light-blur`, `--cap-glass-light-saturate`, `--cap-glass-light-border`, `--cap-glass-light-highlight`, `--cap-overlay`, `--cap-blob-red`, `--cap-blob-wine`, `--cap-blob-taupe` (colores ya con su alfa de `blobs.app`), `--cap-blob-login-red|wine|taupe`, `--cap-red-tint` (claro `#FBEDEE`, oscuro `dark.redTint`), `--cap-radius-control|card|shell|sheet`. En `.dark`: `--cap-glass-bg` usa `glass.darkMode`, blobs a la mitad de alfa, `--cap-page|card|card-2|divider|text-soft` desde `dark`.
- Produces (`scripts/contrast.mjs`): `export function contrastRatio(foreground: string, background: string): number`, `export function compositeOver(tint: string /* "r,g,b" */, alpha: number, backgroundHex: string): string /* "#rrggbb" */`, `export function contrastReport(tokens): { pair: string, ratio: number, min: number, pass: boolean }[]`; como CLI (`node scripts/contrast.mjs`) imprime el reporte y sale con código 1 si algún par falla.

- [ ] **Step 1: Crear `package.json` (privado, `"type": "module"`, scripts `test: "vitest run"`, `tokens: "node scripts/build-tokens-css.mjs"`, `contrast: "node scripts/contrast.mjs"`; devDependencies `vitest`, `happy-dom`, `vue`, `@vue/test-utils`, `@vitejs/plugin-vue`) y `vitest.config.mjs` (plugin vue, `environment: 'happy-dom'`, `include: ['tests/**/*.test.mjs']`). Correr `npm install`.**

- [ ] **Step 2: Escribir pruebas que fallan en `tests/tokens.test.mjs`**

```js
import { contrastRatio, compositeOver, contrastReport } from '../scripts/contrast.mjs';
import tokens from '../design/tokens.json' with { type: 'json' };
import { readFileSync } from 'node:fs';

test('contrastRatio matches WCAG reference', () => {
  expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
  expect(contrastRatio('#B12530', '#FFFFFF')).toBeCloseTo(6.6, 1);
});
test('compositeOver blends glass over a card', () => {
  expect(compositeOver('30,27,26', 0.62, '#FFFDFB')).toBe('#747170');
});
test('brand red unchanged and version bumped', () => {
  expect(tokens.brand.red).toBe('#B12530');
  expect(tokens.version).toBe('2.0.0');
});
test('every contrast pair passes AA', () => {
  const failing = contrastReport(tokens).filter((row) => !row.pass);
  expect(failing).toEqual([]);
});
test('tokens.css exposes the new variables in both themes', () => {
  const css = readFileSync('design/tokens.css', 'utf8');
  for (const name of ['--cap-red-800', '--cap-glass-bg', '--cap-text-soft', '--cap-blob-red', '--cap-radius-shell', '--cap-red-tint']) {
    expect(css).toContain(`${name}:`);
  }
  expect(css.split('.dark {')[1]).toContain('--cap-glass-bg:');
});
```

`contrastReport` debe cubrir como mínimo (min entre paréntesis): `onChromeSoft` y `onChrome` sobre `compositeOver(glass.dark, card)` (4.5); igual en oscuro sobre `dark.card` (4.5); `textSoft` sobre `card` y sobre `paper` (4.5); `brand.red` sobre `redScale.50` (4.5); blanco sobre `wine` (4.5); `chrome.surface` sobre `card` (4.5); `dark.textSoft` sobre `dark.card` (4.5); `brand.redSoft` sobre `dark.card` (4.5); `textSoft` sobre `compositeOver(glass.light, compositeOver(red, blobs.login.red, paper))` (4.5); `inputLine` sobre `card` (3).

- [ ] **Step 3: Correr `npx vitest run tests/tokens.test.mjs` — Expected: FAIL (módulo `scripts/contrast.mjs` no existe).**

- [ ] **Step 4: Implementar `scripts/contrast.mjs`, actualizar `design/tokens.json` con los valores de Interfaces y `scripts/build-tokens-css.mjs` para emitir las variables nuevas; correr `npm run tokens`.** El alfa del vidrio `0.78` ya está calculado para dejar `onChromeSoft` en 5.18:1; si `contrastReport` marca un par, ajustar solo luminosidad ±1 paso, nunca el tono, y anotarlo en el commit.

- [ ] **Step 5: Correr `npm test` y `npm run contrast` — Expected: PASS y reporte sin fallas.**

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.mjs scripts/ design/tokens.json design/tokens.css tests/tokens.test.mjs
git commit -m "Tokens 2.0: warm palette, red scale, glass and contrast check"
```

---

### Task 2: Preset de Tailwind y colores de gráficas

**Files:**
- Modify: `design/tailwind.preset.js`, `design/chart-colors.js`
- Test: `tests/preset.test.mjs`, `tests/chart-colors.test.mjs`

**Interfaces:**
- Consumes: claves de `tokens.json` de Task 1.
- Produces: clases `cap-red-{50,100,200,400,600,800}`, `cap-wine`, `cap-taupe`, `cap-text-soft` (alias `var(--cap-text-soft)`), `cap-on-chrome`, `cap-on-chrome-soft`; `borderRadius`: `cap-control` 14px, `cap-card` **20px** (antes 10), `cap-shell` 24px, `cap-sheet` 28px. Se mantienen todos los nombres 1.x.
- Produces: `chartColors(isDark?: boolean): { series: string[4], status, text, grid }` con `series` claro `[wine, red, redScale.400, taupe]`, oscuro `[redSoft, redScale.200, taupe, dark.divider]`; `text` claro `chrome.textSoft`, oscuro `dark.textSoft`; `grid` claro `chrome.paperLine`, oscuro `dark.divider`.

- [ ] **Step 1: Pruebas que fallan**

```js
// tests/preset.test.mjs
import preset from '../design/tailwind.preset.js';
const { colors, borderRadius } = preset.theme.extend;
test('red scale and new roles exist', () => {
  expect(colors.cap['red-800']).toBe('#6E1219');
  expect(colors.cap.wine).toBe('#6E1219');
  expect(colors.cap['text-soft']).toBe('var(--cap-text-soft)');
});
test('1.x names still exist', () => {
  for (const name of ['brand', 'chrome', 'page', 'card', 'card-2', 'divider', 'head', 'input-line']) expect(colors.cap[name]).toBeDefined();
});
test('radii', () => {
  expect(borderRadius['cap-card']).toBe('20px');
  expect(borderRadius['cap-shell']).toBe('24px');
});
// tests/chart-colors.test.mjs
import { chartColors } from '../design/chart-colors.js';
test('light series start with wine then brand red', () => {
  expect(chartColors(false).series).toEqual(['#6E1219', '#B12530', '#DB7F87', '#A89C91']);
});
test('dark series start with soft red', () => {
  expect(chartColors(true).series[0]).toBe('#E8707A');
});
```

- [ ] **Step 2: `npx vitest run tests/preset.test.mjs tests/chart-colors.test.mjs` — Expected: FAIL.**
- [ ] **Step 3: Implementar en `design/tailwind.preset.js` y `design/chart-colors.js`.**
- [ ] **Step 4: `npm test` — Expected: PASS.**
- [ ] **Step 5: Commit** `git commit -m "Preset and chart colors for the 2.0 palette"`

---

### Task 3: CSS del marco, acceso y capas flotantes + HTML de referencia

**Files:**
- Create: `design/shell.css`, `design/shell/css/{base,sidebar,header,mobile,overlays,login}.css`, `design/shell/reference/app.html`, `design/shell/reference/login.html`
- Test: `tests/shell-css.test.mjs`

**Interfaces:**
- Consumes: variables `--cap-*` de Task 1.
- Produces (contrato de clases y atributos que usan Tasks 4–7; BEM con prefijo `cap-shell`):
  - Lienzo: `.cap-shell` (grid escritorio: sidebar + columna; relleno 12, gap 12, manchones en `::before` con `--cap-blob-*`), `.cap-shell__main`, `.cap-shell__content`.
  - Vidrio: `.cap-glass` (oscuro) y `.cap-glass--light` (blanco); ambos con respaldo sólido en `@supports not (backdrop-filter: blur(1px))` y `@media (prefers-reduced-transparency: reduce)`.
  - Sidebar: `.cap-shell-sidebar` con `[data-collapsed="true"]` (236px ↔ 66px), `__brand`, `__search` (+`__kbd`), `__group-label`, `__item` (alto 38, `[aria-current="page"]` = píldora `--cap-glass-active` + filo rojo 3px con `::before`), `__icon`, `__label`, `__count` (`--urgent` rojo), `__dot` (visible solo colapsado), `__tooltip` (vidrio claro; visible con `__item:is(:hover, :focus-visible)` solo colapsado), `__children` (línea de árbol) y `__child-swatch`, `__spacer`, `__theme`, `__user`, `__collapse` (botón blanco 26px en el borde).
  - Header: `.cap-shell-header` (sticky top 12, alto 64, radio 24, `z-index` 30), `__crumbs`, `__title`, `__search`, `__icon-button` (38px) con `__badge-dot`.
  - Móvil (`< 1024px`; el sidebar y el header se ocultan): `.cap-shell-topbar` (52px, margen 10, radio 20), `.cap-shell-tabbar` (64px, margen 10 + `env(safe-area-inset-bottom)`, radio 24) con `__tab` y `[aria-current="page"]`, `.cap-shell-sheet` (+ `__backdrop`, `__handle`, `[data-open="true"]`), `.cap-shell-fab` (52px rojo). El contenido recibe relleno superior/inferior para no quedar tapado.
  - Capas: `.cap-notifications` (popover vidrio 360px, `__tabs`, `__group`, `__item`, `[data-unread="true"]`), `.cap-toaster` (esquina inferior derecha 16px; arriba a ancho completo en móvil) y `.cap-toast` (`--ok|info|warning|error|neutral`, `__progress`), `.cap-dialog` (+ `__backdrop` con `--cap-overlay` y blur 6px, `__icon`, `__ack`, `__actions`), `.cap-alert` (`--ok|info|warning|error`).
  - Acceso: `.cap-login` (dos paneles radio 28, manchones `--cap-blob-login-*`), `__photo` (con `--cap-login-photo` como `background-image`; sin foto ⇒ `--cap-chrome` + manchones), `__brand-tag`, `__quote`, `__card` (`.cap-glass--light`), `__form`, `__providers`, `__help`; móvil: foto arriba y tarjeta desde 150px, margen 10, radio 30. Oscuro: `__card` pasa a vidrio oscuro.
  - Botones del sistema en píldora: `.cap-button` (`--primary|secondary|danger|provider`), `.cap-field` (46px, radio 14).
- `app.html` y `login.html`: HTML de referencia completo, sin build, con `<link>` a `../../tokens.css` y `../../shell.css`, MDI y fuentes por CDN, `<script type="module" src="../../shell-auto.js">`, botón para alternar claro/oscuro, y todos los atributos `data-cap-*` de Task 4. `app.html` incluye: sidebar con submenú y contadores, header con notificaciones abiertas por botón, contenido con las recetas de tarjetas, tabbar con 5 pestañas pasadas (se muestran 4 + «Más»), FAB, un toaster con botones para disparar cada estado y un botón que abre la confirmación destructiva. Copiar contenido de ejemplo de los bocetos.

- [ ] **Step 1: Pruebas que fallan**

```js
// tests/shell-css.test.mjs
import { readFileSync, readdirSync } from 'node:fs';
const parts = readdirSync('design/shell/css').map((f) => readFileSync(`design/shell/css/${f}`, 'utf8'));
const all = parts.join('\n');
test('entry imports every part', () => {
  const entry = readFileSync('design/shell.css', 'utf8');
  for (const f of readdirSync('design/shell/css')) expect(entry).toContain(`shell/css/${f}`);
});
test('no literal colors', () => {
  expect(all).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
});
test('glass falls back to solid surfaces', () => {
  expect(all).toContain('@supports not (backdrop-filter: blur(1px))');
  expect(all).toContain('prefers-reduced-transparency: reduce');
  expect(all).toContain('prefers-reduced-motion: reduce');
});
test('only z-cap layers', () => {
  for (const [, value] of all.matchAll(/z-index:\s*([^;]+);/g)) expect(value).toMatch(/^var\(--cap-z-/);
});
test('mobile breakpoint is 1024px', () => {
  expect(all).toContain('(max-width: 1023.98px)');
});
```

Agregar en Task 1 si faltan: variables `--cap-z-header|sidebar|dropdown|drawer|modal|toast` en `tokens.css` (valores 30–80) — hacerlo en este paso modificando `scripts/build-tokens-css.mjs` y regenerando.

- [ ] **Step 2: `npx vitest run tests/shell-css.test.mjs` — Expected: FAIL.**
- [ ] **Step 3: Escribir los CSS y los dos HTML de referencia** con las medidas del spec y de los bocetos (`vidrio.html`, `movil.html`, `login-final-v2.html`, `acceso-y-avisos.html` secciones 2–4).
- [ ] **Step 4: `npm test` — Expected: PASS.**
- [ ] **Step 5: Verificación visual.** Servir el repo (`npx http-server -p 4173 .` o `python3 -m http.server 4173`) y abrir `design/shell/reference/app.html` y `login.html` en Chrome a 1440px, 1100px y 390px, en claro y oscuro. Comparar contra los bocetos; captura de cada combinación. Emular `prefers-reduced-transparency` (DevTools › Rendering) y confirmar marco sólido legible. Si la opacidad 0.78 se ve muy distinta del boceto, anotarlo para el informe final (spec lo pide).
- [ ] **Step 6: Commit** `git commit -m "Shell CSS, overlays, login styles and reference HTML"`

---

### Task 4: Comportamiento sin framework (`shell.js`)

**Files:**
- Create: `design/shell.js`, `design/shell-auto.js`, `design/shell/js/{storage,collapse,focus-trap,sheet,popover,command-k,toast-queue,toasts,confirm,theme,password}.js`
- Test: `tests/shell/*.test.mjs` (uno por módulo)

**Interfaces:**
- `storage.js`: `readCollapsed(): boolean | null`, `writeCollapsed(collapsed: boolean): void`. Clave `'cap-shell:sidebar-collapsed'`; ambas atrapan cualquier excepción (lectura ⇒ `null`).
- `collapse.js`: `defaultCollapsed(viewportWidth: number): boolean` (`true` solo en `1024 ≤ w < 1280`); `resolveCollapsed(viewportWidth: number): boolean` (`readCollapsed() ?? defaultCollapsed(w)`); `bindSidebarCollapse(sidebar: HTMLElement): () => void` — botón `[data-cap-collapse]` alterna `data-collapsed` del sidebar, `aria-expanded` y `aria-label` («Contraer menú» / «Expandir menú»), y persiste.
- `focus-trap.js`: `trapFocus(container: HTMLElement, initialFocus?: HTMLElement): () => void` — Tab/Shift+Tab ciclan dentro; la función devuelta libera y devuelve el foco al elemento activo previo.
- `sheet.js`: `bindSheet(trigger: HTMLElement, sheet: HTMLElement): () => void` — abre con `data-open="true"`, `aria-expanded`, foco atrapado; cierra con Escape, clic en `[data-cap-sheet-backdrop]` o arrastre del `[data-cap-sheet-handle]` hacia abajo > 80px.
- `popover.js`: `bindPopover(trigger: HTMLElement, panel: HTMLElement): () => void` — alterna `hidden` y `aria-expanded`; cierra con Escape (foco vuelve al disparador) y clic fuera.
- `command-k.js`: `bindCommandK(input: HTMLElement): () => void` — `(metaKey || ctrlKey) && key === 'k'` ⇒ `preventDefault` y foco.
- `toast-queue.js` (lógica pura, la usa también Vue): `createToastQueue(onChange: (toasts: Toast[]) => void, { now = Date.now, setTimer = setTimeout, clearTimer = clearTimeout } = {}): { show(options: ToastOptions): string, dismiss(id: string): void, pause(id: string): void, resume(id: string): void, list(): Toast[] }`. `ToastOptions = { status: 'ok'|'info'|'warning'|'error'|'neutral', title: string, detail?: string, action?: { label: string, onSelect: () => void } }`. `Toast = ToastOptions & { id: string, autoClose: boolean, remainingMs: number | null }`. Reglas: ok/info `autoClose` 5000 ms; pause/resume conservan el tiempo restante; máximo 3 (al llegar el cuarto se descarta el más antiguo); orden: el más nuevo al final.
- `toasts.js`: `mountToaster(container: HTMLElement): { show(options: ToastOptions): string, dismiss(id: string): void }` — renderiza `.cap-toast` con `role="status"` (ok/info/neutral/warning) o `role="alert"` (error), barra `__progress` solo si `autoClose`, pausa en `mouseenter`/`focusin`. Al montar, convierte cada `[data-cap-toast]` hijo inicial (atributos `data-status`, `data-title`, `data-detail`) en toast — así Blade muestra mensajes flash. Expone `window.capToast = show` solo desde `shell-auto.js`.
- `confirm.js`: `bindConfirmDialog(dialog: HTMLElement): () => void` — se abre con cualquier `[data-cap-confirm-open="<id del diálogo>"]`; foco inicial en `[data-cap-confirm-cancel]`; Escape, `×` y «Cancelar» cierran; clic en el fondo **no** cierra; si existe `[data-cap-confirm-ack]` (casilla), `[data-cap-confirm-accept]` queda `disabled` hasta marcarla; al aceptar emite `CustomEvent('cap:confirm', { bubbles: true, detail: { id } })` en el diálogo y pone `aria-busy="true"` en el botón.
- `theme.js`: `toggleTheme(): 'light' | 'dark'` — alterna clase `dark` en `<html>` y guarda `localStorage.theme` (misma clave que el script del `<head>` de la 1.x), con `try/catch`.
- `password.js`: `bindPasswordToggle(button: HTMLElement): () => void` — alterna `type` del input `#<aria-controls>` y el `aria-label` («Mostrar contraseña» / «Ocultar contraseña»).
- `shell.js`: `initShell(root: ParentNode = document): () => void` — busca cada atributo y enlaza su módulo: `[data-cap-sidebar]`, `[data-cap-search]`, `[data-cap-sheet-trigger]` (+`aria-controls`), `[data-cap-popover-trigger]` (+`aria-controls`), `[data-cap-toaster]`, `[data-cap-confirm]`, `[data-cap-theme-toggle]`, `[data-cap-password-toggle]`; aplica `resolveCollapsed(innerWidth)` al sidebar antes de pintar. Devuelve un teardown que libera todo.
- `shell-auto.js`: llama `initShell()` en `DOMContentLoaded` (o de inmediato si ya cargó) y asigna `window.capToast`.

- [ ] **Step 1: Pruebas que fallan** (una por módulo; nombres y aserciones clave):
  - `storage.test.mjs`: `readCollapsed returns null when localStorage throws` (sustituir `globalThis.localStorage` por un objeto cuyo `getItem` lanza) ⇒ `null`; `writeCollapsed swallows errors`; ida y vuelta guarda `true`.
  - `collapse.test.mjs`: `defaultCollapsed(1100) === true`, `(1280) === false`, `(1023) === false`; clic en `[data-cap-collapse]` ⇒ `sidebar.dataset.collapsed === 'true'`, `aria-expanded === 'false'`, `readCollapsed() === true`.
  - `focus-trap.test.mjs`: Tab desde el último enfocable vuelve al primero; liberar devuelve el foco al disparador.
  - `sheet.test.mjs`: abrir ⇒ `data-open="true"`; Escape cierra y el foco vuelve al disparador; `pointerdown` en el handle + `pointermove` +100px + `pointerup` cierra; +40px no cierra.
  - `popover.test.mjs`: clic abre, clic fuera cierra, Escape cierra con foco al disparador.
  - `command-k.test.mjs`: `ctrl+k` enfoca el input y hace `preventDefault`; `k` sola no.
  - `toast-queue.test.mjs`: **ráfaga de 5 ⇒ `list().length === 3` y los títulos son los 3 últimos en orden**; ok se descarta a los 5000 ms (timers falsos de Vitest); error persiste tras 60 000 ms; `pause` a los 2000 ms y `resume` ⇒ se descarta 3000 ms después.
  - `toasts.test.mjs`: error ⇒ `role="alert"` y sin `.cap-toast__progress`; ok ⇒ `role="status"` y con barra; `[data-cap-toast]` inicial se convierte en toast.
  - `confirm.test.mjs`: abrir enfoca «Cancelar»; con casilla, aceptar está `disabled` hasta marcarla; clic en fondo no cierra; Escape cierra; aceptar emite `cap:confirm` con el `id`.
  - `theme.test.mjs`: alterna clase `dark` y guarda `localStorage.theme`; no lanza si `localStorage` lanza.
  - `password.test.mjs`: alterna `type` `password` ↔ `text`.
  - `init.test.mjs`: montar `design/shell/reference/app.html` (leer el archivo y asignar `document.body.innerHTML` con el `<body>`) y `initShell()` ⇒ el colapso, la hoja y la confirmación funcionan; el teardown quita los listeners (un segundo clic tras teardown no cambia `data-collapsed`).
- [ ] **Step 2: `npx vitest run tests/shell` — Expected: FAIL.**
- [ ] **Step 3: Implementar los módulos con las firmas de arriba.** Ningún módulo pasa de ~40 líneas por función; `toasts.js` y Vue comparten `toast-queue.js`.
- [ ] **Step 4: `npm test` — Expected: PASS. Abrir de nuevo `app.html` en el navegador y probar a mano colapso, tooltip con Tab, hoja en 390px, notificaciones, toasts y confirmación.**
- [ ] **Step 5: Commit** `git commit -m "Framework-free shell behavior (collapse, sheet, popover, toasts, confirm)"`

---

### Task 5: Componentes Vue

**Files:**
- Create: `design/vue/{CapAppLayout,CapSidebar,CapSidebarItem,CapHeader,CapTabBar,CapMoreSheet,CapNotifications,CapToaster,CapConfirmDialog,CapLogin}.vue`, `design/vue/composables/{useSidebarCollapse,useFocusTrap,useToasts}.js`, `design/vue/types.js` (JSDoc de los tipos)
- Test: `tests/vue/*.test.mjs`

**Interfaces:**
- Consumes: `storage.js`, `collapse.js`, `focus-trap.js`, `toast-queue.js`, `theme.js` de Task 4; clases de Task 3 (el HTML generado debe coincidir con `reference/app.html` y `login.html`; los componentes no traen `<style>`).
- Tipos (JSDoc en `types.js`):
  - `MenuItem = { label: string, icon: string /* sin 'mdi-' */, href: string, active?: boolean, count?: number, urgent?: boolean, children?: { label: string, href: string, active?: boolean, swatch?: 'wine'|'red'|'red-400'|'taupe' }[] }`
  - `MenuGroup = { label: string, items: MenuItem[] }`
  - `ShellUser = { name: string, email: string, avatarUrl?: string }`
  - `Breadcrumb = { label: string, href?: string }`
  - `ShellNotification = { id: string, title: string, detail?: string, time: string, group: string, unread: boolean, alert?: boolean, icon: string }`
- `CapAppLayout` props (defaults entre paréntesis): `systemName: String` (req.), `menu: Array<MenuGroup>` (req.), `tabs: Array<MenuItem>` (`[]`; se muestran `tabs.slice(0, 4)` + «Más»), `user: ShellUser` (req.), `title: String` (req.), `breadcrumbs: Array<Breadcrumb>` (`[]`), `notifications: Array<ShellNotification>` (`[]`), `linkComponent: [String, Object]` (`'a'`), `fabLabel: String` (`''`; vacío = sin FAB). Slots: `default`, `search` (contenido del buscador), `header-actions`. Emits: `fab`, `logout`, `mark-all-read`, `notification` (id). Renderiza `CapSidebar`, `CapHeader`, `CapTabBar`, `CapMoreSheet`, `CapToaster`.
- `CapSidebar` props: `systemName`, `menu`, `user`, `linkComponent`; usa `useSidebarCollapse()`; emits `logout`.
- `CapHeader` props: `title`, `breadcrumbs`, `user`, `notifications`, `linkComponent`; slots `search`, `header-actions`; emits `mark-all-read`, `notification`. Contiene `CapNotifications` (props `notifications`; filtro Todas/No leídas interno; agrupa por `group` en el orden recibido).
- `CapTabBar` props: `tabs: Array<MenuItem>`, `linkComponent`; emits `more`.
- `CapMoreSheet` props: `open: Boolean`, `menu`, `user`, `linkComponent`; emits `close`, `logout`; usa `useFocusTrap`.
- `CapConfirmDialog` props: `open: Boolean` (false), `title: String` (req.), `message: String` (req.), `confirmLabel: String` (req.), `icon: String` (`'alert-outline'`), `acknowledgeLabel: String` (`''`; vacío = sin casilla), `loading: Boolean` (false). Emits: `confirm`, `cancel`.
- `CapLogin` props: `systemName` (req.), `tagline` (req.), `photoUrl: String` (`''`), `providers: Array<'microsoft'|'google'>` (`[]`), `helpEmail: String` (req.), `mode: 'login'|'recover'` (`'login'`), `alert: { status: 'error'|'ok', title: string, detail?: string } | null` (null), `loading: Boolean`. Emits: `submit({ email, password, remember })`, `provider(name)`, `recover(email)`, `back`. Logos de proveedor desde `design/logos/`.
- `useSidebarCollapse(): { collapsed: Ref<boolean>, toggle(): void }`; `useFocusTrap(containerRef: Ref<HTMLElement|null>, active: Ref<boolean>): void`; `useToasts(): { toasts: Readonly<Ref<Toast[]>>, show(options: ToastOptions): string, dismiss(id): void, pause(id), resume(id) }` (estado único a nivel de módulo; `CapToaster` lo renderiza).

- [ ] **Step 1: Pruebas que fallan** (`@vue/test-utils`, `mount`):
  - `app-layout.test.mjs`: **con 6 `tabs` renderiza 4 `.cap-shell-tabbar__tab` enlazadas + 1 botón «Más»**; el ítem con `active: true` tiene `aria-current="page"`; `linkComponent` personalizado (`defineComponent` stub) se usa para los enlaces; sin `fabLabel` no hay `.cap-shell-fab`.
  - `sidebar.test.mjs`: clic en colapsar ⇒ `data-collapsed="true"` y `aria-expanded="false"`; con `localStorage` que lanza, monta expandido a 1440px sin error; contador `urgent` lleva `--urgent`; etiquetas de grupo sin `text-transform` (la clase es `__group-label`).
  - `more-sheet.test.mjs`: abierto ⇒ `role="dialog"` y `aria-modal="true"`; Escape emite `close`.
  - `confirm-dialog.test.mjs`: con `acknowledgeLabel`, el botón de confirmar está `disabled` hasta marcar; foco inicial en «Cancelar» (`attachTo: document.body`); clic en fondo no emite `cancel`; Escape sí.
  - `toaster.test.mjs`: `useToasts().show` ×5 ⇒ 3 `.cap-toast` en el DOM.
  - `login.test.mjs`: con `providers: ['microsoft']` el botón ocupa ancho completo (`.cap-login__providers--single`); `loading` deshabilita «Ingresar»; `alert` error se muestra arriba del formulario con `role="alert"`; `submit` emite el payload; `mode: 'recover'` muestra «Recupera tu acceso» y «Volver a ingresar».
  - `parity.test.mjs`: el HTML de `CapAppLayout` con los datos de ejemplo de `reference/app.html` contiene las mismas clases `cap-shell-*` que el archivo de referencia (comparar conjuntos de clases, no texto).
- [ ] **Step 2: `npx vitest run tests/vue` — Expected: FAIL.**
- [ ] **Step 3: Implementar componentes y composables.** Íconos activos en variante rellena: si `icon` termina en `-outline`, el activo usa el nombre sin el sufijo.
- [ ] **Step 4: `npm test` — Expected: PASS.**
- [ ] **Step 5: Commit** `git commit -m "Vue shell, login, confirm and toaster components"`

---

### Task 6: Componentes Blade

**Files:**
- Create: `design/blade/components/cap/{app-layout,sidebar,sidebar-item,header,tab-bar,more-sheet,notifications,toaster,confirm-dialog,login,alert}.blade.php`
- Create (solo pruebas): `tests/blade/composer.json` (`illuminate/view`, `illuminate/filesystem`, `illuminate/events` en la última versión estable), `tests/blade/render.php`, `tests/blade.test.mjs`
- Modify: `.gitignore` (`tests/blade/vendor/`)

**Interfaces:**
- Consumes: HTML/atributos de Task 3 y Task 4 (`data-cap-*`); los componentes no traen `<script>` ni `<style>`: `shell-auto.js` lo importa la app (Task 8).
- Props (mismos nombres que Vue en kebab-case): `<x-cap.app-layout :system-name :menu :tabs :user :title :breadcrumbs :notifications fab-label>` con slots `$slot`, `search`, `headerActions`. Los ítems de menú son arrays con las claves de `MenuItem` más `route?: string`; `active` explícito manda; si no viene y hay `route`, `active = request()->routeIs($item['route'])` (solo si existe la función `request`).
- `<x-cap.toaster />` renderiza `[data-cap-toaster]` y, si `session('cap_toast')` existe (`['status','title','detail']`), un `[data-cap-toast]` inicial.
- `<x-cap.confirm-dialog id title message confirm-label icon acknowledge-label :action method>`: formulario `method=POST` + `@method($method)` hacia `$action`, para que confirmar envíe sin JS adicional.
- `<x-cap.login system-name tagline photo-url :providers help-email mode :alert>`: formulario `POST` a `route('login')` si existe la ruta, si no a `/login`; campos `email`, `password`, `remember`; proveedores enlazan a `route('auth.redirect', $provider)` si existe, si no `/auth/{provider}/redirect`.
- `render.php`: `php tests/blade/render.php <componente> '<json de props>'` imprime el HTML; registra el namespace anónimo `cap` apuntando a `design/blade/components/cap` y define stubs de `request()`, `route()`, `session()` y `old()`.

- [ ] **Step 1: `cd tests/blade && composer install`; pruebas que fallan en `tests/blade.test.mjs`** (ejecutan `render.php` con `execFileSync`):
  - **`tab-bar` con 6 pestañas ⇒ 4 enlaces + botón «Más»**.
  - ítem con `route: 'invoices.*'` y stub `routeIs` verdadero ⇒ `aria-current="page"`; `active: false` explícito gana al `route`.
  - `sidebar` tiene `data-cap-sidebar` y `[data-cap-collapse]` con `aria-expanded`.
  - `toaster` con sesión `cap_toast` ⇒ `[data-cap-toast][data-status="ok"]`.
  - `confirm-dialog` con `acknowledge-label` ⇒ `[data-cap-confirm-ack]` y botón aceptar `disabled`; `method="DELETE"` produce `_method`.
  - `login` con un solo proveedor ⇒ `.cap-login__providers--single`; `alert` error con `role="alert"`.
  - paridad: el conjunto de clases `cap-shell-*` de `app-layout` coincide con `reference/app.html` (misma prueba que Vue, mismo dato de ejemplo en `tests/fixtures/shell-sample.json`, que también usa la prueba de paridad de Vue).
- [ ] **Step 2: `npx vitest run tests/blade.test.mjs` — Expected: FAIL.**
- [ ] **Step 3: Implementar los componentes.**
- [ ] **Step 4: `npm test` — Expected: PASS.**
- [ ] **Step 5: Commit** `git commit -m "Blade shell, login, confirm and toaster components"`

---

### Task 7: Especificación agnóstica y guía de porte

**Files:**
- Create: `design/shell/SHELL_SPEC.md`
- Test: `tests/shell-spec.test.mjs`

**Interfaces:**
- Consumes: todo lo anterior. Es documentación; la prueba asegura que no quede desalineada.

Contenido de `SHELL_SPEC.md` (en español): anatomía de cada pieza (sidebar, header, topbar, tabbar, hoja, FAB, notificaciones, toasts, confirmación, aviso, acceso) con medidas, estados, puntos de quiebre, persistencia (`'cap-shell:sidebar-collapsed'`), teclado (Tab, Escape, ⌘K/Ctrl K), accesibilidad (roles y `aria-*` de Task 4), respaldos (sin `backdrop-filter`, reducir transparencia, reducir movimiento), tabla de atributos `data-cap-*` → módulo, y tabla de props Vue ↔ Blade. Referencia el HTML en `reference/` en vez de copiarlo. Secciones:
- «Portar a React»: pieza → componente, qué estado vive en el layout (colapsado, hoja abierta, toasts), importar `toast-queue.js`, `storage.js`, `collapse.js`, `focus-trap.js` y `theme.js` tal cual dentro de hooks (`useEffect` para enlazar/teardown); no reimplementar reglas. Activo y tipo de enlace los decide la app (como en Vue).
- «Portar a Astro»: copiar el HTML de `reference/` a `src/components/cap/*.astro` con props; `<script>import '../../design/shell-auto.js'</script>` una vez en el layout; activo con `Astro.url.pathname`.

- [ ] **Step 1: Prueba que falla** — `tests/shell-spec.test.mjs`: cada atributo `data-cap-*` que aparece en `design/shell.js` y cada prop declarada en `design/vue/CapAppLayout.vue` aparece mencionado en `SHELL_SPEC.md`; existen los encabezados `## Portar a React` y `## Portar a Astro`.
- [ ] **Step 2: `npx vitest run tests/shell-spec.test.mjs` — Expected: FAIL.**
- [ ] **Step 3: Escribir `SHELL_SPEC.md`.**
- [ ] **Step 4: `npm test` — Expected: PASS.**
- [ ] **Step 5: Commit** `git commit -m "Framework-agnostic shell spec with React and Astro porting guides"`

---

### Task 8: Instalador multi-stack

**Files:**
- Modify: `install.sh`
- Create: `scripts/install/patch-file.mjs` (helpers Node que hoy van en heredocs), `tests/install.test.mjs`

**Interfaces:**
- Consumes: estructura de `design/` de Tasks 1–7.
- `install.sh` detecta el stack en este orden: `artisan` ⇒ `laravel`; `package.json` con dependencia `astro` ⇒ `astro`; con `react` ⇒ `react`; si no, aborta con mensaje que lista los tres soportados. Variables: `CAP_DESIGN_SRC` (ya existe), `CAP_SKIP_NPM=1` (no corre `npm install`; lo usan las pruebas).
- `scripts/install/patch-file.mjs` CLI con subcomandos (cada uno idempotente; sale 0 = cambió, 3 = ya estaba, 2 = no aplicable):
  - `prepend-import <cssFile> <importPath>` (`@import '<path>';` al inicio)
  - `tailwind-preset <configFile> <presetPath> <contentGlob>` (lógica actual, generalizada; CommonJS ⇒ 2)
  - `head-snippet <layoutFile> <snippetName>` donde `snippetName` es `blade` (snippet actual) o `static` (script de tema + `<link>` a fonts.bunny.net con `fonts.webfont` de `tokens.json` resuelto en el texto)
  - `append-js-import <jsFile> <importPath>` y `astro-script <layoutFile> <importPath>` (`<script>import '<path>';</script>` antes de `</body>`)
- Rutas por stack:

| Paso | Laravel | React | Astro |
|---|---|---|---|
| `design/` → | `resources/design` | `src/design` | `src/design` |
| CSS global (primero que exista) | `resources/css/app.css` | `src/index.css`, `src/styles/globals.css`, `src/app/globals.css`, `app/globals.css` | `src/styles/global.css` |
| Imports CSS (relativos al CSS) | `tokens.css`, `shell.css`, MDI | igual | igual |
| JS de comportamiento | `import '../design/shell-auto.js'` en `resources/js/app.js` | ninguno (pendiente: «ver SHELL_SPEC › Portar a React») | `astro-script` en el layout |
| Componentes | `design/blade/components/cap` → `resources/views/components/cap` (se sobrescribe; avisar que no se edita); Vue se usa desde `resources/design/vue` | — | — |
| Layout `<head>` | `resources/views/app.blade.php` (snippet `blade`) | `index.html` (snippet `static`); si hay `app/layout.tsx` ⇒ pendiente | primer `src/layouts/*.astro` con `</head>` (snippet `static`) |
| `config/design.php` | sí | — | — |
| Tailwind | `tailwind.config.{js,mjs}` con preset `./resources/design/tailwind.preset.js` | igual con `./src/design/...` | igual con `./src/design/...` |
| Línea del agente | `resources/design/AGENTS.md` | `src/design/AGENTS.md` | `src/design/AGENTS.md` |

  El resumen final imprime el stack detectado y, para Laravel, cómo usar `<x-cap.app-layout>` y `import CapAppLayout from '@/../design/vue/CapAppLayout.vue'`.

- [ ] **Step 1: Pruebas que fallan en `tests/install.test.mjs`** — cada prueba crea un proyecto mínimo en un directorio temporal (`mkdtempSync`) y corre `bash install.sh` con `CAP_DESIGN_SRC=<repo>` y `CAP_SKIP_NPM=1`:
  - `laravel`: (`artisan`, `package.json` con `vue`, `tailwind.config.js` ESM, `resources/css/app.css`, `resources/js/app.js`, `resources/views/app.blade.php` con `</head>`) ⇒ existen `resources/design/shell.css` y `resources/views/components/cap/app-layout.blade.php`; `app.css` importa `tokens.css` y `shell.css`; `app.js` importa `shell-auto.js`; `config/design.php` existe.
  - `react`: (`package.json` con `react` y `vite`, `index.html`, `src/index.css`) ⇒ `src/design/` existe; `src/index.css` importa `./design/tokens.css` y `./design/shell.css`; `index.html` tiene el script de tema; no existe `config/` ni `resources/`; la salida contiene «Portar a React».
  - `astro`: (`package.json` con `astro`, `src/layouts/Layout.astro` con `</head>` y `</body>`, `src/styles/global.css`) ⇒ `global.css` importa `../design/shell.css`; el layout tiene el script de tema y `import '../design/shell-auto.js'`.
  - **idempotencia: correr dos veces cada uno ⇒ cada import y línea aparece exactamente una vez.**
  - proyecto sin `artisan` ni `react`/`astro` ⇒ código de salida ≠ 0 y mensaje con los tres stacks.
- [ ] **Step 2: `npx vitest run tests/install.test.mjs` — Expected: FAIL.**
- [ ] **Step 3: Implementar.** `install.sh` queda como orquestador por funciones (`detect_stack`, `install_laravel`, `install_react`, `install_astro`, `install_common`, `print_summary`), cada una corta; la manipulación de archivos vive en `patch-file.mjs`.
- [ ] **Step 4: `npm test` — Expected: PASS. Además `bash -n install.sh` sin errores.**
- [ ] **Step 5: Commit** `git commit -m "install.sh: support Laravel, React and Astro"`

---

### Task 9: Guía, instrucciones de agentes, README y versión

**Files:**
- Modify: `design/DESIGN_GUIDE.md`, `design/AGENTS.md`, `skills/cap-design/SKILL.md`, `README.md`, `CHANGELOG.md`, `.claude-plugin/plugin.json` (versión `2.0.0`, keywords + `blade`, `react`, `astro`), `.claude-plugin/marketplace.json` (tags)
- Test: `tests/docs.test.mjs`

Cambios de contenido (del spec, sección «Cambios en la guía y documentación»):
- `DESIGN_GUIDE.md`: «En una frase» nueva («Marco de vidrio ahumado flotando sobre un lienzo piedra, tarjetas blanco hueso, Inter y Poppins, y la escala de rojos de la marca con el rojo CAP como acento.»); tabla «Paleta» con los valores 2.0 claro/oscuro y escala de rojos; «Estructura de página» remite a `shell/SHELL_SPEC.md` y resume medidas; radios (control 14, tarjeta 20, marco 24, hoja/acceso 28; botones del sistema en píldora); elevación con el vidrio como nivel; regla del vidrio; «Pantalla de acceso» reescrita según el spec; modal, toasts y notificaciones con el nuevo aspecto (reglas de comportamiento sin cambio); «Tableros y tarjetas de datos» (tarjeta destacada vino permitida, una por fila; flecha ↗; alerta con `--cap-red-tint`); «Gráficas» (escala de rojos + topo); recetas nuevas: tarjeta de cifra normal/destacada/alerta, tarjeta de lista móvil, chips de filtro, contadores en mosaico; recetario de navegación ⇒ «usa el componente»; «Lo que no se hace»: quitar «tarjeta de color sólido» y acotar degradados a «solo los manchones del lienzo»; agregar «rearmar el marco a mano con Tailwind».
- `AGENTS.md` y `SKILL.md`: «En una frase» y resumen operativo actualizados; regla nueva: el marco, el acceso, la confirmación y los toasts se hacen **siempre** con el componente del stack (`<x-cap.*>` o `design/vue/Cap*.vue`) o, si no hay, siguiendo `shell/SHELL_SPEC.md`; checklist «antes de terminar» suma «sin `rgba(` a mano» y «revisada a <1024px».
- `README.md`: stacks soportados, tabla de contenido del paquete con `shell.css`, `shell.js`, `shell/SHELL_SPEC.md`, `vue/`, `blade/`; uso por stack (3–6 líneas cada uno).
- `CHANGELOG.md`: entrada `## 2.0.0 · <fecha>` con lo nuevo y «Migrar desde 1.x» (reglas reemplazadas: marco pegado ⇒ flotante; ítem activo rojo sólido ⇒ píldora con filo; tarjeta sólida prohibida ⇒ vino permitida; sin degradados ⇒ salvo manchones; `rounded-cap-card` 10 ⇒ 20; paleta neutra ⇒ cálida).

- [ ] **Step 1: Prueba que falla** — `tests/docs.test.mjs`: `plugin.json` y `tokens.json` dicen `2.0.0`; `CHANGELOG.md` empieza con `## 2.0.0`; `DESIGN_GUIDE.md` no contiene `#212121` ni «nunca una tarjeta de color sólido»; contiene `SHELL_SPEC.md`; cada hex de la tabla «Paleta» existe en `tokens.json`.
- [ ] **Step 2: `npx vitest run tests/docs.test.mjs` — Expected: FAIL.**
- [ ] **Step 3: Editar los documentos.**
- [ ] **Step 4: `npm test` — Expected: PASS.**
- [ ] **Step 5: Commit** `git commit -m "Design guide, agent instructions and README for 2.0.0"`

---

### Task 10: Revisión final, verificación visual y optimización

- [ ] **Step 1: `npm test` y `npm run contrast` — Expected: todo PASS.**
- [ ] **Step 2: Verificación visual completa** de `reference/app.html` y `reference/login.html` (1440/1100/390 px × claro/oscuro × reducir transparencia), con capturas. Comparar contra los bocetos; listar diferencias visibles (en particular el vidrio a 0.78).
- [ ] **Step 3: Instalar en un proyecto Laravel real o de prueba** (`laravel new` si está disponible; si no, el fixture de Task 8 con `npm run build` de Vite) y confirmar que `<x-cap.app-layout>` y `CapAppLayout.vue` renderizan con estilos. Si no se puede, decirlo en el informe.
- [ ] **Step 4: Revisión de la rama completa** (`superpowers:requesting-code-review`) y aplicar hallazgos.
- [ ] **Step 5: `/simplify` sobre el diff completo** (exigido por el CLAUDE.md del usuario: reutilización, simplificación, eficiencia, altitud). Presentar hallazgos, aplicarlos, `npm test`.
- [ ] **Step 6: Commit** `git commit -m "Review and simplify pass for 2.0.0"`. Sin push ni tag: el usuario decide.
