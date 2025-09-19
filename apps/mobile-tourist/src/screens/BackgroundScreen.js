import React from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { LOCATION_TASK_NAME } from "../background-task";

export default function BackgroundScreen() {
  const start = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (status !== "granted" || bgStatus !== "granted") {
      Alert.alert("Permission denied", "Background location permission needed.");
      return;
    }

    const registered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (!registered) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 15000,
        distanceInterval: 50,
        foregroundService: {
          notificationTitle: "Tourist Safety Tracking",
          notificationBody: "Tracking location for safety.",
        },
        pausesUpdatesAutomatically: false,
      });
    }
    Alert.alert("Tracking started", "Background location tracking is active.");
  };

  const stop = async () => {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    Alert.alert("Tracking stopped", "Background location tracking stopped.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Background Location</Text>
      <Text style={styles.infoText}>
        This feature allows the app to track your location even when it is closed. It will automatically stop tracking once your trip duration ends.
      </Text>
      <View style={{ width: "100%", marginTop: 12 }}>
        <Button title="Start Background Tracking" onPress={start} />
      </View>
      <View style={{ width: "100%", marginTop: 12 }}>
        <Button title="Stop Background Tracking" onPress={stop} color="red" />
      </View>
      <Text style={styles.note}>
        This feature works on real devices. Android requires background permission and displays a notification.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", alignItems: "center" },
  h1: { fontSize: 20, fontWeight: "700" },
  infoText: { marginTop: 12, color: "#666", textAlign: "center", paddingHorizontal: 10 },
  note: { marginTop: 12, color: "#666", textAlign: "center" },
});
