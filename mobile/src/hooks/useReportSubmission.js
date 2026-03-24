// =============================================================================
// hooks/useReportSubmission.js — Report Submission Logic Hook
// =============================================================================
// Custom hook that handles the API call to submit an emergency report.
//
// SEPARATION PRINCIPLE:
//   This hook owns the submission logic. The UI component that triggers it
//   (e.g. ReportEmergencyButton) only calls `submitReport(data)` and reads
//   the returned state — it never touches fetch/API directly.
//
// Flow:
//   1. Dispatches SUBMIT_REPORT_START (shows loading state).
//   2. Calls api.submitReport() with the report payload.
//   3. On success: dispatches SUBMIT_REPORT_SUCCESS with report + responders.
//   4. On error:   dispatches SUBMIT_REPORT_ERROR with error message.
// =============================================================================

import { useCallback } from 'react';
import { useReportContext } from '../context/ReportContext';
import api from '../services/api';

/**
 * Custom hook for submitting animal emergency reports.
 *
 * @returns {object}
 *   - submitReport(data) — Async function to submit a report
 *   - isSubmitting        — Boolean loading state
 *   - submitError         — Error message string or null
 *   - currentReport       — The last submitted report or null
 *   - nearbyResponders    — Array of responders found nearby
 *   - resetReport()       — Clears the current report state
 */
export function useReportSubmission() {
  const { state, dispatch, ACTIONS } = useReportContext();

  /**
   * Submit an emergency report to the backend.
   *
   * @param {object} reportData
   * @param {string} reportData.reporter_id   — UUID of the citizen
   * @param {number} reportData.latitude      — GPS latitude
   * @param {number} reportData.longitude     — GPS longitude
   * @param {string} reportData.animal_type   — e.g. 'dog', 'cat'
   * @param {string} [reportData.description] — Optional description
   * @param {string} [reportData.urgency]     — 'critical'|'high'|'medium'|'low'
   * @param {string} [reportData.address]     — Reverse-geocoded address
   */
  const submitReport = useCallback(
    async (reportData) => {
      // ── 1. Signal loading ───────────────────────────────────────────────
      dispatch({ type: ACTIONS.SUBMIT_REPORT_START });

      try {
        // ── 2. Call the backend API ─────────────────────────────────────────
        const response = await api.submitReport(reportData);

        // ── 3. Success: store the report and responders ─────────────────────
        dispatch({
          type: ACTIONS.SUBMIT_REPORT_SUCCESS,
          payload: {
            report: response.data.report,
            nearby_responders: response.data.nearby_responders,
          },
        });

        return response.data;
      } catch (error) {
        // ── 4. Error: store the error message ───────────────────────────────
        dispatch({
          type: ACTIONS.SUBMIT_REPORT_ERROR,
          payload: error.message || 'Failed to submit report',
        });

        throw error; // Re-throw so the component can handle it if needed
      }
    },
    [dispatch, ACTIONS]
  );

  /**
   * Reset the report state (e.g. after the user dismisses a success screen).
   */
  const resetReport = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_REPORT });
  }, [dispatch, ACTIONS]);

  // ── Return values for components ──────────────────────────────────────────
  return {
    submitReport,
    isSubmitting: state.isSubmitting,
    submitError: state.submitError,
    currentReport: state.currentReport,
    nearbyResponders: state.nearbyResponders,
    resetReport,
  };
}
