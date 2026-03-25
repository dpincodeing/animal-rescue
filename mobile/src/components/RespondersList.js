import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';

const FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

const COLORS = {
  primary: '#FF7F50',        
  success: '#4CA57C',        
  surface: '#FFFFFF',
  textDark: '#333333',
  textMedium: '#666666',
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
        <View key={r.responder_id || i} style={s.responderCard}>
          <View style={s.responderHeader}>
            <View style={[s.avatar, { backgroundColor: r.responder_type === 'ngo' ? '#E8F5E9' : '#FFF3E0' }]}>
              <Text style={s.avatarEmoji}>
                {r.responder_type === 'ngo' ? '🐾' : r.responder_type === 'vet' ? '🩺' : '❤️'}
              </Text>
            </View>
            <View style={s.info}>
              <Text style={s.name}>{r.full_name}</Text>
              <Text style={s.type}>
                {r.responder_type === 'ngo' ? 'Animal Rescue Org' : r.responder_type === 'vet' ? 'Veterinary Clinic' : 'Local Volunteer'}
              </Text>
              <Text style={s.distance}>{Math.round(r.distance_metres)}m away</Text>
            </View>
          </View>
          
          <View style={s.actionsRow}>
            {r.phone && (
              <TouchableOpacity style={[s.actionBtn, s.callBtn]} onPress={() => handleCall(r.phone)}>
                <Text style={s.btnTextWhite}>📞 Call</Text>
              </TouchableOpacity>
            )}
            {r.latitude && r.longitude && (
              <TouchableOpacity style={[s.actionBtn, s.mapBtn]} onPress={() => handleMap(r.latitude, r.longitude)}>
                <Text style={s.btnTextPrimary}>🗺️ Map</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  listContainer: { gap: 16, marginTop: 16 },
  responderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E6D2',
    marginBottom: 0
  },
  responderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarEmoji: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  type: { fontFamily: FONT_FAMILY, fontSize: 13, color: COLORS.textMedium, marginBottom: 4 },
  distance: { fontFamily: FONT_FAMILY, fontSize: 13, color: COLORS.primary, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  callBtn: { backgroundColor: COLORS.success },
  mapBtn: { backgroundColor: '#FFF0E6', borderWidth: 1, borderColor: '#FFD1B3' },
  btnTextWhite: { fontFamily: FONT_FAMILY, color: '#FFF', fontWeight: '700', fontSize: 14 },
  btnTextPrimary: { fontFamily: FONT_FAMILY, color: COLORS.primary, fontWeight: '700', fontSize: 14 }
});

export default RespondersList;
