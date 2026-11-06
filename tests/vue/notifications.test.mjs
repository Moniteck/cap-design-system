import { mount } from '@vue/test-utils';
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
