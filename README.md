# CAP Design System

Identidad visual de Grupo CAP (manual de marca 2026) lista para instalar en cualquier sistema
interno, y para que el agente de IA de cada programador la aplique sola.

## Stacks soportados

| Stack | Se detecta por | Carpeta de `design/` | Marco y acceso |
|---|---|---|---|
| Laravel + Blade | `artisan` | `resources/design/` | Componentes listos `<x-cap.*>` |
| Laravel + Vue | `artisan` | `resources/design/` | Componentes listos `design/vue/Cap*.vue` |
| React (Vite, Next.js…) | `package.json` con `react` | `src/design/` | `shell.css` + `shell/SHELL_SPEC.md` («Portar a React») |
| Astro | `package.json` con `astro` | `src/design/` | `shell.css` + `shell-auto.js` + `shell/SHELL_SPEC.md` («Portar a Astro») |

## Instalar (un comando)

Desde la raíz de un proyecto Laravel, React o Astro con Tailwind, con tu clave SSH de GitHub (el
repo es privado):

```bash
git clone --depth 1 git@github.com:Moniteck/cap-design-system.git /tmp/cap-design-system && bash /tmp/cap-design-system/install.sh
```

El mismo comando sirve para **actualizar**: solo toca lo que falta y deja igual lo que ya está,
salvo las carpetas del paquete, que se sobrescriben (no se editan). Al terminar imprime qué hizo y,
si algo no pudo resolver solo, lo lista como pendiente. Después: `npm run build` o `npm run dev`.

**Aborta sin tocar nada** si una carpeta de destino ya existe y no es del design system. Renómbrala
o muévela y vuelve a correr el comando:

- Laravel: `resources/design`, `resources/views/components/cap` y `public/cap/logos`.
- React y Astro: `src/design`.

Qué hace en todos los stacks:

1. Copia `design/` a `resources/design/` (Laravel) o `src/design/` (React y Astro): tokens, guía, preset, `shell.css`, `shell.js`, componentes Vue, helpers y logos.
2. Agrega el preset `cap-*` a `tailwind.config.js` y el glob de `design/` a `content`. Con **Tailwind 4** (el defecto de Laravel 13), que detecta por `tailwindcss` ^4 en `package.json` o por `@import 'tailwindcss'` en la hoja global, además crea `tailwind.config.js` si no existe y agrega `@config` a la hoja global: sin esa línea Tailwind 4 ignora el preset, y no existen las clases `cap-*` ni `dark:` por clase.
3. Importa, en este orden, `tokens.css`, `shell.css` y los íconos Material Design en la hoja global (e instala `@mdi/font`).
4. Agrega al `AGENTS.md` y `CLAUDE.md` del proyecto la línea que manda al agente a seguir la guía (crea `AGENTS.md` si no hay ninguno; si `CLAUDE.md` solo incluye `@AGENTS.md`, no la repite).

Y, según el stack:

- **Laravel**: copia los componentes Blade a `resources/views/components/cap/` y los logos a `public/cap/logos/`; crea `config/design.php` (`config('design.brand.red')`); importa `shell-auto.js` en `resources/js/app.js`; pone en `resources/views/app.blade.php` o `resources/views/layouts/app.blade.php` el script del modo oscuro (sin parpadeo) y las fuentes; y copia el estándar de base de datos a `database/DATABASE_GUIDE.md` con su línea en `AGENTS.md`.
- **React**: pone el script del modo oscuro y las fuentes en `index.html` (Vite).
- **Astro**: pone el script del modo oscuro y las fuentes en el layout de `src/layouts/` y agrega el `<script>` de `shell-auto.js`.

Pendiente a mano, que el instalador lista cuando aplica:

- **React**: el comportamiento del marco (`shell.js`) no se instala solo; se porta con los hooks de «Portar a React» en `shell/SHELL_SPEC.md`.
- **Next.js**: el script del modo oscuro y las fuentes van a mano en `app/layout.tsx` (ver «Fuentes y modo oscuro»).
- **Laravel sin layout raíz** (Laravel 13 no trae ninguno): se pega en el `<head>` de tu layout el bloque de «Fuentes y modo oscuro».
- Un `tailwind.config.ts`, un `tailwind.config.js` en CommonJS o sin `export default {` o `content: [`, o una hoja global que no encuentre.

## Qué hay en el paquete

| Qué | Dónde |
|---|---|
| Guía de diseño (paleta, regla del vidrio, estructura de página, componentes, recetario, movimiento, estados, modo oscuro) | `design/DESIGN_GUIDE.md` |
| Tokens: la única fuente de colores, vidrio, radios, fuentes y movimiento | `design/tokens.json` |
| Variables CSS `--cap-*` y tipografía base (generadas desde los tokens) | `design/tokens.css` |
| Preset de Tailwind con las clases `cap-*` | `design/tailwind.preset.js` |
| CSS del marco, el acceso y los avisos en clases `.cap-*` (único para todos los stacks) | `design/shell.css` (importa `design/shell/css/*.css`) |
| Comportamiento del marco sin framework (colapsar, hoja «Más», toasts, ⌘K) | `design/shell.js`, `design/shell-auto.js` |
| Especificación del marco, HTML de referencia y guías «Portar a React» y «Portar a Astro» | `design/shell/SHELL_SPEC.md`, `design/shell/reference/` |
| Componentes Vue del marco (`<script setup>`) | `design/vue/` |
| Componentes Blade del marco (`<x-cap.*>`) | `design/blade/components/cap/` |
| Helpers: clases de badges de estado y colores de gráficas | `design/statuses.js`, `design/chart-colors.js` |
| Plantilla de `config/design.php` para Laravel | `design/design.php` |
| Logos oficiales de terceros a color (Microsoft, Google) para el acceso | `design/logos/` |
| Instrucciones para agentes (Codex, Cursor, Copilot, Gemini, Claude) | `design/AGENTS.md` |
| Estándar de base de datos (nombres, tipos, auditoría, borrado lógico, índices, migraciones, checklist) para MySQL y PostgreSQL | `database/DATABASE_GUIDE.md` |
| Skills de Claude Code: interfaz y base de datos | `skills/cap-design/SKILL.md`, `skills/cap-database/SKILL.md` |
| Instalador | `install.sh` |

`package.json`, `tests/` y `vitest.config.mjs` son solo para probar este repo; el instalador no los
copia. Para correr las pruebas: `npm install`, `npm run test:setup` (una vez: `composer install` en
`tests/blade`, para las de Blade) y `npm test`.

## Uso por stack

**Laravel + Blade**: el layout de cada página es el marco.

```blade
<x-cap.app-layout system-name="Mi sistema" :menu="$menu" :user="$user" title="Facturas">
    …contenido…
</x-cap.app-layout>
```

`<x-cap.login>`, `<x-cap.confirm-dialog>`, `<x-cap.alert>` y `window.capToast(...)` completan el
conjunto. «Cerrar sesión» envía un POST a `route('logout')` o `/logout` (cámbialo con
`logout-action`) y «Marcar todo como leído» aparece al pasar `mark-read-action`. Las props están en
`shell/SHELL_SPEC.md` › «Props: Vue y Blade».

**Laravel + Vue**: `import CapAppLayout from '@/../design/vue/CapAppLayout.vue'` (también `CapLogin`,
`CapConfirmDialog` y `useToasts()`). Requiere Vue 3.5 o superior. Con Inertia se usa como layout
persistente y se pasa `linkComponent`; con vue-router, `:link-component="RouterLink"` y
`link-prop="to"`. El ítem activo lo marca cada sistema con `active`.

**React**: `shell.css` ya da todo el aspecto; la estructura sale del HTML de
`design/shell/reference/app.html` y el comportamiento se porta con los hooks de «Portar a React».

**Astro**: el HTML de referencia se vuelve componentes `.astro` y `shell-auto.js` se carga una sola
vez en el layout («Portar a Astro»).

En todos los stacks, el contenido de la página (tarjetas, tablas, formularios) se escribe con las
clases de Tailwind `cap-*` del recetario de la guía. Badges con
`import { statusBadgeClass } from '@/../design/statuses.js'` y gráficas con
`import { chartColors } from '@/../design/chart-colors.js'` (ajusta la ruta: `@/design/…` en React
y Astro).

## Base de datos

`database/DATABASE_GUIDE.md` es el estándar de esquema de todo sistema nuevo: identificadores en
inglés y `snake_case`, tablas en plural, `id` `BIGINT` y `{tabla}_id`, columnas de auditoría con los
nombres de Eloquent, borrado lógico con `deleted_at`, tipos de dato por dominio, índices,
catálogos, migraciones y un checklist de revisión para cada PR, con un ejemplo completo en MySQL,
PostgreSQL y migración de Laravel. En Laravel el instalador lo copia a `database/DATABASE_GUIDE.md`
(se sobrescribe al actualizar: los cambios se proponen en este repositorio). En proyectos sin
Laravel, cópialo a mano y remite a él desde `AGENTS.md`.

## Skills de Claude Code (opcional, una vez por máquina)

Con esto las guías se activan solas cada vez que se pida crear o revisar interfaz (`cap-design`)
o tocar el esquema de base de datos (`cap-database`), en cualquier proyecto, sin copiar archivos:

```text
/plugin marketplace add moniteck/cap-design-system
/plugin install cap-design@moniteck
```

Claude Code usa las credenciales de git de la máquina (clave SSH, o `gh auth login` seguido de
`gh auth setup-git`). Sin clave SSH: `export CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1`.

## Cuando cambie la marca

1. Edita `design/tokens.json` (y la guía si cambia una regla) y sube `version`: parche = un hex o un
   texto; menor = token, clase o helper nuevo; mayor = clase o variable renombrada o eliminada.
2. Regenera el CSS: `node scripts/build-tokens-css.mjs` y corre `npm test` (incluye el contraste AA).
   Anota el cambio en `CHANGELOG.md`.
3. Cada proyecto vuelve a correr el comando de instalación. Para saber qué versión tiene:
   `node -p "require('./resources/design/tokens.json').version"`. Los usuarios del plugin:
   `/plugin marketplace update moniteck`.

## Instalación manual

Si prefieres hacerlo a mano o el instalador dejó algo pendiente (en React y Astro, `src/design/` en
lugar de `resources/design/`):

### Tailwind

- `tailwind.config.js`: `import cap from './resources/design/tailwind.preset.js'` y `presets: [cap]`
  (el preset ya trae `darkMode: 'class'` y el remapeo de grises); en `content`, `'./resources/design/**/*.{js,vue}'` en Laravel o `'./src/design/**/*.js'` en React y Astro.
- Hoja global (`resources/css/app.css` en Laravel), primeras líneas: `@import '../design/tokens.css';`,
  `@import '../design/shell.css';` y `@import '@mdi/font/css/materialdesignicons.min.css';`
  (`npm i -D @mdi/font`). Ajusta la ruta relativa a `design/`.
- Tailwind 4: en la hoja global, después de los `@import`, `@config '../../tailwind.config.js';` (ruta relativa a esa hoja).
- Laravel: `config/design.php` (copia de `resources/design/design.php`) y `import '../design/shell-auto.js';` en `resources/js/app.js`.

### Fuentes y modo oscuro

- En el `<head>` del layout raíz (`app.blade.php`, `layouts/app.blade.php`, `index.html`, `app/layout.tsx` o el layout de Astro):

  ```blade
  <script>
      let storedTheme;
      try { storedTheme = localStorage.theme; } catch { storedTheme = undefined; }
      const theme = storedTheme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
  </script>
  <link rel="preconnect" href="https://fonts.bunny.net">
  <link href="https://fonts.bunny.net/css?family={{ config('design.fonts.webfont') }}&display=swap" rel="stylesheet">
  ```

  Fuera de Blade, la URL de las fuentes es `https://fonts.bunny.net/css?family=` + `fonts.webfont` de `tokens.json`.

### Instrucciones para agentes

- `AGENTS.md` o `CLAUDE.md`: «Sigue `resources/design/AGENTS.md` y `resources/design/DESIGN_GUIDE.md` en toda interfaz.» y, en Laravel, «Sigue `database/DATABASE_GUIDE.md` en toda migración, seeder, modelo, vista, procedimiento o consulta SQL.»
