import { mount } from '@vue/test-utils';
import CapButton from '../../design/vue/CapButton.vue';

test.each(['primary', 'secondary', 'danger'])('%s uses the shell button class', (variant) => {
  const wrapper = mount(CapButton, { props: { variant } });
  expect(wrapper.classes()).toEqual(['cap-button', `cap-button--${variant}`]);
});

test('renders a link when it has href', () => {
  const wrapper = mount(CapButton, { props: { href: '/facturas' }, slots: { default: 'Ver' } });
  expect(wrapper.element.tagName).toBe('A');
  expect(wrapper.attributes('href')).toBe('/facturas');
  expect(wrapper.attributes('disabled')).toBeUndefined();
});

test('uses linkProp for router links', () => {
  const wrapper = mount(CapButton, { props: { href: '/facturas', linkComponent: 'router-link-stub', linkProp: 'to' } });
  expect(wrapper.attributes('to')).toBe('/facturas');
});

test('is disabled and busy while loading, without its icon', () => {
  const wrapper = mount(CapButton, { props: { loading: true, icon: 'plus' } });
  expect(wrapper.attributes('disabled')).toBeDefined();
  expect(wrapper.attributes('aria-busy')).toBe('true');
  expect(wrapper.find('.mdi-plus').exists()).toBe(false);
});
