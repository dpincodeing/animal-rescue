const express = require('express');
const router = express.Router();

const { getNearbyResponders } = require('../controllers/respondersController');

// ─── GET /api/responders/nearby ─────────────────────────────────────────────
// Fetches nearby responders based on latitude and longitude query params
router.get('/nearby', getNearbyResponders);

module.exports = router;
