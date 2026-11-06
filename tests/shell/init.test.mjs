import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initShell } from '../../design/shell.js';
import { showToast } from '../../design/shell/js/toasts.js';
import { readReference } from '../helpers/repo-files.mjs';
import { pressKey } from '../helpers/keyboard.mjs';

const mountReference = (name) => {
  const source = readReference(name);
  document.body.innerHTML = source.slice(source.indexOf('<body'), source.indexOf('</body>'))
    .replace(/<body[^>]*>/, '')
    .replace(/<script[\s\S]*?<\/script>/g, '');
};

let teardown;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

afterEach(() => teardown?.());

describe('initShell on app.html', () => {
  beforeEach(() => {
    mountReference('app');
    teardown = initShell();
  });

  it('applies the viewport default and collapses on click', () => {
    const sidebar = document.querySelector('[data-cap-sidebar]');
    const before = sidebar.dataset.collapsed;
    sidebar.querySelector('[data-cap-collapse]').click();
    expect(sidebar.dataset.collapsed).toBe(before === 'true' ? 'false' : 'true');
  });

  it('opens the more sheet', () => {
    document.querySelector('[data-cap-sheet-trigger]').click();
    expect(document.getElementById('cap-more-sheet').dataset.open).toBe('true');
  });

  it('opens and confirms the dialog', () => {
    document.querySelector('[data-cap-confirm-open]').click();
    expect(document.getElementById('cap-confirm-void').hidden).toBe(false);
  });

  it('shares one notifications panel between both triggers without fighting', () => {
    const [headerTrigger, topbarTrigger] = document.querySelectorAll('[data-cap-popover-trigger]');
    const panel = document.getElementById('cap-notifications');
    topbarTrigger.click();
    expect(panel.hidden).toBe(false);
    headerTrigger.click();
    expect(panel.hidden).toBe(true);
    headerTrigger.click();
    expect(panel.hidden).toBe(false);
  });

  it('filters the notifications by unread', () => {
    document.querySelector('[data-cap-notification-filter="unread"]').click();
    const items = [...document.querySelectorAll('.cap-notifications__item')];
    expect(items.filter((item) => !item.hidden).every((item) => item.dataset.unread === 'true')).toBe(true);
    expect(items.some((item) => item.hidden)).toBe(true);
  });

  it('toggles the theme from every toggle', () => {
    document.querySelector('[data-cap-theme-toggle]').click();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('mounts the toaster so showToast renders into it', () => {
    showToast({ status: 'warning', title: 'Ojo' });
    expect(document.querySelector('[data-cap-toaster] .cap-toast')).not.toBeNull();
  });

  it('focuses the search input on ctrl+k', () => {
    pressKey('k', { ctrlKey: true });
    expect(document.activeElement).toBe(document.querySelector('[data-cap-search]'));
  });
});

describe('initShell teardown', () => {
  it('removes listeners so a later click changes nothing', () => {
    mountReference('app');
    teardown = initShell();
    const sidebar = document.querySelector('[data-cap-sidebar]');
    const button = sidebar.querySelector('[data-cap-collapse]');
    teardown();
    const before = sidebar.dataset.collapsed;
    button.click();
    expect(sidebar.dataset.collapsed).toBe(before);
    teardown = undefined;
  });
});

describe('initShell on login.html', () => {
  it('wires the password and theme toggles', () => {
    mountReference('login');
    teardown = initShell();
    const input = document.getElementById('login-password');
    document.querySelector('[data-cap-password-toggle]').click();
    expect(input.type).toBe('text');
    document.querySelector('[data-cap-theme-toggle]').click();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

describe('initShell login forms', () => {
  it('blocks the submit button of the login reference', () => {
    mountReference('login');
    teardown = initShell();
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (event) => event.stopPropagation(), { once: true });
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(document.getElementById('login-submit').disabled).toBe(true);
    expect(document.getElementById('login-submit').textContent).toBe('Ingresando…');
  });
});

describe('initShell with incomplete templates', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <aside data-cap-sidebar data-collapsed="false"></aside>
      <button id="sheet-no-controls" data-cap-sheet-trigger>Más</button>
      <button id="popover-dangling" data-cap-popover-trigger aria-controls="missing">Bell</button>
      <div id="dialog" data-cap-confirm hidden><button data-cap-confirm-cancel>Cancelar</button></div>
      <button id="password-no-input" data-cap-password-toggle aria-controls="nothing"></button>
      <button id="theme" data-cap-theme-toggle>Tema</button>
      <div data-cap-toaster></div>`;
  });

  it('skips broken parts, returns a teardown and still binds the rest', () => {
    let teardownResult;
    expect(() => { teardownResult = initShell(); }).not.toThrow();
    teardown = teardownResult;
    expect(typeof teardown).toBe('function');

    document.getElementById('password-no-input').click();
    document.getElementById('theme').click();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    showToast({ status: 'info', title: 'Sigue funcionando' });
    expect(document.querySelector('[data-cap-toaster] .cap-toast')).not.toBeNull();
    expect(() => teardown()).not.toThrow();
    teardown = undefined;
  });
});
