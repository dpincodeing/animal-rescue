// =============================================================================
// App.js — Application Root
// =============================================================================
// This is the entry point that Expo loads. It wraps the entire app in
// the ReportProvider context so that report state is accessible from any
// screen or component.
//
// Architecture note:
//   App.js is a thin shell. All logic lives in hooks, all state in context,
//   and all visuals in components/screens. This makes the UI fully swappable.
// =============================================================================

import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import { ReportProvider } from './src/context/ReportContext';
import HomeScreen from './src/screens/HomeScreen';

function App() {
  return (
    // ── Context Provider wraps the whole app ─────────────────────────────
    <ReportProvider>
      <View style={styles.container}>
        {/* Dark status bar for visibility */}
        <StatusBar barStyle="dark-content" />

        {/* Main screen — in a production app this would be a navigator */}
        <HomeScreen />
      </View>
    </ReportProvider>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
// Using View instead of SafeAreaView for web compatibility.
// minHeight '100vh' ensures the container fills the viewport on web.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    // On web, flex:1 alone collapses to 0 height without a parent flex context
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}),
  },
});

// Explicit registration ensures Expo finds the root component on all platforms
registerRootComponent(App);

export default App;
