import { fetchProfile } from "@/db/profile";
import * as React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCart } from "../state/CartContext";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { navigationRef, navigate } from "@/nav/navigationRef";
import { useRoute } from "@react-navigation/native"; // ✅ added

export default function CheckoutScreen() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const route = useRoute(); // ✅ added
  const addressParam: any = (route.params as any)?.address || null; // ✅ get address param

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [line1, setLine1] = React.useState("");
  const [landmark, setLandmark] = React.useState("");
  const [pincode, setPincode] = React.useState("");

  const [tbyb, setTbyb] = React.useState(true);
  const [lat, setLat] = React.useState<number | null>(null);
  const [lng, setLng] = React.useState<number | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [locLoading, setLocLoading] = React.useState(false);

  type SavedAddress = {
    id: string;
    label?: string | null;
    line1: string;
    line2?: string | null;
    pincode: string;
    is_default?: boolean | null;
  };

  const [addresses, setAddresses] = React.useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = React.useState<SavedAddress | null>(null); // ✅ track actual address

  // 👤 Fetch user profile
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return;
      try {
        const prof = await fetchProfile(user.id);
        if (!alive) return;

        const pickedName =
          prof?.name ??
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          "";

        const pickedPhone =
          prof?.phone ?? user.user_metadata?.phone ?? "";

        if (pickedName) setName((n) => (n ? n : pickedName));
        if (pickedPhone) setPhone((p) => (p ? p : String(pickedPhone)));
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  // 🏠 Load saved addresses + prefill from param or persisted
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      const { data, error } = await supabase
        .from("addresses")
        .select("id,label,line1,line2,pincode,is_default")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (!error && data) {
        const list = data as SavedAddress[];
        setAddresses(list);
        const def = list.find((a) => a.is_default);
        setSelectedAddressId(def?.id ?? list[0]?.id ?? null);
      }

      // ✅ handle passed address param (from Addresses screen)
      if (addressParam) {
        setSelectedAddress(addressParam);
        setLine1(addressParam.line1 || "");
        setPincode(addressParam.pincode || "");
        await AsyncStorage.setItem("lastAddress", JSON.stringify(addressParam));
        return;
      }

      // ✅ fallback: load persisted address from storage
      try {
        const stored = await AsyncStorage.getItem("lastAddress");
        if (stored) {
          const parsed = JSON.parse(stored);
          setSelectedAddress(parsed);
          setLine1(parsed.line1 || "");
          setPincode(parsed.pincode || "");
        }
      } catch {}
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  // 📍 Autofill address via GPS
  const useMyLocation = async () => {
    try {
      setLocLoading(true);
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert(
          "Permission needed",
          canAskAgain
            ? "Please allow location so we can check serviceability at your address."
            : "Location permission was denied. Enable it from Settings to auto-fill your address."
        );
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLat(coords.latitude);
      setLng(coords.longitude);

      try {
        const places = await Location.reverseGeocodeAsync(coords);
        const first = places?.[0];
        if (first?.postalCode) {
          const onlyDigits = first.postalCode.replace(/\D/g, "").slice(0, 6);
          if (onlyDigits) setPincode(onlyDigits);
        }
        if (!line1 && (first?.name || first?.street)) {
          const addr = [first.name, first.street].filter(Boolean).join(" ");
          if (addr) setLine1(addr);
        }
      } catch {}
      Alert.alert(
        "Location added",
        `Lat: ${coords.latitude.toFixed(5)}, Lng: ${coords.longitude.toFixed(5)}`
      );
    } catch (e: any) {
      Alert.alert("Location error", String(e?.message || e));
    } finally {
      setLocLoading(false);
    }
  };

  // 💳 Proceed to Payment
  const handleProceedToPayment = async () => {
    if (!name.trim()) return Alert.alert("Please enter your name");
    if (!/^\d{10}$/.test(phone)) return Alert.alert("Enter a valid 10-digit phone");
    if (!line1.trim()) return Alert.alert("Please enter address line");
    if (!/^\d{6}$/.test(pincode)) return Alert.alert("Enter a valid 6-digit pincode");
    if (!items.length) return Alert.alert("Your cart is empty");

    // ✅ check selected or persisted address
    let chosen = selectedAddress;
    if (!chosen) {
      try {
        const stored = await AsyncStorage.getItem("lastAddress");
        if (stored) chosen = JSON.parse(stored);
      } catch {}
    }

    if (!chosen && !selectedAddressId)
      return Alert.alert("Please select or enter an address");

    if (!navigationRef.isReady()) {
      Alert.alert("Navigation not ready. Try again in a moment.");
      return;
    }

    navigate("Payment", {
      total,
      addressId: chosen?.id ?? selectedAddressId,
      tbyb,
      name,
      phone,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#121216", paddingTop: 70 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>Checkout</Text>

          {/* Contact */}
          <View style={styles.card}>
            <Text style={styles.section}>Contact</Text>
            {user ? (
              <>
                <View style={styles.readonlyRow}>
                  <Text style={styles.readonlyLabel}>Name</Text>
                  <Text style={styles.readonlyValue}>{name || "—"}</Text>
                </View>
                <View style={styles.readonlyRow}>
                  <Text style={styles.readonlyLabel}>Phone</Text>
                  <Text style={styles.readonlyValue}>{phone || "—"}</Text>
                </View>
              </>
            ) : null}
          </View>

          {/* Address */}
          <View style={styles.card}>
            <Text style={styles.section}>Address</Text>
            {user && addresses.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={[styles.subheading]}>Use this address</Text>
                {addresses.map((a) => {
                  const selected = selectedAddressId === a.id;
                  return (
                    <TouchableOpacity
                      key={a.id}
                      onPress={() => setSelectedAddressId(a.id)}
                      style={[
                        styles.addressBox,
                        {
                          borderColor: selected ? "#FF3366" : "#2A2A2F",
                          backgroundColor: selected ? "#1E1E22" : "#2A2A2F",
                        },
                      ]}
                    >
                      <Text style={{ fontWeight: "700", color: "#fff" }}>
                        {a.label ? `${a.label} — ` : ""}
                        {a.line1}
                      </Text>
                      {a.line2 ? <Text style={{ color: "#aaa" }}>{a.line2}</Text> : null}
                      <Text style={{ color: "#aaa" }}>{a.pincode}</Text>
                      {a.is_default && (
                        <Text style={{ color: "#10B981", marginTop: 4 }}>Default</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  onPress={() => {
                    const chosen = addresses.find((x) => x.id === selectedAddressId);
                    if (!chosen) return;
                    setLine1(chosen.line1 || "");
                    setPincode(chosen.pincode || "");
                    setSelectedAddress(chosen);
                    AsyncStorage.setItem("lastAddress", JSON.stringify(chosen));
                  }}
                  style={styles.useBtn}
                >
                  <Text style={{ color: "white", fontWeight: "800" }}>Use selected address</Text>
                </TouchableOpacity>
              </View>
            )}

            <TextInput
              placeholder="Address line"
              placeholderTextColor="#888"
              value={line1}
              onChangeText={setLine1}
              style={styles.input}
            />
            <TextInput
              placeholder="Landmark (optional)"
              placeholderTextColor="#888"
              value={landmark}
              onChangeText={setLandmark}
              style={styles.input}
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TextInput
                placeholder="Pincode"
                placeholderTextColor="#888"
                keyboardType="number-pad"
                value={pincode}
                onChangeText={setPincode}
                style={[styles.input, { flex: 1 }]}
                maxLength={6}
              />
              <TouchableOpacity onPress={useMyLocation} style={styles.locBtn} disabled={locLoading}>
                {locLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ fontWeight: "700", color: "#fff" }}>Use my location</Text>
                )}
              </TouchableOpacity>
            </View>
            {lat != null && lng != null && (
              <Text style={styles.coords}>
                Using location • {lat.toFixed(4)}, {lng.toFixed(4)}
              </Text>
            )}
          </View>

          {/* TBYB */}
          <View style={styles.card}>
            <Text style={styles.section}>Try Before You Buy</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={[styles.toggle, tbyb && styles.toggleOn]}
                onPress={() => setTbyb(true)}
              >
                <Text style={[styles.toggleText, tbyb && styles.toggleTextOn]}>Enabled</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggle, !tbyb && styles.toggleOn]}
                onPress={() => setTbyb(false)}
              >
                <Text style={[styles.toggleText, !tbyb && styles.toggleTextOn]}>Disabled</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.card}>
            <Text style={styles.section}>Summary</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
              Total: ₹{total}
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.cta} onPress={handleProceedToPayment} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Proceed to Payment</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, rowGap: 12, paddingBottom: 32 },
  card: { backgroundColor: "#1E1E22", borderRadius: 14, padding: 14, gap: 10 },
  h1: { fontSize: 28, fontWeight: "900", marginBottom: 4, color: "#fff" },
  section: { fontSize: 16, fontWeight: "800", marginBottom: 6, color: "#fff" },
  subheading: { fontWeight: "700", fontSize: 14, marginBottom: 8, color: "#fff" },
  input: {
    backgroundColor: "#2A2A2F",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  locBtn: {
    backgroundColor: "#2A2A2F",
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    minWidth: 140,
    alignItems: "center",
  },
  coords: { marginTop: 6, color: "#aaa" },
  toggle: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#2A2A2F",
  },
  toggleOn: { backgroundColor: "#FF3366" },
  toggleText: { fontWeight: "700", color: "#aaa" },
  toggleTextOn: { color: "#fff" },
  addressBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  useBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FF3366",
    alignItems: "center",
    marginBottom: 6,
  },
  cta: {
    backgroundColor: "#FF3366",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  ctaText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  readonlyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  readonlyLabel: { color: "#bbb" },
  readonlyValue: { color: "#fff", fontWeight: "600" },
});
