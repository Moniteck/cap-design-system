// Genera design/tokens.css a partir de design/tokens.json. Correr tras editar el JSON:
//   node scripts/build-tokens-css.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'design');
const { brand, chrome, fonts, status, statusSurface, motion, dark: darkPalette, glass, blobs, radius, shadow, z } = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));

const toRgba = (hex, alpha) => {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
  return `rgba(${channels.join(', ')}, ${alpha})`;
};
const glassBackground = ({ tint, alpha }) => `rgba(${tint}, ${alpha})`;
const blobColors = (alphas, scale = 1) => [
  ['red', brand.red],
  ['wine', brand.wine],
  ['taupe', brand.taupe],
].map(([name, hex]) => [name, toRgba(hex, alphas[name] * scale)]);

const statusVariables = (suffix, colors) => Object.entries(colors).map(([key, value]) => [`status-${key}-${suffix}`, value]);

const kebabCase = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

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
  ['card', chrome.card],
  ['card-2', chrome.paper],
  ['divider', chrome.paperLine],
  ['text', chrome.surface],
  ['text-inverse', chrome.onAccent],
  ['text-soft', chrome.textSoft],
  ['on-accent', chrome.onAccent],
  ['on-chrome', chrome.onChrome],
  ['on-chrome-soft', chrome.onChromeSoft],
  ['wine', brand.wine],
  ['taupe', brand.taupe],
  ...Object.entries(brand.redScale).map(([step, value]) => [`red-${step}`, value]),
  ['red-tint', brand.redScale['50']],
  ['red-tint-border', chrome.redTintBorder],
  ['glass-bg', glassBackground(glass.dark)],
  ['glass-blur', glass.dark.blur],
  ['glass-saturate', glass.dark.saturate],
  ['glass-border', glass.dark.border],
  ['glass-highlight', glass.dark.highlight],
  ['glass-hover', glass.dark.hover],
  ['glass-active', glass.dark.active],
  ['glass-active-border', glass.dark.activeBorder],
  ['glass-fill', glass.dark.fill],
  ['glass-chip', glass.dark.chip],
  ['glass-handle', glass.dark.handle],
  ['glass-meter', glass.dark.meter],
  ['glass-tooltip-bg', glass.tooltip],
  ['glass-light-bg', glassBackground(glass.light)],
  ['glass-light-blur', glass.light.blur],
  ['glass-light-saturate', glass.light.saturate],
  ['glass-light-border', glass.light.border],
  ['glass-light-highlight', glass.light.highlight],
  ['overlay', glass.overlay],
  ['overlay-blur', glass.overlayBlur],
  ['photo-veil-top', glass.photoVeilTop],
  ['photo-veil-bottom', glass.photoVeilBottom],
  ...blobColors(blobs.app).map(([name, value]) => [`blob-${name}`, value]),
  ...blobColors(blobs.login).map(([name, value]) => [`blob-login-${name}`, value]),
  ...blobColors(blobs.panel).map(([name, value]) => [`blob-panel-${name}`, value]),
  ...Object.entries(radius).map(([name, value]) => [`radius-${name}`, value]),
  ['input-line', chrome.inputLine],
  ['control-line', chrome.controlLine],
  ['focus-ring', chrome.focusRing],
  ...Object.entries(status.light).map(([key, value]) => [`status-${key}`, value]),
  ...statusVariables('solid', statusSurface.solid),
  ...statusVariables('tint', statusSurface.tint.light),
  ...statusVariables('ink', statusSurface.ink.light),
  ['status-error-detail', statusSurface.errorDetail.light],
  ...Object.entries(shadow).map(([key, value]) => [`shadow-${kebabCase(key)}`, value]),
  ...Object.entries(z).map(([key, value]) => [`z-${key}`, value]),
  ...Object.entries(motion.duration).map(([key, value]) => [`duration-${key}`, value]),
  ...Object.entries(motion.easing).map(([key, value]) => [`ease-${key}`, value]),
];
const dark = [
  ['brand', brand.redSoft],
  ['head', chrome.raised],
  ['page', darkPalette.page],
  ['card', darkPalette.card],
  ['card-2', darkPalette.card2],
  ['divider', darkPalette.divider],
  ['text', chrome.onChrome],
  ['text-inverse', chrome.surface],
  ['text-soft', darkPalette.textSoft],
  ['red-tint', darkPalette.redTint],
  ['red-tint-border', darkPalette.redTintBorder],
  ['glass-bg', glassBackground(glass.darkMode)],
  ['glass-border', glass.darkMode.border],
  ['glass-light-bg', glassBackground(glass.darkMode)],
  ['glass-light-border', glass.darkMode.border],
  ['shadow-glass-light', shadow.glass],
  ...blobColors(blobs.app, 0.5).map(([name, value]) => [`blob-${name}`, value]),
  ...blobColors(blobs.login, 0.5).map(([name, value]) => [`blob-login-${name}`, value]),
  ['input-line', chrome.inputLineDark],
  ['control-line', darkPalette.controlLine],
  ['focus-ring', darkPalette.focusRing],
  ...Object.entries(status.dark).map(([key, value]) => [`status-${key}`, value]),
  ...statusVariables('tint', statusSurface.tint.dark),
  ...statusVariables('ink', statusSurface.ink.dark),
  ['status-error-detail', statusSurface.errorDetail.dark],
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
