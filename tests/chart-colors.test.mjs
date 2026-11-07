import { chartColors } from '../design/chart-colors.js';
import tokens from '../design/tokens.json';

test('light series start with brand red then ink', () => {
  expect(chartColors(false).series).toEqual(['#B12530', '#1E1B1A', '#A89C91', '#F2D3D6']);
});

test('dark series start with soft red', () => {
  expect(chartColors(true).series).toEqual(['#E8707A', '#F2D3D6', '#B12530', '#6E1219']);
});

test('text and grid follow the theme', () => {
  expect(chartColors(false).text).toBe(tokens.chrome.textSoft);
  expect(chartColors(true).text).toBe(tokens.dark.textSoft);
  expect(chartColors(false).grid).toBe(tokens.chrome.paperLine);
  expect(chartColors(true).grid).toBe(tokens.dark.divider);
});
