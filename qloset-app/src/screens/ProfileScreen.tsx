import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { useCart } from "../state/CartContext";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, loading, loginWithPassword, loginWithGoogle, sendMagicLink, logout } = useAuth();

  // demo counts — replace with real data when you wire your API
  const { count } = useCart();
  const wishlistCount = 5;

  const profileMenuItems = [
    { icon: "bag-handle-outline", title: "My Orders", subtitle: "Track your orders" },
    { icon: "help-circle-outline", title: "Help & Query", subtitle: "Get support" },
    { icon: "heart-outline", title: "Wishlist", subtitle: `${wishlistCount} items saved` },
    { icon: "gift-outline", title: "Refer & Earn", subtitle: "Invite friends & get rewards" },
  ];

  const settingsMenuItems = [
    { icon: "color-palette-outline", title: "Appearance", subtitle: "Dark mode, themes", screen: "Appearance" },
    { icon: "person-circle-outline", title: "Manage Account", subtitle: "Profile, preferences", screen: "ManageAccount" },
    { icon: "location-outline", title: "Addresses", subtitle: "Manage delivery addresses", screen: "Addresses" },
    { icon: "pricetag-outline", title: "My Offers", subtitle: "Coupons & discounts", screen: "Offers" },
    { icon: "document-text-outline", title: "Terms & Conditions", subtitle: "Legal information", screen: "Terms" },
    { icon: "shield-checkmark-outline", title: "Privacy Policy", subtitle: "Data & privacy", screen: "Privacy" },
  ];

  // ---- Login UI state (hidden until CTA tapped) ----
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");


  async function onPasswordLogin() {
    if (!email || !password) {
      setMsg("Please enter email and password.");
      return;
    }
    setMsg(null);
    setBusy(true);
    try {
      await loginWithPassword(email.trim(), password);
      setShowLogin(false);
      setEmail("");
      setPassword("");
    } catch (e: any) {
      setMsg(e?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onMagicLink() {
    if (!email) {
      setMsg("Enter your email to get a magic link.");
      return;
    }
    setMsg(null);
    setBusy(true);
    try {
      await sendMagicLink(email.trim());
      setMsg("Magic link sent! Check your email.");
    } catch (e: any) {
      setMsg(e?.message || "Could not send magic link.");
    } finally {
      setBusy(false);
    }
  }

async function onSignUp() {
  // ✅ Validate BEFORE enabling spinner
  if (!name || !email || !password) {
    setMsg("Please enter name, email and password.");
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    setMsg("Enter a valid email address.");
    return;
  }
  if (password.length < 6) {
    setMsg("Password must be at least 6 characters.");
    return;
  }

  setMsg(null);
  setBusy(true);
  try {
    const { data, error } = await supabase!.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name, phone } },
    });
    if (error) throw error;

    if (data.user?.email_confirmed_at) {
      setMsg("Account created and signed in.");
    } else {
      setMsg("Signup successful! Please check your email to verify your account.");
    }

    setTimeout(() => {
      setShowLogin(false);
      setMode("login");
      setName(""); setPhone(""); setEmail(""); setPassword("");
      setMsg(null);
    }, 800);
  } catch (e: any) {
    if (e?.message?.includes("User already registered")) {
      setMsg("This email is already registered. Please sign in instead.");
      setMode("login"); // auto-switch to login form
    } else {
      setMsg(e?.message || "Signup failed.");
    }
  } finally {
    setBusy(false); // ✅ always clear spinner
  }
}



  function getDisplayName() {
    const nameFromMeta =
      // @ts-ignore
      (user?.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || "";
    return nameFromMeta || (user?.email ? user.email.split("@")[0] : "User");
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Config guard */}
      {!hasSupabaseConfig ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Authentication not configured
          </Text>
          <Text style={{ color: "#aaa", marginTop: 8 }}>
            Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env, then
            restart the app.
          </Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            {loading ? (
              <View style={[styles.box, { justifyContent: "center" }]}>
                <ActivityIndicator color="#fff" />
                <Text style={[styles.subtext, { marginLeft: 10 }]}>Loading account…</Text>
              </View>
            ) : user ? (
              // Logged-in header
              <View style={styles.profileBox}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={28} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.welcome}>Welcome back, {getDisplayName()}!</Text>
                  <Text style={styles.subtext}>{user.email}</Text>
                  <View style={styles.stats}>
                    <Text style={styles.subtext}>
                      {count} {count === 1 ? "item" : "items"} in bag
                    </Text>
                    <Text style={styles.subtext}>{wishlistCount} in wishlist</Text>
                  </View>

                </View>
                <TouchableOpacity
                  onPress={async () => {
                    setBusy(true); // optional: spinner
                    try {
                      await logout();
                    } finally {
                      setBusy(false);
                      setMode("login");     // make sure we show login fields
                      setShowLogin(true);   // immediately open modal
                    }
                  }}
                  style={styles.signOutBtn}
                >
                  <Text style={styles.signOutText}>Sign out</Text>
                </TouchableOpacity>

              </View>
            ) : (
              // Not logged in → **only CTA**, no fields
              <View style={styles.box}>
                <View style={styles.avatarMuted}>
                  <Ionicons name="person" size={22} color="#888" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.loginText}>Sign up / Login</Text>
                  <Text style={styles.subtext}>Access orders, wishlist & more</Text>

                  <TouchableOpacity
                    onPress={() => setShowLogin(true)}
                    style={[styles.primaryBtn, { marginTop: 12 }]}
                  >
                    <Text style={styles.primaryBtnText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.grid}>
              {profileMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  style={styles.card}
                  onPress={() => console.log(`${item.title} tapped`)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                      <Ionicons name={item.icon as any} size={18} color="#FF3366" />
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#aaa"
                      style={{ marginLeft: "auto" }}
                    />
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            {settingsMenuItems.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={styles.settingsRow}
                onPress={() => navigation.navigate(item.screen as never)}
              >
                <View style={styles.settingsIcon}>
                  <Ionicons name={item.icon as any} size={18} color="#999" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#aaa" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Qloset v1.0.0</Text>
            <Text style={styles.footerText}>Fashion delivered in 60 minutes</Text>
          </View>

          {/* ===== Auth Modal (Login or Sign Up) ===== */}
          <Modal
            visible={showLogin}
            transparent
            animationType="fade"
            onRequestClose={() => setShowLogin(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                {/* Header */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", flex: 1 }}>
                    {mode === "login" ? "Sign in" : "Create account"}
                  </Text>
                  <TouchableOpacity onPress={() => setShowLogin(false)} hitSlop={10}>
                    <Ionicons name="close" size={22} color="#bbb" />
                  </TouchableOpacity>
                </View>

                {msg ? <Text style={styles.errorText}>{msg}</Text> : null}

                <View style={{ marginTop: 8, gap: 10 }}>
                  {/* Extra fields only for Sign Up */}
                  {mode === "signup" && (
                    <>
                      <TextInput
                        value={name}
                        onChangeText={(t) => { setName(t); if (msg) setMsg(null); }}
                        placeholder="Your name"
                        placeholderTextColor="#7a7a7a"
                        style={styles.input}
                      />
                      <TextInput
                        value={phone}
                        onChangeText={(t) => { setPhone(t); if (msg) setMsg(null); }}
                        keyboardType="phone-pad"
                        placeholder="Phone (optional)"
                        placeholderTextColor="#7a7a7a"
                        style={styles.input}
                      />
                    </>
                  )}

                  {/* Shared fields */}
                  <TextInput
                    value={email}
                    onChangeText={(t) => { setEmail(t); if (msg) setMsg(null); }}
                    placeholder="you@example.com"
                    placeholderTextColor="#7a7a7a"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    style={styles.input}
                  />
                  <TextInput
                    value={password}
                    onChangeText={(t) => { setPassword(t); if (msg) setMsg(null); }}
                    placeholder="••••••••"
                    placeholderTextColor="#7a7a7a"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    style={styles.input}
                  />

                  {/* Primary action */}
                  <TouchableOpacity
                    onPress={mode === "login" ? onPasswordLogin : onSignUp}
                    disabled={busy}
                    style={[styles.primaryBtn, { marginTop: 10 }, busy && { opacity: 0.6 }]}
                  >
                    {busy ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.primaryBtnText}>
                        {mode === "login" ? "Sign in" : "Sign up"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Extra options only in Login mode */}
                  {mode === "login" && (
                    <>
                      <View style={styles.orRow}>
                        <View style={styles.orLine} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.orLine} />
                      </View>

                      <TouchableOpacity
                        onPress={onMagicLink}
                        disabled={busy}
                        style={[styles.secondaryBtn, busy && { opacity: 0.6 }]}
                      >
                        <Text style={styles.secondaryBtnText}>Email me a magic link</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          loginWithGoogle().catch((e) =>
                            Alert.alert("Google sign-in", e?.message || "Failed to sign in")
                          )
                        }
                        disabled={busy}
                        style={[styles.secondaryBtn, busy && { opacity: 0.6 }]}
                      >
                        <Text style={styles.secondaryBtnText}>Continue with Google</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Mode switch (EXACTLY ONE of these exists) */}
                  <TouchableOpacity
                    onPress={() => {
                      setMsg(null);
                      setMode(mode === "login" ? "signup" : "login");
                    }}
                    disabled={busy}
                    style={[styles.secondaryBtn, { marginTop: 10 }]}
                  >
                    <Text style={styles.secondaryBtnText}>
                      {mode === "login" ? "Create a new account" : "I already have an account"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* ===== End Auth Modal ===== */}



        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#121216" },
  header: { padding: 16 },

  box: {
    backgroundColor: "#1E1E22",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  profileBox: {
    backgroundColor: "#1E1E22",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF3366",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarMuted: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2A2A2F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  loginText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  welcome: { color: "#fff", fontSize: 16, fontWeight: "600" },
  subtext: { color: "#aaa", fontSize: 12, marginTop: 2 },
  stats: { flexDirection: "row", gap: 12, marginTop: 6 },

  // Buttons
  primaryBtn: {
    backgroundColor: "#FF3366",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "600" },

  secondaryBtn: {
    backgroundColor: "#2A2A2F",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#fff", fontWeight: "500" },

  input: {
    backgroundColor: "#2A2A2F",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: { color: "#ff6b6b", fontSize: 12, marginTop: 8 },

  orRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  orLine: { flex: 1, height: 1, backgroundColor: "#2A2A2F" },
  orText: { marginHorizontal: 8, color: "#777", fontSize: 11 },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    backgroundColor: "#1E1E22",
    borderRadius: 12,
    padding: 12,
    width: "48%",
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "rgba(255, 51, 102, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { color: "#fff", fontSize: 13, fontWeight: "500" },
  cardSubtitle: { color: "#aaa", fontSize: 11, marginTop: 2 },
  settingsRow: {
    backgroundColor: "#1E1E22",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#2A2A2F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2A2A2F",
  },
  signOutText: { color: "#fff", fontSize: 12 },

  footer: { alignItems: "center", marginTop: 30, marginBottom: 40 },
  footerText: { color: "#888", fontSize: 12 },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#1E1E22",
    borderRadius: 14,
    padding: 16,
  },
});
