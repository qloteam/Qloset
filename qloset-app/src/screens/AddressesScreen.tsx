import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

type Address = {
  id: string;
  user_id: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode: string;
  lat?: number | null;
  lng?: number | null;
  is_default?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export default function AddressesScreen() {
  const { user, notConfigured } = useAuth();
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [pincode, setPincode] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const canUseSupabase = useMemo(
    () => hasSupabaseConfig && !notConfigured && !!supabase,
    [notConfigured]
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!canUseSupabase) return;
        if (!user) {
          setAddresses([]);
          return;
        }
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (mounted) setAddresses((data ?? []) as Address[]);
      } catch (err: any) {
        Alert.alert("Couldn't load addresses", String(err?.message || err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    // ✅ restore previously selected address if saved
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("lastAddress");
        if (stored) {
          const parsed = JSON.parse(stored);
          setSelectedAddress(parsed);
        }
      } catch (e) {
        console.warn("Failed to restore address:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user, canUseSupabase]);

  async function onAdd() {
    if (!line1.trim() || !pincode.trim()) return;
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to save an address.", [
        { text: "Go to Profile", onPress: () => navigation.goBack() },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    if (!canUseSupabase) {
      Alert.alert("Not configured", "Supabase is not configured in this build.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        label: label.trim() || null,
        line1: line1.trim(),
        line2: line2.trim() || null,
        pincode: pincode.trim(),
      };
      const { data, error } = await supabase
        .from("addresses")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      setAddresses((prev) => [data as Address, ...prev]);
      setLabel("");
      setLine1("");
      setLine2("");
      setPincode("");
    } catch (err: any) {
      Alert.alert("Couldn't save address", String(err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!user || !canUseSupabase) return;
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      Alert.alert("Couldn't delete address", String(err?.message || err));
    }
  }

  async function onMakeDefault(id: string) {
    if (!user || !canUseSupabase) return;
    try {
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      const { data: fresh } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      setAddresses((fresh ?? []) as Address[]);
    } catch (err: any) {
      Alert.alert("Couldn't set default", String(err?.message || err));
    }
  }

  // ✅ handle deliver-here and persist
  async function handleDeliverHere(address: Address) {
    try {
      setSelectedAddress(address);
      await AsyncStorage.setItem("lastAddress", JSON.stringify(address));
(navigation as any).navigate("Checkout", { address });
    } catch (e) {
      Alert.alert("Error", "Couldn't select address. Please try again.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Addresses</Text>

        {!user ? (
          <View style={[styles.card, { marginBottom: 16 }]}>
            <Text style={styles.muted}>
              You’re not signed in. Sign in from the Profile tab to add and
              manage your addresses.
            </Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <TextInput
            placeholder="Label (Home / Work) — optional"
            placeholderTextColor="#888"
            value={label}
            onChangeText={setLabel}
            style={styles.input}
            selectionColor="#fff"
          />
          <TextInput
            placeholder="Address line 1"
            placeholderTextColor="#888"
            value={line1}
            onChangeText={setLine1}
            style={styles.input}
            selectionColor="#fff"
          />
          <TextInput
            placeholder="Address line 2 (optional)"
            placeholderTextColor="#888"
            value={line2}
            onChangeText={setLine2}
            style={styles.input}
            selectionColor="#fff"
          />
          <TextInput
            placeholder="Pincode"
            placeholderTextColor="#888"
            value={pincode}
            onChangeText={setPincode}
            style={styles.input}
            keyboardType="numeric"
            selectionColor="#fff"
          />
          <TouchableOpacity
            onPress={onAdd}
            disabled={saving || !line1.trim() || !pincode.trim()}
            style={[
              styles.button,
              (saving || !line1.trim() || !pincode.trim()) && { opacity: 0.7 },
            ]}
          >
            {saving ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.buttonText}>Save Address</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, { marginTop: 16 }]}>Saved addresses</Text>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={addresses}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <View style={styles.addressRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressLine}>
                    {item.label ? `${item.label} — ` : ""}
                    {item.line1}
                  </Text>
                  {item.line2 ? (
                    <Text style={styles.addressLineMuted}>{item.line2}</Text>
                  ) : null}
                  <Text style={styles.addressLineMuted}>{item.pincode}</Text>
                  {item.is_default ? (
                    <Text style={styles.defaultBadge}>Default</Text>
                  ) : null}
                </View>

                <View style={{ gap: 8, alignItems: "flex-end" }}>
                  <TouchableOpacity
                    onPress={() => handleDeliverHere(item)}
                    style={styles.deliverBtn}
                  >
                    <Text style={styles.deliverText}>Deliver here</Text>
                  </TouchableOpacity>
                  {!item.is_default ? (
                    <TouchableOpacity onPress={() => onMakeDefault(item.id)}>
                      <Text style={styles.action}>Make default</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity onPress={() => onDelete(item.id)}>
                    <Text style={styles.delete}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.muted}>
                {user
                  ? "No addresses yet. Add your first one above."
                  : "Sign in to view your saved addresses."}
              </Text>
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121216", padding: 20 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  subtitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  card: { backgroundColor: "#1E1E22", borderRadius: 12, padding: 12 },
  input: {
    backgroundColor: "#18181C",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#FF3366",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E1E22",
    padding: 12,
    borderRadius: 12,
  },
  addressLine: { color: "#fff", fontSize: 14 },
  addressLineMuted: { color: "#AAA", fontSize: 13 },
  defaultBadge: { color: "#6EF17E", fontSize: 12, marginTop: 4 },
  action: { color: "#86B6FF", fontWeight: "600" },
  delete: { color: "#FF6363", fontWeight: "600" },
  deliverBtn: {
    backgroundColor: "#FF3366",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deliverText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  muted: { color: "#AAA" },
});
