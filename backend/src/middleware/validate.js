// =============================================================================
// middleware/validate.js — Request Validation Middleware
// =============================================================================
// Uses `express-validator` to declare and enforce validation rules for
// incoming request bodies.
//
// Pattern:
//   1. Define an array of validation chains (rules).
//   2. Export a middleware that runs those chains, then checks for errors.
//   3. If errors exist → respond with 422 and the error details.
//   4. If clean → call next() to proceed to the controller.
//
// This keeps validation logic OUT of controllers, following single-
// responsibility principle.
// =============================================================================

const { body, validationResult } = require('express-validator');

// ─── Validation rules for POST /api/reports/new ─────────────────────────────
// Each rule is an express-validator chain that checks one field.
const reportValidationRules = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('latitude must be a number between -90 and 90'),

  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('longitude must be a number between -180 and 180'),

  body('animal_type')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('animal_type is required (e.g. "dog", "cat")'),

  body('description')
    .optional()
    .isString()
    .trim(),

  body('urgency')
    .optional()
    .isIn(['critical', 'high', 'medium', 'low'])
    .withMessage('urgency must be one of: critical, high, medium, low'),

  body('reporter_id')
    .optional()
    .isUUID()
    .withMessage('reporter_id must be a valid UUID if provided'),

  body('address')
    .optional()
    .isString()
    .trim(),

  body('photo_url')
    .optional()
    .isURL()
    .withMessage('photo_url must be a valid URL'),
];

// ─── Generic validation result checker ──────────────────────────────────────
// This middleware runs AFTER the validation chains and collects any errors.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Return 422 Unprocessable Entity with a structured error payload.
    return res.status(422).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  // No validation errors — proceed to the controller
  next();
};

module.exports = {
  reportValidationRules,
  validate,
};
