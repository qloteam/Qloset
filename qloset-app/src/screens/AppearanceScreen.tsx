import React, { useContext } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { ThemeContext } from "../state/ThemeContext";

export default function AppearanceScreen() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? "#121216" : "#fff" }]}>
      <Text style={[styles.title, { color: darkMode ? "#fff" : "#000" }]}>Appearance</Text>
      <View style={styles.row}>
        <Text style={{ color: darkMode ? "#fff" : "#000", fontSize: 16 }}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
