import { afterEach, describe, expect, it } from 'vitest';
import { readCollapsed, readItem, writeCollapsed, writeItem } from '../../design/shell/js/storage.js';

const originalStorage = globalThis.localStorage;
const throwingStorage = {
  getItem() { throw new Error('blocked'); },
  setItem() { throw new Error('blocked'); },
};

afterEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: originalStorage, configurable: true });
  originalStorage.clear();
});

describe('storage', () => {
  it('readCollapsed returns null when localStorage throws', () => {
    Object.defineProperty(globalThis, 'localStorage', { value: throwingStorage, configurable: true });
    expect(readCollapsed()).toBeNull();
  });

  it('writeCollapsed swallows errors', () => {
    Object.defineProperty(globalThis, 'localStorage', { value: throwingStorage, configurable: true });
    expect(() => writeCollapsed(true)).not.toThrow();
  });

  it('round-trips the collapsed flag', () => {
    expect(readCollapsed()).toBeNull();
    writeCollapsed(true);
    expect(readCollapsed()).toBe(true);
    writeCollapsed(false);
    expect(readCollapsed()).toBe(false);
  });

  it('readItem and writeItem round-trip generic keys and tolerate blocked storage', () => {
    writeItem('theme', 'dark');
    expect(readItem('theme')).toBe('dark');
    Object.defineProperty(globalThis, 'localStorage', { value: throwingStorage, configurable: true });
    expect(readItem('theme')).toBeNull();
    expect(() => writeItem('theme', 'light')).not.toThrow();
  });
});
