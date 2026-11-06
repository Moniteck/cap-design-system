import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DRAG_CLOSE_DISTANCE, bindSheet, createDragToClose } from '../../design/shell/js/sheet.js';
import { pressKey } from '../helpers/keyboard.mjs';

const pointer = (target, type, clientY) =>
  target.dispatchEvent(new PointerEvent(type, { clientY, bubbles: true }));

let trigger;
let sheet;
let handle;

beforeEach(() => {
  document.body.innerHTML = `
    <button id="trigger" aria-expanded="false" aria-controls="sheet">Más</button>
    <div id="sheet" data-open="false">
      <div data-cap-sheet-backdrop></div>
      <div><div data-cap-sheet-handle></div><a href="#">Inicio</a></div>
    </div>`;
  trigger = document.getElementById('trigger');
  sheet = document.getElementById('sheet');
  handle = sheet.querySelector('[data-cap-sheet-handle]');
  bindSheet(trigger, sheet);
});

describe('bindSheet', () => {
  it('opens on trigger click', () => {
    trigger.click();
    expect(sheet.dataset.open).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes on Escape and returns focus to the trigger', () => {
    trigger.focus();
    trigger.click();
    pressKey('Escape');
    expect(sheet.dataset.open).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on backdrop click', () => {
    trigger.click();
    sheet.querySelector('[data-cap-sheet-backdrop]').click();
    expect(sheet.dataset.open).toBe('false');
  });

  it('closes when the handle is dragged down more than 80px', () => {
    trigger.click();
    pointer(handle, 'pointerdown', 100);
    pointer(document, 'pointermove', 200);
    pointer(document, 'pointerup', 200);
    expect(sheet.dataset.open).toBe('false');
  });

  it('stays open when dragged only 40px', () => {
    trigger.click();
    pointer(handle, 'pointerdown', 100);
    pointer(document, 'pointermove', 140);
    pointer(document, 'pointerup', 140);
    expect(sheet.dataset.open).toBe('true');
  });
});

describe('createDragToClose', () => {
  const pointerAt = (clientY) => ({ clientY });

  it('closes only when open and dragged past the threshold', () => {
    const close = vi.fn();
    const drag = createDragToClose(() => true, close);
    drag.start(pointerAt(0));
    drag.end(pointerAt(DRAG_CLOSE_DISTANCE));
    expect(close).not.toHaveBeenCalled();
    drag.start(pointerAt(0));
    drag.end(pointerAt(DRAG_CLOSE_DISTANCE + 1));
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('ignores a release that did not start on the handle', () => {
    const close = vi.fn();
    createDragToClose(() => true, close).end(pointerAt(500));
    expect(close).not.toHaveBeenCalled();
  });
});
