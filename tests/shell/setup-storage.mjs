// Node 25 ships a global localStorage that shadows happy-dom's and has no usable methods without a backing file.
const items = new Map();

const memoryStorage = {
  getItem: (key) => (items.has(key) ? items.get(key) : null),
  setItem: (key, value) => items.set(key, String(value)),
  removeItem: (key) => items.delete(key),
  clear: () => items.clear(),
};

Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true, writable: true });
