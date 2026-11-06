import { ref } from 'vue';
import { resolveCollapsed } from '../../shell/js/collapse.js';
import { writeCollapsed } from '../../shell/js/storage.js';

export function useSidebarCollapse() {
  const collapsed = ref(typeof window === 'undefined' ? false : resolveCollapsed(window.innerWidth));

  function toggle() {
    collapsed.value = !collapsed.value;
    writeCollapsed(collapsed.value);
  }

  return { collapsed, toggle };
}
