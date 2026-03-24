// =============================================================================
// utils/logger.js — Simple Logging Utility
// =============================================================================
// A lightweight logger that prefixes messages with a timestamp and level.
//
// Why not Winston/Pino?
//   For a prototype, a simple wrapper keeps dependencies minimal. Replace
//   this with a production logger (Pino recommended) when you scale up.
// =============================================================================

/**
 * Format a log message with ISO timestamp and level prefix.
 * @param {'INFO'|'WARN'|'ERROR'} level
 * @param  {...any} args
 */
const formatLog = (level, ...args) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}]`, ...args);
};

module.exports = {
  info: (...args) => formatLog('INFO', ...args),
  warn: (...args) => formatLog('WARN', ...args),
  error: (...args) => formatLog('ERROR', ...args),
};
