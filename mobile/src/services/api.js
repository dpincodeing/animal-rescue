// =============================================================================
// services/api.js — Backend API Client
// =============================================================================
// Centralised HTTP client for communicating with the Node/Express backend.
//
// Uses the native `fetch` API (available in React Native) instead of Axios
// to keep dependencies light.
//
// Configuration:
//   BASE_URL points to the backend. For local Expo development you may use
//   your machine's LAN IP (e.g. http://192.168.1.5:3000). In production,
//   this would be your Railway deployment URL.
// =============================================================================

// ── Base URL configuration ──────────────────────────────────────────────────
// IMPORTANT: Replace this with your actual backend URL.
//   - Local dev:   http://<YOUR_LAN_IP>:3000
//   - Railway:     https://your-app.up.railway.app
const BASE_URL = 'http://localhost:3000';

/**
 * Generic request helper with error handling.
 *
 * @param {string} endpoint  — API path (e.g. '/api/reports/new')
 * @param {object} options   — fetch options (method, headers, body)
 * @returns {Promise<object>} — Parsed JSON response
 * @throws {Error}            — On network or server errors
 */
const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // Default headers: always send and expect JSON
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse the JSON body
    const data = await response.json();

    // If the server returned an error status, throw with the message
    if (!response.ok) {
      const errorMessage =
        data.error?.message || data.errors?.[0]?.message || 'Request failed';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Re-throw with a more descriptive message for network failures
    if (error.name === 'TypeError' && error.message === 'Network request failed') {
      throw new Error(
        'Unable to connect to the server. Please check your internet connection.'
      );
    }
    throw error;
  }
};

// ── API Methods ─────────────────────────────────────────────────────────────

/**
 * Submit a new animal emergency report.
 *
 * @param {object} reportData — Report payload
 * @param {string} reportData.reporter_id  — UUID of the reporting citizen
 * @param {number} reportData.latitude     — GPS latitude
 * @param {number} reportData.longitude    — GPS longitude
 * @param {string} reportData.animal_type  — e.g. 'dog', 'cat'
 * @param {string} [reportData.description] — Free text description
 * @param {string} [reportData.urgency]     — 'critical'|'high'|'medium'|'low'
 * @param {string} [reportData.address]     — Reverse-geocoded address
 * @param {string} [reportData.photo_url]   — Optional image URL
 * @returns {Promise<object>} — { success, data: { report, nearby_responders } }
 */
const submitReport = (reportData) => {
  return request('/api/reports/new', {
    method: 'POST',
    body: JSON.stringify(reportData),
  });
};

/**
 * Fetch nearby responders without creating an emergency report.
 *
 * @param {number} latitude  — GPS latitude
 * @param {number} longitude — GPS longitude
 * @param {number} radius    — Search radius in metres
 * @returns {Promise<object>} — { success, data: [...] }
 */
const getNearbyResponders = (latitude, longitude, radius = 5000) => {
  return request(`/api/responders/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`, {
    method: 'GET',
  });
};

// ── Export all API methods ───────────────────────────────────────────────────
// Add new methods here as the API grows (e.g. getReports, updateSession, etc.)
const api = {
  submitReport,
  getNearbyResponders,
};

export default api;
