<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
    :class="colorClasses"
    :title="description"
  >
    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 7l2.55 2.4A1 1 0 0116 11H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" />
    </svg>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: String,
  description: String
});

const label = computed(() => {
  const labels = {
    missed_objection: 'Missed Objection',
    wrong_info: 'Wrong Info',
    early_hangup: 'Early Hangup',
    off_script: 'Off Script',
    no_next_step: 'No Next Step',
    criteria_missed: 'Criteria Missed'
  };
  return labels[props.type] || props.type;
});

const colorClasses = computed(() => {
  const colors = {
    missed_objection: 'bg-orange-100 text-orange-700',
    wrong_info: 'bg-red-100 text-red-700',
    early_hangup: 'bg-purple-100 text-purple-700',
    off_script: 'bg-yellow-100 text-yellow-700',
    no_next_step: 'bg-blue-100 text-blue-700',
    criteria_missed: 'bg-gray-100 text-gray-700'
  };
  return colors[props.type] || 'bg-gray-100 text-gray-700';
});
</script>
