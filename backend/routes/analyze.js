const express = require('express');
const router = express.Router();
const { analyzeCall, analyzeAllCallsForAgent, generateRecommendations } = require('../analyze');

// NOTE: /agent/* routes must come before /:callId or Express will match "agent" as a callId
router.post('/agent/:agentId', async (req, res) => {
  try {
    const results = await analyzeAllCallsForAgent(req.params.agentId);
    res.json({ success: true, agentId: req.params.agentId, results });
  } catch (err) {
    console.error(`POST /api/analyze/agent/${req.params.agentId} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/agent/:agentId/recommendations', async (req, res) => {
  try {
    const content = await generateRecommendations(req.params.agentId);
    res.json({ success: true, agentId: req.params.agentId, content });
  } catch (err) {
    console.error(`POST /api/analyze/agent/${req.params.agentId}/recommendations error:`, err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/:callId', async (req, res) => {
  try {
    const result = await analyzeCall(req.params.callId);
    res.json({ success: true, callId: req.params.callId, result });
  } catch (err) {
    console.error(`POST /api/analyze/${req.params.callId} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
