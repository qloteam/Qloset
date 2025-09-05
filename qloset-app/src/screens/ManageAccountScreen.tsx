import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import { fetchProfile, saveProfile as saveProfileToDb } from "../db/profile";
import { supabase } from "../lib/supabaseClient";

export default function ManageAccountScreen() {
  const { user, logout } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing profile from DB (or fall back to auth metadata)
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!user) return;

      const prof = await fetchProfile(user.id);
      if (cancel) return;

      if (prof) {
        setName(prof.name ?? "");
        setPhone(prof.phone ?? "");
        setEmail(prof.email ?? user.email ?? "");
      } else {
        // Fallback to auth metadata if the row doesn't exist yet
        // @ts-ignore
        const metaName = user.user_metadata?.full_name || user.user_metadata?.name || "";
        // @ts-ignore
        const metaPhone = user.user_metadata?.phone || "";
        setName(metaName);
        setPhone(metaPhone);
        setEmail(user.email ?? "");
      }
    })();

    return () => {
      cancel = true;
    };
  }, [user]);

  // Save handler -> upsert to Supabase
  async function onSave() {
    if (!user) return;
    setSaving(true);
    try {
      await saveProfileToDb(user.id, {
        name: name || null,
        phone: phone || null,
        email: email || user.email || null,
      });

      // Optional: mirror to auth metadata so other parts of the app can read it
      await supabase?.auth.updateUser({
        data: { full_name: name, phone },
      });

      setEditing(false);
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    try {
      await logout(); // use your AuthContext logout
    } catch (e: any) {
      Alert.alert("Logout", e?.message || "Failed to log out");
    }
  }

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
          autoCapitalize="none"
          onChangeText={setEmail}
        />
      </View>

      {/* Edit / Save */}
      {editing ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Changes"}</Text>
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
        onPress={onLogout}
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
