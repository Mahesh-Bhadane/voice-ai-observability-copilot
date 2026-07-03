const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:id', (req, res) => {
  try {
    const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(req.params.id);
    if (!call) return res.status(404).json({ error: 'Call not found' });

    const analysis = db.prepare('SELECT * FROM analyses WHERE call_id = ?').get(req.params.id);
    const agent = db.prepare('SELECT id, name FROM agents WHERE id = ?').get(call.agent_id);

    let transcript = [];
    try { transcript = JSON.parse(call.transcript); } catch {}

    let flags = [];
    let use_actions = [];
    if (analysis) {
      try { flags = JSON.parse(analysis.flags); } catch {}
      try { use_actions = JSON.parse(analysis.use_actions); } catch {}
    }

    res.json({
      ...call,
      transcript,
      agent,
      analysis: analysis ? {
        ...analysis,
        flags,
        use_actions
      } : null
    });
  } catch (err) {
    console.error(`GET /api/calls/${req.params.id} error:`, err);
    res.status(500).json({ error: 'Failed to fetch call' });
  }
});

module.exports = router;
