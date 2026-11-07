import { execFileSync } from 'node:child_process';
import sample from './fixtures/shell-sample.json';
import { collectShellClasses } from './helpers/shell-classes.mjs';
import { readReference, readRepoFile } from './helpers/repo-files.mjs';

const htmlByRenderArguments = new Map();

function renderBladeHtml(component, props, context) {
  const cacheKey = JSON.stringify([component, props, context]);
  if (!htmlByRenderArguments.has(cacheKey)) {
    const html = execFileSync(
      'php',
      ['tests/blade/render.php', component, JSON.stringify(props), JSON.stringify(context)],
      { encoding: 'utf8' },
    );
    htmlByRenderArguments.set(cacheKey, html);
  }
  return htmlByRenderArguments.get(cacheKey);
}

function renderComponent(component, props = {}, context = {}) {
  const html = renderBladeHtml(component, props, context);
  const container = document.createElement('div');
  container.innerHTML = html;
  return { html, container };
}

function renderLayout(props = {}, context = {}) {
  return renderComponent('app-layout', { ...sample, slot: '', ...props }, context);
}

const sixTabs = [
  ...sample.tabs,
  { label: 'Ayuda', icon: 'help-circle-outline', href: '#' },
];

describe('tab-bar', () => {
  test('renders four links and the "Más" button for six tabs', () => {
    const { container } = renderComponent('tab-bar', { tabs: sixTabs });
    expect(container.querySelectorAll('a.cap-shell-tabbar__tab')).toHaveLength(4);
    const more = container.querySelector('button.cap-shell-tabbar__tab--more');
    expect(more.textContent).toContain('Más');
    expect(more.hasAttribute('data-cap-sheet-trigger')).toBe(true);
  });
});

describe('active item resolution', () => {
  const invoiceItem = { label: 'Facturas', icon: 'file-document-outline', href: '#', route: 'invoices.*' };
  const menu = [{ label: 'Principal', items: [invoiceItem] }];

  test('marks the item current when its route matches', () => {
    const { container } = renderLayout({ menu }, { routeIs: true });
    expect(container.querySelector('a.cap-shell-sidebar__item').getAttribute('aria-current')).toBe('page');
  });

  test('does not mark the item current when its route does not match', () => {
    const { container } = renderLayout({ menu }, { routeIs: false });
    expect(container.querySelector('a.cap-shell-sidebar__item').hasAttribute('aria-current')).toBe(false);
  });

  test('an explicit active: false wins over the route', () => {
    const explicitMenu = [{ label: 'Principal', items: [{ ...invoiceItem, active: false }] }];
    const { container } = renderLayout({ menu: explicitMenu }, { routeIs: true });
    expect(container.querySelector('a.cap-shell-sidebar__item').hasAttribute('aria-current')).toBe(false);
  });
});

describe('sidebar', () => {
  test('exposes the sidebar hook and the collapse button with aria-expanded', () => {
    const { container } = renderLayout();
    expect(container.querySelector('[data-cap-sidebar]')).not.toBeNull();
    expect(container.querySelector('[data-cap-collapse]').getAttribute('aria-expanded')).toBe('true');
  });

  test('renders menu children as a branch with swatches', () => {
    const { container } = renderLayout();
    expect(container.querySelectorAll('details .cap-shell-sidebar__child')).toHaveLength(3);
  });
});

describe('toaster', () => {
  test('renders only the container without a flashed toast', () => {
    const { container } = renderComponent('toaster');
    expect(container.querySelector('[data-cap-toaster]')).not.toBeNull();
    expect(container.querySelector('[data-cap-toast]')).toBeNull();
  });

  test('renders the flashed cap_toast as the initial toast', () => {
    const session = { cap_toast: { status: 'ok', title: 'Factura emitida', detail: 'F-10235' } };
    const { container } = renderComponent('toaster', {}, { session });
    const toast = container.querySelector('[data-cap-toaster] [data-cap-toast]');
    expect(toast.getAttribute('data-status')).toBe('ok');
    expect(toast.getAttribute('data-title')).toBe('Factura emitida');
    expect(toast.getAttribute('data-detail')).toBe('F-10235');
  });
});

describe('confirm-dialog', () => {
  const props = {
    id: 'cap-confirm-void',
    title: '¿Anular la factura?',
    message: 'No se puede deshacer.',
    confirmLabel: 'Anular factura',
    action: '/invoices/1',
  };

  test('with acknowledge-label renders the checkbox and a disabled accept button', () => {
    const { container } = renderComponent('confirm-dialog', { ...props, acknowledgeLabel: 'Entiendo' });
    expect(container.querySelector('[data-cap-confirm-ack]')).not.toBeNull();
    expect(container.querySelector('[data-cap-confirm-accept]').disabled).toBe(true);
  });

  test('without acknowledge-label the accept button is enabled', () => {
    const { container } = renderComponent('confirm-dialog', props);
    expect(container.querySelector('[data-cap-confirm-ack]')).toBeNull();
    expect(container.querySelector('[data-cap-confirm-accept]').disabled).toBe(false);
  });

  test('is hidden, wired to the confirm hooks and posts to the action', () => {
    const { container } = renderComponent('confirm-dialog', props);
    const dialog = container.querySelector('[data-cap-confirm]');
    expect(dialog.hidden).toBe(true);
    expect(dialog.id).toBe('cap-confirm-void');
    expect(container.querySelector('[data-cap-confirm-cancel]')).not.toBeNull();
    expect(container.querySelector('[data-cap-confirm-close]')).not.toBeNull();
    const form = container.querySelector('form');
    expect(form.getAttribute('method')).toBe('POST');
    expect(form.getAttribute('action')).toBe('/invoices/1');
    expect(container.querySelector('input[name="_method"]')).toBeNull();
  });

  test('method="DELETE" adds the _method field', () => {
    const { container } = renderComponent('confirm-dialog', { ...props, method: 'DELETE' });
    expect(container.querySelector('input[name="_method"]').value).toBe('DELETE');
  });
});

describe('login', () => {
  const props = { systemName: 'Facturación', tagline: 'Emite y cobra.', helpEmail: 'mesadeayuda@cap.cl' };

  test('a single provider adds the single modifier', () => {
    const { container } = renderComponent('login', { ...props, providers: ['microsoft'] });
    expect(container.querySelector('.cap-login__providers--single')).not.toBeNull();
  });

  test('two providers do not add the single modifier', () => {
    const { container } = renderComponent('login', { ...props, providers: ['microsoft', 'google'] });
    expect(container.querySelector('.cap-login__providers')).not.toBeNull();
    expect(container.querySelector('.cap-login__providers--single')).toBeNull();
  });

  test('posts credentials to /login and links providers to the fallback urls', () => {
    const { container } = renderComponent('login', { ...props, providers: ['microsoft'] });
    const form = container.querySelector('form.cap-login__form');
    expect(form.getAttribute('method')).toBe('POST');
    expect(form.getAttribute('action')).toBe('/login');
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(container.querySelector('input[name="remember"]')).not.toBeNull();
    expect(container.querySelector('a.cap-button--provider').getAttribute('href')).toBe('/auth/microsoft/redirect');
  });

  test('uses named routes when they exist', () => {
    const routes = { login: '/ingresar', 'auth.redirect': '/oauth/{provider}' };
    const { container } = renderComponent('login', { ...props, providers: ['google'] }, { routes });
    expect(container.querySelector('form.cap-login__form').getAttribute('action')).toBe('/ingresar');
    expect(container.querySelector('a.cap-button--provider').getAttribute('href')).toBe('/oauth/google');
  });

  test('renders the alert and flags the password field on error', () => {
    const alert = { status: 'error', title: 'Correo o contraseña incorrectos', detail: 'Te quedan 2 intentos.' };
    const { container } = renderComponent('login', { ...props, alert });
    expect(container.querySelector('.cap-alert--error').getAttribute('role')).toBe('alert');
    expect(container.querySelector('#login-password-field').classList).toContain('cap-field--error');
  });

  test('recover mode renders the recovery form', () => {
    const { container } = renderComponent('login', { ...props, mode: 'recover' });
    expect(container.querySelector('.cap-login__title').textContent).toBe('Recupera tu acceso');
    expect(container.querySelector('input[name="password"]')).toBeNull();
  });

  test('escapes user supplied text', () => {
    const { html } = renderComponent('login', { ...props, tagline: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>');
  });
});

describe('alert', () => {
  test('error alerts use role="alert" and ok alerts role="status"', () => {
    const error = renderComponent('alert', { status: 'error', title: 'Falló' }).container.querySelector('.cap-alert');
    const ok = renderComponent('alert', { status: 'ok', title: 'Listo', detail: 'Guardado' }).container.querySelector('.cap-alert');
    expect(error.getAttribute('role')).toBe('alert');
    expect(ok.getAttribute('role')).toBe('status');
    expect(ok.querySelector('.cap-alert__detail').textContent).toBe('Guardado');
  });
});

describe('skeleton', () => {
  test('table announces loading and repeats its rows', () => {
    const html = renderBladeHtml('skeleton', { variant: 'table', rows: 3 });
    expect(html).toContain('role="status"');
    expect(html.match(/cap-skeleton-table__row/g)).toHaveLength(3);
  });

  test('line is decorative', () => {
    const html = renderBladeHtml('skeleton', {});
    expect(html).toContain('class="cap-skeleton"');
    expect(html).toContain('aria-hidden="true"');
  });
});

describe('app-layout', () => {
  const slots = {
    slot: '<p class="page-body">Contenido</p>',
    search: '<input class="cap-shell-header__search-input" id="cap-global-search" type="search" data-cap-search>',
  };

  test('generates the same cap-shell and cap-notifications classes as reference/app.html', () => {
    const referenceHtml = readReference('app');
    const { html } = renderComponent('app-layout', { ...sample, fabLabel: 'Nueva factura', notificationsHref: '#', markReadAction: '/notifications/read', ...slots });
    expect([...collectShellClasses(html)].sort()).toEqual([...collectShellClasses(referenceHtml)].sort());
  });

  test('renders slots, the toaster and only the sidebar state script', () => {
    const { html, container } = renderComponent('app-layout', { ...sample, ...slots });
    expect(container.querySelector('main.cap-shell__content .page-body')).not.toBeNull();
    expect(container.querySelector('[data-cap-toaster]')).not.toBeNull();
    expect(html).not.toMatch(/<style/);
    expect(container.querySelectorAll('script')).toHaveLength(1);
    expect(container.querySelector('[data-cap-sidebar] > script')).not.toBeNull();
  });

  test('button renders a link with href and is busy while loading', () => {
    const link = renderComponent('button', { href: '/facturas', slot: 'Ver' }).container.querySelector('a');
    expect(link.getAttribute('href')).toBe('/facturas');

    const button = renderComponent('button', { variant: 'secondary', loading: true, slot: 'Guardar' }).container.querySelector('button');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.className).toBe('cap-button cap-button--secondary');
  });

  test('omits the search label and the fab when not provided', () => {
    const { container } = renderComponent('app-layout', { ...sample, slot: '' });
    expect(container.querySelector('.cap-shell-header__search')).toBeNull();
    expect(container.querySelector('.cap-shell-fab')).toBeNull();
  });

  test('shows the unread count on the bell and renders header actions', () => {
    const { container } = renderComponent('app-layout', { ...sample, slot: '', headerActions: '<button class="extra-action" type="button">x</button>' });
    expect(container.querySelector('[data-cap-popover-trigger]').getAttribute('aria-label')).toBe('Notificaciones, 3 sin leer');
    expect(container.querySelector('.cap-shell-header__actions .extra-action')).not.toBeNull();
    expect(container.querySelector('.cap-notifications__tab-count').textContent).toBe('3');
  });
});

describe('sidebar state script', () => {
  const COLLAPSED_KEY = 'cap-shell:sidebar-collapsed';

  function runSidebarScript() {
    const { html, container } = renderLayout();
    document.body.innerHTML = html;
    new Function(container.querySelector('[data-cap-sidebar] > script').textContent)();
    return document.querySelector('[data-cap-sidebar]');
  }

  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  test('reads the same key as storage.js', () => {
    expect(readRepoFile('design/shell/js/storage.js')).toContain(COLLAPSED_KEY);
  });

  test('uses the same breakpoints as collapse.js', () => {
    const collapseSource = readRepoFile('design/shell/js/collapse.js');
    const railMinWidth = collapseSource.match(/RAIL_MIN_WIDTH = (\d+)/)[1];
    const panelMinWidth = collapseSource.match(/PANEL_MIN_WIDTH = (\d+)/)[1];
    const { container } = renderLayout();
    expect(container.querySelector('[data-cap-sidebar] > script').textContent)
      .toContain(`innerWidth >= ${railMinWidth} && innerWidth < ${panelMinWidth}`);
  });

  test('applies the stored state and leaves no inline transition', () => {
    localStorage.setItem(COLLAPSED_KEY, 'true');
    const sidebar = runSidebarScript();
    expect(sidebar.dataset.collapsed).toBe('true');
    expect(sidebar.style.transition).toBe('');
  });

  test('survives a blocked localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(() => runSidebarScript()).not.toThrow();
  });
});

describe('logout', () => {
  const logoutForms = (container) => [...container.querySelectorAll('form:has(.cap-shell-sidebar__user-menu)')];

  test('sidebar and sheet post to /logout with csrf by default', () => {
    const forms = logoutForms(renderLayout().container);
    expect(forms).toHaveLength(2);
    for (const form of forms) {
      expect(form.getAttribute('method')).toBe('POST');
      expect(form.getAttribute('action')).toBe('/logout');
      expect(form.querySelector('input[name="_token"]')).not.toBeNull();
      expect(form.querySelector('button').getAttribute('type')).toBe('submit');
    }
  });

  test('uses the logout route when it exists', () => {
    const forms = logoutForms(renderLayout({}, { routes: { logout: '/salir' } }).container);
    expect(forms.map((form) => form.getAttribute('action'))).toEqual(['/salir', '/salir']);
  });

  test('logout-action wins over the route', () => {
    const forms = logoutForms(renderLayout({ logoutAction: '/cerrar' }, { routes: { logout: '/salir' } }).container);
    expect(forms.map((form) => form.getAttribute('action'))).toEqual(['/cerrar', '/cerrar']);
  });
});

describe('notifications', () => {
  test('hides mark as read without mark-read-action', () => {
    expect(renderLayout().container.querySelector('.cap-notifications__mark-read')).toBeNull();
  });

  test('mark-read-action renders a POST form with csrf', () => {
    const { container } = renderLayout({ markReadAction: '/notificaciones/leer' });
    const form = container.querySelector('form:has(.cap-notifications__mark-read)');
    expect(form.getAttribute('method')).toBe('POST');
    expect(form.getAttribute('action')).toBe('/notificaciones/leer');
    expect(form.querySelector('input[name="_token"]')).not.toBeNull();
  });

  test('a notification with href is a link and one without stays a block', () => {
    const [first, ...others] = sample.notifications;
    const { container } = renderLayout({ notifications: [{ ...first, href: '/facturas/10232' }, ...others] });
    expect(container.querySelector('a.cap-notifications__item').getAttribute('href')).toBe('/facturas/10232');
    expect(container.querySelectorAll('div.cap-notifications__item')).toHaveLength(others.length);
  });

  test('exposes the filter hooks', () => {
    const { container } = renderLayout();
    expect(container.querySelector('[data-cap-notifications]')).not.toBeNull();
    expect(container.querySelector('[data-cap-notification-filter="all"]').getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('[data-cap-notification-filter="unread"]')).not.toBeNull();
    expect(container.querySelector('[data-cap-notification-empty]').hidden).toBe(true);
  });
});

describe('mobile topbar', () => {
  const topbar = (props) => renderLayout(props).container.querySelector('.cap-shell-topbar');

  test('without back-href shows the logo and system name and keeps a hidden h1', () => {
    const bar = topbar();
    expect(bar.querySelector('.cap-shell-logo')).not.toBeNull();
    expect(bar.querySelector('span.cap-shell-topbar__title').textContent).toBe('Facturación');
    expect(bar.querySelector('h1.cap-shell-topbar__hidden-title').textContent).toBe('Tablero');
  });

  test('with back-href shows the arrow and the title as the h1', () => {
    const bar = topbar({ backHref: '/facturas' });
    expect(bar.querySelector('.cap-shell-logo')).toBeNull();
    expect(bar.querySelector('a[aria-label="Volver"]').getAttribute('href')).toBe('/facturas');
    expect(bar.querySelector('h1.cap-shell-topbar__title').textContent).toBe('Tablero');
    expect(bar.querySelectorAll('h1')).toHaveLength(1);
  });

  test('links the magnifier to search-href, can hide it and keeps the bell', () => {
    expect(topbar({ searchHref: '/buscar' }).querySelector('a[aria-label="Buscar"]').getAttribute('href')).toBe('/buscar');
    const hidden = topbar({ topbarSearch: false });
    expect(hidden.querySelector('[aria-label="Buscar"]')).toBeNull();
    expect(hidden.querySelector('[data-cap-popover-trigger]')).not.toBeNull();
  });

  test('renders the topbarActions slot', () => {
    expect(topbar({ topbarActions: '<button class="extra-filter" type="button">f</button>' }).querySelector('.extra-filter')).not.toBeNull();
  });
});

describe('more sheet', () => {
  test('a branch without href does not break the page', () => {
    const menu = [{ label: 'Principal', items: [{ label: 'Empresas', icon: 'domain', children: [{ label: 'Cintac', href: '/cintac' }] }] }];
    const { container } = renderLayout({ menu });
    expect(container.querySelector('.cap-shell-sheet a.cap-shell-sidebar__item').getAttribute('href')).toBe('#');
  });
});

describe('login form', () => {
  const props = { systemName: 'Facturación', tagline: 'Emite y cobra.', helpEmail: 'mesadeayuda@cap.cl' };

  test('both forms carry the busy label', () => {
    expect(renderComponent('login', props).container.querySelector('form').dataset.capLoginForm).toBe('Ingresando…');
    expect(renderComponent('login', { ...props, mode: 'recover' }).container.querySelector('form').dataset.capLoginForm).toBe('Enviando…');
  });

  const recoverLink = (container) => container.querySelector('.cap-login__options .cap-login__link').getAttribute('href');

  test('recover-url falls back to /forgot-password', () => {
    expect(recoverLink(renderComponent('login', props).container)).toBe('/forgot-password');
  });

  test('recover-url uses password.request when it exists', () => {
    const routes = { 'password.request': '/recuperar' };
    expect(recoverLink(renderComponent('login', props, { routes }).container)).toBe('/recuperar');
  });

  test('an explicit recover-url wins', () => {
    expect(recoverLink(renderComponent('login', { ...props, recoverUrl: '/ayuda' }).container)).toBe('/ayuda');
  });
});
