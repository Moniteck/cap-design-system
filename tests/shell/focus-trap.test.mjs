import { beforeEach, describe, expect, it } from 'vitest';
import { trapFocus } from '../../design/shell/js/focus-trap.js';
import { pressKey } from '../helpers/keyboard.mjs';

const pressTab = (element, shiftKey = false) => pressKey('Tab', { target: element, shiftKey });

beforeEach(() => {
  document.body.innerHTML = `
    <button id="opener">open</button>
    <div id="box"><button id="first">a</button><button id="middle">b</button><button id="last">c</button></div>`;
});

describe('trapFocus', () => {
  it('wraps Tab from the last focusable to the first', () => {
    trapFocus(document.getElementById('box'));
    document.getElementById('last').focus();
    const event = pressTab(document.getElementById('last'));
    expect(document.activeElement.id).toBe('first');
    expect(event.defaultPrevented).toBe(true);
  });

  it('wraps Shift+Tab from the first focusable to the last', () => {
    trapFocus(document.getElementById('box'));
    document.getElementById('first').focus();
    pressTab(document.getElementById('first'), true);
    expect(document.activeElement.id).toBe('last');
  });

  it('focuses the requested element and returns focus on release', () => {
    const opener = document.getElementById('opener');
    opener.focus();
    const release = trapFocus(document.getElementById('box'), document.getElementById('middle'));
    expect(document.activeElement.id).toBe('middle');
    release();
    expect(document.activeElement).toBe(opener);
  });
});
