// =============================================================================
// screens/HomeScreen.js — Compassionate Redesign + Directory
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
  background: '#FFF9F0',     
  surface: '#FFFFFF',        
  primary: '#FF7F50',        
  success: '#4CA57C',        
  textDark: '#333333',       
  textMedium: '#666666',     
  textLight: '#999999',      
  border: '#F0E6D2',         
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
    nearbyResponders: emergencyResponders,
  } = useReportSubmission();

  const {
    fetchResponders,
    responders: directoryResponders,
    isFetching: isFetchingDirectory,
    error: directoryError
  } = useNearbyResponders();

  const [showDirectory, setShowDirectory] = useState(false);

  // Automatically fetch directory if user opened directory tab and location becomes available
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
        {/* ── Emergency Report Action ─────────────────────────────────────────── */}
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
                <Text style={s.statVal}>{emergencyResponders.length}</Text>
                <Text style={s.statLabel}>Responders{'\n'}Notified</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statVal}>Active</Text>
                <Text style={s.statLabel}>Mission{'\n'}Status</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Directory: Find Responders (No Emergency) ─────────────────────── */}
        {!currentReport && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Local Directory</Text>
            <Text style={s.cardSubtitle}>
              Looking for a nearby Vet Clinic or Animal Shelter? Browse our local directory without triggering an emergency dispatch.
            </Text>
            
            {!showDirectory ? (
              <TouchableOpacity style={s.directoryBtn} onPress={handleOpenDirectory}>
                <Text style={s.directoryBtnText}>🔍 Find Vets & NGOs Near Me</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.directoryContainer}>
                {!location && (
                  <View style={s.locationPrompt}>
                    <Text style={s.locationText}>Please acquire your GPS location above to see nearby responders.</Text>
                    <TouchableOpacity style={s.locBtn} onPress={fetchLocation} disabled={isFetchingLocation}>
                      {isFetchingLocation ? <ActivityIndicator color="#FFF" /> : <Text style={s.locBtnText}>📍 Get Location</Text>}
                    </TouchableOpacity>
                  </View>
                )}
                
                {isFetchingDirectory && (
                   <View style={s.loadingBox}>
                     <ActivityIndicator color={COLORS.primary} />
                     <Text style={s.loadingText}>Searching nearby area...</Text>
                   </View>
                )}

                {directoryError && (
                  <Text style={s.errorText}>⚠ {directoryError}</Text>
                )}

                {!isFetchingDirectory && location && directoryResponders.length > 0 && (
                  <RespondersList responders={directoryResponders} />
                )}

                {!isFetchingDirectory && location && directoryResponders.length === 0 && (
                  <Text style={s.emptyText}>No responders found in your 5km radius.</Text>
                )}
              </View>
            )}
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
  
  heroContainer: {
    width: '100%',
    height: 320,
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
    paddingBottom: 40, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
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
  },

  contentWrapper: {
    marginTop: -20, 
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'center', 
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 600, 
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

  directoryBtn: {
    backgroundColor: '#FFF0E6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD1B3'
  },
  directoryBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary
  },
  directoryContainer: {
    marginTop: 8,
  },
  locationPrompt: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  locationText: {
    fontFamily: FONT_FAMILY,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginBottom: 12,
  },
  locBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  locBtnText: {
    fontFamily: FONT_FAMILY,
    color: '#FFF',
    fontWeight: '700',
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: FONT_FAMILY,
    color: COLORS.textMedium,
  },
  errorText: {
    fontFamily: FONT_FAMILY,
    color: '#D32F2F',
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    fontWeight: '600'
  },
  emptyText: {
    fontFamily: FONT_FAMILY,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
    fontStyle: 'italic'
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
