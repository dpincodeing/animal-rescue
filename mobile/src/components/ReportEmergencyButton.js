// =============================================================================
// components/ReportEmergencyButton.js — Premium Redesign
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

const COLORS = {
  primary: '#2C4C3B',        // Deep Forest Green
  accent: '#C05A44',         // Terracotta for Emergency
  surface: '#FFFFFF',
  textDark: '#1C1C1E',
  textMedium: '#8A8A8E',
  disabledBg: '#F2F2F7',
  disabledText: '#C7C7CC',
  errorBg: 'rgba(192,90,68,0.1)',
  errorText: '#C05A44',
  successText: '#2C4C3B',
};

const FONT_FAMILY = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif-light',
  web: '-apple-system, BlinkMacSystemFont, "Avenir Next", "Helvetica Neue", Helvetica, sans-serif',
});

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
      <View style={s.header}>
        <Text style={s.title}>Emergency Dispatch</Text>
        <Text style={s.subtitle}>
          Secure a GPS lock to instantly alert registered responders in your vicinity.
        </Text>
      </View>

      {/* ── Step 1: Location ─────────────────────────────────────────── */}
      <View style={s.stepContainer}>
        <View style={s.stepHeader}>
          <Text style={s.stepNumber}>01</Text>
          <Text style={s.stepTitle}>Acquire Location</Text>
        </View>
        
        <TouchableOpacity
          style={[s.button, hasLocation ? s.buttonSecondary : s.buttonOutline]}
          onPress={onFetchLocation}
          disabled={isFetchingLocation || isSubmitting || isSuccess}
          activeOpacity={0.6}
        >
          {isFetchingLocation ? (
            <ActivityIndicator color={COLORS.textDark} size="small" />
          ) : (
            <Text style={[s.buttonText, hasLocation ? s.buttonTextSecondary : s.buttonTextOutline]}>
              {hasLocation ? 'Position Secured' : 'Lock GPS Coordinates'}
            </Text>
          )}
        </TouchableOpacity>

        {address && (
          <View style={s.addressBlock}>
            <Text style={s.addressLabel}>DETECTED LOCATION</Text>
            <Text style={s.addressText}>{address}</Text>
          </View>
        )}

        {locationError && (
          <View style={s.errorBlock}>
            <Text style={s.errorText}>{locationError}</Text>
          </View>
        )}
      </View>

      {/* ── Step 2: Report ───────────────────────────────────────────── */}
      <View style={[s.stepContainer, s.stepTwoContainer]}>
        <View style={s.stepHeader}>
          <Text style={s.stepNumber}>02</Text>
          <Text style={s.stepTitle}>Initialize Rescue</Text>
        </View>

        <TouchableOpacity
          style={[
            s.button,
            s.buttonPrimary,
            (!hasLocation || isSuccess) && s.buttonDisabled,
          ]}
          onPress={onSubmitReport}
          disabled={!hasLocation || isSubmitting || isSuccess}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={s.buttonTextPrimary}>Transmit Alert</Text>
          )}
        </TouchableOpacity>

        {submitError && (
          <View style={s.errorBlock}>
            <Text style={s.errorText}>{submitError}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    color: COLORS.textMedium,
    lineHeight: 24,
  },

  stepContainer: {
    marginBottom: 32,
  },
  stepTwoContainer: {
    marginBottom: 0, 
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    fontFamily: FONT_FAMILY,
    fontWeight: '700',
    fontSize: 12,
    color: COLORS.textMedium,
    marginRight: 12,
    letterSpacing: 1,
  },
  stepTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    letterSpacing: -0.2,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30, // Premium pill shape
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonPrimary: {
    backgroundColor: COLORS.accent,
  },
  buttonSecondary: {
    backgroundColor: '#F9F9F7',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  buttonOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabledBg,
    borderColor: 'transparent',
  },

  buttonTextPrimary: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  buttonTextSecondary: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.successText,
    letterSpacing: 0.5,
  },
  buttonTextOutline: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },

  addressBlock: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#F9F9F7',
    borderRadius: 16,
  },
  addressLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMedium,
    letterSpacing: 1,
    marginBottom: 8,
  },
  addressText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 22,
  },
  
  errorBlock: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.errorBg,
    borderRadius: 12,
  },
  errorText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: COLORS.errorText,
    fontWeight: '500',
  },
});

export default ReportEmergencyButton;
