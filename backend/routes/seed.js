const express = require('express');
const router = express.Router();
const { seedData } = require('../seed');
const { analyzeAllUnanalyzedCalls, generateRecommendations } = require('../analyze');
const db = require('../db');

router.post('/', async (req, res) => {
  try {
    const seeded = seedData();

    if (!seeded) {
      return res.json({
        success: true,
        message: 'Data already exists. No changes made.',
        seeded: false
      });
    }

    res.json({
      success: true,
      message: 'Data seeded successfully. Analysis will run in background.',
      seeded: true
    });

    // Run analysis in background after responding
    setImmediate(async () => {
      try {
        console.log('Starting background analysis of all calls...');
        await analyzeAllUnanalyzedCalls();

        const agents = db.prepare('SELECT id FROM agents').all();
        for (const agent of agents) {
          console.log(`Generating recommendations for agent ${agent.id}...`);
          await generateRecommendations(agent.id);
        }
        console.log('Background analysis complete.');
      } catch (err) {
        console.error('Background analysis error:', err);
      }
    });
  } catch (err) {
    console.error('POST /api/seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
