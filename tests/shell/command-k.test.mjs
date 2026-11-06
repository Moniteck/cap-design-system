import { beforeEach, describe, expect, it } from 'vitest';
import { bindCommandK } from '../../design/shell/js/command-k.js';
import { pressKey } from '../helpers/keyboard.mjs';

const press = (init) => pressKey(init.key, init);

let input;

beforeEach(() => {
  document.body.innerHTML = '<input id="search" type="search">';
  input = document.getElementById('search');
  bindCommandK(input);
});

describe('bindCommandK', () => {
  it('focuses the input on ctrl+k and prevents default', () => {
    const event = press({ key: 'k', ctrlKey: true });
    expect(document.activeElement).toBe(input);
    expect(event.defaultPrevented).toBe(true);
  });

  it('focuses the input on meta+k', () => {
    press({ key: 'k', metaKey: true });
    expect(document.activeElement).toBe(input);
  });

  it('ignores a bare k', () => {
    const event = press({ key: 'k' });
    expect(document.activeElement).not.toBe(input);
    expect(event.defaultPrevented).toBe(false);
  });
});
