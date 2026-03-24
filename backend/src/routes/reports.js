// =============================================================================
// routes/reports.js — Report Routes
// =============================================================================
// Defines the REST endpoints for animal emergency reports.
//
// Current endpoints:
//   POST /api/reports/new   — Create a new emergency report
//
// Architecture:
//   Routes → Validation Middleware → Controller
//   This file is purely declarative — no business logic here.
// =============================================================================

const express = require('express');
const router = express.Router();

const { createReport } = require('../controllers/reportsController');
const { reportValidationRules, validate } = require('../middleware/validate');

// ─── POST /api/reports/new ──────────────────────────────────────────────────
// Flow:
//   1. reportValidationRules — express-validator chains check each field
//   2. validate              — collects errors, returns 422 if any
//   3. createReport          — controller inserts report + finds responders
router.post(
  '/new',
  reportValidationRules, // Step 1: declare rules
  validate,              // Step 2: enforce rules
  createReport           // Step 3: business logic
);

module.exports = router;
