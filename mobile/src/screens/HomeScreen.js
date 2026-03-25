// =============================================================================
// screens/HomeScreen.js — Compassionate Redesign
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { useReportSubmission } from '../hooks/useReportSubmission';
import ReportEmergencyButton from '../components/ReportEmergencyButton';

// ── Colors ──────────────────────────────────────────────────────────────────
const COLORS = {
  background: '#FFF9F0',     // Warm neutral
  surface: '#FFFFFF',        // Pure white cards
  primary: '#FF7F50',        // Coral / Orange
  success: '#4CA57C',        // Calming green
  textDark: '#333333',       // Main text
  textMedium: '#666666',     // Subtitles
  textLight: '#999999',      // Meta text
  border: '#F0E6D2',         // Soft borders
};

const FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

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

  return (
    <ScrollView style={s.root} contentContainerStyle={s.mainContent}>
      
      {/* ── Hero Image ────────────────────────────────────────────────────────── */}
      <View style={s.heroContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop' }} 
          style={s.heroImage} 
        />
        <View style={s.heroOverlay}>
          <Text style={s.appTitle}>Rescue Paws ♡</Text>
          <Text style={s.appSubtitle}>Compassion in action. Help animals in need with a single tap.</Text>
        </View>
      </View>

      <View style={s.contentWrapper}>
        {/* ── Main Report Action ──────────────────────────────────────────────── */}
        <View style={s.card}>
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

        {/* ── Status & Mission Update (Only shows after reporting) ──────────── */}
        {currentReport && (
          <View style={[s.card, s.missionCard]}>
            <View style={s.missionHeaderRow}>
              <View style={s.successPulse} />
              <Text style={s.cardTitle}>Help is on the way</Text>
            </View>
            <Text style={s.missionMsg}>
              Your report <Text style={{fontWeight: '700'}}>#{currentReport.id?.substring(0, 6)}</Text> has been received. 
              We've alerted local responders near your location!
            </Text>

            <View style={s.statsRow}>
              <View style={s.statBox}>
                <Text style={s.statVal}>{nearbyResponders.length}</Text>
                <Text style={s.statLabel}>Responders{'\n'}Notified</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statVal}>Active</Text>
                <Text style={s.statLabel}>Mission{'\n'}Status</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Nearby Responders List (Only shows if there are any) ────────────── */}
        {nearbyResponders.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Local Heroes Nearby</Text>
            <Text style={s.cardSubtitle}>
              These compassionate organizations have been alerted and are reviewing your distress call.
            </Text>

            <View style={s.respondersList}>
              {nearbyResponders.map((r, i) => (
                <View key={r.responder_id || i} style={s.responderRow}>
                  <View style={[s.avatar, { backgroundColor: r.responder_type === 'ngo' ? '#E8F5E9' : '#FFF3E0' }]}>
                    <Text style={s.avatarEmoji}>
                      {r.responder_type === 'ngo' ? '🐾' : r.responder_type === 'vet' ? '🩺' : '❤️'}
                    </Text>
                  </View>
                  <View style={s.responderInfo}>
                    <Text style={s.responderName}>{r.full_name}</Text>
                    <Text style={s.responderType}>
                      {r.responder_type === 'ngo' ? 'Animal Rescue Org' : r.responder_type === 'vet' ? 'Veterinary Clinic' : 'Local Volunteer'}
                    </Text>
                  </View>
                  <View style={s.distanceBadge}>
                    <Text style={s.distanceText}>{Math.round(r.distance_metres)}m</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
      
      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <Text style={s.footerText}>Thank you for being a voice for the voiceless. 🕊️</Text>
    </ScrollView>
  );
};

// ── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    paddingBottom: 60,
  },
  
  // ── Hero Section ────────────────────────
  heroContainer: {
    width: '100%',
    height: 320,
    position: 'relative',
    backgroundColor: COLORS.primary,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40, // More space to blend into content
    backgroundColor: 'rgba(0,0,0,0.4)', // Soft gradient-like darkening
  },
  appTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  appSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    maxWidth: '90%',
  },

  // ── Content Layout ──────────────────────
  contentWrapper: {
    marginTop: -20, // Pulls content up over the hero slightly
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'center', // Centers web content gracefully
  },

  // ── Cards ───────────────────────────────
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 600, // Limit width on large screens (Web layout support)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  missionCard: {
    backgroundColor: '#F3FAF6',
    borderColor: '#D1E8D5',
  },
  cardTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    color: COLORS.textMedium,
    lineHeight: 22,
    marginBottom: 20,
  },

  // ── Mission Block ───────────────────────
  missionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  successPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    marginRight: 10,
  },
  missionMsg: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    color: COLORS.textDark,
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  statVal: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.success,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: COLORS.textMedium,
    textAlign: 'center',
    fontWeight: '600',
  },

  // ── Responders List ─────────────────────
  respondersList: {
    gap: 16,
  },
  responderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  responderInfo: {
    flex: 1,
  },
  responderName: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  responderType: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: COLORS.textMedium,
    fontWeight: '500',
  },
  distanceBadge: {
    backgroundColor: '#FFF1E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distanceText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 13,
  },

  footerText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: 40,
    fontStyle: 'italic',
  }
});

export default HomeScreen;
