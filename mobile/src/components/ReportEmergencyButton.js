// =============================================================================
// components/ReportEmergencyButton.js — Tactical Ops Styled
// =============================================================================
// Redesigned to match the military/ops command center aesthetic.
// Monospace fonts, orange accents, terminal-style layout.
//
// SEPARATION PRINCIPLE: Zero business logic. All data via props.
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';

const MONO = Platform.select({
  web: 'Courier New, Courier, monospace',
  ios: 'Courier New',
  android: 'monospace',
  default: 'monospace',
});

const ACCENT = '#E8731E';
const TEXT_DIM = '#5A5A5A';
const TEXT_MED = '#888888';
const TEXT_BRIGHT = '#D4D4D4';
const BORDER = '#1E1E1E';

const ReportEmergencyButton = ({
  onFetchLocation,
  onSubmitReport,
  isFetchingLocation,
  isSubmitting,
  hasLocation,
  address,
  locationError,
  submitError,
  isSuccess,
}) => {
  return (
    <View style={s.container}>
      {/* ── Title ────────────────────────────────────────────────────── */}
      <Text style={s.title}>FIELD REPORT</Text>
      <View style={s.divider} />

      {/* ── Stats row (like Agent Allocation numbers) ────────────────── */}
      <View style={s.statsRow}>
        <View style={s.statBlock}>
          <Text style={s.statNumber}>{hasLocation ? '1' : '0'}</Text>
          <Text style={s.statLabel}>GPS{'\n'}Lock</Text>
        </View>
        <View style={s.statBlock}>
          <Text style={s.statNumber}>{isSuccess ? '1' : '0'}</Text>
          <Text style={s.statLabel}>Reports{'\n'}Filed</Text>
        </View>
        <View style={s.statBlock}>
          <Text style={[s.statNumber, isSuccess && { color: '#4ADE80' }]}>
            {isSuccess ? 'ACT' : 'SBY'}
          </Text>
          <Text style={s.statLabel}>Dispatch{'\n'}Status</Text>
        </View>
      </View>

      <View style={s.divider} />

      {/* ── Step 1: Location ─────────────────────────────────────────── */}
      <TouchableOpacity
        style={[s.button, hasLocation && s.buttonSuccess]}
        onPress={onFetchLocation}
        disabled={isFetchingLocation}
        activeOpacity={0.7}
      >
        {isFetchingLocation ? (
          <View style={s.buttonInner}>
            <ActivityIndicator color={ACCENT} size="small" />
            <Text style={s.buttonText}>  ACQUIRING TARGET…</Text>
          </View>
        ) : (
          <View style={s.buttonInner}>
            <View style={[s.btnDot, { backgroundColor: hasLocation ? '#4ADE80' : TEXT_DIM }]} />
            <Text style={s.buttonText}>
              {hasLocation ? 'GPS LOCK ACQUIRED' : '> ACQUIRE GPS LOCK'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── Location Error ───────────────────────────────────────────── */}
      {locationError && (
        <View style={s.errorRow}>
          <Text style={s.errorDot}>●</Text>
          <Text style={s.errorText}>[ERR] {locationError}</Text>
        </View>
      )}

      {/* ── Address Display ──────────────────────────────────────────── */}
      {address && (
        <View style={s.addressBlock}>
          <Text style={s.addressLabel}>{'>'} COORDINATES RESOLVED:</Text>
          <Text style={s.addressText}>{address}</Text>
        </View>
      )}

      {/* ── Step 2: Report ───────────────────────────────────────────── */}
      <TouchableOpacity
        style={[s.button, s.buttonReport, !hasLocation && s.buttonDisabled]}
        onPress={onSubmitReport}
        disabled={!hasLocation || isSubmitting}
        activeOpacity={0.7}
      >
        {isSubmitting ? (
          <View style={s.buttonInner}>
            <ActivityIndicator color="#FFF" size="small" />
            <Text style={s.buttonTextBright}>  TRANSMITTING…</Text>
          </View>
        ) : (
          <View style={s.buttonInner}>
            <Text style={s.buttonTextBright}>⚠ DISPATCH RESCUE ALERT</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── Submit Error ─────────────────────────────────────────────── */}
      {submitError && (
        <View style={s.errorRow}>
          <Text style={s.errorDot}>●</Text>
          <Text style={s.errorText}>[ERR] {submitError}</Text>
        </View>
      )}

      {/* ── Success ──────────────────────────────────────────────────── */}
      {isSuccess && (
        <View style={s.successBlock}>
          <Text style={s.successText}>
            {'> ALERT DISPATCHED SUCCESSFULLY\n'}
            {'> RESPONDERS NOTIFIED\n'}
            {'> MISSION STATUS: ACTIVE'}
          </Text>
        </View>
      )}
    </View>
  );
};

// =============================================================================
// STYLES — Tactical command panel
// =============================================================================

const s = StyleSheet.create({
  container: {
    // No background — inherits from parent card
  },

  title: {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_BRIGHT,
    letterSpacing: 2,
    marginBottom: 12,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 16,
  },

  // ── Stats row ───────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-around',
  },

  statBlock: {
    alignItems: 'center',
  },

  statNumber: {
    fontFamily: MONO,
    fontSize: 28,
    fontWeight: '900',
    color: TEXT_BRIGHT,
    letterSpacing: 1,
  },

  statLabel: {
    fontFamily: MONO,
    fontSize: 10,
    color: TEXT_DIM,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 14,
  },

  // ── Buttons ─────────────────────────────────────────────────────────────
  button: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  buttonSuccess: {
    borderColor: '#166534',
    backgroundColor: 'rgba(74,222,128,0.04)',
  },

  buttonReport: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },

  buttonDisabled: {
    backgroundColor: '#1A1A1A',
    borderColor: BORDER,
    opacity: 0.5,
  },

  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },

  buttonText: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_MED,
    letterSpacing: 1,
  },

  buttonTextBright: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // ── Address ─────────────────────────────────────────────────────────────
  addressBlock: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#166534',
    borderRadius: 2,
    padding: 12,
    marginBottom: 12,
  },

  addressLabel: {
    fontFamily: MONO,
    fontSize: 10,
    color: '#4ADE80',
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: '700',
  },

  addressText: {
    fontFamily: MONO,
    fontSize: 11,
    color: TEXT_MED,
    lineHeight: 16,
  },

  // ── Errors ──────────────────────────────────────────────────────────────
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 4,
  },

  errorDot: {
    fontFamily: MONO,
    color: '#EF4444',
    fontSize: 10,
    marginRight: 8,
    marginTop: 2,
  },

  errorText: {
    fontFamily: MONO,
    fontSize: 11,
    color: '#FCA5A5',
    flex: 1,
    lineHeight: 16,
  },

  // ── Success ─────────────────────────────────────────────────────────────
  successBlock: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#166534',
    borderRadius: 2,
    padding: 12,
    marginTop: 4,
  },

  successText: {
    fontFamily: MONO,
    fontSize: 11,
    color: '#4ADE80',
    lineHeight: 18,
    fontWeight: '600',
  },
});

export default ReportEmergencyButton;
