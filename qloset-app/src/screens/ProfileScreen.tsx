import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = { isLoggedIn: false, phone: "+91 98765 43210" };
  const cartCount = 2;
  const wishlistCount = 5;

  const profileMenuItems = [
    { icon: "bag-handle-outline", title: "My Orders", subtitle: "Track your orders" },
    { icon: "help-circle-outline", title: "Help & Query", subtitle: "Get support" },
    { icon: "heart-outline", title: "Wishlist", subtitle: `${wishlistCount} items saved` },
    { icon: "gift-outline", title: "Refer & Earn", subtitle: "Invite friends & get rewards" },
  ];

  const settingsMenuItems = [
    {
      icon: "color-palette-outline",
      title: "Appearance",
      subtitle: "Dark mode, themes",
      screen: "Appearance",
    },
    {
      icon: "person-circle-outline",
      title: "Manage Account",
      subtitle: "Profile, preferences",
      screen: "ManageAccount",
    },
    {
      icon: "location-outline",
      title: "Addresses",
      subtitle: "Manage delivery addresses",
      screen: "Addresses",
    },
    {
      icon: "pricetag-outline",
      title: "My Offers",
      subtitle: "Coupons & discounts",
      screen: "Offers",
    },
    {
      icon: "document-text-outline",
      title: "Terms & Conditions",
      subtitle: "Legal information",
      screen: "Terms",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Privacy Policy",
      subtitle: "Data & privacy",
      screen: "Privacy",
    },
  ];

  return (
    <ScrollView style={styles.wrap}>
      {/* Profile Header */}
      <View style={styles.header}>
        {user.isLoggedIn ? (
          <View style={styles.profileBox}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcome}>Welcome back!</Text>
              <Text style={styles.subtext}>{user.phone}</Text>
              <View style={styles.stats}>
                <Text style={styles.subtext}>{cartCount} items in bag</Text>
                <Text style={styles.subtext}>{wishlistCount} in wishlist</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loginBox}
            onPress={() => navigation.navigate("ManageAccount" as never)}
          >
            <View style={styles.avatarMuted}>
              <Ionicons name="person" size={22} color="#888" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.loginText}>Tap here to Sign up/Login</Text>
              <Text style={styles.subtext}>Access your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#121216" },
  header: { padding: 16 },
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
  welcome: { color: "#fff", fontSize: 16, fontWeight: "600" },
  subtext: { color: "#aaa", fontSize: 12, marginTop: 2 },
  stats: { flexDirection: "row", gap: 12, marginTop: 6 },
  loginBox: {
    backgroundColor: "#1E1E22",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: { color: "#fff", fontSize: 14, fontWeight: "500" },
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
  footer: { alignItems: "center", marginTop: 30, marginBottom: 40 },
  footerText: { color: "#888", fontSize: 12 },
});
