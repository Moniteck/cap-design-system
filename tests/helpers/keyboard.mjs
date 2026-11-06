export function pressKey(key, { target = document, ...eventInit } = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...eventInit });
  target.dispatchEvent(event);
  return event;
}
