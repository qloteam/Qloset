import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function ManageAccountScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      const storedName = await AsyncStorage.getItem("userName");
      const storedPhone = await AsyncStorage.getItem("userPhone");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      if (storedName) setName(storedName);
      if (storedPhone) setPhone(storedPhone);
      if (storedEmail) setEmail(storedEmail);
    })();
  }, []);

  const saveProfile = async () => {
    await AsyncStorage.setItem("userName", name);
    await AsyncStorage.setItem("userPhone", phone);
    await AsyncStorage.setItem("userEmail", email);
    setEditing(false);
    Alert.alert("Saved", "Your profile has been updated");
  };

  const logout = async () => {
    await AsyncStorage.clear();
    Alert.alert("Logged out", "You have been logged out.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Account</Text>

      {/* Name */}
      <View style={styles.row}>
        <Ionicons name="person-outline" size={20} color="#FF3366" />
        <TextInput
          style={styles.input}
          value={name}
          editable={editing}
          placeholder="Full Name"
          placeholderTextColor="#777"
          onChangeText={setName}
        />
      </View>

      {/* Phone */}
      <View style={styles.row}>
        <Ionicons name="call-outline" size={20} color="#FF3366" />
        <TextInput
          style={styles.input}
          value={phone}
          editable={editing}
          placeholder="Phone Number"
          placeholderTextColor="#777"
          keyboardType="phone-pad"
          onChangeText={setPhone}
        />
      </View>

      {/* Email */}
      <View style={styles.row}>
        <Ionicons name="mail-outline" size={20} color="#FF3366" />
        <TextInput
          style={styles.input}
          value={email}
          editable={editing}
          placeholder="Email"
          placeholderTextColor="#777"
          keyboardType="email-address"
          onChangeText={setEmail}
        />
      </View>

      {/* Edit / Save */}
      {editing ? (
        <TouchableOpacity style={styles.button} onPress={saveProfile}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#444" }]}
          onPress={() => setEditing(true)}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      {/* Logout */}
      <TouchableOpacity
        style={[styles.button, { marginTop: 20, backgroundColor: "rgba(255,51,102,0.1)" }]}
        onPress={logout}
      >
        <Text style={[styles.buttonText, { color: "#FF3366" }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121216", padding: 20 },
  title: { color: "#fff", fontSize: 22, fontWeight: "600", marginBottom: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E22",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: { flex: 1, color: "#fff", padding: 12, fontSize: 14 },
  button: {
    backgroundColor: "#FF3366",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
