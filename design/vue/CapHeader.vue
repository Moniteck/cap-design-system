<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import CapAvatar from './CapAvatar.vue';
import CapBellButton from './CapBellButton.vue';
import CapNotifications from './CapNotifications.vue';
import { usePopover } from './composables/usePopover.js';
import { bindCommandK } from '../shell/js/command-k.js';

const props = defineProps({
  title: { type: String, required: true },
  systemName: { type: String, default: '' },
  breadcrumbs: { type: Array, default: () => [] },
  user: { type: Object, required: true },
  notifications: { type: Array, default: () => [] },
  linkComponent: { type: [String, Object], default: 'a' },
  linkProp: { type: String, default: 'href' },
  backHref: { type: String, default: '' },
  topbarSearch: { type: Boolean, default: true },
  notificationsHref: { type: String, default: '' },
});

const emit = defineEmits(['mark-all-read', 'notification', 'search', 'view-all']);

const { isOpen: notificationsOpen, toggle: toggleNotifications, close: closeNotifications } = usePopover('cap-notifications');

const closeAndEmit = (eventName, ...payload) => {
  closeNotifications();
  emit(eventName, ...payload);
};

const searchLabel = ref(null);
let releaseCommandK = () => {};

const unreadCount = computed(() => props.notifications.filter((notification) => notification.unread).length);
const topbarShowsTitle = computed(() => Boolean(props.backHref) || !props.systemName);

onMounted(() => {
  const searchInput = searchLabel.value?.querySelector('input');
  if (searchInput) releaseCommandK = bindCommandK(searchInput);
});
onBeforeUnmount(() => releaseCommandK());
</script>

<template>
  <header class="cap-shell-header cap-glass">
    <div>
      <nav v-if="breadcrumbs.length" class="cap-shell-header__crumbs" aria-label="Migas de pan">
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.label">
          <span v-if="index > 0" aria-hidden="true"> › </span>
          <component :is="linkComponent" v-if="crumb.href" :[linkProp]="crumb.href">{{ crumb.label }}</component>
          <template v-else>{{ crumb.label }}</template>
        </template>
      </nav>
      <h1 class="cap-shell-header__title">{{ title }}</h1>
    </div>
    <label v-if="$slots.search" ref="searchLabel" class="cap-shell-header__search">
      <i class="mdi mdi-magnify" aria-hidden="true" />
      <slot name="search" />
      <kbd class="cap-shell-header__kbd">⌘K</kbd>
    </label>
    <div class="cap-shell-header__actions">
      <slot name="header-actions" />
      <CapBellButton
        button-class="cap-shell-header__icon-button"
        :expanded="notificationsOpen"
        :unread-count="unreadCount"
        @click="toggleNotifications"
      />
      <CapAvatar :user="user" />
    </div>
  </header>

  <header class="cap-shell-topbar cap-glass">
    <component :is="linkComponent" v-if="backHref" class="cap-shell-topbar__icon-button" :[linkProp]="backHref" aria-label="Volver">
      <i class="mdi mdi-arrow-left" aria-hidden="true" />
    </component>
    <span v-else class="cap-shell-logo" aria-hidden="true">C</span>
    <h1 v-if="topbarShowsTitle" class="cap-shell-topbar__title">{{ title }}</h1>
    <template v-else>
      <span class="cap-shell-topbar__title">{{ systemName }}</span>
      <h1 class="cap-shell-topbar__hidden-title">{{ title }}</h1>
    </template>
    <button v-if="topbarSearch" class="cap-shell-topbar__icon-button" type="button" aria-label="Buscar" @click="emit('search')">
      <i class="mdi mdi-magnify" aria-hidden="true" />
    </button>
    <slot name="topbar-actions" />
    <CapBellButton
      button-class="cap-shell-topbar__icon-button"
      :expanded="notificationsOpen"
      :unread-count="unreadCount"
      @click="toggleNotifications"
    />
  </header>

  <CapNotifications
    :hidden="!notificationsOpen"
    :notifications="notifications"
    :view-all-href="notificationsHref"
    :link-component="linkComponent"
    :link-prop="linkProp"
    @mark-all-read="emit('mark-all-read')"
    @notification="closeAndEmit('notification', $event)"
    @view-all="closeAndEmit('view-all')"
  />
</template>
