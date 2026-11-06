import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { readReference } from './helpers/repo-files.mjs';

const cssDirectory = 'design/shell/css';
const parts = existsSync(cssDirectory)
  ? readdirSync(cssDirectory).map((file) => readFileSync(`${cssDirectory}/${file}`, 'utf8'))
  : [];
const all = parts.join('\n');
const tokensCss = readFileSync('design/tokens.css', 'utf8');

test('entry imports every part', () => {
  const entry = readFileSync('design/shell.css', 'utf8');
  for (const file of readdirSync(cssDirectory)) expect(entry).toContain(`shell/css/${file}`);
  for (const part of ['base', 'sidebar', 'header', 'mobile', 'overlays', 'login']) {
    expect(readdirSync(cssDirectory)).toContain(`${part}.css`);
  }
});

test('no literal colors', () => {
  expect(all).not.toBe('');
  expect(all).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
});

test('glass falls back to solid surfaces', () => {
  expect(all).toContain('@supports not (backdrop-filter: blur(1px))');
  expect(all).toContain('prefers-reduced-transparency: reduce');
  expect(all).toContain('prefers-reduced-motion: reduce');
});

test('only z-cap layers', () => {
  expect(all).toContain('z-index');
  for (const [, value] of all.matchAll(/z-index:\s*([^;]+);/g)) expect(value).toMatch(/^var\(--cap-z-/);
});

test('z layers follow the fixed scale', () => {
  const layers = { header: 30, sidebar: 40, dropdown: 50, drawer: 60, modal: 70, toast: 80 };
  for (const [name, value] of Object.entries(layers)) expect(tokensCss).toContain(`--cap-z-${name}: ${value};`);
});

test('mobile breakpoint is 1024px', () => {
  expect(all).toContain('(max-width: 1023.98px)');
});

test('every variable used by the shell exists in tokens.css or is declared by the shell', () => {
  const declared = new Set([...`${tokensCss}\n${all}`.matchAll(/(--cap-[a-z0-9-]+):/g)].map(([, name]) => name));
  const used = [...all.matchAll(/var\((--cap-[a-z0-9-]+)(,?)/g)];
  const undeclared = used.filter(([, name, hasFallback]) => !hasFallback && !declared.has(name)).map(([, name]) => name);
  expect(undeclared).toEqual([]);
});

test('nothing below the 12px text floor', () => {
  for (const [, size] of all.matchAll(/font-size:\s*([\d.]+)px/g)) expect(Number(size)).toBeGreaterThanOrEqual(12);
});

test('reference pages load the shared files and never hardcode colors', () => {
  for (const page of ['app', 'login']) {
    const html = readReference(page);
    expect(html).toContain('href="../../tokens.css"');
    expect(html).toContain('href="../../shell.css"');
    expect(html).toContain('<script type="module" src="../../shell-auto.js"></script>');
    expect(html).toContain('data-cap-theme-toggle');
    expect(html).not.toMatch(/#[0-9a-fA-F]{6}\b|rgba?\(/);
  }
});

test('app reference wires every behavior attribute', () => {
  const html = readReference('app');
  for (const attribute of [
    'data-cap-sidebar', 'data-cap-collapse', 'data-cap-search', 'data-cap-sheet-trigger', 'data-cap-sheet-backdrop',
    'data-cap-sheet-handle', 'data-cap-popover-trigger', 'data-cap-toaster', 'data-cap-confirm', 'data-cap-confirm-open',
    'data-cap-confirm-cancel', 'data-cap-confirm-accept', 'data-cap-confirm-ack',
  ]) expect(html).toContain(attribute);
});

test('login reference wires the password toggle', () => {
  expect(readReference('login')).toContain('data-cap-password-toggle');
});

const mobileRules = () => [...all.matchAll(/@media \(max-width: 1023\.98px\) \{([\s\S]*?)\n\}/g)].map(([, rules]) => rules).join('\n');

test('a focused field with an error shows a high-contrast ring, not only the soft halo', () => {
  const [, focusedError] = all.match(/\.cap-field--error \.cap-field__control:focus-within \{([^}]*)\}/) ?? [];
  expect(focusedError).toMatch(/outline: 2px solid var\(--cap-text\);/);
  expect(focusedError).toMatch(/outline-offset: 3px;/);
});

test('rail popover links get a focus outline that shows on the light surface', () => {
  expect(all).toMatch(/\[data-collapsed="true"\] \.cap-shell-sidebar__child:focus-visible \{[^}]*outline-color: var\(--cap-chrome\)/);
});

test('small controls reach 40px touch targets on mobile', () => {
  const rules = mobileRules();
  for (const selector of ['.cap-toast__close', '.cap-dialog__close', '.cap-field__reveal']) {
    expect(rules).toMatch(new RegExp(`${selector.replace('.', '\\.')} \\{[^}]*width: 40px;[^}]*height: 40px;`));
  }
  expect(rules).toMatch(/\.cap-notifications__tab \{[^}]*height: 40px;/);
  expect(rules).toMatch(/\.cap-notifications__mark-read \{[^}]*min-height: 40px;/);
});

test('the loading state of the login reference blocks the submit button', () => {
  expect(readReference('login')).toContain('submit.disabled = isLoading');
});

test('solid fallbacks outrank the tokens whatever the import order', () => {
  const fallbackBlocks = [...all.matchAll(/(?:@supports not \(backdrop-filter: blur\(1px\)\)|@media \(prefers-reduced-transparency: reduce\)) \{\s*([^{]+)\{/g)];
  expect(fallbackBlocks).toHaveLength(2);
  for (const [, selectors] of fallbackBlocks) {
    expect(selectors.split(',').map((selector) => selector.trim())).toEqual([':root:root', '.dark.dark']);
  }
});

test('the expanded nav scrolls on short screens and the rail keeps its popovers unclipped', () => {
  expect(all).toMatch(/\.cap-shell-sidebar__nav \{[^}]*overflow-y: auto;/);
  expect(all).toMatch(/\[data-collapsed="true"\] \.cap-shell-sidebar__nav \{[^}]*overflow: visible;/);
});

test('rail popover children show hover and the current page', () => {
  expect(all).toMatch(/\[data-collapsed="true"\] \.cap-shell-sidebar__child:is\(:hover, \[aria-current="page"\]\) \{[^}]*background: var\(--cap-on-chrome\);/);
  expect(all).toMatch(/\[data-collapsed="true"\] \.cap-shell-sidebar__child\[aria-current="page"\] \{[^}]*box-shadow: inset 3px 0 0 var\(--cap-red\);/);
});

test('the header search draws a single focus ring', () => {
  expect(all).toMatch(/\.cap-shell-header \.cap-shell-header__search-input:focus-visible \{\s*outline: 0;/);
});

test('button hover also works on links', () => {
  expect(all).not.toContain(':hover:enabled');
  expect(all).toContain('.cap-button--provider:hover:not(:disabled)');
});

test('notification filter can hide items that set their own display', () => {
  expect(all).toMatch(/\.cap-notifications \[hidden\] \{\s*display: none;/);
});
