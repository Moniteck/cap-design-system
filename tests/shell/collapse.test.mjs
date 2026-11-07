import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindSidebarCollapse, bindSidebarPeek, defaultCollapsed, resolveCollapsed } from '../../design/shell/js/collapse.js';
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

describe('bindSidebarPeek', () => {
  const pointer = (type, pointerType = 'mouse') => {
    const event = new Event(type);
    event.pointerType = pointerType;
    return event;
  };

  let sidebar;
  let unbind;

  beforeEach(() => {
    vi.useFakeTimers();
    sidebar = document.querySelector('[data-cap-sidebar]');
    sidebar.dataset.collapsed = 'true';
    unbind = bindSidebarPeek(sidebar);
  });

  afterEach(() => {
    unbind();
    vi.useRealTimers();
  });

  it('opens the rail after a short hover and closes it after leaving', () => {
    sidebar.dispatchEvent(pointer('pointerenter'));
    expect(sidebar.dataset.peek).toBeUndefined();
    vi.advanceTimersByTime(120);
    expect(sidebar.dataset.peek).toBe('open');

    sidebar.dispatchEvent(pointer('pointerleave'));
    vi.advanceTimersByTime(240);
    expect(sidebar.dataset.peek).toBeUndefined();
  });

  it('ignores a pointer that passes by quickly', () => {
    sidebar.dispatchEvent(pointer('pointerenter'));
    sidebar.dispatchEvent(pointer('pointerleave'));
    vi.advanceTimersByTime(1000);
    expect(sidebar.dataset.peek).toBeUndefined();
  });

  it('stays open when the pointer comes back before the close delay', () => {
    sidebar.dataset.peek = 'open';
    sidebar.dispatchEvent(pointer('pointerleave'));
    vi.advanceTimersByTime(100);
    sidebar.dispatchEvent(pointer('pointerenter'));
    vi.advanceTimersByTime(1000);
    expect(sidebar.dataset.peek).toBe('open');
  });

  it('does nothing on touch or when the panel is pinned open', () => {
    sidebar.dispatchEvent(pointer('pointerenter', 'touch'));
    vi.advanceTimersByTime(500);
    expect(sidebar.dataset.peek).toBeUndefined();

    sidebar.dataset.collapsed = 'false';
    sidebar.dispatchEvent(pointer('pointerenter'));
    vi.advanceTimersByTime(500);
    expect(sidebar.dataset.peek).toBeUndefined();
  });

  it('leaves peek when the collapse button pins the panel', () => {
    sidebar.dataset.peek = 'open';
    sidebar.querySelector('[data-cap-collapse]').click();
    expect(sidebar.dataset.peek).toBeUndefined();
  });

  it('closes with Escape and does not touch the stored preference', () => {
    sidebar.dataset.peek = 'open';
    sidebar.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(sidebar.dataset.peek).toBeUndefined();
    expect(readCollapsed()).toBeNull();
  });
});
