import { beforeEach, describe, expect, it } from 'vitest';
import { bindPasswordToggle } from '../../design/shell/js/password.js';

let input;
let button;

beforeEach(() => {
  document.body.innerHTML = `
    <input id="pw" type="password">
    <button aria-controls="pw" aria-label="Mostrar contraseña"><i class="mdi mdi-eye-outline"></i></button>`;
  input = document.getElementById('pw');
  button = document.querySelector('button');
  bindPasswordToggle(button);
});

describe('bindPasswordToggle', () => {
  it('toggles type and label', () => {
    button.click();
    expect(input.type).toBe('text');
    expect(button.getAttribute('aria-label')).toBe('Ocultar contraseña');
    button.click();
    expect(input.type).toBe('password');
    expect(button.getAttribute('aria-label')).toBe('Mostrar contraseña');
  });
});
