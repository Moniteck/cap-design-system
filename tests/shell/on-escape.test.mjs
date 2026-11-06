import { describe, expect, it, vi } from 'vitest';
import { onEscape } from '../../design/shell/js/on-escape.js';
import { bindPopover } from '../../design/shell/js/popover.js';
import { pressKey } from '../helpers/keyboard.mjs';

describe('onEscape', () => {
  it('calls the handler only for Escape', () => {
    const handler = vi.fn();
    const release = onEscape(document, handler);
    pressKey('a');
    expect(handler).not.toHaveBeenCalled();
    pressKey('Escape');
    expect(handler).toHaveBeenCalledTimes(1);
    release();
  });

  it('stops listening after release', () => {
    const handler = vi.fn();
    onEscape(document, handler)();
    pressKey('Escape');
    expect(handler).not.toHaveBeenCalled();
  });

  it('popover registers its Escape listener only while open', () => {
    document.body.innerHTML = '<button id="t" aria-controls="p">x</button><section id="p" hidden></section>';
    const addListener = vi.spyOn(document, 'addEventListener');
    const keydownRegistrations = () => addListener.mock.calls.filter(([type]) => type === 'keydown').length;
    const trigger = document.getElementById('t');
    bindPopover(trigger, document.getElementById('p'));
    expect(keydownRegistrations()).toBe(0);
    trigger.click();
    expect(keydownRegistrations()).toBe(1);
    addListener.mockRestore();
  });
});
