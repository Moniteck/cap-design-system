import { mount } from '@vue/test-utils';
import CapAppLayout from '../../design/vue/CapAppLayout.vue';
import sample from '../fixtures/shell-sample.json';
import { collectShellClasses } from '../helpers/shell-classes.mjs';
import { readReference } from '../helpers/repo-files.mjs';

test('CapAppLayout generates the same cap-shell and cap-notifications classes as reference/app.html', () => {
  const referenceHtml = readReference('app');
  const wrapper = mount(CapAppLayout, {
    props: { ...sample, fabLabel: 'Nueva factura', notificationsHref: '#' },
    slots: { search: '<input class="cap-shell-header__search-input" id="cap-global-search" type="search">' },
  });
  const expected = [...collectShellClasses(referenceHtml)].sort();
  const actual = [...collectShellClasses(wrapper.html())].sort();
  expect(actual).toEqual(expected);
});
