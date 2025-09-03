import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.subtitle}>
        Here you can add your privacy policy about how user data is handled.
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
