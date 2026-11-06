import { mount } from '@vue/test-utils';
import CapSidebar from '../../design/vue/CapSidebar.vue';
import sample from '../fixtures/shell-sample.json';

const props = { systemName: sample.systemName, menu: sample.menu, user: sample.user };

afterEach(() => {
  localStorage.clear();
  window.innerWidth = 1024;
});

test('collapses when the toggle is clicked', async () => {
  window.innerWidth = 1440;
  const wrapper = mount(CapSidebar, { props });
  const sidebar = wrapper.find('.cap-shell-sidebar');
  expect(sidebar.attributes('data-collapsed')).toBe('false');
  await wrapper.find('.cap-shell-sidebar__collapse').trigger('click');
  expect(sidebar.attributes('data-collapsed')).toBe('true');
  expect(wrapper.find('.cap-shell-sidebar__collapse').attributes('aria-expanded')).toBe('false');
});

test('mounts expanded at 1440px when localStorage throws', () => {
  window.innerWidth = 1440;
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } },
  });
  try {
    const wrapper = mount(CapSidebar, { props });
    expect(wrapper.find('.cap-shell-sidebar').attributes('data-collapsed')).toBe('false');
  } finally {
    Object.defineProperty(globalThis, 'localStorage', original);
  }
});

test('starts as a rail between 1024 and 1279px', () => {
  window.innerWidth = 1100;
  const wrapper = mount(CapSidebar, { props });
  expect(wrapper.find('.cap-shell-sidebar').attributes('data-collapsed')).toBe('true');
});

test('marks urgent counts with the urgent modifier only', () => {
  const counts = mount(CapSidebar, { props }).findAll('.cap-shell-sidebar__count');
  expect(counts).toHaveLength(2);
  expect(counts[0].classes()).not.toContain('cap-shell-sidebar__count--urgent');
  expect(counts[1].classes()).toContain('cap-shell-sidebar__count--urgent');
});

test('uses the group-label class for group headings', () => {
  const labels = mount(CapSidebar, { props }).findAll('.cap-shell-sidebar__group-label');
  expect(labels.map((label) => label.text())).toEqual(['Principal', 'General']);
});

test('uses the filled icon for the active item and the outline one otherwise', () => {
  const icons = mount(CapSidebar, { props }).findAll('.cap-shell-sidebar__icon');
  expect(icons[0].classes()).toContain('mdi-view-dashboard');
  expect(icons[1].classes()).toContain('mdi-file-document-outline');
});

test('renders items with children as a details branch', () => {
  const wrapper = mount(CapSidebar, { props });
  expect(wrapper.findAll('.cap-shell-sidebar__child')).toHaveLength(3);
  expect(wrapper.find('.cap-shell-sidebar__child-swatch').attributes('style')).toContain('var(--cap-wine)');
});

test('emits logout from the account button', async () => {
  const wrapper = mount(CapSidebar, { props });
  await wrapper.find('.cap-shell-sidebar__user-menu').trigger('click');
  expect(wrapper.emitted('logout')).toHaveLength(1);
});
