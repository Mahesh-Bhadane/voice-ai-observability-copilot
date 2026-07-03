<template>
  <div class="space-y-3">
    <div
      v-for="turn in transcript"
      :key="turn.turn"
      class="flex"
      :class="turn.role === 'agent' ? 'justify-start' : 'justify-end'"
    >
      <div
        class="max-w-[75%] relative"
        :class="getTurnWrapperClass(turn)"
      >
        <!-- Turn indicator -->
        <div
          class="absolute -top-2.5 flex items-center gap-1"
          :class="turn.role === 'agent' ? 'left-2' : 'right-2'"
        >
          <span class="text-xs text-gray-400">T{{ turn.turn }}</span>
          <span v-if="getFlagsForTurn(turn.turn).length" class="text-red-500" title="Flagged turn">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 7l2.55 2.4A1 1 0 0116 11H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" />
            </svg>
          </span>
          <span v-if="getActionsForTurn(turn.turn).length" class="text-amber-500" title="Human intervention needed">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </span>
        </div>

        <!-- Bubble -->
        <div
          class="mt-2 px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          :class="getBubbleClass(turn)"
        >
          <!-- Role label -->
          <p class="text-xs font-semibold mb-1 opacity-70 uppercase tracking-wide">
            {{ turn.role === 'agent' ? 'AI Agent' : 'Caller' }}
          </p>
          <p>{{ turn.text }}</p>
        </div>

        <!-- Flag tooltips for this turn -->
        <div v-if="getFlagsForTurn(turn.turn).length" class="mt-1 space-y-1">
          <div
            v-for="flag in getFlagsForTurn(turn.turn)"
            :key="flag.type"
            class="flex items-start gap-1.5 px-2 py-1 rounded bg-red-50 border border-red-200 text-xs text-red-700"
          >
            <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 7l2.55 2.4A1 1 0 0116 11H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" />
            </svg>
            <span><strong>{{ formatFlagType(flag.type) }}:</strong> {{ flag.description }}</span>
          </div>
        </div>

        <!-- Use action badges for this turn -->
        <div v-if="getActionsForTurn(turn.turn).length" class="mt-1 space-y-1">
          <div
            v-for="action in getActionsForTurn(turn.turn)"
            :key="action.turn"
            class="flex items-start gap-1.5 px-2 py-1 rounded bg-amber-50 border border-amber-200 text-xs text-amber-700"
          >
            <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span><strong>Human needed:</strong> {{ action.reason }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  transcript: {
    type: Array,
    default: () => []
  },
  flags: {
    type: Array,
    default: () => []
  },
  useActions: {
    type: Array,
    default: () => []
  }
});

function getFlagsForTurn(turnNum) {
  return props.flags.filter(f => f.turn === turnNum);
}

function getActionsForTurn(turnNum) {
  return props.useActions.filter(a => a.turn === turnNum);
}

function getTurnWrapperClass(turn) {
  const hasFlagOrAction = getFlagsForTurn(turn.turn).length > 0 || getActionsForTurn(turn.turn).length > 0;
  return hasFlagOrAction ? 'pt-5' : 'pt-3';
}

function getBubbleClass(turn) {
  const hasFlag = getFlagsForTurn(turn.turn).length > 0;
  const hasAction = getActionsForTurn(turn.turn).length > 0;

  if (turn.role === 'agent') {
    if (hasFlag) return 'bg-red-50 border-2 border-red-300 text-gray-800';
    if (hasAction) return 'bg-amber-50 border-2 border-amber-300 text-gray-800';
    return 'bg-accent text-white';
  } else {
    if (hasFlag) return 'bg-red-50 border-2 border-red-300 text-gray-800';
    if (hasAction) return 'bg-amber-50 border-2 border-amber-300 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  }
}

function formatFlagType(type) {
  const labels = {
    missed_objection: 'Missed Objection',
    wrong_info: 'Wrong Info',
    early_hangup: 'Early Hangup',
    off_script: 'Off Script',
    no_next_step: 'No Next Step',
    criteria_missed: 'Criteria Missed'
  };
  return labels[type] || type;
}
</script>
