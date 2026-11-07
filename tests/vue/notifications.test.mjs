import { mount } from '@vue/test-utils';
import CapHeader from '../../design/vue/CapHeader.vue';
import CapNotifications from '../../design/vue/CapNotifications.vue';

const notification = { title: 'Factura', time: '5 min', group: 'Hoy', unread: true, icon: 'file-document-outline' };
const notifications = [
  { ...notification, id: 'with-link', href: '/facturas/1' },
  { ...notification, id: 'without-link' },
];

function mountNotifications() {
  return mount(CapNotifications, { props: { notifications } });
}

test('Enter on a linked item does not emit: the browser click already does', async () => {
  const wrapper = mountNotifications();
  await wrapper.find('a.cap-notifications__item').trigger('keydown', { key: 'Enter' });
  expect(wrapper.emitted('notification')).toBeUndefined();
});

test('Enter on an item without link emits once', async () => {
  const wrapper = mountNotifications();
  await wrapper.find('div.cap-notifications__item').trigger('keydown', { key: 'Enter' });
  expect(wrapper.emitted('notification')).toEqual([['without-link']]);
});

test('click emits for both kinds of item', async () => {
  const wrapper = mountNotifications();
  await wrapper.find('a.cap-notifications__item').trigger('click');
  await wrapper.find('div.cap-notifications__item').trigger('click');
  expect(wrapper.emitted('notification')).toEqual([['with-link'], ['without-link']]);
});

test('the footer link also emits view-all', async () => {
  const wrapper = mount(CapNotifications, { props: { notifications, viewAllHref: '/notificaciones' } });
  await wrapper.find('a.cap-notifications__footer').trigger('click');
  expect(wrapper.emitted('view-all')).toHaveLength(1);
});

test('the panel in the header closes when a notification is opened', async () => {
  const wrapper = mount(CapHeader, {
    attachTo: document.body,
    props: { title: 'Inicio', user: { name: 'Ana', email: 'a@cap.cl' }, notifications },
  });
  await wrapper.find('.cap-shell-header__icon-button').trigger('click');
  expect(wrapper.find('#cap-notifications').attributes('hidden')).toBeUndefined();

  await wrapper.find('a.cap-notifications__item').trigger('click');
  expect(wrapper.find('#cap-notifications').attributes('hidden')).toBeDefined();
  wrapper.unmount();
});
