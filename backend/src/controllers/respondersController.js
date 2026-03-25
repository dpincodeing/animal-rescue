// =============================================================================
// controllers/respondersController.js — Responders Logic
// =============================================================================

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

let db;
let spatialService;
try {
  db = require('../config/db');
  spatialService = require('../services/spatialService');
} catch (e) {
  logger.warn('Database module failed to load — running in DEMO mode');
}

/**
 * GET /api/responders/nearby
 * 
 * Query params:
 *   latitude: number
 *   longitude: number
 *   radius: number (optional)
 */
const getNearbyResponders = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'latitude and longitude query parameters are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    let dbConnected = false;
    if (db) {
      try {
        await db.query('SELECT 1');
        dbConnected = true;
      } catch {
        dbConnected = false;
      }
    }

    if (!dbConnected) {
      logger.warn('⚡ DEMO MODE — returning simulated responders data');
      const demoData = [
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
          latitude:          lat + 0.005,
          longitude:         lng + 0.005,
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
          latitude:          lat - 0.015,
          longitude:         lng + 0.01,
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
          latitude:          lat + 0.02,
          longitude:         lng - 0.02,
        },
      ];

      return res.status(200).json({
        success: true,
        demo_mode: true,
        data: demoData,
      });
    }

    const nearbyResponders = await spatialService.findNearbyResponders(
      lat, lng, parseInt(radius)
    );

    res.status(200).json({
      success: true,
      data: nearbyResponders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbyResponders,
};
