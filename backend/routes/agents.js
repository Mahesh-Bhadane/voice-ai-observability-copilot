const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const agents = db.prepare(`
      SELECT
        a.id,
        a.name,
        a.script,
        a.success_criteria,
        a.created_at,
        COUNT(c.id) as call_count,
        ROUND(AVG(an.score), 1) as avg_score,
        SUM(CASE WHEN an.score < 50 THEN 1 ELSE 0 END) as failure_count,
        MAX(c.started_at) as last_call_at
      FROM agents a
      LEFT JOIN calls c ON c.agent_id = a.id
      LEFT JOIN analyses an ON an.call_id = c.id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `).all();

    res.json(agents);
  } catch (err) {
    console.error('GET /api/agents error:', err);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const agent = db.prepare(`
      SELECT
        a.id,
        a.name,
        a.script,
        a.success_criteria,
        a.created_at,
        COUNT(c.id) as call_count,
        ROUND(AVG(an.score), 1) as avg_score,
        SUM(CASE WHEN an.score < 50 THEN 1 ELSE 0 END) as failure_count,
        MAX(c.started_at) as last_call_at
      FROM agents a
      LEFT JOIN calls c ON c.agent_id = a.id
      LEFT JOIN analyses an ON an.call_id = c.id
      WHERE a.id = ?
      GROUP BY a.id
    `).get(req.params.id);

    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    console.error(`GET /api/agents/${req.params.id} error:`, err);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

router.get('/:id/calls', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const total = db.prepare('SELECT COUNT(*) as count FROM calls WHERE agent_id = ?').get(req.params.id);

    const calls = db.prepare(`
      SELECT
        c.id,
        c.caller,
        c.duration_sec,
        c.started_at,
        an.score,
        an.summary,
        an.analyzed_at,
        an.flags,
        an.use_actions
      FROM calls c
      LEFT JOIN analyses an ON an.call_id = c.id
      WHERE c.agent_id = ?
      ORDER BY c.started_at DESC
      LIMIT ? OFFSET ?
    `).all(req.params.id, limit, offset);

    const callsWithParsed = calls.map(call => {
      let flags_count = 0;
      let use_actions_count = 0;
      try { flags_count = call.flags ? JSON.parse(call.flags).length : 0; } catch {}
      try { use_actions_count = call.use_actions ? JSON.parse(call.use_actions).length : 0; } catch {}
      const { flags, use_actions, ...rest } = call;
      return { ...rest, flags_count, use_actions_count };
    });

    res.json({
      calls: callsWithParsed,
      total: total.count,
      page,
      limit,
      totalPages: Math.ceil(total.count / limit)
    });
  } catch (err) {
    console.error(`GET /api/agents/${req.params.id}/calls error:`, err);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

router.get('/:id/recommendations', (req, res) => {
  try {
    const recommendations = db.prepare(`
      SELECT * FROM recommendations
      WHERE agent_id = ?
      ORDER BY generated_at DESC
      LIMIT 5
    `).all(req.params.id);

    res.json(recommendations);
  } catch (err) {
    console.error(`GET /api/agents/${req.params.id}/recommendations error:`, err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;
