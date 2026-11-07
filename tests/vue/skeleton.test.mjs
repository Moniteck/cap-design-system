import { mount } from '@vue/test-utils';
import CapSkeleton from '../../design/vue/CapSkeleton.vue';

test('line is decorative', () => {
  const wrapper = mount(CapSkeleton);
  expect(wrapper.classes()).toContain('cap-skeleton');
  expect(wrapper.attributes('aria-hidden')).toBe('true');
});

test('table announces loading and repeats its rows', () => {
  const wrapper = mount(CapSkeleton, { props: { variant: 'table', rows: 3 } });
  expect(wrapper.attributes('role')).toBe('status');
  expect(wrapper.attributes('aria-label')).toBe('Cargando');
  expect(wrapper.findAll('.cap-skeleton-table__row')).toHaveLength(3);
});

test('stats renders four cards with a custom label', () => {
  const wrapper = mount(CapSkeleton, { props: { variant: 'stats', label: 'Cargando cifras' } });
  expect(wrapper.attributes('aria-label')).toBe('Cargando cifras');
  expect(wrapper.findAll('.cap-skeleton-stats__card')).toHaveLength(4);
});
