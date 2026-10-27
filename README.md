# CAP Design System

Identidad visual de Grupo CAP (manual de marca 2026) lista para instalar en cualquier sistema
interno, y para que el agente de IA de cada programador la aplique sola.

| Qué | Dónde |
|---|---|
| Guía de diseño (paleta, tipografía, componentes, estados, modo oscuro) | `design/DESIGN_GUIDE.md` |
| Tokens: la única fuente de colores y fuentes | `design/tokens.json` |
| Variables CSS `--cap-*` (generadas desde los tokens) | `design/tokens.css` |
| Preset de Tailwind con las clases `cap-*` | `design/tailwind.preset.js` |
| Plantilla de `config/design.php` para Laravel | `design/design.php` |
| Instrucciones para agentes (Codex, Cursor, Copilot, Gemini, Claude) | `design/AGENTS.md` |
| Skill de Claude Code | `skills/cap-design/SKILL.md` |

## Instalar en un proyecto (Laravel + Vue + Tailwind)

1. Copia la carpeta `design/` al proyecto:

   ```bash
   npx degit moniteck/cap-design-system/design resources/design
   ```

2. Tailwind: usa el preset en `tailwind.config.js`.

   ```js
   import cap from './resources/design/tailwind.preset.js';

   export default {
       presets: [cap],
       content: ['./resources/views/**/*.blade.php', './resources/js/**/*.{vue,js}'],
   };
   ```

3. CSS: importa las variables y la tipografía base en `resources/css/app.css`.

   ```css
   @import '../design/tokens.css';
   ```

4. Fuentes: en el layout principal (`app.blade.php`).

   ```blade
   <link rel="preconnect" href="https://fonts.bunny.net">
   <link href="https://fonts.bunny.net/css?family={{ config('design.fonts.webfont') }}&display=swap" rel="stylesheet">
   ```

5. PHP (PDF, correos, colores que salen del servidor): copia `resources/design/design.php` a
   `config/design.php` y usa `config('design.brand.red')`.

6. Gráficas y JS: `import tokens from '@/../design/tokens.json'` y `tokens.brand.red`.

7. Agentes de IA: agrega una línea al `AGENTS.md` o `CLAUDE.md` del proyecto (créalo si no existe):

   ```md
   Sigue `resources/design/AGENTS.md` y `resources/design/DESIGN_GUIDE.md` en toda interfaz.
   ```

Otros stacks (React, HTML, etc.): basta con `tokens.css`, `tokens.json` y la guía; el preset es
solo para Tailwind.

## Skill de Claude Code (opcional, una vez por máquina)

Con esto la guía se activa sola cada vez que se pida crear o revisar interfaz, en cualquier
proyecto, sin copiar archivos:

```text
/plugin marketplace add moniteck/cap-design-system
/plugin install cap-design@moniteck
```

El repo es privado: Claude Code usa las credenciales de git de la máquina (SSH o `gh auth login`
seguido de `gh auth setup-git`). Sin clave SSH: `export CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1`.

## Cuando cambie la marca

1. Edita `design/tokens.json` (y la guía si cambia una regla).
2. Regenera el CSS: `node scripts/build-tokens-css.mjs`.
3. Cada proyecto vuelve a correr el `degit` del paso 1 para traer la versión nueva; los usuarios
   del plugin lo actualizan con `/plugin marketplace update moniteck`.
