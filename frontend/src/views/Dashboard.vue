<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 text-sm mt-1">Voice AI agent performance overview</p>
    </div>

    <!-- Error state -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ error }}
      <button @click="loadData" class="ml-2 underline">Retry</button>
    </div>

    <!-- Seed prompt -->
    <div v-if="!loading && agents.length === 0 && !error" class="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="font-semibold text-blue-900">No data found</p>
          <p class="text-blue-700 text-sm mt-1">Seed mock data to populate the dashboard with realistic call transcripts and AI analysis.</p>
          <button
            @click="seedData"
            :disabled="seeding"
            class="mt-3 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <div v-if="seeding" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ seeding ? 'Seeding & Analyzing...' : 'Seed Mock Data + Run Analysis' }}
          </button>
          <p v-if="seeding" class="text-blue-600 text-xs mt-2">Seeding 30 calls and analyzing with Claude. Takes 2-3 minutes — dashboard will update automatically.</p>
          <p v-if="seedMessage" class="text-green-700 text-xs mt-2 font-medium">{{ seedMessage }}</p>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KpiCard
        label="Total Agents"
        :value="loading ? '...' : kpis.totalAgents"
        icon-path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        variant="default"
        sub="Voice AI bots"
      />
      <KpiCard
        label="Total Calls"
        :value="loading ? '...' : kpis.totalCalls"
        icon-path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        variant="default"
        sub="Analyzed conversations"
      />
      <KpiCard
        label="Avg Score"
        :value="loading ? '...' : (kpis.avgScore !== null ? kpis.avgScore + '/100' : 'N/A')"
        :icon-path="'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'"
        :variant="kpis.avgScore >= 80 ? 'success' : kpis.avgScore >= 50 ? 'warning' : 'danger'"
        sub="Across all agents"
      />
      <KpiCard
        label="High Risk Calls"
        :value="loading ? '...' : kpis.highRiskCalls"
        icon-path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        variant="danger"
        sub="Score below 50"
      />
    </div>

    <!-- Agents Table -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-semibold text-gray-900">Agents</h2>
        <span class="text-sm text-gray-400">{{ agents.length }} total</span>
      </div>

      <div v-if="loading" class="p-8 flex items-center justify-center">
        <div class="flex items-center gap-3 text-gray-500">
          <div class="w-5 h-5 border-2 border-gray-300 border-t-accent rounded-full animate-spin"></div>
          Loading agents...
        </div>
      </div>

      <div v-else-if="agents.length === 0" class="p-8 text-center text-gray-400 text-sm">
        No agents found. Seed data to get started.
      </div>

      <table v-else class="w-full">
        <thead>
          <tr class="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
            <th class="px-6 py-3 text-left">Agent</th>
            <th class="px-6 py-3 text-left">Avg Score</th>
            <th class="px-6 py-3 text-left">Total Calls</th>
            <th class="px-6 py-3 text-left">Failure Rate</th>
            <th class="px-6 py-3 text-left">Last Call</th>
            <th class="px-6 py-3 text-right"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="agent in agents"
            :key="agent.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4">
              <div class="font-medium text-gray-900 text-sm">{{ agent.name }}</div>
              <div class="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{{ agent.script.slice(0, 80) }}...</div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex-1 min-w-0 max-w-24">
                  <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="getScoreBarColor(agent.avg_score)"
                      :style="{ width: `${agent.avg_score || 0}%` }"
                    ></div>
                  </div>
                </div>
                <ScoreBadge :score="agent.avg_score" size="sm" />
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ agent.call_count || 0 }}</td>
            <td class="px-6 py-4">
              <span
                class="text-sm font-medium"
                :class="getFailureRateColor(agent.failure_count, agent.call_count)"
              >
                {{ getFailureRate(agent.failure_count, agent.call_count) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-400">
              {{ agent.last_call_at ? formatDate(agent.last_call_at) : '—' }}
            </td>
            <td class="px-6 py-4 text-right">
              <router-link
                :to="`/agents/${agent.id}`"
                class="inline-flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent-hover transition-colors"
              >
                View Details
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import KpiCard from '../components/KpiCard.vue';
import ScoreBadge from '../components/ScoreBadge.vue';

const agents = ref([]);
const loading = ref(true);
const error = ref(null);
const seeding = ref(false);
const seedMessage = ref('');

const kpis = computed(() => {
  const totalAgents = agents.value.length;
  const totalCalls = agents.value.reduce((sum, a) => sum + (a.call_count || 0), 0);
  const agentsWithScores = agents.value.filter(a => a.avg_score !== null);
  const avgScore = agentsWithScores.length
    ? Math.round(agentsWithScores.reduce((sum, a) => sum + a.avg_score, 0) / agentsWithScores.length)
    : null;
  const highRiskCalls = agents.value.reduce((sum, a) => sum + (a.failure_count || 0), 0);
  return { totalAgents, totalCalls, avgScore, highRiskCalls };
});

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch('/api/agents');
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    agents.value = await res.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function seedData() {
  seeding.value = true;
  seedMessage.value = '';
  try {
    const res = await fetch('/api/seed', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Seed failed');
    seedMessage.value = data.message + ' Reloading data...';
    let attempts = 0;
    const poll = async () => {
      attempts++;
      await loadData();
      const hasScores = agents.value.some(a => a.avg_score !== null);
      if (!hasScores && attempts < 40) {
        setTimeout(poll, 5000);
      } else {
        seeding.value = false;
        seedMessage.value = '';
      }
    };
    setTimeout(poll, 5000);
  } catch (err) {
    error.value = err.message;
    seeding.value = false;
  }
}

function getScoreBarColor(score) {
  if (score === null || score === undefined) return 'bg-gray-300';
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getFailureRate(failureCount, callCount) {
  if (!callCount) return '—';
  return Math.round((failureCount / callCount) * 100) + '%';
}

function getFailureRateColor(failureCount, callCount) {
  if (!callCount) return 'text-gray-400';
  const rate = failureCount / callCount;
  if (rate < 0.2) return 'text-green-600';
  if (rate < 0.4) return 'text-yellow-600';
  return 'text-red-600';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

onMounted(loadData);
</script>
