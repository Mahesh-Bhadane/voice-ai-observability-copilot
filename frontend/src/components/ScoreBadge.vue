<template>
  <span
    class="inline-flex items-center justify-center rounded-full font-semibold text-white"
    :class="[sizeClasses, colorClasses]"
  >
    {{ score !== null && score !== undefined ? score : '—' }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  score: {
    type: Number,
    default: null
  },
  size: {
    type: String,
    default: 'md' // sm | md | lg
  }
});

const colorClasses = computed(() => {
  if (props.score === null || props.score === undefined) return 'bg-gray-400';
  if (props.score >= 80) return 'bg-green-500';
  if (props.score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
});

const sizeClasses = computed(() => {
  if (props.size === 'sm') return 'text-xs w-8 h-8';
  if (props.size === 'lg') return 'text-xl w-14 h-14';
  return 'text-sm w-10 h-10';
});
</script>
