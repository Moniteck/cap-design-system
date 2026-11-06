import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { toggleTheme } from '../../design/shell/js/theme.js';

const originalStorage = globalThis.localStorage;

beforeEach(() => {
  document.documentElement.classList.remove('dark');
  localStorage.clear();
});

afterEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: originalStorage, configurable: true });
});

describe('toggleTheme', () => {
  it('toggles the dark class and stores the choice', () => {
    expect(toggleTheme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(toggleTheme()).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('does not throw when localStorage throws', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: { setItem() { throw new Error('blocked'); } },
      configurable: true,
    });
    expect(() => toggleTheme()).not.toThrow();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
