import { mount } from '@vue/test-utils';
import CapToaster from '../../design/vue/CapToaster.vue';
import { useToasts } from '../../design/vue/composables/useToasts.js';

afterEach(() => {
  const { toasts, dismiss } = useToasts();
  toasts.value.forEach((toast) => dismiss(toast.id));
});

test('keeps at most three toasts in the DOM, newest last', async () => {
  const wrapper = mount(CapToaster);
  const { show } = useToasts();
  for (let number = 1; number <= 5; number++) show({ status: 'warning', title: `Aviso ${number}` });
  await wrapper.vm.$nextTick();
  const titles = wrapper.findAll('.cap-toast__title').map((title) => title.text());
  expect(titles).toEqual(['Aviso 3', 'Aviso 4', 'Aviso 5']);
});

test('uses role alert for errors and status otherwise', async () => {
  const wrapper = mount(CapToaster);
  const { show } = useToasts();
  show({ status: 'error', title: 'Falló' });
  show({ status: 'ok', title: 'Listo' });
  await wrapper.vm.$nextTick();
  const roles = wrapper.findAll('.cap-toast').map((toast) => toast.attributes('role'));
  expect(roles).toEqual(['alert', 'status']);
});

test('only auto-closing toasts show the countdown bar', async () => {
  const wrapper = mount(CapToaster);
  const { show } = useToasts();
  show({ status: 'ok', title: 'Listo' });
  show({ status: 'warning', title: 'Ojo' });
  await wrapper.vm.$nextTick();
  const [okToast, warningToast] = wrapper.findAll('.cap-toast');
  expect(okToast.find('.cap-toast__progress').exists()).toBe(true);
  expect(warningToast.find('.cap-toast__progress').exists()).toBe(false);
});

test('dismisses from the close button', async () => {
  const wrapper = mount(CapToaster);
  useToasts().show({ status: 'warning', title: 'Ojo' });
  await wrapper.vm.$nextTick();
  await wrapper.find('.cap-toast__close').trigger('click');
  expect(wrapper.findAll('.cap-toast')).toHaveLength(0);
});

test('runs the action and dismisses the toast', async () => {
  const wrapper = mount(CapToaster);
  const onSelect = vi.fn();
  useToasts().show({ status: 'neutral', title: 'Archivado', action: { label: 'Deshacer', onSelect } });
  await wrapper.vm.$nextTick();
  await wrapper.find('.cap-toast__action').trigger('click');
  expect(onSelect).toHaveBeenCalledOnce();
  expect(wrapper.findAll('.cap-toast')).toHaveLength(0);
});
