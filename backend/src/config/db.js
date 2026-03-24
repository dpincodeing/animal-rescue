// =============================================================================
// config/db.js — PostgreSQL Connection Pool (Railway)
// =============================================================================
// Uses the `pg` library's Pool to manage a connection pool against the
// Railway-hosted PostgreSQL instance.
//
// Why a Pool?
//   Pools re-use TCP connections across requests, avoiding the overhead of
//   opening a new connection for every query. This is critical for a
//   real-time rescue platform where milliseconds matter.
//
// Configuration:
//   Reads DATABASE_URL from environment. Railway injects this automatically
//   when you link a Postgres add-on to your service.
//
// SSL:
//   Railway requires SSL connections. We set `rejectUnauthorized: false`
//   because Railway uses self-signed certificates.
// =============================================================================

const { Pool } = require('pg');
const logger = require('../utils/logger');

// ── Validate that the DATABASE_URL is set ───────────────────────────────────
if (!process.env.DATABASE_URL) {
  logger.warn('DATABASE_URL is not set — database features will run in DEMO mode.');
  logger.warn('Set it in .env or as a Railway service variable for production use.');
}

// ── Create the connection pool ──────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // SSL configuration for Railway
  ssl: {
    rejectUnauthorized: false, // Railway uses self-signed certs
  },

  // Pool tuning — sensible defaults for a prototype
  max: 10,               // Maximum simultaneous connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Fail fast if DB is unreachable
});

// ── Connection event logging ────────────────────────────────────────────────
pool.on('connect', () => {
  logger.info('📦 New client connected to PostgreSQL pool');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
  // Don't crash — the pool will remove the broken client and create a new one
});

// ── Export a query helper ───────────────────────────────────────────────────
// Wraps pool.query so every module can simply:
//   const db = require('../config/db');
//   const result = await db.query('SELECT ...', [params]);
module.exports = {
  /**
   * Execute a parameterised SQL query against the pool.
   *
   * @param {string} text  — SQL statement with $1, $2, … placeholders
   * @param {any[]}  params — Values to bind to the placeholders
   * @returns {Promise<import('pg').QueryResult>}
   */
  query: (text, params) => pool.query(text, params),

  /**
   * Expose the raw pool for advanced use-cases (transactions, etc.)
   */
  pool,
};
