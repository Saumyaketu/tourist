import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import useLocationBackground from './src/hooks/useLocation';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { requestPermissions } from './src/background-task';

export default function App() {
  const { startBackground } = useLocationBackground();

  useEffect(() => {
    const startLocationTask = async () => {
      try {
        await requestPermissions();
        await startBackground();
        console.log('Background location task started.');
      } catch (e) {
        console.error("Failed to start background location task:", e);
      }
    };

    startLocationTask();
  }, [startBackground]);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});