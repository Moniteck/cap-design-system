import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createToastQueue } from '../../design/shell/js/toast-queue.js';

let queue;
let onChange;

beforeEach(() => {
  vi.useFakeTimers();
  onChange = vi.fn();
  queue = createToastQueue(onChange);
});

afterEach(() => vi.useRealTimers());

describe('createToastQueue', () => {
  it('keeps the 3 newest of a burst of 5, newest last', () => {
    for (let index = 1; index <= 5; index += 1) {
      queue.show({ status: 'error', title: `t${index}` });
    }
    expect(queue.list().map((toast) => toast.title)).toEqual(['t3', 't4', 't5']);
  });

  it('auto-closes ok toasts after 5000 ms', () => {
    queue.show({ status: 'ok', title: 'listo' });
    vi.advanceTimersByTime(4999);
    expect(queue.list()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(queue.list()).toHaveLength(0);
  });

  it('keeps error toasts after 60 seconds', () => {
    queue.show({ status: 'error', title: 'falló' });
    vi.advanceTimersByTime(60000);
    expect(queue.list()).toHaveLength(1);
    expect(queue.list()[0].autoClose).toBe(false);
    expect(queue.list()[0].remainingMs).toBeNull();
  });

  it('preserves remaining time across pause and resume', () => {
    const id = queue.show({ status: 'info', title: 'aviso' });
    vi.advanceTimersByTime(2000);
    queue.pause(id);
    vi.advanceTimersByTime(10000);
    expect(queue.list()).toHaveLength(1);
    expect(queue.list()[0].remainingMs).toBe(3000);
    queue.resume(id);
    vi.advanceTimersByTime(2999);
    expect(queue.list()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(queue.list()).toHaveLength(0);
  });

  it('dismisses by id and notifies on every change', () => {
    const id = queue.show({ status: 'warning', title: 'cuidado' });
    queue.dismiss(id);
    expect(queue.list()).toHaveLength(0);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('cancels the timer of a toast evicted by the limit', () => {
    queue.show({ status: 'ok', title: 'viejo' });
    for (let index = 0; index < 3; index += 1) queue.show({ status: 'error', title: `e${index}` });
    vi.advanceTimersByTime(5000);
    expect(queue.list().map((toast) => toast.title)).toEqual(['e0', 'e1', 'e2']);
  });

  it('clear removes every toast and cancels their timers with one notification', () => {
    queue.show({ status: 'ok', title: 'uno' });
    queue.show({ status: 'error', title: 'dos' });
    onChange.mockClear();
    queue.clear();
    expect(queue.list()).toEqual([]);
    expect(onChange).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(10000);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
