import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import PanicButton from "../components/PanicButton";
import { sendPanic } from "../api/client";

export default function PanicScreen() {
  const [sending, setSending] = useState(false);

  const onPanic = async () => {
    setSending(true);
    try {
      // Example payload - in production include tourist ID + auth
      const resp = await sendPanic({
        deviceId: "mobile-demo-1",
        timestamp: new Date().toISOString(),
        location: { lat: 26.14, lon: 91.73 },
      });
      Alert.alert("Panic Sent", JSON.stringify(resp));
    } catch (e) {
      Alert.alert("Error", "Failed to send panic");
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
