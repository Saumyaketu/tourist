import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function IDScreen() {
  // TODO: fetch from backend; this is mock
  const tourist = {
    name: "John Doe",
    passport: "X1234567",
    itinerary: "Delhi → Jaipur → Agra",
    validTill: "2025-09-30",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Digital Tourist ID</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{tourist.name}</Text>

        <Text style={styles.label}>Passport</Text>
        <Text style={styles.value}>{tourist.passport}</Text>

        <Text style={styles.label}>Itinerary</Text>
        <Text style={styles.value}>{tourist.itinerary}</Text>

        <Text style={styles.label}>Valid Till</Text>
        <Text style={styles.value}>{tourist.validTill}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "#f8fbff", padding: 14, borderRadius: 10 },
  label: { color: "#666", marginTop: 10, fontSize: 12 },
  value: { fontSize: 16, fontWeight: "600" },
});
