import { onBeforeUnmount, onMounted, ref } from 'vue';
import { belongsToPanel } from '../../shell/js/popover.js';
import { useEscapeKey } from './useEscapeKey.js';

export function usePopover(panelId) {
  const isOpen = ref(false);
  let opener = null;

  const close = () => {
    isOpen.value = false;
  };

  const toggle = (event) => {
    opener = event.currentTarget;
    isOpen.value = !isOpen.value;
  };

  const onDocumentClick = (event) => {
    if (isOpen.value && !belongsToPanel(event.target, panelId)) close();
  };

  useEscapeKey(isOpen, () => {
    close();
    opener?.focus();
  });
  onMounted(() => document.addEventListener('click', onDocumentClick));
  onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick));

  return { isOpen, toggle, close };
}
