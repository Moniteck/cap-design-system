import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bindConfirmDialog } from '../../design/shell/js/confirm.js';
import { pressKey } from '../helpers/keyboard.mjs';

let dialog;
let opener;

const html = (withAck) => `
  <button id="opener" data-cap-confirm-open="dlg">Anular</button>
  <div id="dlg" data-cap-confirm hidden>
    <div class="cap-dialog__backdrop"></div>
    <div class="cap-dialog__panel">
      <button data-cap-confirm-close>x</button>
      ${withAck ? '<input type="checkbox" data-cap-confirm-ack>' : ''}
      <button data-cap-confirm-cancel>Cancelar</button>
      <button data-cap-confirm-accept ${withAck ? 'disabled' : ''}>Anular</button>
    </div>
  </div>`;

const setup = (withAck = true) => {
  document.body.innerHTML = html(withAck);
  dialog = document.getElementById('dlg');
  opener = document.getElementById('opener');
  bindConfirmDialog(dialog);
};

const pressEscape = () => pressKey('Escape');

describe('bindConfirmDialog', () => {
  beforeEach(() => setup());

  it('opens from the trigger and focuses Cancelar', () => {
    opener.focus();
    opener.click();
    expect(dialog.hidden).toBe(false);
    expect(document.activeElement).toBe(dialog.querySelector('[data-cap-confirm-cancel]'));
  });

  it('keeps accept disabled until the checkbox is checked', () => {
    opener.click();
    const accept = dialog.querySelector('[data-cap-confirm-accept]');
    const ack = dialog.querySelector('[data-cap-confirm-ack]');
    expect(accept.disabled).toBe(true);
    ack.checked = true;
    ack.dispatchEvent(new Event('change', { bubbles: true }));
    expect(accept.disabled).toBe(false);
  });

  it('does not close on backdrop click', () => {
    opener.click();
    dialog.querySelector('.cap-dialog__backdrop').click();
    expect(dialog.hidden).toBe(false);
  });

  it('closes on Escape and returns focus to the opener', () => {
    opener.focus();
    opener.click();
    pressEscape();
    expect(dialog.hidden).toBe(true);
    expect(document.activeElement).toBe(opener);
  });

  it('closes with Cancelar and with the close button', () => {
    opener.click();
    dialog.querySelector('[data-cap-confirm-cancel]').click();
    expect(dialog.hidden).toBe(true);
    opener.click();
    dialog.querySelector('[data-cap-confirm-close]').click();
    expect(dialog.hidden).toBe(true);
  });

  it('emits cap:confirm with the dialog id and marks accept busy', () => {
    const listener = vi.fn();
    document.addEventListener('cap:confirm', listener);
    opener.click();
    const ack = dialog.querySelector('[data-cap-confirm-ack]');
    ack.checked = true;
    ack.dispatchEvent(new Event('change', { bubbles: true }));
    const accept = dialog.querySelector('[data-cap-confirm-accept]');
    accept.click();
    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0].detail).toEqual({ id: 'dlg' });
    expect(accept.getAttribute('aria-busy')).toBe('true');
    document.removeEventListener('cap:confirm', listener);
  });

  it('resets the acknowledgement when reopened', () => {
    opener.click();
    const ack = dialog.querySelector('[data-cap-confirm-ack]');
    ack.checked = true;
    ack.dispatchEvent(new Event('change', { bubbles: true }));
    pressEscape();
    opener.click();
    expect(ack.checked).toBe(false);
    expect(dialog.querySelector('[data-cap-confirm-accept]').disabled).toBe(true);
  });
});

describe('bindConfirmDialog without acknowledgement', () => {
  it('leaves accept enabled', () => {
    setup(false);
    opener.click();
    expect(dialog.querySelector('[data-cap-confirm-accept]').disabled).toBe(false);
  });
});
