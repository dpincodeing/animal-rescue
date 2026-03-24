// =============================================================================
// context/ReportContext.js — Global Report State
// =============================================================================
// React Context that provides app-wide state for the current report workflow.
//
// WHY Context?
//   Multiple screens/components need to read the same state:
//     - HomeScreen needs the current location and submission status
//     - ReportEmergencyButton needs loading/error states
//     - Future screens (e.g. report list, session tracker) will need reports
//
// SEPARATION PRINCIPLE:
//   This context holds STATE and DISPATCH only. It does NOT own business logic
//   (that lives in hooks like useReportSubmission). Components consume this
//   context via the `useReportContext` hook.
// =============================================================================

import React, { createContext, useContext, useReducer } from 'react';

// ── Initial state shape ─────────────────────────────────────────────────────
const initialState = {
  // Current device location
  location: null,           // { latitude, longitude } or null
  address: null,            // Reverse-geocoded address string or null

  // Report submission state
  currentReport: null,      // The last submitted report object from the API
  nearbyResponders: [],     // Array of responders returned after submission
  isSubmitting: false,      // True while the API call is in flight
  submitError: null,        // Error message string or null

  // Location fetching state
  isFetchingLocation: false,
  locationError: null,
};

// ── Action types ────────────────────────────────────────────────────────────
// Using string constants prevents typo bugs.
const ACTIONS = {
  SET_LOCATION: 'SET_LOCATION',
  SET_LOCATION_ERROR: 'SET_LOCATION_ERROR',
  SET_FETCHING_LOCATION: 'SET_FETCHING_LOCATION',
  SUBMIT_REPORT_START: 'SUBMIT_REPORT_START',
  SUBMIT_REPORT_SUCCESS: 'SUBMIT_REPORT_SUCCESS',
  SUBMIT_REPORT_ERROR: 'SUBMIT_REPORT_ERROR',
  RESET_REPORT: 'RESET_REPORT',
};

// ── Reducer ─────────────────────────────────────────────────────────────────
// Pure function that returns a new state for each action.
const reportReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_FETCHING_LOCATION:
      return {
        ...state,
        isFetchingLocation: true,
        locationError: null,
      };

    case ACTIONS.SET_LOCATION:
      return {
        ...state,
        location: action.payload.location,
        address: action.payload.address,
        isFetchingLocation: false,
        locationError: null,
      };

    case ACTIONS.SET_LOCATION_ERROR:
      return {
        ...state,
        isFetchingLocation: false,
        locationError: action.payload,
      };

    case ACTIONS.SUBMIT_REPORT_START:
      return {
        ...state,
        isSubmitting: true,
        submitError: null,
      };

    case ACTIONS.SUBMIT_REPORT_SUCCESS:
      return {
        ...state,
        isSubmitting: false,
        currentReport: action.payload.report,
        nearbyResponders: action.payload.nearby_responders,
        submitError: null,
      };

    case ACTIONS.SUBMIT_REPORT_ERROR:
      return {
        ...state,
        isSubmitting: false,
        submitError: action.payload,
      };

    case ACTIONS.RESET_REPORT:
      return {
        ...state,
        currentReport: null,
        nearbyResponders: [],
        submitError: null,
      };

    default:
      return state;
  }
};

// ── Context creation ────────────────────────────────────────────────────────
const ReportContext = createContext(undefined);

// ── Provider component ──────────────────────────────────────────────────────
// Wrap your app (or a subtree) in <ReportProvider> to make state available.
export function ReportProvider({ children }) {
  const [state, dispatch] = useReducer(reportReducer, initialState);

  return (
    <ReportContext.Provider value={{ state, dispatch, ACTIONS }}>
      {children}
    </ReportContext.Provider>
  );
}

// ── Consumer hook ───────────────────────────────────────────────────────────
// Use this in any component that needs report state:
//   const { state, dispatch, ACTIONS } = useReportContext();
export function useReportContext() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReportContext must be used within a ReportProvider');
  }
  return context;
}
