// =============================================================================
// controllers/reportsController.js — Report Business Logic
// =============================================================================
// Handles the core workflow for creating a new animal emergency report:
//
//   1. Extract validated fields from the request body.
//   2. Insert the report into the `reports` table, using ST_MakePoint to
//      construct a PostGIS geography point from lat/lon.
//   3. Immediately run a spatial query to find nearby responders.
//   4. Return both the new report and the list of nearby responders.
//
// Future enhancement:
//   After step 3, push an FCM notification to each nearby responder's
//   device using their `fcm_token`. This is stubbed but not wired to
//   Firebase yet (see the TODO comment below).
// =============================================================================

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// ── Attempt to load the DB module ───────────────────────────────────────────
// If DATABASE_URL is not set or is a placeholder, we run in DEMO mode so the
// full flow works without a live PostgreSQL instance.
let db;
let spatialService;
try {
  db = require('../config/db');
  spatialService = require('../services/spatialService');
} catch (e) {
  logger.warn('Database module failed to load — running in DEMO mode');
}

/**
 * Generate realistic mock data so the prototype works end-to-end
 * without a live database connection.
 */
const generateDemoResponse = (body) => {
  const reportId = uuidv4();
  return {
    report: {
      id: reportId,
      reporter_id:  body.reporter_id || uuidv4(),
      latitude:     body.latitude,
      longitude:    body.longitude,
      animal_type:  body.animal_type,
      description:  body.description || null,
      urgency:      body.urgency || 'medium',
      address:      body.address || null,
      photo_url:    body.photo_url || null,
      status:       'pending',
      created_at:   new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    },
    nearby_responders: [
      {
        responder_id:      uuidv4(),
        full_name:         'Happy Paws NGO',
        phone:             '+91-98765-43210',
        email:             'help@happypaws.org',
        fcm_token:         null,
        organization_name: 'Happy Paws Animal Welfare',
        responder_type:    'ngo',
        specializations:   ['dogs', 'cats'],
        distance_metres:   850,
        latitude:          parseFloat(body.latitude) + 0.005,
        longitude:         parseFloat(body.longitude) + 0.005,
      },
      {
        responder_id:      uuidv4(),
        full_name:         'Dr. Priya Sharma',
        phone:             '+91-99887-76655',
        email:             'dr.priya@vetcare.in',
        fcm_token:         null,
        organization_name: 'VetCare 24/7 Clinic',
        responder_type:    'vet',
        specializations:   ['dogs', 'cats', 'birds'],
        distance_metres:   2100,
        latitude:          parseFloat(body.latitude) - 0.015,
        longitude:         parseFloat(body.longitude) + 0.01,
      },
      {
        responder_id:      uuidv4(),
        full_name:         'Ravi Kumar',
        phone:             '+91-91234-56789',
        email:             'ravi.volunteer@mail.com',
        fcm_token:         null,
        organization_name: null,
        responder_type:    'volunteer',
        specializations:   ['dogs'],
        distance_metres:   3400,
        latitude:          parseFloat(body.latitude) + 0.02,
        longitude:         parseFloat(body.longitude) - 0.02,
      },
    ],
  };
};

/**
 * Check whether the DB is actually reachable (not just a placeholder URL).
 * Returns true if we can successfully run a trivial query.
 */
const isDatabaseConnected = async () => {
  if (!db) return false;
  try {
    await db.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

/**
 * POST /api/reports/new
 *
 * Request body (JSON):
 *   {
 *     "reporter_id":  "uuid",          — the citizen's user id (optional in demo)
 *     "latitude":     28.6139,         — GPS latitude
 *     "longitude":    77.2090,         — GPS longitude
 *     "animal_type":  "dog",           — species / type
 *     "description":  "Injured stray", — optional free text
 *     "urgency":      "high",          — optional, defaults to "medium"
 *     "address":      "Some street",   — optional, from Nominatim
 *     "photo_url":    "https://..."    — optional image URL
 *   }
 *
 * Response (201 Created):
 *   {
 *     "success": true,
 *     "data": {
 *       "report":     { ... },
 *       "nearby_responders": [ ... ]
 *     }
 *   }
 */
const createReport = async (req, res, next) => {
  try {
    const {
      reporter_id,
      latitude,
      longitude,
      animal_type,
      description = null,
      urgency = 'medium',
      address = null,
      photo_url = null,
    } = req.body;

    logger.info(`Creating new report: ${animal_type} at (${latitude}, ${longitude})`);

    // ── Check if a real database is available ─────────────────────────────
    const dbConnected = await isDatabaseConnected();

    if (!dbConnected) {
      // ══════════════════════════════════════════════════════════════════
      // DEMO MODE — no database connected, return realistic mock data
      // ══════════════════════════════════════════════════════════════════
      logger.warn('⚡ DEMO MODE — returning simulated response (no DB connected)');

      const demoData = generateDemoResponse(req.body);

      return res.status(201).json({
        success: true,
        demo_mode: true,
        data: demoData,
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // PRODUCTION MODE — real database connected
    // ══════════════════════════════════════════════════════════════════════
    const insertSQL = `
      INSERT INTO reports (
        reporter_id, latitude, longitude, location,
        animal_type, description, urgency, address, photo_url, status
      ) VALUES (
        $1, $2, $3, ST_MakePoint($4, $5)::geography,
        $6, $7, $8, $9, $10, 'pending'
      )
      RETURNING *;
    `;

    const insertParams = [
      reporter_id, latitude, longitude,
      longitude, latitude,
      animal_type, description, urgency, address, photo_url,
    ];

    const reportResult = await db.query(insertSQL, insertParams);
    const newReport = reportResult.rows[0];

    logger.info(`Report created with id: ${newReport.id}`);

    const nearbyResponders = await spatialService.findNearbyResponders(
      latitude, longitude, 5000
    );

    if (nearbyResponders.length > 0) {
      logger.info(
        `Notifiable responders: ${nearbyResponders.map((r) => r.full_name).join(', ')}`
      );
    } else {
      logger.warn('No responders found within 5 km radius');
    }

    res.status(201).json({
      success: true,
      data: {
        report: newReport,
        nearby_responders: nearbyResponders,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
};
