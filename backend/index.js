require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// GHL iframe compatibility headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  next();
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/agents', require('./routes/agents'));
app.use('/api/calls', require('./routes/calls'));
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/seed', require('./routes/seed'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`HL Observability backend running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
