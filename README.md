# CAP Design System

Identidad visual de Grupo CAP (manual de marca 2026) lista para instalar en cualquier sistema
interno, y para que el agente de IA de cada programador la aplique sola.

## Instalar (un comando)

Desde la raíz de un proyecto Laravel + Vue + Tailwind, con tu clave SSH de GitHub (el repo es
privado):

```bash
git clone --depth 1 git@github.com:Moniteck/cap-design-system.git /tmp/cap-design-system && bash /tmp/cap-design-system/install.sh
```

El mismo comando sirve para **actualizar**: solo toca lo que falta y deja igual lo que ya está.
Al terminar imprime qué hizo y, si algo no pudo resolver solo (por ejemplo un
`tailwind.config.js` en CommonJS), lo lista como pendiente. Después: `npm run build` o `npm run dev`.

Qué hace el instalador:

1. Copia `design/` a `resources/design/` (tokens, guía, preset, CSS, helpers). Esa carpeta no se edita.
2. Agrega el preset `cap-*` a `tailwind.config.js` y el glob `resources/design/**/*.js` a `content`.
3. Importa `tokens.css` y los íconos Material Design al inicio de `resources/css/app.css`, e instala `@mdi/font`.
4. Crea `config/design.php` para usar los tokens en PHP (`config('design.brand.red')`).
5. Pone en el `<head>` de `app.blade.php` el script del modo oscuro (sin parpadeo) y las fuentes Inter y Poppins.
6. Agrega al `AGENTS.md` y `CLAUDE.md` del proyecto la línea que manda al agente a seguir la guía (crea `AGENTS.md` si no hay ninguno).

Otros stacks (React, HTML, etc.): copia `design/` y usa `tokens.css`, `tokens.json` y la guía; el
preset y los helpers son para Tailwind y Vue.

## Qué hay en el paquete

| Qué | Dónde |
|---|---|
| Guía de diseño (paleta, tipografía, componentes, recetario, movimiento, estados, modo oscuro) | `design/DESIGN_GUIDE.md` |
| Tokens: la única fuente de colores, fuentes y movimiento | `design/tokens.json` |
| Variables CSS `--cap-*` y tipografía base (generadas desde los tokens) | `design/tokens.css` |
| Preset de Tailwind con las clases `cap-*` | `design/tailwind.preset.js` |
| Helpers para Vue: clases de badges de estado y colores de gráficas | `design/statuses.js`, `design/chart-colors.js` |
| Plantilla de `config/design.php` para Laravel | `design/design.php` |
| Instrucciones para agentes (Codex, Cursor, Copilot, Gemini, Claude) | `design/AGENTS.md` |
| Skill de Claude Code | `skills/cap-design/SKILL.md` |
| Instalador | `install.sh` |

En Vue: badges con `import { statusBadgeClass } from '@/../design/statuses.js'` y gráficas con
`import { chartColors } from '@/../design/chart-colors.js'`.

## Skill de Claude Code (opcional, una vez por máquina)

Con esto la guía se activa sola cada vez que se pida crear o revisar interfaz, en cualquier
proyecto, sin copiar archivos:

```text
/plugin marketplace add moniteck/cap-design-system
/plugin install cap-design@moniteck
```

Claude Code usa las credenciales de git de la máquina (clave SSH, o `gh auth login` seguido de
`gh auth setup-git`). Sin clave SSH: `export CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1`.

## Cuando cambie la marca

1. Edita `design/tokens.json` (y la guía si cambia una regla) y sube `version`: parche = un hex o un
   texto; menor = token, clase o helper nuevo; mayor = clase o variable renombrada o eliminada.
2. Regenera el CSS: `node scripts/build-tokens-css.mjs`. Anota el cambio en `CHANGELOG.md`.
3. Cada proyecto vuelve a correr el comando de instalación. Para saber qué versión tiene:
   `node -p "require('./resources/design/tokens.json').version"`. Los usuarios del plugin:
   `/plugin marketplace update moniteck`.

## Instalación manual

Si prefieres hacerlo a mano o el instalador dejó algo pendiente:

- `tailwind.config.js`: `import cap from './resources/design/tailwind.preset.js'` y `presets: [cap]`
  (el preset ya trae `darkMode: 'class'` y el remapeo de grises); `'./resources/design/**/*.js'` en `content`.
- `resources/css/app.css`, primera línea: `@import '../design/tokens.css';` y
  `@import '@mdi/font/css/materialdesignicons.min.css';` (`npm i -D @mdi/font`).
- `config/design.php`: copia de `resources/design/design.php`.
- `app.blade.php`, en el `<head>`:

  ```blade
  <script>
      const theme = localStorage.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
  </script>
  <link rel="preconnect" href="https://fonts.bunny.net">
  <link href="https://fonts.bunny.net/css?family={{ config('design.fonts.webfont') }}&display=swap" rel="stylesheet">
  ```

- `AGENTS.md` o `CLAUDE.md`: «Sigue `resources/design/AGENTS.md` y `resources/design/DESIGN_GUIDE.md` en toda interfaz.»
