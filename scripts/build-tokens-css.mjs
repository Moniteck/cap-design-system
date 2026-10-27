// Genera design/tokens.css a partir de design/tokens.json. Correr tras editar el JSON:
//   node scripts/build-tokens-css.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'design');
const { brand, chrome, fonts, status } = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));

const vars = (entries) => entries.map(([name, value]) => `  --cap-${name}: ${value};`).join('\n');

const light = [
  ['font-text', `"${fonts.text}", system-ui, sans-serif`],
  ['font-display', `"${fonts.display}", "${fonts.text}", system-ui, sans-serif`],
  ['brand', brand.red],
  ['red', brand.red],
  ['red-hover', brand.redHover],
  ['red-soft', brand.redSoft],
  ['gray', brand.gray],
  ['chrome', chrome.surface],
  ['rail', chrome.rail],
  ['raised', chrome.raised],
  ['line', chrome.line],
  ['page', chrome.paper],
  ['card', '#ffffff'],
  ['card-2', chrome.paper],
  ['divider', chrome.paperLine],
  ...Object.entries(status.light).map(([key, value]) => [`status-${key}`, value]),
];
const dark = [
  ['brand', brand.redSoft],
  ['chrome', chrome.raised],
  ['page', chrome.canvas],
  ['card', chrome.surface],
  ['card-2', chrome.raised],
  ['divider', chrome.line],
  ...Object.entries(status.dark).map(([key, value]) => [`status-${key}`, value]),
];

const css = `/* Generado desde tokens.json (node scripts/build-tokens-css.mjs). No editar a mano. */
:root {
${vars(light)}
}

/* Modo oscuro: clase \`dark\` en <html> o <body>. El marco (chrome, rail) es oscuro en los dos temas. */
.dark {
${vars(dark)}
}

body {
  font-family: var(--cap-font-text);
}

h1, h2, h3, h4, h5, h6, .font-display {
  font-family: var(--cap-font-display);
}
`;
writeFileSync(join(root, 'tokens.css'), css);
console.log('design/tokens.css generado');
