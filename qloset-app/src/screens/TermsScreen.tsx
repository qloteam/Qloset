import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms & Conditions</Text>
      <Text style={styles.subtitle}>
        Here you can add your detailed legal terms and conditions.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121216" },
  content: { padding: 20 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600", marginBottom: 12 },
  subtitle: { color: "#aaa", fontSize: 14, lineHeight: 20 },
});
