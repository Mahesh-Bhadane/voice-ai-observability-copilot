require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { randomUUID } = require('crypto');
const db = require('./db');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function formatTranscript(transcript) {
  const turns = JSON.parse(transcript);
  return turns.map(t => `[Turn ${t.turn}] ${t.role.toUpperCase()}: ${t.text}`).join('\n');
}

async function analyzeCall(callId) {
  const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(callId);
  if (!call) throw new Error(`Call ${callId} not found`);

  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(call.agent_id);
  if (!agent) throw new Error(`Agent for call ${callId} not found`);

  const formattedTranscript = formatTranscript(call.transcript);

  const userPrompt = `Agent: ${agent.name}
Script/Goal: ${agent.script}
Success Criteria: ${agent.success_criteria}

Transcript:
${formattedTranscript}

Return ONLY valid JSON (no markdown):
{
  "score": <0-100 integer>,
  "flags": [{"type": "missed_objection"|"wrong_info"|"early_hangup"|"off_script"|"no_next_step"|"criteria_missed", "turn": <N>, "description": "<specific issue>"}],
  "use_actions": [{"turn": <N>, "reason": "<why human intervention needed>"}],
  "summary": "<2-3 sentences on call performance>"
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: 'You are a Voice AI call quality analyst. Analyze call transcripts against agent success criteria and return a JSON object.',
    messages: [{ role: 'user', content: userPrompt }]
  });

  const rawText = message.content[0].text.trim();
  let result;
  try {
    result = JSON.parse(rawText);
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error(`Failed to parse Claude response: ${rawText.slice(0, 200)}`);
    }
  }

  const existingAnalysis = db.prepare('SELECT id FROM analyses WHERE call_id = ?').get(callId);
  const flags = JSON.stringify(result.flags || []);
  const useActions = JSON.stringify(result.use_actions || []);
  const now = new Date().toISOString();

  if (existingAnalysis) {
    db.prepare('UPDATE analyses SET score = ?, flags = ?, use_actions = ?, summary = ?, analyzed_at = ? WHERE call_id = ?')
      .run(result.score, flags, useActions, result.summary, now, callId);
  } else {
    db.prepare('INSERT INTO analyses (id, call_id, score, flags, use_actions, summary, analyzed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(randomUUID(), callId, result.score, flags, useActions, result.summary, now);
  }

  return result;
}

async function analyzeAllCallsForAgent(agentId) {
  const calls = db.prepare(`
    SELECT c.id FROM calls c
    LEFT JOIN analyses a ON c.id = a.call_id
    WHERE c.agent_id = ? AND a.id IS NULL
  `).all(agentId);

  const results = [];
  for (const call of calls) {
    try {
      console.log(`Analyzing call ${call.id}...`);
      const result = await analyzeCall(call.id);
      results.push({ callId: call.id, success: true, score: result.score });
    } catch (err) {
      console.error(`Failed to analyze call ${call.id}:`, err.message);
      results.push({ callId: call.id, success: false, error: err.message });
    }
  }

  await generateRecommendations(agentId);

  return results;
}

async function analyzeAllUnanalyzedCalls() {
  const calls = db.prepare(`
    SELECT c.id FROM calls c
    LEFT JOIN analyses a ON c.id = a.call_id
    WHERE a.id IS NULL
  `).all();

  console.log(`Found ${calls.length} unanalyzed calls.`);
  const results = [];
  for (const call of calls) {
    try {
      console.log(`Analyzing call ${call.id}...`);
      const result = await analyzeCall(call.id);
      results.push({ callId: call.id, success: true, score: result.score });
    } catch (err) {
      console.error(`Failed to analyze call ${call.id}:`, err.message);
      results.push({ callId: call.id, success: false, error: err.message });
    }
  }
  return results;
}

async function generateRecommendations(agentId) {
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId);
  if (!agent) throw new Error(`Agent ${agentId} not found`);

  const calls = db.prepare(`
    SELECT c.caller, c.duration_sec, a.score, a.flags, a.summary
    FROM calls c
    JOIN analyses a ON c.id = a.call_id
    WHERE c.agent_id = ?
    ORDER BY c.started_at DESC
    LIMIT 15
  `).all(agentId);

  if (calls.length === 0) return null;

  const callSummaries = calls.map((c, i) =>
    `Call ${i + 1}: Caller=${c.caller}, Score=${c.score}, Duration=${c.duration_sec}s\nFlags: ${c.flags}\nSummary: ${c.summary}`
  ).join('\n\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: 'You are a Voice AI performance coach. Generate actionable recommendations for improving an AI agent based on recent call analysis data.',
    messages: [{
      role: 'user',
      content: `Agent: ${agent.name}
Agent Script: ${agent.script}
Success Criteria: ${agent.success_criteria}

Recent Call Analyses:
${callSummaries}

Generate 4-6 specific, actionable recommendations to improve this agent's performance. Format as:
**1. [Recommendation Title]**
[2-3 sentence explanation with specific examples from the calls]

**2. [Recommendation Title]**
[2-3 sentence explanation]

...continue for all recommendations.`
    }]
  });

  const content = message.content[0].text;

  db.prepare('INSERT INTO recommendations (id, agent_id, content, generated_at) VALUES (?, ?, ?, ?)')
    .run(randomUUID(), agentId, content, new Date().toISOString());

  return content;
}

module.exports = { analyzeCall, analyzeAllCallsForAgent, analyzeAllUnanalyzedCalls, generateRecommendations };
