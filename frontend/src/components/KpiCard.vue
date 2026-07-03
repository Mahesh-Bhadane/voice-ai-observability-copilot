<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
    <div class="p-2.5 rounded-lg flex-shrink-0" :class="iconBgClass">
      <svg class="w-5 h-5" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
      </svg>
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-sm text-gray-500 font-medium">{{ label }}</p>
      <p class="text-2xl font-bold text-gray-900 mt-0.5" :class="valueColorClass">{{ value }}</p>
      <p v-if="sub" class="text-xs text-gray-400 mt-1">{{ sub }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: String,
  value: [String, Number],
  sub: String,
  variant: {
    type: String,
    default: 'default' // default | success | warning | danger
  },
  iconPath: String
});

const iconBgClass = computed(() => {
  const map = {
    default: 'bg-blue-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
    danger: 'bg-red-50'
  };
  return map[props.variant] || map.default;
});

const iconColorClass = computed(() => {
  const map = {
    default: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };
  return map[props.variant] || map.default;
});

const valueColorClass = computed(() => {
  const map = {
    default: 'text-gray-900',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700'
  };
  return map[props.variant] || map.default;
});
</script>
