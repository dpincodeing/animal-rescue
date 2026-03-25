// =============================================================================
// components/ReportEmergencyButton.js — Compassionate Redesign
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
  primary: '#FF7F50',        // Warm Coral
  primaryActive: '#E76B3E',  // Darker Coral for pressed state
  success: '#4CA57C',        // Compassionate Green
  successBg: '#E8F5E9',      // Light Green Background
  surface: '#FFFFFF',
  textDark: '#333333',
  textMedium: '#666666',
  textLight: '#999999',
  border: '#F0E6D2',
  disabledBg: '#F5F5F5',
  disabledText: '#CCCCCC',
  errorBg: '#FFF0F0',
  errorText: '#D32F2F',
};

const FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
        <Text style={s.title}>Report an Emergency</Text>
        <Text style={s.subtitle}>
          Help us find the distressed animal by sharing your current location.
        </Text>
      </View>

      {/* ── Step 1: Location ─────────────────────────────────────────── */}
      <View style={s.stepContainer}>
        <View style={s.stepHeader}>
          <Text style={[s.stepNumber, hasLocation && s.stepNumberSuccess]}>1</Text>
          <Text style={s.stepTitle}>Locate</Text>
        </View>
        
        <TouchableOpacity
          style={[s.button, hasLocation ? s.buttonSecondary : s.buttonOutline]}
          onPress={onFetchLocation}
          disabled={isFetchingLocation || isSubmitting || isSuccess}
          activeOpacity={0.7}
        >
          {isFetchingLocation ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <>
              <Text style={s.emojiIcon}>{hasLocation ? '📍' : '📡'}</Text>
              <Text style={[s.buttonText, hasLocation ? s.buttonTextSecondary : s.buttonTextOutline]}>
                {hasLocation ? 'Location Found' : 'Find My Location'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Address Display */}
        {address && (
          <View style={s.addressBlock}>
            <Text style={s.addressText}>{address}</Text>
          </View>
        )}

        {/* Location Error */}
        {locationError && (
          <View style={s.errorBlock}>
            <Text style={s.errorText}>⚠ {locationError}</Text>
          </View>
        )}
      </View>

      {/* ── Step 2: Report ───────────────────────────────────────────── */}
      <View style={[s.stepContainer, s.stepTwoContainer]}>
        <View style={s.stepHeader}>
          <Text style={[s.stepNumber, isSuccess && s.stepNumberSuccess]}>2</Text>
          <Text style={s.stepTitle}>Get Help</Text>
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
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={s.emojiIcon}>🐾</Text>
              <Text style={s.buttonTextPrimary}>Send Rescue Alert</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Submit Error */}
        {submitError && (
          <View style={s.errorBlock}>
            <Text style={s.errorText}>⚠ {submitError}</Text>
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
    marginBottom: 24,
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    color: COLORS.textMedium,
    lineHeight: 22,
  },

  // ── Steps ─────────────────────────────────────────────────────────────
  stepContainer: {
    marginBottom: 24,
  },
  stepTwoContainer: {
    marginBottom: 0, // Last element doesn't need margin
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0E6D2',
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: FONT_FAMILY,
    fontWeight: '800',
    fontSize: 13,
    marginRight: 10,
    overflow: 'hidden', // Ensure text stays in circle on web
  },
  stepNumberSuccess: {
    backgroundColor: COLORS.success,
    color: '#FFF',
  },
  stepTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // ── Buttons ─────────────────────────────────────────────────────────────
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16, // Softer, friendlier corners
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: COLORS.successBg,
    borderColor: '#C8E6C9',
    borderWidth: 1,
  },
  buttonOutline: {
    backgroundColor: '#FFF',
    borderColor: '#E0E0E0',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabledBg,
    shadowOpacity: 0,
    elevation: 0,
    borderColor: 'transparent',
  },

  buttonTextPrimary: {
    fontFamily: FONT_FAMILY,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  buttonTextSecondary: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
  },
  buttonTextOutline: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  
  emojiIcon: {
    fontSize: 18,
  },

  // ── Feedback Blocks ─────────────────────────────────────────────────────
  addressBlock: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  addressText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  
  errorBlock: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.errorBg,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: COLORS.errorText,
    fontWeight: '600',
  },
});

export default ReportEmergencyButton;
