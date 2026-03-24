// =============================================================================
// services/spatialService.js — PostGIS Spatial Query Helpers
// =============================================================================
// Encapsulates all PostGIS-related database queries so that controllers
// remain free of raw SQL.
//
// Key function:
//   findNearbyResponders(latitude, longitude, radiusMetres)
//     → Uses ST_DWithin on the `users.last_known_location` geography column
//       to find active, available responders within the given radius.
//
// Why GEOGRAPHY and not GEOMETRY?
//   GEOGRAPHY operates on a real-world spheroid, so ST_DWithin distances
//   are in **metres** — no SRID projection math required.
// =============================================================================

const db = require('../config/db');
const logger = require('../utils/logger');

/**
 * Find active, available responders within `radiusMetres` of the given
 * coordinates.
 *
 * @param {number} latitude   — Latitude of the emergency location (-90 to 90)
 * @param {number} longitude  — Longitude of the emergency location (-180 to 180)
 * @param {number} [radiusMetres=5000] — Search radius in metres (default 5 km)
 * @returns {Promise<Array>}  — Array of responder objects, sorted by distance
 *
 * Each returned object contains:
 *   - responder_id     (UUID)
 *   - full_name        (string)
 *   - phone            (string | null)
 *   - email            (string)
 *   - organization_name (string | null)
 *   - responder_type   ('ngo' | 'vet' | 'volunteer')
 *   - specializations  (string[])
 *   - distance_metres  (number) — exact distance for ranking
 *   - fcm_token        (string | null) — for sending push notifications
 */
const findNearbyResponders = async (latitude, longitude, radiusMetres = 5000) => {
  // ── Build the spatial query ─────────────────────────────────────────────
  // ST_MakePoint takes (longitude, latitude) — note the order!
  // We cast to ::geography so ST_DWithin operates in metres.
  const sql = `
    SELECT
      u.id              AS responder_id,
      u.full_name,
      u.phone,
      u.email,
      u.fcm_token,
      rp.organization_name,
      rp.responder_type,
      rp.specializations,
      ST_Distance(
        u.last_known_location,
        ST_MakePoint($1, $2)::geography
      ) AS distance_metres
    FROM users u
    JOIN responder_profiles rp ON rp.user_id = u.id
    WHERE
      u.role            = 'responder'
      AND u.is_active   = TRUE
      AND rp.is_available = TRUE
      AND u.last_known_location IS NOT NULL
      AND ST_DWithin(
        u.last_known_location,
        ST_MakePoint($1, $2)::geography,
        $3
      )
    ORDER BY distance_metres ASC
    LIMIT 10;
  `;

  // Parameters: $1 = longitude, $2 = latitude, $3 = radius in metres
  const params = [longitude, latitude, radiusMetres];

  logger.info(
    `Spatial query: finding responders within ${radiusMetres}m of (${latitude}, ${longitude})`
  );

  const result = await db.query(sql, params);

  logger.info(`Found ${result.rows.length} nearby responders`);

  return result.rows;
};

module.exports = {
  findNearbyResponders,
};
