import { mount } from '@vue/test-utils';
import CapConfirmDialog from '../../design/vue/CapConfirmDialog.vue';
import { pressKey } from '../helpers/keyboard.mjs';

const baseProps = {
  open: true,
  title: '¿Anular la factura F-10233?',
  message: 'No se puede deshacer.',
  confirmLabel: 'Anular factura',
};

const mountDialog = (props = {}) =>
  mount(CapConfirmDialog, { props: { ...baseProps, ...props }, attachTo: document.body });

const findConfirmButton = (wrapper) => wrapper.find('.cap-button--danger');

test('renders nothing while closed', () => {
  const wrapper = mountDialog({ open: false });
  expect(wrapper.find('.cap-dialog').exists()).toBe(false);
  wrapper.unmount();
});

test('keeps the confirm button disabled until the acknowledgement is checked', async () => {
  const wrapper = mountDialog({ acknowledgeLabel: 'Entiendo que es definitiva' });
  expect(findConfirmButton(wrapper).attributes('disabled')).toBeDefined();
  await wrapper.find('.cap-dialog__ack input').setValue(true);
  expect(findConfirmButton(wrapper).attributes('disabled')).toBeUndefined();
  wrapper.unmount();
});

test('has no acknowledgement checkbox without acknowledgeLabel', () => {
  const wrapper = mountDialog();
  expect(wrapper.find('.cap-dialog__ack').exists()).toBe(false);
  expect(findConfirmButton(wrapper).attributes('disabled')).toBeUndefined();
  wrapper.unmount();
});

test('focuses Cancelar initially', () => {
  const wrapper = mountDialog();
  expect(document.activeElement.textContent).toBe('Cancelar');
  wrapper.unmount();
});

test('focuses Cancelar when opened after mounting', async () => {
  const wrapper = mountDialog({ open: false });
  await wrapper.setProps({ open: true });
  expect(document.activeElement.textContent).toBe('Cancelar');
  wrapper.unmount();
});

test('does not cancel when the backdrop is clicked', async () => {
  const wrapper = mountDialog();
  await wrapper.find('.cap-dialog__backdrop').trigger('click');
  expect(wrapper.emitted('cancel')).toBeUndefined();
  wrapper.unmount();
});

test('cancels on Escape, the close button and Cancelar', async () => {
  const wrapper = mountDialog();
  pressKey('Escape');
  await wrapper.find('.cap-dialog__close').trigger('click');
  await wrapper.find('.cap-button--secondary').trigger('click');
  expect(wrapper.emitted('cancel')).toHaveLength(3);
  wrapper.unmount();
});

test('emits confirm and marks the button busy while loading', async () => {
  const wrapper = mountDialog({ loading: true });
  expect(findConfirmButton(wrapper).attributes('aria-busy')).toBe('true');
  await wrapper.setProps({ loading: false });
  await findConfirmButton(wrapper).trigger('click');
  expect(wrapper.emitted('confirm')).toHaveLength(1);
  wrapper.unmount();
});

test('links the dialog to its title and message', () => {
  const wrapper = mountDialog();
  const panel = wrapper.find('.cap-dialog__panel');
  expect(panel.attributes('role')).toBe('alertdialog');
  expect(wrapper.find(`#${panel.attributes('aria-labelledby')}`).text()).toBe(baseProps.title);
  expect(wrapper.find(`#${panel.attributes('aria-describedby')}`).text()).toBe(baseProps.message);
  wrapper.unmount();
});
