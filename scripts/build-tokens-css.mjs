// Genera design/tokens.css a partir de design/tokens.json. Correr tras editar el JSON:
//   node scripts/build-tokens-css.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'design');
const { brand, chrome, fonts, status, motion } = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));

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
  ['head', chrome.surface],
  ['rail', chrome.rail],
  ['raised', chrome.raised],
  ['line', chrome.line],
  ['page', chrome.paper],
  ['card', '#ffffff'],
  ['card-2', chrome.paper],
  ['divider', chrome.paperLine],
  ['input-line', chrome.inputLine],
  ...Object.entries(status.light).map(([key, value]) => [`status-${key}`, value]),
  ...Object.entries(motion.duration).map(([key, value]) => [`duration-${key}`, value]),
  ...Object.entries(motion.easing).map(([key, value]) => [`ease-${key}`, value]),
];
const dark = [
  ['brand', brand.redSoft],
  ['head', chrome.raised],
  ['page', chrome.canvas],
  ['card', chrome.surface],
  ['card-2', chrome.raised],
  ['divider', chrome.line],
  ['input-line', chrome.inputLineDark],
  ...Object.entries(status.dark).map(([key, value]) => [`status-${key}`, value]),
];

const css = `/* Generado desde tokens.json (node scripts/build-tokens-css.mjs). No editar a mano. */
:root {
${vars(light)}
}

/* Modo oscuro: clase \`dark\` en <html> o <body>. El marco (--cap-chrome, --cap-rail) no cambia de tema. */
.dark {
${vars(dark)}
}

body {
  font-family: var(--cap-font-text);
}

h1, h2, h3, h4, h5, h6, .font-display {
  font-family: var(--cap-font-display);
}

/* Movimiento: aparecer y entrar desde abajo (modales, menús, toasts). */
@keyframes cap-fade-in { from { opacity: 0; } }
@keyframes cap-rise-in { from { opacity: 0; transform: translateY(8px); } }
@keyframes cap-pulse { 50% { opacity: 0.45; } }

/* Quien pide menos movimiento recibe los cambios al instante: sin desplazamientos ni esperas. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;
writeFileSync(join(root, 'tokens.css'), css);
console.log('design/tokens.css generado');
