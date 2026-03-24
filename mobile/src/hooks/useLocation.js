// =============================================================================
// hooks/useLocation.js — Device Location & Reverse Geocoding Hook
// =============================================================================
// Custom hook that encapsulates ALL location logic:
//   1. Requesting location permissions via Expo Location.
//   2. Getting the device's current GPS coordinates.
//   3. Reverse-geocoding coordinates into a human-readable address using
//      OpenStreetMap's Nominatim API (FREE — no API key required).
//
// SEPARATION PRINCIPLE:
//   This hook OWNS the location logic. UI components receive the results
//   as return values and never call Expo Location or Nominatim directly.
//   This means you can swap the entire UI without touching this file.
//
// NOMINATIM USAGE POLICY:
//   - Max 1 request per second (we only call on user action, so this is fine).
//   - Must include a descriptive User-Agent header.
//   - See: https://operations.osmfoundation.org/policies/nominatim/
// =============================================================================

import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { useReportContext } from '../context/ReportContext';

/**
 * Reverse-geocode coordinates using OpenStreetMap Nominatim.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} — Human-readable address or fallback string
 */
const reverseGeocode = async (latitude, longitude) => {
  try {
    // Nominatim expects lat/lon as query parameters.
    // format=json returns machine-readable JSON.
    // addressdetails=1 includes structured address components.
    const url =
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        // REQUIRED by Nominatim usage policy — identify your app
        'User-Agent': 'AnimalRescueApp/1.0 (contact@animalrescue.dev)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim returned status ${response.status}`);
    }

    const data = await response.json();

    // `display_name` is the full, human-readable address string
    // e.g. "Connaught Place, New Delhi, Delhi, 110001, India"
    return data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.warn('Reverse geocoding failed, using coordinates as fallback:', error);
    // Graceful degradation: show raw coordinates if Nominatim fails
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

/**
 * Custom hook for device location management.
 *
 * @returns {object}
 *   - fetchLocation()   — Async function to get current position + address
 *   - location          — { latitude, longitude } or null
 *   - address           — Human-readable address string or null
 *   - isFetching        — Boolean loading state
 *   - error             — Error message string or null
 */
export function useLocation() {
  const { state, dispatch, ACTIONS } = useReportContext();

  /**
   * Request permissions, get GPS coordinates, and reverse-geocode.
   * Dispatches results into the ReportContext.
   */
  const fetchLocation = useCallback(async () => {
    // Signal that we're loading
    dispatch({ type: ACTIONS.SET_FETCHING_LOCATION });

    try {
      // ── Step 1: Request permission ──────────────────────────────────────
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        dispatch({
          type: ACTIONS.SET_LOCATION_ERROR,
          payload: 'Location permission denied. Please enable it in Settings.',
        });
        return;
      }

      // ── Step 2: Get current position ────────────────────────────────────
      // accuracy: High gives GPS-level precision (~10m), which is what we
      // need for an emergency rescue scenario.
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;

      // ── Step 3: Reverse-geocode via Nominatim ───────────────────────────
      const address = await reverseGeocode(latitude, longitude);

      // ── Step 4: Dispatch results into global state ──────────────────────
      dispatch({
        type: ACTIONS.SET_LOCATION,
        payload: {
          location: { latitude, longitude },
          address,
        },
      });
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_LOCATION_ERROR,
        payload: error.message || 'Failed to get location',
      });
    }
  }, [dispatch, ACTIONS]);

  // ── Return values for components ──────────────────────────────────────────
  return {
    fetchLocation,
    location: state.location,
    address: state.address,
    isFetching: state.isFetchingLocation,
    error: state.locationError,
  };
}
