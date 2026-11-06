import { beforeEach, describe, expect, it } from 'vitest';
import { bindSidebarCollapse, defaultCollapsed, resolveCollapsed } from '../../design/shell/js/collapse.js';
import { readCollapsed, writeCollapsed } from '../../design/shell/js/storage.js';

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = `
    <aside data-cap-sidebar data-collapsed="false">
      <button data-cap-collapse aria-expanded="true" aria-label="Contraer menú"></button>
    </aside>`;
});

describe('defaultCollapsed', () => {
  it('collapses only between 1024 and 1279', () => {
    expect(defaultCollapsed(1100)).toBe(true);
    expect(defaultCollapsed(1024)).toBe(true);
    expect(defaultCollapsed(1279)).toBe(true);
    expect(defaultCollapsed(1280)).toBe(false);
    expect(defaultCollapsed(1023)).toBe(false);
  });
});

describe('resolveCollapsed', () => {
  it('prefers the stored value over the viewport default', () => {
    expect(resolveCollapsed(1100)).toBe(true);
    writeCollapsed(false);
    expect(resolveCollapsed(1100)).toBe(false);
  });
});

describe('bindSidebarCollapse', () => {
  it('toggles state, aria and persistence on click', () => {
    const sidebar = document.querySelector('[data-cap-sidebar]');
    const button = sidebar.querySelector('[data-cap-collapse]');
    bindSidebarCollapse(sidebar);

    button.click();
    expect(sidebar.dataset.collapsed).toBe('true');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Expandir menú');
    expect(readCollapsed()).toBe(true);

    button.click();
    expect(sidebar.dataset.collapsed).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Contraer menú');
  });

  it('stops reacting after teardown', () => {
    const sidebar = document.querySelector('[data-cap-sidebar]');
    const teardown = bindSidebarCollapse(sidebar);
    teardown();
    sidebar.querySelector('[data-cap-collapse]').click();
    expect(sidebar.dataset.collapsed).toBe('false');
  });
});
