import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountToaster } from '../../design/shell/js/toasts.js';

let container;

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div id="toaster" data-cap-toaster></div>';
  container = document.getElementById('toaster');
});

afterEach(() => vi.useRealTimers());

describe('mountToaster', () => {
  it('renders errors as alerts without a progress bar', () => {
    mountToaster(container).show({ status: 'error', title: 'Falló', detail: 'Reintenta' });
    const toast = container.querySelector('.cap-toast');
    expect(toast.getAttribute('role')).toBe('alert');
    expect(toast.classList.contains('cap-toast--error')).toBe(true);
    expect(toast.querySelector('.cap-toast__progress')).toBeNull();
    expect(toast.querySelector('.cap-toast__detail').textContent).toBe('Reintenta');
  });

  it('renders ok toasts as status with a progress bar', () => {
    mountToaster(container).show({ status: 'ok', title: 'Listo' });
    const toast = container.querySelector('.cap-toast');
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.querySelector('.cap-toast__progress')).not.toBeNull();
  });

  it('removes the toast when the close button is clicked', () => {
    mountToaster(container).show({ status: 'warning', title: 'Ojo' });
    container.querySelector('.cap-toast__close').click();
    expect(container.querySelector('.cap-toast')).toBeNull();
  });

  it('runs the action and dismisses', () => {
    const onSelect = vi.fn();
    mountToaster(container).show({ status: 'neutral', title: 'Archivado', action: { label: 'Deshacer', onSelect } });
    container.querySelector('.cap-toast__action').click();
    expect(onSelect).toHaveBeenCalledOnce();
    expect(container.querySelector('.cap-toast')).toBeNull();
  });

  it('pauses on mouseenter and resumes on mouseleave', () => {
    mountToaster(container).show({ status: 'ok', title: 'Listo' });
    const toast = container.querySelector('.cap-toast');
    toast.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(20000);
    expect(container.querySelector('.cap-toast')).not.toBeNull();
    toast.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(5000);
    expect(container.querySelector('.cap-toast')).toBeNull();
  });

  it('converts initial [data-cap-toast] children into toasts', () => {
    container.innerHTML = '<div data-cap-toast data-status="ok" data-title="Guardado" data-detail="Sin cambios pendientes"></div>';
    mountToaster(container);
    const toasts = container.querySelectorAll('.cap-toast');
    expect(toasts).toHaveLength(1);
    expect(toasts[0].querySelector('.cap-toast__title').textContent).toBe('Guardado');
    expect(container.querySelector('[data-cap-toast]')).toBeNull();
  });
});
