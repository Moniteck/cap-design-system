<script setup>
import { computed } from 'vue';

const ALERT_ICONS = { error: 'mdi-alert-circle-outline', ok: 'mdi-check-circle-outline' };

const props = defineProps({
  alert: { type: Object, required: true },
});

const role = computed(() => (props.alert.status === 'error' ? 'alert' : 'status'));
</script>

<template>
  <div class="cap-alert" :class="`cap-alert--${alert.status}`" :role="role">
    <i class="cap-alert__icon mdi" :class="ALERT_ICONS[alert.status]" aria-hidden="true" />
    <div><strong class="cap-alert__title">{{ alert.title }}</strong><span v-if="alert.detail" class="cap-alert__detail">{{ alert.detail }}</span></div>
  </div>
</template>
