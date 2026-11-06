#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const EXIT_CHANGED = 0;
const EXIT_INAPPLICABLE = 2;
const EXIT_ALREADY_PRESENT = 3;

const CHANGED = 'changed';
const ALREADY_PRESENT = 'already-present';
const INAPPLICABLE = 'inapplicable';

const THEME_SNIPPET_MARKER = 'Grupo CAP design system: tema sin parpadeo y fuentes';

function webfontFamilies() {
  const tokensFile = fileURLToPath(new URL('../../design/tokens.json', import.meta.url));
  return JSON.parse(readFileSync(tokensFile, 'utf8')).fonts.webfont;
}

function editFile(file, transform) {
  const original = readFileSync(file, 'utf8');
  const result = transform(original);
  if (result === ALREADY_PRESENT || result === INAPPLICABLE) return result;
  writeFileSync(file, result);
  return CHANGED;
}

function designRelativeTail(importPath) {
  const designIndex = importPath.indexOf('design/');
  return designIndex === -1 ? importPath : importPath.slice(designIndex);
}

function prependImport(cssFile, importPath) {
  return editFile(cssFile, (css) => {
    if (css.includes(designRelativeTail(importPath))) return ALREADY_PRESENT;
    return `@import '${importPath}';\n${css}`;
  });
}

function addPresetImportAndEntry(config, presetPath) {
  if (config.includes('design/tailwind.preset')) return config;
  if (!/export default\s*\{/.test(config)) return INAPPLICABLE;
  const importLine = `import cap from '${presetPath}';`;
  const imports = [...config.matchAll(/^import .*;$/gm)];
  const lastImport = imports.at(-1);
  const withImport = lastImport
    ? config.slice(0, lastImport.index + lastImport[0].length) + `\n${importLine}` + config.slice(lastImport.index + lastImport[0].length)
    : `${importLine}\n${config}`;
  return withImport.replace(/export default\s*\{/, (match) => `${match}\n    presets: [cap],`);
}

function addContentGlob(config, contentGlob) {
  if (config.includes(contentGlob)) return config;
  if (!/content:\s*\[/.test(config)) return INAPPLICABLE;
  return config.replace(/content:\s*\[/, (match) => `${match}\n        '${contentGlob}',`);
}

function tailwindPreset(configFile, presetPath, contentGlob) {
  return editFile(configFile, (original) => {
    if (original.includes('module.exports')) return INAPPLICABLE;
    const withPreset = addPresetImportAndEntry(original, presetPath);
    if (withPreset === INAPPLICABLE) return INAPPLICABLE;
    const patched = addContentGlob(withPreset, contentGlob);
    return patched === original ? ALREADY_PRESENT : patched;
  });
}

function linkTailwindConfig(cssFile, configPath) {
  return editFile(cssFile, (css) => {
    const existingConfig = css.match(/^@config\s+[^;]*;/m);
    if (existingConfig) return existingConfig[0].includes(configPath) ? ALREADY_PRESENT : INAPPLICABLE;
    const lastImport = [...css.matchAll(/^@import\s[^;]*;/gm)].at(-1);
    const insertAt = lastImport ? lastImport.index + lastImport[0].length : 0;
    return `${css.slice(0, insertAt)}\n@config '${configPath}';${css.slice(insertAt)}`.trimStart();
  });
}

function themeScriptLines(scriptOpeningTag) {
  return [
    `<!-- ${THEME_SNIPPET_MARKER} -->`,
    scriptOpeningTag,
    '    let storedTheme;',
    '    try { storedTheme = localStorage.theme; } catch { storedTheme = undefined; }',
    "    const theme = storedTheme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');",
    "    document.documentElement.classList.toggle('dark', theme === 'dark');",
    '</script>',
    '<link rel="preconnect" href="https://fonts.bunny.net">',
  ];
}

const staticStylesheetLink = () => `<link href="https://fonts.bunny.net/css?family=${webfontFamilies()}&display=swap" rel="stylesheet">`;

const snippets = {
  blade: {
    scriptOpeningTag: '<script>',
    replacesFontLinks: true,
    stylesheetLink: () => '<link href="https://fonts.bunny.net/css?family={{ config(\'design.fonts.webfont\') }}&display=swap" rel="stylesheet">',
  },
  static: { scriptOpeningTag: '<script>', stylesheetLink: staticStylesheetLink },
  'static-astro': { scriptOpeningTag: '<script is:inline>', stylesheetLink: staticStylesheetLink },
};

function headSnippet(layoutFile, snippetName) {
  const snippet = snippets[snippetName];
  if (!snippet) throw new Error(`Unknown snippet "${snippetName}" (use ${Object.keys(snippets).join(', ')})`);
  return editFile(layoutFile, (layout) => {
    if (layout.includes('design.fonts.webfont') || layout.includes(THEME_SNIPPET_MARKER)) return ALREADY_PRESENT;
    const headClose = layout.match(/^([ \t]*)<\/head>/m);
    if (!headClose) return INAPPLICABLE;
    const indent = headClose[1] + '    ';
    const headLines = [...themeScriptLines(snippet.scriptOpeningTag), snippet.stylesheetLink()];
    const indentedSnippet = headLines.map((line) => indent + line).join('\n');
    const cleanLayout = snippet.replacesFontLinks ? layout.replace(/^[ \t]*<link[^>]*fonts\.bunny\.net[^>]*>[ \t]*\n/gm, '') : layout;
    return cleanLayout.replace(/^([ \t]*)<\/head>/m, `${indentedSnippet}\n$1</head>`);
  });
}

function appendJsImport(jsFile, importPath) {
  return editFile(jsFile, (js) => {
    if (js.includes(importPath)) return ALREADY_PRESENT;
    const separator = js.endsWith('\n') || js === '' ? '' : '\n';
    return `${js}${separator}import '${importPath}';\n`;
  });
}

function astroScript(layoutFile, importPath) {
  return editFile(layoutFile, (layout) => {
    if (layout.includes(importPath)) return ALREADY_PRESENT;
    const bodyClose = layout.match(/^([ \t]*)<\/body>/m);
    if (!bodyClose) return INAPPLICABLE;
    const script = `${bodyClose[1]}    <script>import '${importPath}';</script>`;
    return layout.replace(/^([ \t]*)<\/body>/m, `${script}\n$1</body>`);
  });
}

const commands = {
  'prepend-import': prependImport,
  'tailwind-preset': tailwindPreset,
  'tailwind-config-link': linkTailwindConfig,
  'head-snippet': headSnippet,
  'append-js-import': appendJsImport,
  'astro-script': astroScript,
};

const exitCodes = {
  [CHANGED]: EXIT_CHANGED,
  [ALREADY_PRESENT]: EXIT_ALREADY_PRESENT,
  [INAPPLICABLE]: EXIT_INAPPLICABLE,
};

function main() {
  const [commandName, targetFile, ...rest] = process.argv.slice(2);
  const command = commands[commandName];
  if (!command || !targetFile || !existsSync(targetFile)) {
    console.error(`Usage: patch-file.mjs <${Object.keys(commands).join('|')}> <file> [args...] (file must exist)`);
    process.exit(1);
  }
  process.exit(exitCodes[command(targetFile, ...rest)]);
}

main();
