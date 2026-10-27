#!/usr/bin/env bash
# Instala o actualiza el design system de Grupo CAP en un proyecto Laravel + Vue + Tailwind.
#
# Desde la raíz del proyecto:
#   git clone --depth 1 git@github.com:Moniteck/cap-design-system.git /tmp/cap-design-system && bash /tmp/cap-design-system/install.sh
#
# Es idempotente: se puede correr de nuevo para actualizar. Solo toca lo que falta y lista lo que no
# pudo hacer solo. No edita nada dentro de resources/design/ (se sobrescribe con la copia del paquete).
set -euo pipefail

REPO_SSH="git@github.com:Moniteck/cap-design-system.git"
SRC="${CAP_DESIGN_SRC:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
PROJECT="$(pwd)"
DONE=()
SKIPPED=()
TODO=()

ok() { DONE+=("$1"); }
skip() { SKIPPED+=("$1"); }
todo() { TODO+=("$1"); }

if [[ ! -f "$PROJECT/artisan" ]]; then
    echo "✘ Corre este script desde la raíz de un proyecto Laravel (no encuentro ./artisan)." >&2
    exit 1
fi
if [[ ! -d "$SRC/design" ]]; then
    echo "→ Descargando el paquete…"
    SRC="$(mktemp -d)/cap-design-system"
    git clone --quiet --depth 1 "$REPO_SSH" "$SRC"
fi
VERSION="$(node -p "require('$SRC/design/tokens.json').version")"

# 1. Carpeta design/
rm -rf "$PROJECT/resources/design"
cp -R "$SRC/design" "$PROJECT/resources/design"
ok "resources/design/ (versión $VERSION)"

# 2. Tailwind: preset + glob de resources/design
TW="$PROJECT/tailwind.config.js"
if [[ ! -f "$TW" ]]; then
    todo "No hay tailwind.config.js: crea uno con \`presets: [cap]\` (ver README › Tailwind)."
elif grep -q "design/tailwind.preset" "$TW"; then
    skip "tailwind.config.js ya usa el preset"
elif grep -q "module.exports" "$TW"; then
    todo "tailwind.config.js usa CommonJS: agrega a mano \`const cap = require('./resources/design/tailwind.preset.js')\` y \`presets: [cap]\`."
else
    node - "$TW" <<'EOF'
const fs = require('fs');
const [file] = process.argv.slice(2);
let s = fs.readFileSync(file, 'utf8');
const importLine = "import cap from './resources/design/tailwind.preset.js';\n";
const imports = [...s.matchAll(/^import .*;$/gm)];
s = imports.length ? s.slice(0, imports.at(-1).index + imports.at(-1)[0].length) + '\n' + importLine.trimEnd() + s.slice(imports.at(-1).index + imports.at(-1)[0].length) : importLine + s;
s = s.replace(/export default\s*\{/, (m) => `${m}\n    presets: [cap],`);
if (!s.includes("resources/design/**/*.js")) {
    s = s.replace(/content:\s*\[/, (m) => `${m}\n        './resources/design/**/*.js',`);
}
fs.writeFileSync(file, s);
EOF
    ok "tailwind.config.js: preset y glob de resources/design"
fi

# 3. CSS: tokens.css e íconos
CSS="$PROJECT/resources/css/app.css"
if [[ ! -f "$CSS" ]]; then
    todo "No hay resources/css/app.css: importa '../design/tokens.css' en tu hoja principal."
else
    if grep -q "design/tokens.css" "$CSS"; then
        skip "app.css ya importa tokens.css"
    else
        printf "@import '../design/tokens.css';\n%s\n" "$(cat "$CSS")" > "$CSS"
        ok "app.css: @import de tokens.css"
    fi
    if grep -q "materialdesignicons" "$CSS"; then
        skip "app.css ya importa Material Design Icons"
    else
        printf "@import '@mdi/font/css/materialdesignicons.min.css';\n%s\n" "$(cat "$CSS")" > "$CSS"
        ok "app.css: @import de Material Design Icons"
    fi
fi

# 4. Íconos (dependencia npm)
if node -e "const p=require('./package.json');process.exit((p.dependencies||{})['@mdi/font']||(p.devDependencies||{})['@mdi/font']?0:1)" 2>/dev/null; then
    skip "@mdi/font ya está en package.json"
else
    npm install --silent --save-dev @mdi/font
    ok "npm: @mdi/font instalado"
fi

# 5. config/design.php
if [[ -f "$PROJECT/config/design.php" ]]; then
    skip "config/design.php ya existe"
else
    cp "$SRC/design/design.php" "$PROJECT/config/design.php"
    ok "config/design.php"
fi

# 6. Layout: fuentes y modo oscuro
BLADE="$PROJECT/resources/views/app.blade.php"
if [[ ! -f "$BLADE" ]]; then
    todo "No hay resources/views/app.blade.php: agrega en el <head> de tu layout el script de tema y el <link> de fuentes (README › Fuentes y modo oscuro)."
elif grep -q "design.fonts.webfont" "$BLADE"; then
    skip "app.blade.php ya carga las fuentes del paquete"
else
    node - "$BLADE" <<'EOF'
const fs = require('fs');
const [file] = process.argv.slice(2);
let s = fs.readFileSync(file, 'utf8');
const headMatch = s.match(/^([ \t]*)<\/head>/m);
if (!headMatch) process.exit(2);
const indent = headMatch[1] + '    ';
const head = [
    '<!-- Grupo CAP design system: tema sin parpadeo y fuentes -->',
    '<script>',
    "    const theme = localStorage.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');",
    "    document.documentElement.classList.toggle('dark', theme === 'dark');",
    '</script>',
    '<link rel="preconnect" href="https://fonts.bunny.net">',
    '<link href="https://fonts.bunny.net/css?family={{ config(\'design.fonts.webfont\') }}&display=swap" rel="stylesheet">',
].map((line) => indent + line).join('\n');
s = s.replace(/^[ \t]*<link[^>]*fonts\.bunny\.net[^>]*>[ \t]*\n/gm, '');
s = s.replace(/^([ \t]*)<\/head>/m, `${head}\n$1</head>`);
fs.writeFileSync(file, s);
EOF
    if [[ $? -eq 0 ]]; then ok "app.blade.php: script de tema y fuentes"; else todo "app.blade.php no tiene </head>: agrega el script de tema y las fuentes a mano."; fi
fi

# 7. Instrucciones para el agente
LINE="Sigue \`resources/design/AGENTS.md\` y \`resources/design/DESIGN_GUIDE.md\` en toda interfaz."
added=0
for f in AGENTS.md CLAUDE.md; do
    if [[ -f "$PROJECT/$f" ]]; then
        if grep -q "resources/design/AGENTS.md" "$PROJECT/$f"; then skip "$f ya remite a la guía"; else printf "\n%s\n" "$LINE" >> "$PROJECT/$f"; ok "$f: línea hacia la guía"; fi
        added=1
    fi
done
if [[ $added -eq 0 ]]; then
    printf "# Instrucciones para agentes\n\n%s\n" "$LINE" > "$PROJECT/AGENTS.md"
    ok "AGENTS.md creado"
fi

# Resumen
echo
echo "CAP design system $VERSION"
for i in ${DONE[@]+"${DONE[@]}"}; do echo "  ✔ $i"; done
for i in ${SKIPPED[@]+"${SKIPPED[@]}"}; do echo "  · $i"; done
if [[ ${#TODO[@]} -gt 0 ]]; then
    echo
    echo "Pendiente a mano:"
    for i in ${TODO[@]+"${TODO[@]}"}; do echo "  ! $i"; done
fi
echo
echo "Siguiente: npm run build (o npm run dev). En Vue: statusBadgeClass() de '@/../design/statuses.js' y chartColors() de '@/../design/chart-colors.js'."
echo "Claude Code (opcional, una vez por máquina): /plugin marketplace add moniteck/cap-design-system  →  /plugin install cap-design@moniteck"
