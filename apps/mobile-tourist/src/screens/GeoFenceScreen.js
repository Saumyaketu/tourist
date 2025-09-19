import React, { useRef, useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { haversineKm } from "../utils/geo";

const GEOFENCE_CENTER = { lat: 28.6562, lon: 77.2410 }; // Red Fort Delhi
const GEOFENCE_RADIUS_KM = 0.5; // 500 meters

export default function GeoFenceScreen() {
  const [watching, setWatching] = useState(false);
  const [location, setLocation] = useState(null);
  const subRef = useRef(null);

  const checkGeoFence = (currentLocation) => {
    const dist = haversineKm(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      GEOFENCE_CENTER.lat,
      GEOFENCE_CENTER.lon
    );
    if (dist < GEOFENCE_RADIUS_KM) {
      Alert.alert("Geo-fence Alert", "You are entering a sensitive zone.");
    }
  };

  const startWatching = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please grant location access.");
      return;
    }

    subRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 50 },
      (loc) => {
        setLocation(loc);
        checkGeoFence(loc);
      }
    );
    setWatching(true);
    Alert.alert("Monitor Started", "Geo-fence monitor is now active.");
  };

  const stopWatching = () => {
    if (subRef.current) {
      subRef.current.remove();
      subRef.current = null;
    }
    setWatching(false);
    Alert.alert("Monitor Stopped", "Geo-fence monitor is now inactive.");
  };
  
  useEffect(() => {
    return () => {
      if (subRef.current) {
        subRef.current.remove();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Geo-Fence Monitor</Text>
      <View style={styles.statusCard}>
        <Text style={styles.statusText}>Status: {watching ? "Active" : "Inactive"}</Text>
        {location && (
          <Text style={styles.locationText}>
            Current Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      <View style={{ width: "100%", marginTop: 12 }}>
        <Button
          title={watching ? "Stop Monitor" : "Start Monitor"}
          onPress={watching ? stopWatching : startWatching}
        />
      </View>
      <Text style={styles.note}>
        Demo uses a single circular geo-fence around the Red Fort, Delhi.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", alignItems: "center" },
  h1: { fontSize: 20, fontWeight: "700" },
  statusCard: {
    backgroundColor: "#f8fbff",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
  },
  statusText: { fontSize: 16, fontWeight: "600" },
  locationText: { marginTop: 8, color: "#666" },
  note: { marginTop: 12, color: "#666", textAlign: "center" },
});
