import { beforeEach, describe, expect, it } from 'vitest';
import { bindNotificationFilter } from '../../design/shell/js/notification-filter.js';

const panelHtml = (items) => `
  <section data-cap-notifications>
    <button data-cap-notification-filter="all" aria-pressed="true">Todas</button>
    <button data-cap-notification-filter="unread" aria-pressed="false">No leídas</button>
    ${items}
    <p data-cap-notification-empty hidden>No tienes notificaciones sin leer.</p>
  </section>`;

const mixedItems = `
  <p class="cap-notifications__group" id="today">Hoy</p>
  <div class="cap-notifications__item" id="unread" data-unread="true"></div>
  <p class="cap-notifications__group" id="yesterday">Ayer</p>
  <div class="cap-notifications__item" id="read"></div>`;

const byId = (id) => document.getElementById(id);
const filterButton = (name) => document.querySelector(`[data-cap-notification-filter="${name}"]`);
const emptyMessage = () => document.querySelector('[data-cap-notification-empty]');

describe('bindNotificationFilter', () => {
  beforeEach(() => {
    document.body.innerHTML = panelHtml(mixedItems);
  });

  it('shows only unread items and hides groups left empty', () => {
    bindNotificationFilter(document.querySelector('[data-cap-notifications]'));
    filterButton('unread').click();

    expect(byId('unread').hidden).toBe(false);
    expect(byId('read').hidden).toBe(true);
    expect(byId('today').hidden).toBe(false);
    expect(byId('yesterday').hidden).toBe(true);
    expect(filterButton('unread').getAttribute('aria-pressed')).toBe('true');
    expect(filterButton('all').getAttribute('aria-pressed')).toBe('false');
  });

  it('restores everything with the all filter', () => {
    bindNotificationFilter(document.querySelector('[data-cap-notifications]'));
    filterButton('unread').click();
    filterButton('all').click();

    expect(byId('read').hidden).toBe(false);
    expect(byId('yesterday').hidden).toBe(false);
    expect(filterButton('all').getAttribute('aria-pressed')).toBe('true');
  });

  it('shows the empty message when nothing is unread', () => {
    document.body.innerHTML = panelHtml('<p class="cap-notifications__group">Ayer</p><div class="cap-notifications__item"></div>');
    bindNotificationFilter(document.querySelector('[data-cap-notifications]'));
    filterButton('unread').click();
    expect(emptyMessage().hidden).toBe(false);

    filterButton('all').click();
    expect(emptyMessage().hidden).toBe(true);
  });

  it('stops reacting after teardown', () => {
    const teardown = bindNotificationFilter(document.querySelector('[data-cap-notifications]'));
    teardown();
    filterButton('unread').click();

    expect(byId('read').hidden).toBe(false);
  });
});
