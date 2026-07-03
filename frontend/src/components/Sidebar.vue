<template>
  <aside class="w-64 flex-shrink-0 bg-sidebar flex flex-col h-full">
    <!-- Logo / Brand -->
    <div class="px-6 py-5 border-b border-white/10">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div>
          <p class="text-white font-semibold text-sm leading-tight">Voice AI</p>
          <p class="text-gray-400 text-xs leading-tight">Observability</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
      <router-link
        to="/"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
        :class="isActive('/') ? 'bg-accent text-white' : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Dashboard
      </router-link>

      <!-- Agents section -->
      <div class="pt-4 pb-1">
        <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Agents</p>
      </div>

      <div v-if="loadingAgents" class="px-3 py-2">
        <div class="flex items-center gap-2 text-gray-500 text-sm">
          <div class="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      </div>

      <template v-else>
        <router-link
          v-for="agent in agents"
          :key="agent.id"
          :to="`/agents/${agent.id}`"
          class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors group"
          :class="isActive(`/agents/${agent.id}`) ? 'bg-accent text-white' : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'"
        >
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-2 h-2 rounded-full flex-shrink-0" :class="getAgentStatusColor(agent.avg_score)"></div>
            <span class="truncate">{{ agent.name }}</span>
          </div>
          <span
            class="flex-shrink-0 text-xs px-1.5 py-0.5 rounded font-medium"
            :class="isActive(`/agents/${agent.id}`) ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400 group-hover:bg-white/20'"
          >
            {{ agent.call_count || 0 }}
          </span>
        </router-link>
      </template>
    </nav>

    <!-- Footer -->
    <div class="px-6 py-4 border-t border-white/10">
      <p class="text-gray-500 text-xs">GHL Voice AI Copilot</p>
      <p class="text-gray-600 text-xs">v1.0.0</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const agents = ref([]);
const loadingAgents = ref(true);

function isActive(path) {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
}

function getAgentStatusColor(avgScore) {
  if (avgScore === null || avgScore === undefined) return 'bg-gray-500';
  if (avgScore >= 80) return 'bg-green-400';
  if (avgScore >= 50) return 'bg-yellow-400';
  return 'bg-red-400';
}

async function loadAgents() {
  try {
    const res = await fetch('/api/agents');
    if (!res.ok) throw new Error('Failed to fetch agents');
    agents.value = await res.json();
  } catch (err) {
    console.error('Sidebar: failed to load agents', err);
  } finally {
    loadingAgents.value = false;
  }
}

onMounted(loadAgents);
</script>
