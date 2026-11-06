import { readCollapsed, writeCollapsed } from './storage.js';

const RAIL_MIN_WIDTH = 1024;
const PANEL_MIN_WIDTH = 1280;

export function defaultCollapsed(viewportWidth) {
  return viewportWidth >= RAIL_MIN_WIDTH && viewportWidth < PANEL_MIN_WIDTH;
}

export function resolveCollapsed(viewportWidth) {
  return readCollapsed() ?? defaultCollapsed(viewportWidth);
}

export function applyCollapsed(sidebar, collapsed) {
  sidebar.dataset.collapsed = String(collapsed);
  const button = sidebar.querySelector('[data-cap-collapse]');
  if (!button) return;
  button.setAttribute('aria-expanded', String(!collapsed));
  button.setAttribute('aria-label', collapsed ? 'Expandir menú' : 'Contraer menú');
}

export function bindSidebarCollapse(sidebar) {
  const button = sidebar.querySelector('[data-cap-collapse]');
  if (!button) return () => {};
  const toggle = () => {
    const collapsed = sidebar.dataset.collapsed !== 'true';
    applyCollapsed(sidebar, collapsed);
    writeCollapsed(collapsed);
  };
  button.addEventListener('click', toggle);
  return () => button.removeEventListener('click', toggle);
}
