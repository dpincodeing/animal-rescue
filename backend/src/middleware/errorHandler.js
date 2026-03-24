// =============================================================================
// middleware/errorHandler.js — Global Error Handler
// =============================================================================
// Express error-handling middleware (4-argument signature).
//
// Any error thrown or passed via next(err) in a route/controller lands here.
// We log the full error server-side but send a sanitised response to the
// client to avoid leaking stack traces or internal details.
// =============================================================================

const logger = require('../utils/logger');

/**
 * Global error-handling middleware.
 *
 * @param {Error} err   — The error object
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next — unused but required by Express
 */
const errorHandler = (err, req, res, _next) => {
  // ── Log the full error for debugging ──────────────────────────────────
  logger.error(`Error on ${req.method} ${req.originalUrl}:`, err.message);
  if (err.stack) {
    logger.error(err.stack);
  }

  // ── Determine the HTTP status code ────────────────────────────────────
  // If the error already carries a statusCode (set by controller/validation),
  // use it. Otherwise default to 500 Internal Server Error.
  const statusCode = err.statusCode || 500;

  // ── Send a clean JSON response ────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      // Only include the error code if one was explicitly set
      ...(err.code && { code: err.code }),
    },
  });
};

module.exports = errorHandler;
