<template>
  <div class="p-6 max-w-5xl mx-auto">
    <!-- Back button -->
    <button @click="$router.back()" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="flex items-center gap-3 text-gray-500">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-accent rounded-full animate-spin"></div>
        Loading call...
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ error }}
    </div>

    <template v-else-if="call">
      <!-- Call Metadata Header -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <router-link
                v-if="call.agent"
                :to="`/agents/${call.agent.id}`"
                class="text-sm text-accent hover:underline font-medium"
              >
                {{ call.agent.name }}
              </router-link>
              <span class="text-gray-300">/</span>
              <span class="text-sm text-gray-500">Call Detail</span>
            </div>
            <h1 class="text-xl font-bold text-gray-900">{{ call.caller }}</h1>
            <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(call.started_at) }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatDuration(call.duration_sec) }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {{ call.transcript.length }} turns
              </span>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="text-center">
              <ScoreBadge :score="call.analysis?.score" size="lg" />
              <p class="text-xs text-gray-400 mt-1">Score</p>
            </div>
            <div class="text-center">
              <p class="text-xl font-bold text-red-600">{{ call.analysis?.flags?.length || 0 }}</p>
              <p class="text-xs text-gray-400">Flags</p>
            </div>
            <div class="text-center">
              <p class="text-xl font-bold text-amber-600">{{ call.analysis?.use_actions?.length || 0 }}</p>
              <p class="text-xs text-gray-400">Escalations</p>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="call.analysis?.summary" class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">AI Summary</p>
          <p class="text-sm text-gray-700">{{ call.analysis.summary }}</p>
        </div>

        <!-- No analysis yet -->
        <div v-else-if="!call.analysis" class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p class="text-sm text-gray-400">This call has not been analyzed yet.</p>
          <button
            @click="runAnalysis"
            :disabled="analyzing"
            class="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            <div v-if="analyzing" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ analyzing ? 'Analyzing...' : 'Run Analysis' }}
          </button>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex gap-6 items-start">

        <!-- Transcript -->
        <div class="flex-1 min-w-0">
          <div class="bg-white rounded-xl border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-100">
              <h2 class="font-semibold text-gray-900">Transcript</h2>
              <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-accent inline-block"></span>
                  AI Agent
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-gray-200 inline-block"></span>
                  Caller
                </span>
                <span v-if="call.analysis?.flags?.length" class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded border-2 border-red-400 inline-block"></span>
                  Flagged turn
                </span>
                <span v-if="call.analysis?.use_actions?.length" class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded border-2 border-amber-400 inline-block"></span>
                  Human needed
                </span>
              </div>
            </div>
            <div class="p-6">
              <TranscriptViewer
                :transcript="call.transcript"
                :flags="call.analysis?.flags || []"
                :use-actions="call.analysis?.use_actions || []"
              />
            </div>
          </div>
        </div>

        <!-- Flags & Actions Sidebar -->
        <div class="w-72 flex-shrink-0 space-y-4">

          <!-- Flags summary -->
          <div class="bg-white rounded-xl border border-gray-200">
            <div class="px-5 py-4 border-b border-gray-100">
              <h3 class="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 7l2.55 2.4A1 1 0 0116 11H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" />
                </svg>
                Flags ({{ call.analysis?.flags?.length || 0 }})
              </h3>
            </div>
            <div class="p-4">
              <div v-if="!call.analysis?.flags?.length" class="text-xs text-gray-400 text-center py-3">
                No flags detected
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="flag in call.analysis.flags"
                  :key="`${flag.type}-${flag.turn}`"
                  class="p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <div class="flex items-center justify-between mb-1">
                    <FlagBadge :type="flag.type" :description="flag.description" />
                    <span class="text-xs text-gray-400">Turn {{ flag.turn }}</span>
                  </div>
                  <p class="text-xs text-gray-600">{{ flag.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Use Actions -->
          <div class="bg-white rounded-xl border border-gray-200">
            <div class="px-5 py-4 border-b border-gray-100">
              <h3 class="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Escalations ({{ call.analysis?.use_actions?.length || 0 }})
              </h3>
            </div>
            <div class="p-4">
              <div v-if="!call.analysis?.use_actions?.length" class="text-xs text-gray-400 text-center py-3">
                No escalations flagged
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="action in call.analysis.use_actions"
                  :key="action.turn"
                  class="p-3 rounded-lg bg-amber-50 border border-amber-100"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-semibold text-amber-700 uppercase tracking-wide">Human Needed</span>
                    <span class="text-xs text-gray-400">Turn {{ action.turn }}</span>
                  </div>
                  <p class="text-xs text-gray-600">{{ action.reason }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Re-analyze button -->
          <button
            @click="runAnalysis"
            :disabled="analyzing"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <svg class="w-4 h-4" :class="analyzing ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ analyzing ? 'Re-analyzing...' : 'Re-analyze with Claude' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ScoreBadge from '../components/ScoreBadge.vue';
import FlagBadge from '../components/FlagBadge.vue';
import TranscriptViewer from '../components/TranscriptViewer.vue';
import { apiFetch } from '../api.js';

const route = useRoute();
const call = ref(null);
const loading = ref(true);
const analyzing = ref(false);
const error = ref(null);

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatDuration(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

async function loadCall() {
  loading.value = true;
  error.value = null;
  try {
    const res = await apiFetch(`/api/calls/${route.params.id}`);
    if (!res.ok) throw new Error('Call not found');
    call.value = await res.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function runAnalysis() {
  analyzing.value = true;
  try {
    const res = await apiFetch(`/api/analyze/${route.params.id}`, { method: 'POST' });
    if (!res.ok) throw new Error('Analysis failed');
    await loadCall();
  } catch (err) {
    console.error(err);
  } finally {
    analyzing.value = false;
  }
}

onMounted(loadCall);
</script>
