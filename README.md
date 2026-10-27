# CAP Design System

Identidad visual de Grupo CAP (manual de marca 2026) lista para instalar en cualquier sistema
interno, y para que el agente de IA de cada programador la aplique sola.

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

## Instalar en un proyecto (Laravel + Vue + Tailwind)

1. Copia la carpeta `design/` al proyecto. El repo es privado, así que se usa tu clave SSH de
   GitHub (la misma que usas para clonar los proyectos de Moniteck):

   ```bash
   git clone --depth 1 git@github.com:Moniteck/cap-design-system.git /tmp/cap-design-system \
     && rm -rf resources/design && cp -R /tmp/cap-design-system/design resources/design \
     && rm -rf /tmp/cap-design-system
   ```

   Para actualizar, el mismo comando. No edites nada dentro de `resources/design/`: se sobrescribe.

2. Tailwind: añade el preset a tu `tailwind.config.js`. No hace falta `darkMode` ni remapear
   grises, el preset ya lo trae. Incluye `resources/design/**/*.js` en `content` para que las
   clases de `statuses.js` se generen.

   ```js
   import cap from './resources/design/tailwind.preset.js';

   export default {
       presets: [cap],
       content: [
           './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
           './storage/framework/views/*.php',
           './resources/views/**/*.blade.php',
           './resources/js/**/*.{vue,js}',
           './resources/design/**/*.js',
       ],
   };
   ```

3. CSS: en la **primera línea** de `resources/css/app.css`, antes de `@tailwind base`:

   ```css
   @import '../design/tokens.css';
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. Íconos (Material Design Icons): `npm i @mdi/font` y, junto al import anterior,
   `@import '@mdi/font/css/materialdesignicons.min.css';`. Uso:
   `<i class="mdi mdi-account-outline text-xl"></i>`.

5. PHP: copia `resources/design/design.php` a `config/design.php`. Expone los tokens al servidor
   (`config('design.brand.red')`, `config('design.fonts.webfont')`) para PDF, correos y el layout.

6. Fuentes y modo oscuro, en el `<head>` del layout principal (`app.blade.php`):

   ```blade
   <script>
       const theme = localStorage.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
       document.documentElement.classList.toggle('dark', theme === 'dark');
   </script>
   <link rel="preconnect" href="https://fonts.bunny.net">
   <link href="https://fonts.bunny.net/css?family={{ config('design.fonts.webfont') }}&display=swap" rel="stylesheet">
   ```

7. Vue: badges con `import { statusBadgeClass } from '@/../design/statuses.js'` y gráficas con
   `import { chartColors } from '@/../design/chart-colors.js'`.

8. Agentes de IA: agrega una línea al `AGENTS.md` o `CLAUDE.md` del proyecto (créalo si no existe):

   ```md
   Sigue `resources/design/AGENTS.md` y `resources/design/DESIGN_GUIDE.md` en toda interfaz.
   ```

Otros stacks (React, HTML, etc.): basta con `tokens.css`, `tokens.json` y la guía; el preset y los
helpers son para Tailwind y Vue.

## Skill de Claude Code (opcional, una vez por máquina)

Con esto la guía se activa sola cada vez que se pida crear o revisar interfaz, en cualquier
proyecto, sin copiar archivos:

```text
/plugin marketplace add moniteck/cap-design-system
/plugin install cap-design@moniteck
```

El repo es privado: Claude Code usa las credenciales de git de la máquina (clave SSH, o
`gh auth login` seguido de `gh auth setup-git`). Sin clave SSH:
`export CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1`.

## Cuando cambie la marca

1. Edita `design/tokens.json` (y la guía si cambia una regla) y sube `version`: parche = un hex o un
   texto; menor = token, clase o helper nuevo; mayor = clase o variable renombrada o eliminada.
2. Regenera el CSS: `node scripts/build-tokens-css.mjs`. Anota el cambio en `CHANGELOG.md`.
3. Cada proyecto repite el comando del paso 1 de instalación. Para saber qué versión tiene:
   `node -p "require('./resources/design/tokens.json').version"`. Los usuarios del plugin:
   `/plugin marketplace update moniteck`.
