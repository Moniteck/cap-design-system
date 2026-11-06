import { mount } from '@vue/test-utils';
import CapMoreSheet from '../../design/vue/CapMoreSheet.vue';
import sample from '../fixtures/shell-sample.json';
import { pressKey } from '../helpers/keyboard.mjs';

const mountSheet = (props = {}) =>
  mount(CapMoreSheet, {
    props: { open: true, menu: sample.menu, user: sample.user, ...props },
    attachTo: document.body,
  });

test('is a modal dialog when open', () => {
  const wrapper = mountSheet();
  const sheet = wrapper.find('.cap-shell-sheet');
  expect(sheet.attributes('role')).toBe('dialog');
  expect(sheet.attributes('aria-modal')).toBe('true');
  expect(sheet.attributes('data-open')).toBe('true');
  wrapper.unmount();
});

test('emits close on Escape', () => {
  const wrapper = mountSheet();
  pressKey('Escape');
  expect(wrapper.emitted('close')).toHaveLength(1);
  wrapper.unmount();
});

test('ignores Escape while closed', () => {
  const wrapper = mountSheet({ open: false });
  pressKey('Escape');
  expect(wrapper.emitted('close')).toBeUndefined();
  wrapper.unmount();
});

test('emits close when the backdrop is clicked', async () => {
  const wrapper = mountSheet();
  await wrapper.find('.cap-shell-sheet__backdrop').trigger('click');
  expect(wrapper.emitted('close')).toHaveLength(1);
  wrapper.unmount();
});

test('lists the complete menu including children', () => {
  const wrapper = mountSheet();
  expect(wrapper.findAll('.cap-shell-sidebar__item').length).toBeGreaterThanOrEqual(7);
  expect(wrapper.findAll('.cap-shell-sidebar__child')).toHaveLength(3);
  wrapper.unmount();
});

test('emits logout from the account button', async () => {
  const wrapper = mountSheet();
  await wrapper.find('.cap-shell-sidebar__user-menu').trigger('click');
  expect(wrapper.emitted('logout')).toHaveLength(1);
  wrapper.unmount();
});
