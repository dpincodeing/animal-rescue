// =============================================================================
// components/RespondersList.js — Premium Redesign
// =============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';

const FONT_FAMILY = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif-light',
  web: '-apple-system, BlinkMacSystemFont, "Avenir Next", "Helvetica Neue", Helvetica, sans-serif',
});

const COLORS = {
  primary: '#2C4C3B',        
  accent: '#C05A44',         
  surface: '#FFFFFF',
  textDark: '#1C1C1E',
  textMedium: '#8A8A8E',
  border: 'rgba(0,0,0,0.06)'
};

// Generates an elegant monogram from a full name
const getMonogram = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const formatType = (type) => {
  switch (type) {
    case 'ngo': return 'ORGANIZATION';
    case 'vet': return 'VETERINARY';
    default: return 'VOLUNTEER';
  }
};

const RespondersList = ({ responders }) => {
  if (!responders || responders.length === 0) return null;

  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleMap = (lat, lng) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <View style={s.listContainer}>
      {responders.map((r, i) => (
        <View key={r.responder_id || i} style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.avatar}>
              <Text style={s.monogram}>{getMonogram(r.full_name)}</Text>
            </View>
            <View style={s.info}>
              <Text style={s.name}>{r.full_name}</Text>
              <Text style={s.type}>{formatType(r.responder_type)}  ·  {Math.round(r.distance_metres)}M</Text>
            </View>
          </View>
          
          <View style={s.actions}>
            {r.phone && (
              <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={() => handleCall(r.phone)}>
                <Text style={s.btnTextWhite}>Contact</Text>
              </TouchableOpacity>
            )}
            {r.latitude && r.longitude && (
              <TouchableOpacity style={[s.btn, s.btnOutline]} onPress={() => handleMap(r.latitude, r.longitude)}>
                <Text style={s.btnTextDark}>Navigate</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  listContainer: { gap: 20, marginTop: 24 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar: { 
    width: 48, height: 48, 
    borderRadius: 12, 
    backgroundColor: '#F9F9F7', 
    alignItems: 'center', justifyContent: 'center', 
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  monogram: { fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: '700', color: COLORS.textDark, letterSpacing: 1 },
  info: { flex: 1 },
  name: { fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: '600', color: COLORS.textDark, marginBottom: 4, letterSpacing: -0.3 },
  type: { fontFamily: FONT_FAMILY, fontSize: 11, fontWeight: '700', color: COLORS.textMedium, letterSpacing: 1 },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: COLORS.textDark },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#D1D1D6' },
  btnTextWhite: { fontFamily: FONT_FAMILY, color: '#FFFFFF', fontWeight: '600', fontSize: 14, letterSpacing: 0.5 },
  btnTextDark: { fontFamily: FONT_FAMILY, color: COLORS.textDark, fontWeight: '600', fontSize: 14, letterSpacing: 0.5 }
});

export default RespondersList;
