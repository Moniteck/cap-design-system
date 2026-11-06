import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import CapAppLayout from '../../design/vue/CapAppLayout.vue';
import sample from '../fixtures/shell-sample.json';
import { pressKey } from '../helpers/keyboard.mjs';

const mountLayout = (props = {}, options = {}) =>
  mount(CapAppLayout, { props: { ...sample, ...props }, ...options });

test('shows four linked tabs plus the More button when given six tabs', () => {
  const tabs = [...sample.tabs, { label: 'Ayuda', icon: 'help-circle-outline', href: '#' }];
  const wrapper = mountLayout({ tabs });
  expect(wrapper.findAll('a.cap-shell-tabbar__tab')).toHaveLength(4);
  expect(wrapper.findAll('button.cap-shell-tabbar__tab--more')).toHaveLength(1);
});

test('marks the active tab with aria-current', () => {
  const [activeTab, otherTab] = mountLayout().findAll('a.cap-shell-tabbar__tab');
  expect(activeTab.attributes('aria-current')).toBe('page');
  expect(otherTab.attributes('aria-current')).toBeUndefined();
});

test('uses the custom link component for every navigation link', () => {
  const StubLink = defineComponent({
    props: { href: { type: String, default: '' } },
    setup: (props, { slots }) => () => h('a', { href: props.href, 'data-stub': 'true' }, slots.default?.()),
  });
  const wrapper = mountLayout({ linkComponent: StubLink });
  expect(wrapper.findAll('.cap-shell-sidebar__item[data-stub]').length).toBeGreaterThan(0);
  expect(wrapper.findAll('.cap-shell-tabbar__tab[data-stub]')).toHaveLength(4);
});

test('renders no floating action button without fabLabel', () => {
  expect(mountLayout().find('.cap-shell-fab').exists()).toBe(false);
});

test('renders the floating action button and emits fab when clicked', async () => {
  const wrapper = mountLayout({ fabLabel: 'Nueva factura' });
  const fab = wrapper.find('.cap-shell-fab');
  expect(fab.attributes('aria-label')).toBe('Nueva factura');
  await fab.trigger('click');
  expect(wrapper.emitted('fab')).toHaveLength(1);
});

test('opens the More sheet from the tab bar', async () => {
  const wrapper = mountLayout();
  await wrapper.find('.cap-shell-tabbar__tab--more').trigger('click');
  expect(wrapper.find('.cap-shell-sheet').attributes('data-open')).toBe('true');
  expect(wrapper.find('.cap-shell-tabbar__tab--more').attributes('aria-expanded')).toBe('true');
});

test('renders the default slot inside the content area', () => {
  const wrapper = mountLayout({}, { slots: { default: '<p id="page">Contenido</p>' } });
  expect(wrapper.find('.cap-shell__content #page').exists()).toBe(true);
});

test('forwards notification events', async () => {
  const wrapper = mountLayout();
  await wrapper.find('.cap-notifications__mark-read').trigger('click');
  await wrapper.find('.cap-notifications__item').trigger('click');
  expect(wrapper.emitted('mark-all-read')).toHaveLength(1);
  expect(wrapper.emitted('notification')[0]).toEqual(['n1']);
});

test('opens and closes the notifications panel from the header bell', async () => {
  const wrapper = mountLayout({}, { attachTo: document.body });
  const panel = wrapper.find('#cap-notifications');
  expect(panel.attributes('hidden')).toBeDefined();
  await wrapper.find('.cap-shell-header__icon-button[aria-controls]').trigger('click');
  expect(panel.attributes('hidden')).toBeUndefined();
  pressKey('Escape');
  await wrapper.vm.$nextTick();
  expect(panel.attributes('hidden')).toBeDefined();
  wrapper.unmount();
});

test('view-all footer emits without a href and links with one', async () => {
  const emitOnly = mountLayout();
  await emitOnly.find('button.cap-notifications__footer').trigger('click');
  expect(emitOnly.emitted('view-all')).toHaveLength(1);
  const linked = mountLayout({ notificationsHref: '/notificaciones' });
  expect(linked.find('a.cap-notifications__footer').attributes('href')).toBe('/notificaciones');
});

describe('linkProp', () => {
  const RouterLinkStub = defineComponent({
    props: { to: { type: String, required: true } },
    setup: (props, { slots }) => () => h('a', { 'data-to': props.to }, slots.default?.()),
  });

  test('passes the destination through the prop vue-router expects on every link', () => {
    const [first, ...others] = sample.notifications;
    const wrapper = mountLayout({
      linkComponent: RouterLinkStub,
      linkProp: 'to',
      backHref: '/facturas',
      notificationsHref: '/notificaciones',
      breadcrumbs: [{ label: 'Inicio', href: '/' }, { label: 'Facturas' }],
      notifications: [{ ...first, href: '/facturas/10232' }, ...others],
    });
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.length).toBeGreaterThan(10);
    for (const link of links) expect(link.attributes('data-to')).toBeTruthy();
    for (const link of links) expect(link.attributes('to')).toBeUndefined();
    for (const selector of [
      '.cap-shell-sidebar__item', '.cap-shell-sidebar__child', '.cap-shell-tabbar__tab', '.cap-shell-header__crumbs a',
      '.cap-shell-topbar__icon-button', 'a.cap-notifications__item', 'a.cap-notifications__footer', '.cap-shell-sheet .cap-shell-sidebar__item',
    ]) expect(wrapper.find(`${selector}[data-to]`).exists()).toBe(true);
  });

  test('a branch without href still gets a destination in the sheet', () => {
    const menu = [{ label: 'Principal', items: [{ label: 'Empresas', icon: 'domain', children: [{ label: 'Cintac', href: '/cintac' }] }] }];
    const wrapper = mountLayout({ menu, linkComponent: RouterLinkStub, linkProp: 'to' });
    expect(wrapper.find('.cap-shell-sheet .cap-shell-sidebar__item[data-to]').attributes('data-to')).toBe('#');
  });
});

describe('mobile topbar', () => {
  test('without backHref shows the logo and system name and keeps a hidden h1', () => {
    const topbar = mountLayout().find('.cap-shell-topbar');
    expect(topbar.find('.cap-shell-logo').exists()).toBe(true);
    expect(topbar.find('span.cap-shell-topbar__title').text()).toBe('Facturación');
    expect(topbar.find('h1.cap-shell-topbar__hidden-title').text()).toBe('Tablero');
  });

  test('with backHref shows the arrow and the title as the h1', () => {
    const topbar = mountLayout({ backHref: '/facturas' }).find('.cap-shell-topbar');
    expect(topbar.find('.cap-shell-logo').exists()).toBe(false);
    expect(topbar.find('a[aria-label="Volver"]').attributes('href')).toBe('/facturas');
    expect(topbar.find('h1.cap-shell-topbar__title').text()).toBe('Tablero');
    expect(topbar.findAll('h1')).toHaveLength(1);
  });

  test('the magnifier emits search and can be hidden without losing the bell', async () => {
    const wrapper = mountLayout();
    await wrapper.find('.cap-shell-topbar [aria-label="Buscar"]').trigger('click');
    expect(wrapper.emitted('search')).toHaveLength(1);
    const hidden = mountLayout({ topbarSearch: false }).find('.cap-shell-topbar');
    expect(hidden.find('[aria-label="Buscar"]').exists()).toBe(false);
    expect(hidden.find('[aria-controls="cap-notifications"]').exists()).toBe(true);
  });

  test('renders the topbar-actions slot', () => {
    const wrapper = mountLayout({}, { slots: { 'topbar-actions': '<button id="filter" type="button">f</button>' } });
    expect(wrapper.find('.cap-shell-topbar #filter').exists()).toBe(true);
  });
});

test('a notification with href is a link and keeps emitting', async () => {
  const [first, ...others] = sample.notifications;
  const wrapper = mountLayout({ notifications: [{ ...first, href: '/facturas/10232' }, ...others] });
  const link = wrapper.find('a.cap-notifications__item');
  expect(link.attributes('href')).toBe('/facturas/10232');
  expect(link.attributes('role')).toBeUndefined();
  await link.trigger('click');
  expect(wrapper.emitted('notification')[0]).toEqual(['n1']);
});
