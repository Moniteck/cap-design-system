import { beforeEach, describe, expect, it } from 'vitest';
import { bindPopover } from '../../design/shell/js/popover.js';
import { pressKey } from '../helpers/keyboard.mjs';

let trigger;
let secondTrigger;
let panel;

beforeEach(() => {
  document.body.innerHTML = `
    <button id="one" aria-expanded="false" aria-controls="panel">1</button>
    <button id="two" aria-expanded="false" aria-controls="panel">2</button>
    <p id="outside">fuera</p>
    <section id="panel" hidden><a href="#">item</a></section>`;
  trigger = document.getElementById('one');
  secondTrigger = document.getElementById('two');
  panel = document.getElementById('panel');
});

describe('bindPopover', () => {
  it('opens on click and closes on outside click', () => {
    bindPopover(trigger, panel);
    trigger.click();
    expect(panel.hidden).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    document.getElementById('outside').click();
    expect(panel.hidden).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('stays open when clicking inside the panel', () => {
    bindPopover(trigger, panel);
    trigger.click();
    panel.querySelector('a').click();
    expect(panel.hidden).toBe(false);
  });

  it('closes on Escape and focuses the trigger', () => {
    bindPopover(trigger, panel);
    trigger.click();
    pressKey('Escape');
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  it('treats every trigger of the same panel as inside and focuses the opener on Escape', () => {
    bindPopover(trigger, panel);
    bindPopover(secondTrigger, panel);
    secondTrigger.click();
    expect(panel.hidden).toBe(false);
    pressKey('Escape');
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(secondTrigger);
  });

  it('stops reacting after teardown', () => {
    bindPopover(trigger, panel)();
    trigger.click();
    expect(panel.hidden).toBe(true);
  });
});
