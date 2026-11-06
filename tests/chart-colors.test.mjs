import { chartColors } from '../design/chart-colors.js';
import tokens from '../design/tokens.json';

test('light series start with wine then brand red', () => {
  expect(chartColors(false).series).toEqual(['#6E1219', '#B12530', '#DB7F87', '#A89C91']);
});

test('dark series start with soft red', () => {
  expect(chartColors(true).series).toEqual(['#E8707A', '#F2D3D6', '#A89C91', '#3A3431']);
});

test('text and grid follow the theme', () => {
  expect(chartColors(false).text).toBe(tokens.chrome.textSoft);
  expect(chartColors(true).text).toBe(tokens.dark.textSoft);
  expect(chartColors(false).grid).toBe(tokens.chrome.paperLine);
  expect(chartColors(true).grid).toBe(tokens.dark.divider);
});
