// =============================================================================
// screens/HomeScreen.js — Tactical Ops Dashboard
// =============================================================================
// Redesigned to match a military/tactical ops command center aesthetic.
// Dark black background, orange accents, monospace fonts, card grid layout.
//
// SEPARATION PRINCIPLE PRESERVED:
//   All data comes from hooks. This is purely visual wiring.
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { useReportSubmission } from '../hooks/useReportSubmission';
import ReportEmergencyButton from '../components/ReportEmergencyButton';

// ── Monospace font helper ───────────────────────────────────────────────────
const MONO = Platform.select({
  web: 'Courier New, Courier, monospace',
  ios: 'Courier New',
  android: 'monospace',
  default: 'monospace',
});

// ── Live clock component ────────────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Text style={s.clockText}>
      LAST UPDATE: {time.toISOString().replace('T', ' ').substring(0, 19)} UTC
    </Text>
  );
};

const HomeScreen = () => {
  const {
    fetchLocation,
    location,
    address,
    isFetching: isFetchingLocation,
    error: locationError,
  } = useLocation();

  const {
    submitReport,
    isSubmitting,
    submitError,
    currentReport,
    nearbyResponders,
  } = useReportSubmission();

  const handleSubmitReport = async () => {
    if (!location) return;
    await submitReport({
      latitude: location.latitude,
      longitude: location.longitude,
      animal_type: 'dog',
      description: 'Animal in distress — immediate rescue required',
      urgency: 'critical',
      address: address || undefined,
    });
  };

  // ── Activity log entries ──────────────────────────────────────────────────
  const [uptime, setUptime] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const sec = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  return (
    <View style={s.root}>
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <View style={s.sidebar}>
        <View style={s.sidebarHeader}>
          <Text style={s.sidebarTitle}>RESCUE OPS</Text>
          <Text style={s.sidebarVersion}>v2.1.7 CLASSIFIED</Text>
        </View>

        <TouchableOpacity style={[s.navItem, s.navItemActive]}>
          <Text style={s.navIcon}>⬡</Text>
          <Text style={[s.navText, s.navTextActive]}>COMMAND CENTER</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIcon}>◈</Text>
          <Text style={s.navText}>RESPONDER NET</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIcon}>◉</Text>
          <Text style={s.navText}>OPERATIONS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIcon}>◇</Text>
          <Text style={s.navText}>INTELLIGENCE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIcon}>⚙</Text>
          <Text style={s.navText}>SYSTEMS</Text>
        </TouchableOpacity>

        <View style={s.sidebarFooter}>
          <View style={s.statusDot} />
          <Text style={s.statusOnline}>SYSTEM ONLINE</Text>
          <Text style={s.statusMeta}>UPTIME: {formatUptime(uptime)}</Text>
          <Text style={s.statusMeta}>
            RESPONDERS: {nearbyResponders.length > 0 ? nearbyResponders.length : '—'} ACTIVE
          </Text>
          <Text style={s.statusMeta}>
            MISSIONS: {currentReport ? '1 ONGOING' : '0 ONGOING'}
          </Text>
        </View>
      </View>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <ScrollView style={s.main} contentContainerStyle={s.mainContent}>
        {/* ── Top bar ────────────────────────────────────────────────── */}
        <View style={s.topBar}>
          <View style={s.breadcrumb}>
            <Text style={s.breadcrumbText}>TACTICAL COMMAND / </Text>
            <Text style={s.breadcrumbActive}>OVERVIEW</Text>
          </View>
          <LiveClock />
        </View>

        {/* ── Dashboard Grid ─────────────────────────────────────────── */}
        <View style={s.grid}>
          {/* ── Report Card (replaces Agent Allocation) ──────────────── */}
          <View style={[s.card, s.cardReport]}>
            <ReportEmergencyButton
              onFetchLocation={fetchLocation}
              onSubmitReport={handleSubmitReport}
              isFetchingLocation={isFetchingLocation}
              isSubmitting={isSubmitting}
              hasLocation={!!location}
              address={address}
              locationError={locationError}
              submitError={submitError}
              isSuccess={!!currentReport}
            />
          </View>

          {/* ── Activity Log ─────────────────────────────────────────── */}
          <View style={[s.card, s.cardLog]}>
            <Text style={s.cardTitle}>ACTIVITY LOG</Text>
            <View style={s.logDivider} />

            {currentReport ? (
              <>
                <View style={s.logEntry}>
                  <Text style={s.logTime}>
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                  </Text>
                  <Text style={s.logMsg}>
                    Report <Text style={s.logHighlight}>#{currentReport.id?.substring(0, 8)}</Text>{' '}
                    submitted at coordinates{'\n'}
                    ({currentReport.latitude?.toFixed(4)}, {currentReport.longitude?.toFixed(4)})
                  </Text>
                </View>
                <View style={s.logEntry}>
                  <Text style={s.logTime}>
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                  </Text>
                  <Text style={s.logMsg}>
                    <Text style={s.logHighlight}>{nearbyResponders.length}</Text> responders
                    detected within 5km radius
                  </Text>
                </View>
                <View style={s.logEntry}>
                  <Text style={s.logTime}>
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                  </Text>
                  <Text style={s.logMsg}>
                    Dispatch alert sent to{' '}
                    <Text style={s.logHighlight}>
                      {nearbyResponders[0]?.full_name || 'responders'}
                    </Text>
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={s.logEntry}>
                  <Text style={s.logTime}>— — —</Text>
                  <Text style={s.logMsg}>Awaiting new incident report…</Text>
                </View>
                <View style={s.logEntry}>
                  <Text style={s.logTime}>— — —</Text>
                  <Text style={s.logMsg}>
                    System monitoring <Text style={s.logHighlight}>active</Text>
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* ── Encrypted Comms / System Panel ───────────────────────── */}
          <View style={[s.card, s.cardComms]}>
            <Text style={s.cardTitle}>ENCRYPTED COMMS</Text>
            <View style={s.logDivider} />

            {/* Radar visual (ASCII art style) */}
            <View style={s.radarContainer}>
              <Text style={s.radarText}>
                {'    ╭─────────╮\n'}
                {'  ╭─┤  ◉    ╱ ├─╮\n'}
                {'  │ │    ╱    │ │\n'}
                {'  │ │  ╱  ·   │ │\n'}
                {'  │ │╱    ·   │ │\n'}
                {'  ╰─┤         ├─╯\n'}
                {'    ╰─────────╯'}
              </Text>
            </View>

            <View style={s.terminalBlock}>
              <Text style={s.terminalText}>
                {'# ' + new Date().toISOString().substring(0, 19) + ' UTC\n'}
                {'> [SYS:rescue_net] ::: INIT >>\n'}
                {'^^^ loading secure channel\n'}
                {'> CH#1 | GPS.COORD.' + (location ? `${location.latitude.toFixed(3)}` : '—') + '\n'}
                {'> KEY LOCKED\n'}
                {'> STATUS >> "...monitoring all\n'}
                {'  frequencies... awaiting\n'}
                {'  rescue dispatch"'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Responders Grid (lower section) ────────────────────────── */}
        {nearbyResponders.length > 0 && (
          <View style={s.lowerGrid}>
            {/* ── Responder Allocation ─────────────────────────────────── */}
            <View style={[s.card, s.cardAllocation]}>
              <Text style={s.cardTitle}>RESPONDER ALLOCATION</Text>
              <View style={s.logDivider} />

              {nearbyResponders.map((r, i) => (
                <View key={r.responder_id || i} style={s.agentRow}>
                  <View
                    style={[
                      s.agentDot,
                      {
                        backgroundColor:
                          r.responder_type === 'ngo'
                            ? '#4ADE80'
                            : r.responder_type === 'vet'
                            ? '#E8731E'
                            : '#6B7280',
                      },
                    ]}
                  />
                  <View style={s.agentInfo}>
                    <Text style={s.agentCode}>
                      R-{String(i + 1).padStart(3, '0')}
                      {r.responder_type === 'vet' ? 'V' : r.responder_type === 'ngo' ? 'N' : 'X'}
                    </Text>
                    <Text style={s.agentName}>{r.full_name.toUpperCase()}</Text>
                  </View>
                  <Text style={s.agentDist}>{Math.round(r.distance_metres)}m</Text>
                </View>
              ))}
            </View>

            {/* ── Mission Information ──────────────────────────────────── */}
            <View style={[s.card, s.cardMission]}>
              <Text style={s.cardTitle}>MISSION INFORMATION</Text>
              <View style={s.logDivider} />

              <View style={s.missionRow}>
                <View style={[s.missionDot, { backgroundColor: '#E8731E' }]} />
                <Text style={s.missionLabel}>Active Rescue</Text>
              </View>

              <View style={s.missionStats}>
                <View style={s.missionStatRow}>
                  <Text style={s.missionStatLabel}>NGO Responders</Text>
                  <Text style={s.missionStatVal}>
                    {nearbyResponders.filter((r) => r.responder_type === 'ngo').length}
                  </Text>
                </View>
                <View style={s.missionStatRow}>
                  <Text style={s.missionStatLabel}>Vet Responders</Text>
                  <Text style={s.missionStatVal}>
                    {nearbyResponders.filter((r) => r.responder_type === 'vet').length}
                  </Text>
                </View>
                <View style={s.missionStatRow}>
                  <Text style={s.missionStatLabel}>Volunteers</Text>
                  <Text style={s.missionStatVal}>
                    {nearbyResponders.filter((r) => r.responder_type === 'volunteer').length}
                  </Text>
                </View>
                <View style={[s.missionStatRow, s.missionStatRowTotal]}>
                  <Text style={[s.missionStatLabel, { color: '#E8731E' }]}>Total Dispatched</Text>
                  <Text style={[s.missionStatVal, { color: '#E8731E' }]}>
                    {nearbyResponders.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// =============================================================================
// STYLES — Tactical Ops Command Center
// =============================================================================

const ACCENT = '#E8731E';       // Orange
const BG = '#0A0A0A';           // Pure black
const CARD_BG = '#111111';      // Slightly lighter for cards
const BORDER = '#1E1E1E';       // Subtle card borders
const TEXT_DIM = '#5A5A5A';     // Dimmed text
const TEXT_MED = '#888888';     // Medium text
const TEXT_BRIGHT = '#D4D4D4';  // Bright text

const webShadow = Platform.OS === 'web'
  ? { boxShadow: '0 0 1px rgba(232,115,30,0.1)' }
  : {};

const s = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: BG,
  },

  // ── Sidebar ───────────────────────────────────────────────────────────
  sidebar: {
    width: 200,
    backgroundColor: '#0D0D0D',
    borderRightWidth: 1,
    borderRightColor: BORDER,
    paddingTop: 24,
    justifyContent: 'flex-start',
  },

  sidebarHeader: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  sidebarTitle: {
    fontFamily: MONO,
    fontSize: 18,
    fontWeight: '900',
    color: TEXT_BRIGHT,
    letterSpacing: 2,
  },

  sidebarVersion: {
    fontFamily: MONO,
    fontSize: 10,
    color: TEXT_DIM,
    marginTop: 2,
    letterSpacing: 1,
  },

  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },

  navItemActive: {
    backgroundColor: 'rgba(232,115,30,0.08)',
    borderLeftColor: ACCENT,
  },

  navIcon: {
    fontFamily: MONO,
    fontSize: 14,
    color: TEXT_DIM,
    marginRight: 10,
    width: 20,
    textAlign: 'center',
  },

  navText: {
    fontFamily: MONO,
    fontSize: 12,
    color: TEXT_DIM,
    letterSpacing: 1,
    fontWeight: '600',
  },

  navTextActive: {
    color: ACCENT,
  },

  sidebarFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginBottom: 6,
  },

  statusOnline: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '800',
    color: TEXT_BRIGHT,
    letterSpacing: 1,
    marginBottom: 6,
  },

  statusMeta: {
    fontFamily: MONO,
    fontSize: 10,
    color: TEXT_DIM,
    lineHeight: 16,
  },

  // ── Main Content ──────────────────────────────────────────────────────
  main: {
    flex: 1,
    backgroundColor: BG,
  },

  mainContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // ── Top Bar ───────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  breadcrumb: {
    flexDirection: 'row',
  },

  breadcrumbText: {
    fontFamily: MONO,
    fontSize: 13,
    color: TEXT_DIM,
    letterSpacing: 1,
    fontWeight: '600',
  },

  breadcrumbActive: {
    fontFamily: MONO,
    fontSize: 13,
    color: ACCENT,
    letterSpacing: 1,
    fontWeight: '700',
  },

  clockText: {
    fontFamily: MONO,
    fontSize: 11,
    color: TEXT_DIM,
    letterSpacing: 0.5,
  },

  // ── Grid layout ───────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },

  lowerGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    flexWrap: 'wrap',
  },

  // ── Cards ─────────────────────────────────────────────────────────────
  card: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 20,
    ...webShadow,
  },

  cardReport: {
    flex: 1,
    minWidth: 280,
  },

  cardLog: {
    flex: 1,
    minWidth: 250,
  },

  cardComms: {
    flex: 1,
    minWidth: 250,
  },

  cardAllocation: {
    flex: 2,
    minWidth: 300,
  },

  cardMission: {
    flex: 1,
    minWidth: 250,
  },

  cardTitle: {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_BRIGHT,
    letterSpacing: 2,
    marginBottom: 12,
  },

  logDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 16,
  },

  // ── Activity Log Entries ──────────────────────────────────────────────
  logEntry: {
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: BORDER,
  },

  logTime: {
    fontFamily: MONO,
    fontSize: 11,
    color: TEXT_DIM,
    marginBottom: 4,
  },

  logMsg: {
    fontFamily: MONO,
    fontSize: 12,
    color: TEXT_MED,
    lineHeight: 18,
  },

  logHighlight: {
    color: ACCENT,
    fontWeight: '700',
  },

  // ── Encrypted Comms / Terminal ────────────────────────────────────────
  radarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },

  radarText: {
    fontFamily: MONO,
    fontSize: 14,
    color: TEXT_DIM,
    lineHeight: 18,
  },

  terminalBlock: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 2,
    padding: 12,
  },

  terminalText: {
    fontFamily: MONO,
    fontSize: 11,
    color: TEXT_DIM,
    lineHeight: 17,
  },

  // ── Responder Allocation (Agent rows) ─────────────────────────────────
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  agentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
  },

  agentInfo: {
    flex: 1,
  },

  agentCode: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '800',
    color: TEXT_BRIGHT,
    letterSpacing: 1,
  },

  agentName: {
    fontFamily: MONO,
    fontSize: 11,
    color: TEXT_DIM,
    letterSpacing: 1,
    marginTop: 2,
  },

  agentDist: {
    fontFamily: MONO,
    fontSize: 13,
    color: ACCENT,
    fontWeight: '700',
  },

  // ── Mission Information ───────────────────────────────────────────────
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  missionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },

  missionLabel: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_BRIGHT,
  },

  missionStats: {
    marginTop: 4,
  },

  missionStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  missionStatRowTotal: {
    borderBottomWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    marginTop: 4,
    paddingTop: 12,
  },

  missionStatLabel: {
    fontFamily: MONO,
    fontSize: 12,
    color: TEXT_MED,
  },

  missionStatVal: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '800',
    color: TEXT_BRIGHT,
  },
});

export default HomeScreen;
