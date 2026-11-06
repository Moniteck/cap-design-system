import { beforeEach, describe, expect, it } from 'vitest';
import { bindLoginForm } from '../../design/shell/js/login-form.js';

const submit = (form) => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

describe('bindLoginForm', () => {
  let form;
  let button;

  beforeEach(() => {
    document.body.innerHTML = '<form data-cap-login-form="Ingresando…"><button type="submit">Ingresar</button></form>';
    form = document.querySelector('form');
    button = form.querySelector('button');
  });

  it('blocks the button and shows the busy label on submit', () => {
    bindLoginForm(form);
    submit(form);

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.textContent).toBe('Ingresando…');
  });

  it('leaves the button alone when the app cancelled the submit', () => {
    form.addEventListener('submit', (event) => event.preventDefault());
    bindLoginForm(form);
    submit(form);

    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe('Ingresar');
  });

  it('restores the button when the browser returns from the back-forward cache', () => {
    bindLoginForm(form);
    submit(form);
    window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));

    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-busy')).toBe('false');
    expect(button.textContent).toBe('Ingresar');
  });

  it('stops reacting after teardown', () => {
    const teardown = bindLoginForm(form);
    teardown();
    submit(form);

    expect(button.disabled).toBe(false);
  });

  it('skips a form without a submit button', () => {
    form.innerHTML = '';
    expect(() => bindLoginForm(form)()).not.toThrow();
  });
});
