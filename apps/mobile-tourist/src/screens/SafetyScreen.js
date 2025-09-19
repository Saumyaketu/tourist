import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const ProgressBar = ({ progress }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
  </View>
);

export default function SafetyScreen() {
  const [score, setScore] = useState(null);

  useEffect(() => {
    // mock API call to get safety score
    const t = setTimeout(() => setScore(82), 800);
    return () => clearTimeout(t);
  }, []);

  const progress = score ? score / 100 : 0;
  const scoreColor = score > 75 ? "#28a745" : score > 50 ? "#ffc107" : "#dc3545";

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Tourist Safety Score</Text>

      <View style={styles.scoreBox}>
        {score !== null ? (
          <Text style={[styles.scoreText, { color: scoreColor }]}>{score}/100</Text>
        ) : (
          <ActivityIndicator size="large" color="#0000ff" />
        )}

        {score !== null && <ProgressBar progress={progress} />}
      </View>

      <Text style={styles.info}>
        Your score combines area risk, time of day, and recent behavior to give a real-time safety assessment.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", alignItems: "center" },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  scoreBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f6fbff",
    borderRadius: 10,
    width: "80%",
  },
  scoreText: { fontSize: 48, fontWeight: "700" },
  progressBarContainer: {
    height: 10,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginTop: 12,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007bff",
  },
  info: { marginTop: 18, color: "#666", textAlign: "center", paddingHorizontal: 20 },
});
