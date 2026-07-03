<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Back button -->
    <router-link to="/" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Dashboard
    </router-link>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="flex items-center gap-3 text-gray-500">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-accent rounded-full animate-spin"></div>
        Loading agent...
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ error }}
    </div>

    <template v-else-if="agent">
      <!-- Agent Header -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900">{{ agent.name }}</h1>
                <p class="text-sm text-gray-400">Created {{ formatDate(agent.created_at) }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 mt-2 max-w-2xl">{{ agent.script }}</p>

            <!-- Success Criteria Tags -->
            <div class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="criterion in parsedCriteria"
                :key="criterion"
                class="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-full"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                {{ formatCriterion(criterion) }}
              </span>
            </div>
          </div>

          <!-- Score summary -->
          <div class="flex items-center gap-6 flex-shrink-0">
            <div class="text-center">
              <ScoreBadge :score="agent.avg_score" size="lg" />
              <p class="text-xs text-gray-400 mt-1">Avg Score</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ agent.call_count || 0 }}</p>
              <p class="text-xs text-gray-400">Total Calls</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold" :class="agent.failure_count > 0 ? 'text-red-600' : 'text-green-600'">{{ agent.failure_count || 0 }}</p>
              <p class="text-xs text-gray-400">High Risk</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content: Calls + Recommendations -->
      <div class="flex gap-6 items-start">

        <!-- Calls Table (2/3) -->
        <div class="flex-1 min-w-0">
          <div class="bg-white rounded-xl border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 class="font-semibold text-gray-900">Calls</h2>
              <span class="text-sm text-gray-400">{{ callsData.total || 0 }} total</span>
            </div>

            <div v-if="loadingCalls" class="p-8 flex items-center justify-center">
              <div class="flex items-center gap-3 text-gray-500">
                <div class="w-5 h-5 border-2 border-gray-300 border-t-accent rounded-full animate-spin"></div>
                Loading calls...
              </div>
            </div>

            <div v-else-if="callsData.calls.length === 0" class="p-8 text-center text-gray-400 text-sm">
              No calls found for this agent.
            </div>

            <table v-else class="w-full">
              <thead>
                <tr class="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th class="px-6 py-3 text-left">Caller</th>
                  <th class="px-6 py-3 text-left">Score</th>
                  <th class="px-6 py-3 text-left">Flags</th>
                  <th class="px-6 py-3 text-left">Use Actions</th>
                  <th class="px-6 py-3 text-left">Date</th>
                  <th class="px-6 py-3 text-left">Duration</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="call in callsData.calls"
                  :key="call.id"
                  @click="$router.push(`/calls/${call.id}`)"
                  class="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td class="px-6 py-3 text-sm font-medium text-gray-900">{{ call.caller }}</td>
                  <td class="px-6 py-3">
                    <ScoreBadge :score="call.score" size="sm" />
                  </td>
                  <td class="px-6 py-3">
                    <span
                      v-if="call.flags_count"
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs font-medium rounded-full"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 7l2.55 2.4A1 1 0 0116 11H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" />
                      </svg>
                      {{ call.flags_count }}
                    </span>
                    <span v-else class="text-gray-300 text-xs">—</span>
                  </td>
                  <td class="px-6 py-3">
                    <span
                      v-if="call.use_actions_count"
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                      {{ call.use_actions_count }}
                    </span>
                    <span v-else class="text-gray-300 text-xs">—</span>
                  </td>
                  <td class="px-6 py-3 text-xs text-gray-400">{{ formatDate(call.started_at) }}</td>
                  <td class="px-6 py-3 text-xs text-gray-400">{{ formatDuration(call.duration_sec) }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="callsData.totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p class="text-sm text-gray-400">Page {{ callsData.page }} of {{ callsData.totalPages }}</p>
              <div class="flex gap-2">
                <button
                  @click="changePage(callsData.page - 1)"
                  :disabled="callsData.page <= 1"
                  class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  @click="changePage(callsData.page + 1)"
                  :disabled="callsData.page >= callsData.totalPages"
                  class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations Panel (1/3) -->
        <div class="w-80 flex-shrink-0">
          <div class="bg-white rounded-xl border border-gray-200 sticky top-6">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 class="font-semibold text-gray-900 text-sm">AI Recommendations</h3>
              </div>
              <button
                @click="regenerateRecommendations"
                :disabled="regenerating"
                class="flex items-center gap-1 px-2.5 py-1 text-xs text-accent border border-accent/30 rounded-lg hover:bg-accent/5 disabled:opacity-50 transition-colors"
                title="Regenerate recommendations"
              >
                <svg class="w-3 h-3" :class="regenerating ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ regenerating ? 'Generating...' : 'Regenerate' }}
              </button>
            </div>

            <div class="p-5">
              <div v-if="loadingRecs" class="flex items-center justify-center py-8">
                <div class="flex items-center gap-2 text-gray-400 text-sm">
                  <div class="w-4 h-4 border-2 border-gray-200 border-t-accent rounded-full animate-spin"></div>
                  Loading...
                </div>
              </div>

              <div v-else-if="!latestRecommendation" class="text-center py-8">
                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p class="text-sm text-gray-400">No recommendations yet</p>
                <button
                  @click="regenerateRecommendations"
                  :disabled="regenerating"
                  class="mt-3 text-xs text-accent hover:underline disabled:opacity-50"
                >
                  Generate now
                </button>
              </div>

              <div v-else>
                <p class="text-xs text-gray-400 mb-4">Generated {{ formatDate(latestRecommendation.generated_at) }}</p>
                <div class="text-sm text-gray-700 space-y-3 leading-relaxed recommendation-content" v-html="renderMarkdown(latestRecommendation.content)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import ScoreBadge from '../components/ScoreBadge.vue';

const route = useRoute();
const agent = ref(null);
const callsData = ref({ calls: [], total: 0, page: 1, totalPages: 1 });
const recommendations = ref([]);
const loading = ref(true);
const loadingCalls = ref(true);
const loadingRecs = ref(true);
const regenerating = ref(false);
const error = ref(null);

const parsedCriteria = computed(() => {
  if (!agent.value?.success_criteria) return [];
  try { return JSON.parse(agent.value.success_criteria); } catch { return []; }
});

const latestRecommendation = computed(() => recommendations.value[0] || null);

function formatCriterion(s) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^#{1,3}\s+(.+)$/gm, '<p class="font-semibold text-gray-900 mt-3 mb-1">$1</p>')
    .replace(/^---+$/gm, '<hr class="border-gray-100 my-2">')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br>');
}

async function loadAgent() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(`/api/agents/${route.params.id}`);
    if (!res.ok) throw new Error(`Agent not found`);
    agent.value = await res.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function loadCalls(page = 1) {
  loadingCalls.value = true;
  try {
    const res = await fetch(`/api/agents/${route.params.id}/calls?page=${page}&limit=20`);
    if (!res.ok) throw new Error('Failed to load calls');
    callsData.value = await res.json();
  } catch (err) {
    console.error(err);
  } finally {
    loadingCalls.value = false;
  }
}

async function loadRecommendations() {
  loadingRecs.value = true;
  try {
    const res = await fetch(`/api/agents/${route.params.id}/recommendations`);
    if (!res.ok) throw new Error('Failed to load recommendations');
    recommendations.value = await res.json();
  } catch (err) {
    console.error(err);
  } finally {
    loadingRecs.value = false;
  }
}

async function regenerateRecommendations() {
  regenerating.value = true;
  try {
    const res = await fetch(`/api/analyze/agent/${route.params.id}/recommendations`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to generate recommendations');
    await loadRecommendations();
  } catch (err) {
    console.error(err);
  } finally {
    regenerating.value = false;
  }
}

function changePage(page) {
  loadCalls(page);
}

onMounted(async () => {
  await loadAgent();
  await Promise.all([loadCalls(), loadRecommendations()]);
});

watch(() => route.params.id, async () => {
  await loadAgent();
  await Promise.all([loadCalls(), loadRecommendations()]);
});
</script>

<style scoped>
.recommendation-content :deep(strong) {
  @apply font-semibold text-gray-900;
}
.recommendation-content :deep(p) {
  @apply mb-3;
}
</style>
