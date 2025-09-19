import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PanicButton from "../components/PanicButton";

export default function HomeScreen() {
  const nav = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Smart Tourist</Text>
      <Text style={styles.subtitle}>Safety, tracking & quick response</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => nav.navigate("ID")}>
          <Text style={styles.cardTitle}>Digital ID</Text>
          <Text style={styles.cardSub}>View your ID & travel details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => nav.navigate("Safety")}>
          <Text style={styles.cardTitle}>Safety Score</Text>
          <Text style={styles.cardSub}>Current risk level</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => nav.navigate("GeoFence")}>
          <Text style={styles.cardTitle}>Geo-Fence</Text>
          <Text style={styles.cardSub}>Monitor sensitive zones</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => nav.navigate("MapView")}>
          <Text style={styles.cardTitle}>Live Map</Text>
          <Text style={styles.cardSub}>View your current location</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 18 }}>
        <PanicButton onPress={() => nav.navigate("Panic")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f6fbff", alignItems: "center" },
  h1: { fontSize: 28, fontWeight: "700", marginTop: 6 },
  subtitle: { fontSize: 14, color: "#555", marginTop: 6, marginBottom: 20 },
  grid: { width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardSub: { marginTop: 6, color: "#666", fontSize: 12 },
});