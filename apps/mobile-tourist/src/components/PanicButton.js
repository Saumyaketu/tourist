import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function PanicButton({ onPress, disabled }) {
  return (
    <TouchableOpacity style={[styles.button, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <Text style={styles.text}>🚨 PANIC</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#d9534f",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
  },
  disabled: { opacity: 0.6 },
  text: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
