// =============================================================================
// server.js — Express Application Entry Point
// =============================================================================
// Responsibilities:
//   1. Load environment variables (dotenv).
//   2. Configure Express middleware (JSON parsing, CORS).
//   3. Mount route modules.
//   4. Attach the global error handler (must be last middleware).
//   5. Start listening on the configured port.
//
// Architecture note:
//   This file is intentionally thin. All business logic lives in controllers
//   and services — server.js is purely "wiring".
// =============================================================================

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load .env variables into process.env

const reportRoutes = require('./routes/reports');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// ── Create Express app ──────────────────────────────────────────────────────
const app = express();

// ── Global middleware ───────────────────────────────────────────────────────
// Parse incoming JSON bodies (application/json).
app.use(express.json());

// Enable Cross-Origin Resource Sharing for all origins during development.
// In production you would lock this down to your frontend's domain.
app.use(cors());

// Simple request logging (method + URL) for every incoming request.
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// ── Health-check endpoint ───────────────────────────────────────────────────
// Useful for Railway's zero-downtime deploy healthchecks.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Route modules ───────────────────────────────────────────────────────────
// All report-related endpoints live under /api/reports
app.use('/api/reports', reportRoutes);

// ── Global error handler (MUST be registered last) ──────────────────────────
app.use(errorHandler);

// ── Start server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 Animal Rescue API listening on port ${PORT}`);
});

module.exports = app; // Export for testing
