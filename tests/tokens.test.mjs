import { contrastRatio, compositeOver, contrastReport } from '../scripts/contrast.mjs';
import tokens from '../design/tokens.json' with { type: 'json' };
import { readFileSync } from 'node:fs';

test('contrastRatio matches WCAG reference', () => {
  expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
  expect(contrastRatio('#B12530', '#FFFFFF')).toBeCloseTo(6.6, 1);
});
test('compositeOver blends glass over a card', () => {
  expect(compositeOver('30,27,26', 0.62, '#FFFDFB')).toBe('#747170');
});
test('brand red unchanged and version bumped', () => {
  expect(tokens.brand.red).toBe('#B12530');
  expect(tokens.version).toBe('2.0.0');
});
test('every contrast pair passes AA', () => {
  const failing = contrastReport(tokens).filter((row) => !row.pass);
  expect(failing).toEqual([]);
});
test('tokens.css exposes the new variables in both themes', () => {
  const css = readFileSync('design/tokens.css', 'utf8');
  for (const name of ['--cap-red-800', '--cap-glass-bg', '--cap-text-soft', '--cap-blob-red', '--cap-radius-shell', '--cap-red-tint']) {
    expect(css).toContain(`${name}:`);
  }
  expect(css.split('.dark {')[1]).toContain('--cap-glass-bg:');
});
