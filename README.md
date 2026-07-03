# Voice AI Observability Copilot

A GHL-integrated dashboard that automates the **Monitor** and **Analyze** phases for HighLevel Voice AI agents. Uses Claude (claude-sonnet-4-6) to score call transcripts against agent-specific success criteria, flag failures, surface escalation points, and generate actionable recommendations — closing the loop from raw call logs to script improvements.

---

## The Validation Flywheel

```
Voice AI bot makes calls
        ↓
Transcripts ingested + stored
        ↓
Claude scores each call (0-100) against the agent's KPIs
        ↓
Failures flagged, escalation moments highlighted
        ↓
Per-agent recommendations generated from call patterns
        ↓
You fix the agent script → bot performs better → repeat
```

This flywheel runs automatically. After seeding, every call is analyzed in the background with no manual intervention.

---

## Two Observability Loops

### Monitor
- Ingests call transcripts and stores them against the agent that made them
- Each agent has a `script` (what it's trying to do) and `success_criteria` (what a good call looks like)
- Claude reads the transcript + criteria and returns a score, structured flags, and escalation points
- Flag types: `missed_objection`, `wrong_info`, `early_hangup`, `off_script`, `no_next_step`, `criteria_missed`
- Escalations (`use_actions`) mark turns where a human should have stepped in

### Analyze
- Dashboard shows KPIs across all agents: avg score, total calls, failure rate, high-risk call count
- Agent detail view shows all calls with scores, flag counts, escalation counts
- Call detail view shows the transcript as chat bubbles with inline flag + escalation annotations at the exact turn they occurred
- AI Recommendations panel generates 4-6 specific improvements per agent based on its last 15 calls

---

## Architecture

```
voice-ai-observability-copilot/
├── backend/                  Node.js + Express + SQLite
│   ├── index.js              Server entry, CORS, GHL iframe headers
│   ├── db.js                 SQLite schema (agents, calls, analyses, recommendations)
│   ├── seed.js               30 realistic mock call transcripts across 2 agents
│   ├── analyze.js            Claude analysis + recommendation logic
│   └── routes/
│       ├── agents.js         Agent list, detail, calls, recommendations
│       ├── calls.js          Call detail with parsed transcript + analysis
│       ├── analyze.js        Trigger analysis per call or per agent
│       └── seed.js           Seed endpoint + background analysis trigger
├── frontend/                 Vue 3 + Vite + Tailwind CSS
│   └── src/
│       ├── views/
│       │   ├── Dashboard.vue       KPI cards + agents table
│       │   ├── AgentDetail.vue     Calls table + AI recommendations panel
│       │   └── CallDetail.vue      Transcript viewer + flags + escalations
│       └── components/
│           ├── Sidebar.vue         Agent nav with health indicators
│           ├── ScoreBadge.vue      Color-coded score circle (green/yellow/red)
│           ├── KpiCard.vue         Stat card with icon + variant
│           ├── TranscriptViewer.vue Chat bubbles with inline flag annotations
│           └── FlagBadge.vue       Color-coded flag type label
├── docker-compose.yml
├── .env.example
└── README.md
```

**Data flow:**
1. `POST /api/seed` inserts 2 agents + 30 calls, fires background Claude analysis
2. Each call: Claude reads transcript + agent KPIs → returns score, flags, use_actions, summary
3. After all calls analyzed: Claude reads last 15 call summaries → returns per-agent recommendations
4. Frontend polls until scores appear, then renders everything live

---

## Quick Start

### Prerequisites
- Node.js 18+
- Anthropic API key

### 1. Clone and configure

```bash
git clone https://github.com/Mahesh-Bhadane/voice-ai-observability-copilot
cd voice-ai-observability-copilot
cp backend/.env.example backend/.env
# Edit backend/.env and set ANTHROPIC_API_KEY
```

### 2. Backend

```bash
cd backend
npm install
npm start
# Runs on http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 4. Seed data + run analysis

Open http://localhost:5173 and click **"Seed Mock Data + Run Analysis"**.

This inserts 2 agents and 30 call transcripts, then fires Claude analysis on all 30 calls in the background. Takes 2-3 minutes. The dashboard updates automatically when scores appear.

### Docker (optional)

```bash
cp backend/.env.example backend/.env
# Set ANTHROPIC_API_KEY in backend/.env
docker-compose up --build
# Backend: http://localhost:3001
# Frontend: http://localhost:5173
```

---

## GHL Integration — Running Inside HighLevel

### Step 1: Deploy the backend

Deploy to Railway, Render, or any Node.js host. Get the public URL (e.g. `https://your-app.railway.app`).

Update `frontend/src/vite.config.js` proxy target to your deployed backend URL, then deploy the frontend separately (Netlify, Vercel, or the same host).

### Step 2: Add a Custom Menu Link in GHL

1. Log into your GHL sub-account
2. Go to **Settings → Custom Menu Links**
3. Click **Add New**
4. Set:
   - **Name**: Voice AI Copilot
   - **URL**: your deployed frontend URL
   - **Open in**: iFrame
5. Save — it appears in the GHL left sidebar

The app loads inside GHL as a native-feeling panel. Backend sets `X-Frame-Options: ALLOWALL` and `Content-Security-Policy: frame-ancestors *` so GHL can embed it without iframe restrictions.

### Step 3: Use the sandbox

The GHL Marketplace developer sandbox is at [marketplace.gohighlevel.com](https://marketplace.gohighlevel.com). Create a free developer account, create a sub-account, then add the Custom Menu Link pointing to your deployed app.

---

## What's Real vs Mocked

| Feature | Status |
|---|---|
| SQLite database with full schema + relationships | Real |
| Claude analysis — score, flags, escalations, summary | Real (calls Anthropic API) |
| AI recommendations per agent | Real (calls Anthropic API) |
| Re-analyze a single call | Real |
| Regenerate recommendations | Real |
| GHL iframe embed (headers + Custom Menu Link) | Real |
| 2 agents with scripts + success criteria | Mock (realistic) |
| 30 call transcripts with realistic dialogue | Mock (realistic) |
| Live GHL Voice AI webhook ingestion | Not implemented — architecture is wired for it |
| Auth / user management | Not in scope |

### How live GHL ingestion would work

1. Create a GHL Webhook on "Call Completed" events in the sub-account
2. `POST` the transcript payload to a new `/api/calls` route
3. Call `POST /api/analyze/:callId` to score it
4. Dashboard refreshes automatically on next load

The `GHL_API_KEY` and `GHL_LOCATION_ID` in `.env` are pre-wired for future GHL API calls.

---

## Team of One

This project was owned and delivered solo across all four functions:

**Product**
- Defined the two observability loops (Monitor + Analyze) and the Validation Flywheel model
- Chose the 6 flag types that matter for Voice AI quality: `missed_objection`, `wrong_info`, `early_hangup`, `off_script`, `no_next_step`, `criteria_missed`
- Decided to surface Use Actions as a distinct escalation layer separate from quality flags
- Prioritized KPIs: avg score, failure rate (score < 50), escalation count per call

**Design**
- GHL-inspired dark sidebar with white content area — feels native to the GHL interface
- Score color logic: green ≥ 80, yellow 50-79, red < 50 — consistent across every view
- Transcript as chat bubbles with inline flag annotations at the exact turn — no tab-switching to correlate issues
- Recommendations panel sticky beside the calls table — insight and data in one view

**Engineering**
- Node.js + Express backend with SQLite — zero infrastructure, runs anywhere
- Vue 3 SPA with Vue Router — no component library, all custom
- Background analysis via `setImmediate` — seed responds instantly, analysis runs async
- N+1 eliminated — flags and use_actions fetched in JOIN, parsed in memory
- All SQL parameterized, all JSON parses in try/catch, all routes with error boundaries

**QA**
- 30 mock calls cover: full success, partial failure, full failure, early hangup, objection handling, off-script, wrong info, edge cases (very technical caller, negotiation, wrong person)
- Idempotent seed — safe to run multiple times
- Idempotent analysis — re-analyze updates existing row, doesn't duplicate
- Health endpoint at `GET /health`
