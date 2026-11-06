import preset from '../design/tailwind.preset.js';

const { colors, borderRadius } = preset.theme.extend;

test('red scale and new roles exist', () => {
  expect(colors.cap['red-800']).toBe('#6E1219');
  expect(colors.cap.wine).toBe('#6E1219');
  expect(colors.cap['text-soft']).toBe('var(--cap-text-soft)');
});

test('every red scale step is exposed', () => {
  for (const step of ['50', '100', '200', '400', '600', '800']) expect(colors.cap[`red-${step}`]).toBeDefined();
});

test('taupe and chrome text colors exist', () => {
  expect(colors.cap.taupe).toBe('#A89C91');
  expect(colors.cap['on-chrome']).toBe('#E9E4E0');
  expect(colors.cap['on-chrome-soft']).toBe('#D2CAC3');
});

test('1.x names still exist', () => {
  for (const name of ['brand', 'chrome', 'page', 'card', 'card-2', 'divider', 'head', 'input-line']) expect(colors.cap[name]).toBeDefined();
});

test('radii', () => {
  expect(borderRadius['cap-control']).toBe('14px');
  expect(borderRadius['cap-card']).toBe('20px');
  expect(borderRadius['cap-shell']).toBe('24px');
  expect(borderRadius['cap-sheet']).toBe('28px');
});
