// =============================================================================
// screens/HomeScreen.js — Premium Redesign
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { useReportSubmission } from '../hooks/useReportSubmission';
import { useNearbyResponders } from '../hooks/useNearbyResponders';
import ReportEmergencyButton from '../components/ReportEmergencyButton';
import RespondersList from '../components/RespondersList';

// ── Colors ──────────────────────────────────────────────────────────────────
const COLORS = {
  background: '#F9F9F7',     // Alabaster
  surface: '#FFFFFF',        // Pure White
  primary: '#2C4C3B',        // Deep Forest Green
  accent: '#C05A44',         // Terracotta
  textDark: '#1C1C1E',       // Almost Black
  textMedium: '#8A8A8E',     // Sleek Medium Grey
  textLight: '#C7C7CC',      // Muted Border Grey
  border: 'rgba(0,0,0,0.06)',         
};

// ── Premium Font Stack ──────────────────────────────────────────────────────
const FONT_FAMILY = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif-light',
  web: '-apple-system, BlinkMacSystemFont, "Avenir Next", "Helvetica Neue", Helvetica, sans-serif',
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
    nearbyResponders: emergencyResponders,
  } = useReportSubmission();

  const {
    fetchResponders,
    responders: directoryResponders,
    isFetching: isFetchingDirectory,
    error: directoryError
  } = useNearbyResponders();

  const [showDirectory, setShowDirectory] = useState(false);

  useEffect(() => {
    if (showDirectory && location) {
      fetchResponders(location.latitude, location.longitude);
    }
  }, [showDirectory, location, fetchResponders]);

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

  const handleOpenDirectory = () => {
    setShowDirectory(true);
    if (location) {
      fetchResponders(location.latitude, location.longitude);
    }
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.mainContent}>
      
      {/* ── Premium Hero Section ──────────────────────────────────────────────── */}
      <View style={s.heroContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200&auto=format&fit=crop' }} 
          style={s.heroImage} 
        />
        <View style={s.heroOverlay} />
      </View>

      <View style={s.headerBlock}>
        <Text style={s.appTitle}>Rescue Ops.</Text>
        <Text style={s.appSubtitle}>Rapid response and care for local wildlife and domestic strays in distress.</Text>
      </View>

      <View style={s.contentWrapper}>
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

        {currentReport && (
          <View style={[s.card, s.missionCard]}>
            <View style={s.missionHeaderRow}>
              <View style={s.successPulse} />
              <Text style={s.missionCardTitle}>Mission Received</Text>
            </View>
            <Text style={s.missionMsg}>
              Report <Text style={s.boldText}>#{currentReport.id?.substring(0, 6).toUpperCase()}</Text> is active. Local responders have been alerted.
            </Text>

            <View style={s.statsRow}>
              <View style={s.statBox}>
                <Text style={s.statVal}>{emergencyResponders.length}</Text>
                <Text style={s.statLabel}>NOTIFIED</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statVal}>Active</Text>
                <Text style={s.statLabel}>STATUS</Text>
              </View>
            </View>
          </View>
        )}

        {!currentReport && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Local Directory</Text>
            <Text style={s.cardSubtitle}>
              Explore vetted clinics and non-profit organizations operating seamlessly in your vicinity.
            </Text>
            
            {!showDirectory ? (
              <TouchableOpacity style={s.directoryBtn} onPress={handleOpenDirectory}>
                <Text style={s.directoryBtnText}>Explore Local Responders</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.directoryContainer}>
                {!location && (
                  <View style={s.locationPrompt}>
                    <Text style={s.locationText}>Location services are required to browse the directory.</Text>
                    <TouchableOpacity style={s.locBtn} onPress={fetchLocation} disabled={isFetchingLocation}>
                      {isFetchingLocation ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.locBtnText}>Enable Location</Text>}
                    </TouchableOpacity>
                  </View>
                )}
                
                {isFetchingDirectory && (
                   <View style={s.loadingBox}>
                     <ActivityIndicator color={COLORS.primary} />
                     <Text style={s.loadingText}>Synthesizing local networks...</Text>
                   </View>
                )}

                {directoryError && (
                  <Text style={s.errorText}>{directoryError}</Text>
                )}

                {!isFetchingDirectory && location && directoryResponders.length > 0 && (
                  <RespondersList responders={directoryResponders} />
                )}

                {!isFetchingDirectory && location && directoryResponders.length === 0 && (
                  <Text style={s.emptyText}>No registered organizations found within a 5km radius.</Text>
                )}
              </View>
            )}
          </View>
        )}
      </View>
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
    paddingBottom: 80,
  },
  
  heroContainer: {
    width: '100%',
    height: 380,
    backgroundColor: COLORS.primary,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  headerBlock: {
    marginTop: -100,
    paddingHorizontal: 24,
    marginBottom: 40,
    zIndex: 2,
  },
  appTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
  },
  appSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 28,
    maxWidth: '90%',
  },

  contentWrapper: {
    paddingHorizontal: 20,
    gap: 24,
    alignItems: 'center', 
    zIndex: 5,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 640, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  missionCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cardTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  missionCardTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    color: COLORS.textMedium,
    lineHeight: 24,
    marginBottom: 28,
  },

  missionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  successPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 12,
  },
  missionMsg: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    marginBottom: 32,
  },
  boldText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statVal: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    fontWeight: '600',
  },

  directoryBtn: {
    backgroundColor: COLORS.background,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  directoryBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  directoryContainer: {
    marginTop: 8,
  },
  locationPrompt: {
    backgroundColor: COLORS.background,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  locationText: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  locBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  locBtnText: {
    fontFamily: FONT_FAMILY,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: COLORS.textMedium,
  },
  errorText: {
    fontFamily: FONT_FAMILY,
    color: COLORS.accent,
    backgroundColor: 'rgba(192,90,68,0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    fontWeight: '500'
  },
  emptyText: {
    fontFamily: FONT_FAMILY,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
    fontSize: 15,
  },
});

export default HomeScreen;
