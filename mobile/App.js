// =============================================================================
// App.js — Application Root
// =============================================================================

import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import { ReportProvider } from './src/context/ReportContext';
import HomeScreen from './src/screens/HomeScreen';

function App() {
  return (
    <ReportProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9F9F7" />
        <HomeScreen />
      </View>
    </ReportProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F7', // Premium Alabaster Background
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}),
  },
});

registerRootComponent(App);

export default App;
