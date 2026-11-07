#!/usr/bin/env bash
# Instala o actualiza el design system de Grupo CAP en un proyecto Laravel, React o Astro.
#
# Desde la raíz del proyecto:
#   git clone --depth 1 git@github.com:Moniteck/cap-design-system.git /tmp/cap-design-system && bash /tmp/cap-design-system/install.sh
#
# Es idempotente: se puede correr de nuevo para actualizar. Solo toca lo que falta y lista lo que no
# pudo hacer solo. La carpeta design/ del proyecto se sobrescribe con la copia del paquete: no se edita.
# CAP_SKIP_NPM=1 omite `npm install` (lo usan las pruebas).
set -euo pipefail

REPO_SSH="git@github.com:Moniteck/cap-design-system.git"
SRC="${CAP_DESIGN_SRC:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
PROJECT="$(pwd)"
STACK=""
DESIGN_DIR=""
VERSION=""
PATCH_FILE=""
PACKAGE_DEPENDENCIES=""
PROTECTED_FOLDERS=""
TAILWIND_GLOB=""
GLOBAL_CSS_CANDIDATES=""
LAYOUT_CANDIDATES=""
LAYOUT_SNIPPET=""
LAYOUT_PENDING_HINT=""
LAYOUT_MISSING_TODO=""
USAGE_HINT=""
LAYOUT_FILE=""
DONE=()
SKIPPED=()
TODO=()

ok() { DONE+=("$1"); }
skip() { SKIPPED+=("$1"); }
todo() { TODO+=("$1"); }

read_package_dependencies() {
    [[ -f "$PROJECT/package.json" ]] || return 0
    PACKAGE_DEPENDENCIES="$(node -e "
const p = require(process.argv[1]);
for (const [name, version] of Object.entries({ ...p.devDependencies, ...p.dependencies })) console.log(name + '\\t' + version);
" "$PROJECT/package.json" 2>/dev/null || true)"
}

package_dependency_version() {
    awk -F'\t' -v name="$1" '$1 == name { print $2; exit }' <<< "$PACKAGE_DEPENDENCIES"
}

package_has_dependency() {
    [[ -n "$(package_dependency_version "$1")" ]]
}

detect_stack() {
    read_package_dependencies
    if [[ -f "$PROJECT/artisan" ]]; then STACK="laravel"
    elif package_has_dependency astro; then STACK="astro"
    elif package_has_dependency react; then STACK="react"
    else
        echo "✘ No reconozco el proyecto. Corre este script desde la raíz de un proyecto Laravel (./artisan), React (package.json con react) o Astro (package.json con astro)." >&2
        exit 1
    fi
}

configure_stack() {
    local import_root
    case $STACK in
        laravel)
            DESIGN_DIR="resources/design"
            import_root="@/../design"
            PROTECTED_FOLDERS="$DESIGN_DIR tokens.json
resources/views/components/cap app-layout.blade.php
public/cap/logos google.svg"
            TAILWIND_GLOB="./$DESIGN_DIR/**/*.{js,vue}"
            GLOBAL_CSS_CANDIDATES="resources/css/app.css"
            LAYOUT_CANDIDATES="resources/views/app.blade.php resources/views/layouts/app.blade.php"
            LAYOUT_SNIPPET="blade"
            LAYOUT_PENDING_HINT=" (README › Fuentes y modo oscuro)"
            LAYOUT_MISSING_TODO="Laravel no trae un layout raíz por defecto: pega en el <head> de tu layout el bloque de README › Fuentes y modo oscuro (script de tema y fuentes)."
            USAGE_HINT="Siguiente: npm run build (o npm run dev). En Blade: <x-cap.app-layout>. En Vue: import CapAppLayout from '$import_root/vue/CapAppLayout.vue'; statusBadgeClass() de '$import_root/statuses.js' y chartColors() de '$import_root/chart-colors.js'."
            ;;
        react)
            DESIGN_DIR="src/design"
            import_root="$DESIGN_DIR"
            GLOBAL_CSS_CANDIDATES="src/index.css src/styles/globals.css src/app/globals.css app/globals.css"
            LAYOUT_CANDIDATES="index.html"
            LAYOUT_SNIPPET="static"
            LAYOUT_PENDING_HINT=""
            LAYOUT_MISSING_TODO="No hay index.html: agrega en el <head> de tu layout el script de tema y el <link> de fuentes (README › Fuentes y modo oscuro)."
            ;;
        astro)
            DESIGN_DIR="src/design"
            import_root="$DESIGN_DIR"
            GLOBAL_CSS_CANDIDATES="src/styles/global.css"
            LAYOUT_CANDIDATES="$(cd "$PROJECT" && grep -l '</head>' src/layouts/*.astro 2>/dev/null | head -n 1 || true)"
            LAYOUT_SNIPPET="static-astro"
            LAYOUT_PENDING_HINT=""
            LAYOUT_MISSING_TODO="No encontré un layout en src/layouts/*.astro con </head>: agrega el script de tema, las fuentes y <script>import '../design/shell-auto.js';</script> a mano."
            ;;
    esac
    if [[ $STACK != laravel ]]; then
        PROTECTED_FOLDERS="$DESIGN_DIR tokens.json"
        TAILWIND_GLOB="./$DESIGN_DIR/**/*.js"
        USAGE_HINT="Siguiente: npm run build (o npm run dev). Guía en $DESIGN_DIR/DESIGN_GUIDE.md; statusBadgeClass() de '$import_root/statuses.js' y chartColors() de '$import_root/chart-colors.js'."
    fi
}

resolve_source() {
    if [[ ! -d "$SRC/design" ]]; then
        echo "→ Descargando el paquete…"
        SRC="$(mktemp -d)/cap-design-system"
        git clone --quiet --depth 1 "$REPO_SSH" "$SRC"
    fi
    VERSION="$(sed -n 's/^  "version": *"\([^"]*\)".*/\1/p' "$SRC/design/tokens.json")"
    PATCH_FILE="$SRC/scripts/install/patch-file.mjs"
}

# Corre un subcomando de patch-file.mjs y registra el resultado: 0 cambió, 3 ya estaba, 2 no aplica.
# Uso: patch_file "<hecho>" "<ya estaba>" "<pendiente>" <subcomando> <archivo> [args...]
patch_file() {
    local done_message="$1" present_message="$2" pending_message="$3"
    local status=0
    shift 3
    node "$PATCH_FILE" "$@" || status=$?
    case $status in
        0) ok "$done_message" ;;
        3) skip "$present_message" ;;
        2) todo "$pending_message" ;;
        *) echo "✘ Falló: patch-file.mjs $1" >&2; exit 1 ;;
    esac
}

relative_import_path() {
    local from_file="$1" target_file="$2" relative
    relative="$(node -p "require('path').relative(require('path').dirname(process.argv[1]), process.argv[2])" "$from_file" "$target_file")"
    if [[ $relative == .* ]]; then echo "$relative"; else echo "./$relative"; fi
}

first_existing_file() {
    local candidate
    for candidate in "$@"; do
        if [[ -f "$PROJECT/$candidate" ]]; then echo "$candidate"; return 0; fi
    done
    return 1
}

is_foreign_folder() {
    local folder="$PROJECT/$1" marker="$2"
    [[ -e $folder && ! -e "$folder/$marker" ]]
}

abort_if_foreign_folders() {
    local folder marker foreign=()
    while read -r folder marker; do
        if is_foreign_folder "$folder" "$marker"; then foreign+=("$folder"); fi
    done <<< "$PROTECTED_FOLDERS"
    [[ ${#foreign[@]} -eq 0 ]] && return 0
    echo "✘ Estas carpetas ya existen y no son del design system (les falta el archivo marcador); el instalador las sobrescribiría y no tocó nada:" >&2
    print_list "-" "${foreign[@]}" >&2
    echo "  Renómbralas o muévelas y vuelve a correr el instalador." >&2
    exit 1
}

copy_design_folder() {
    rm -rf "${PROJECT:?}/$DESIGN_DIR"
    mkdir -p "$(dirname "$PROJECT/$DESIGN_DIR")"
    cp -R "$SRC/design" "$PROJECT/$DESIGN_DIR"
    ok "$DESIGN_DIR/ (versión $VERSION)"
}

uses_tailwind_4() {
    local version css
    version="$(package_dependency_version tailwindcss)"
    if [[ -n $version ]]; then [[ $version =~ ^[^0-9]*4 ]]; return; fi
    css="$(find_global_css)" && grep -qE "@import[[:space:]]+['\"]tailwindcss['\"]" "$PROJECT/$css"
}

create_tailwind_config() {
    cat > "$PROJECT/tailwind.config.js" <<CONFIG
import cap from './$DESIGN_DIR/tailwind.preset.js';

export default {
    presets: [cap],
    content: [
        '$TAILWIND_GLOB',
    ],
};
CONFIG
    ok "tailwind.config.js creado con el preset"
}

patch_tailwind_config() {
    local config="$1" preset="./$DESIGN_DIR/tailwind.preset.js"
    if [[ $config == *.ts ]]; then
        todo "$config: agrega a mano \`import cap from '$preset'\`, \`presets: [cap]\` y '$TAILWIND_GLOB' en \`content\`."
        return
    fi
    patch_file \
        "$config: preset y glob de $DESIGN_DIR" \
        "$config ya usa el preset" \
        "$config usa CommonJS, o no tiene \`export default {\` o \`content: [\`: agrega a mano \`const cap = require('$preset')\`, \`presets: [cap]\` y '$TAILWIND_GLOB' en \`content\`." \
        tailwind-preset "$PROJECT/$config" "$preset" "$TAILWIND_GLOB"
}

find_tailwind_config() {
    first_existing_file tailwind.config.js tailwind.config.mjs tailwind.config.ts
}

patch_tailwind() {
    local config
    if config="$(find_tailwind_config)"; then
        patch_tailwind_config "$config"
    elif uses_tailwind_4; then
        create_tailwind_config
    else
        todo "No hay tailwind.config.{js,mjs,ts}: crea uno con \`presets: [cap]\` (ver README › Tailwind)."
    fi
}

link_tailwind_config() {
    local css config config_path
    uses_tailwind_4 && config="$(find_tailwind_config)" || return 0
    if ! css="$(find_global_css)"; then
        todo "Tailwind 4: agrega \`@config\` con la ruta relativa a $config en tu hoja global, después de los @import."
        return
    fi
    config_path="$(relative_import_path "$PROJECT/$css" "$PROJECT/$config")"
    patch_file "$css: @config de $config" "$css ya enlaza $config" \
        "$css ya tiene otro @config: agrega \`presets: [cap]\` en ese archivo." \
        tailwind-config-link "$PROJECT/$css" "$config_path"
}

# Cada import se antepone al archivo, así que se recorren al revés para que queden tokens → shell → íconos.
patch_global_css() {
    local css="$1" design_file import_path
    patch_file \
        "$css: @import de Material Design Icons" \
        "$css ya importa Material Design Icons" "" \
        prepend-import "$PROJECT/$css" "@mdi/font/css/materialdesignicons.min.css"
    for design_file in shell.css tokens.css; do
        import_path="$(relative_import_path "$PROJECT/$css" "$PROJECT/$DESIGN_DIR/$design_file")"
        patch_file "$css: @import de $design_file" "$css ya importa $design_file" "" \
            prepend-import "$PROJECT/$css" "$import_path"
    done
}

find_global_css() {
    first_existing_file $GLOBAL_CSS_CANDIDATES
}

install_global_css() {
    local css
    if css="$(find_global_css)"; then
        patch_global_css "$css"
    else
        todo "No encontré la hoja de estilos global: importa tokens.css y shell.css de $DESIGN_DIR/ en ella."
    fi
}

install_mdi_package() {
    if package_has_dependency "@mdi/font"; then
        skip "@mdi/font ya está en package.json"
    elif [[ ${CAP_SKIP_NPM:-0} == 1 ]]; then
        todo "Instala los íconos: npm install --save-dev @mdi/font"
    else
        (cd "$PROJECT" && npm install --silent --save-dev @mdi/font)
        ok "npm: @mdi/font instalado"
    fi
}

install_agent_line() {
    local line="Sigue \`$DESIGN_DIR/AGENTS.md\` y \`$DESIGN_DIR/DESIGN_GUIDE.md\` en toda interfaz."
    local found_instructions_file=0 name
    for name in AGENTS.md CLAUDE.md; do
        [[ -f "$PROJECT/$name" ]] || continue
        found_instructions_file=1
        if grep -q "$marker" "$PROJECT/$name"; then skip "$name ya remite a $guide"
        elif [[ $name == CLAUDE.md ]] && grep -qE '(^|[[:space:]])@(\./)?AGENTS\.md([[:space:]]|$)' "$PROJECT/$name" && grep -q "$marker" "$PROJECT/AGENTS.md" 2>/dev/null; then skip "CLAUDE.md incluye AGENTS.md, que ya remite a $guide"
        else printf "\n%s\n" "$line" >> "$PROJECT/$name"; ok "$name: línea hacia $guide"; fi
    done
    if [[ $found_instructions_file -eq 0 ]]; then
        printf "# Instrucciones para agentes\n\n%s\n" "$line" > "$PROJECT/AGENTS.md"
        ok "AGENTS.md creado con la línea hacia $guide"
    fi
}

install_common() {
    copy_design_folder
    patch_tailwind
    install_global_css
    link_tailwind_config
    install_mdi_package
}

install_laravel_components() {
    rm -rf "$PROJECT/resources/views/components/cap"
    mkdir -p "$PROJECT/resources/views/components"
    cp -R "$SRC/design/blade/components/cap" "$PROJECT/resources/views/components/cap"
    ok "resources/views/components/cap/ (se sobrescribe en cada corrida: no lo edites)"
    mkdir -p "$PROJECT/public/cap"
    rm -rf "$PROJECT/public/cap/logos"
    cp -R "$SRC/design/logos" "$PROJECT/public/cap/logos"
    ok "public/cap/logos/ (logos del acceso)"
}

install_laravel_config() {
    if [[ -f "$PROJECT/config/design.php" ]]; then
        skip "config/design.php ya existe"
    else
        mkdir -p "$PROJECT/config"
        cp "$SRC/design/design.php" "$PROJECT/config/design.php"
        ok "config/design.php"
    fi
}

install_layout() {
    if ! LAYOUT_FILE="$(first_existing_file $LAYOUT_CANDIDATES)"; then
        todo "$LAYOUT_MISSING_TODO"
        return
    fi
    patch_file "$LAYOUT_FILE: script de tema y fuentes" "$LAYOUT_FILE ya carga las fuentes del paquete" \
        "$LAYOUT_FILE no tiene <head>: agrega el script de tema y las fuentes a mano$LAYOUT_PENDING_HINT." \
        head-snippet "$PROJECT/$LAYOUT_FILE" "$LAYOUT_SNIPPET"
}

install_laravel_files() {
    local app_js="resources/js/app.js"
    if [[ -f "$PROJECT/$app_js" ]]; then
        patch_file "$app_js: import de shell-auto.js" "$app_js ya importa shell-auto.js" "" \
            append-js-import "$PROJECT/$app_js" "../design/shell-auto.js"
    else
        todo "No hay $app_js: importa '../design/shell-auto.js' en tu JS principal."
    fi
    install_layout
}

install_laravel() {
    install_common
    install_laravel_components
    install_laravel_config
    install_laravel_files
}

install_react() {
    install_common
remove_laravel_default_font() {
    local css vite_config
    if css="$(find_global_css)"; then
        patch_file "$css: quitada la fuente por defecto de Laravel" "$css no redefine font-sans" "" \
            remove-theme-font "$PROJECT/$css"
    fi
    if vite_config="$(first_existing_file vite.config.js vite.config.ts)"; then
        patch_file "$vite_config: quitada Instrument Sans" "$vite_config no descarga Instrument Sans" \
            "$vite_config: quita a mano la fuente Instrument Sans de \`fonts\`." \
            remove-vite-font "$PROJECT/$vite_config"
    fi
}

    todo "El comportamiento del marco (shell.js) no se instala solo en React: ver SHELL_SPEC › Portar a React ($DESIGN_DIR/shell/SHELL_SPEC.md)."
    if [[ -f "$PROJECT/app/layout.tsx" || -f "$PROJECT/src/app/layout.tsx" ]]; then
    remove_laravel_default_font
        todo "Next.js: agrega a mano el script de tema y las fuentes en app/layout.tsx (README › Fuentes y modo oscuro)."
    else
        install_layout
    fi
}

install_astro() {
    install_common
    install_layout
    [[ -n $LAYOUT_FILE ]] || return 0
    patch_file "$LAYOUT_FILE: script de shell-auto.js" "$LAYOUT_FILE ya importa shell-auto.js" \
        "$LAYOUT_FILE no tiene </body>: agrega <script>import '../design/shell-auto.js';</script> a mano." \
        astro-script "$PROJECT/$LAYOUT_FILE" "../design/shell-auto.js"
}

print_list() {
    local prefix="$1"
    shift
    local item
    for item in "$@"; do echo "  $prefix $item"; done
}

print_summary() {
    echo
    echo "CAP design system $VERSION (stack: $STACK)"
    print_list "✔" ${DONE[@]+"${DONE[@]}"}
    print_list "·" ${SKIPPED[@]+"${SKIPPED[@]}"}
    if [[ ${#TODO[@]} -gt 0 ]]; then
        echo
        echo "Pendiente a mano:"
        print_list "!" "${TODO[@]}"
    fi
    echo
    echo "$USAGE_HINT"
    echo "Claude Code (opcional, una vez por máquina): /plugin marketplace add moniteck/cap-design-system  →  /plugin install cap-design@moniteck"
}

main() {
    detect_stack
    configure_stack
    abort_if_foreign_folders
    resolve_source
    "install_$STACK"
    install_agent_line
    print_summary
}

main
