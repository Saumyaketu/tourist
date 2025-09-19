import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import PanicButton from "../components/PanicButton";
import { sendPanic } from "../api/client";
import * as Location from "expo-location";

export default function PanicScreen() {
  const [sending, setSending] = useState(false);

  const onPanic = async () => {
    setSending(true);
    let currentLocation = null;

    try {
      // 1. Request foreground location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission denied", "Please grant location access to send a panic alert.");
        setSending(false);
        return;
      }

      // 2. Attempt to get current location with a timeout
      // This is a more robust way to handle location requests that might fail or be slow.
      const locationPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const timeoutPromise = new Promise((resolve, reject) =>
        setTimeout(() => reject(new Error('Location request timed out')), 5000)
      );

      try {
        currentLocation = await Promise.race([locationPromise, timeoutPromise]);
      } catch (e) {
        console.warn("Location fetch timed out or failed:", e.message);
      }

      if (!currentLocation || !currentLocation.coords) {
        Alert.alert("Location Not Available", "Could not get your current location. Sending alert without it.");
      }
      
      const payload = {
        deviceId: Platform.OS === 'ios' ? 'mobile-demo-ios-1' : 'mobile-demo-android-1',
        timestamp: new Date().toISOString(),
        location: currentLocation ? { lat: currentLocation.coords.latitude, lon: currentLocation.coords.longitude } : null,
      };

      // 3. Send panic payload
      const resp = await sendPanic(payload);
      Alert.alert("Panic Sent", `Alert ID: ${resp.alertId}`);
      console.log('Panic alert sent with payload:', payload);

    } catch (e) {
      console.error('Panic button error:', e);
      Alert.alert("Error", "Failed to send panic. Check your network connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Panic</Text>
      <Text style={styles.help}>Tap the button to notify nearest police and emergency contacts.</Text>
      <PanicButton onPress={onPanic} disabled={sending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 14 },
  help: { color: "#666", marginBottom: 20, textAlign: "center" },
});
