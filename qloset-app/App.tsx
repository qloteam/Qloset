// App.tsx
import "react-native-gesture-handler";
import * as React from "react";
import { View, Text } from "react-native"; // ✅ for badge + icons
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";

// Contexts
import { CartProvider } from "./src/state/CartContext";
import { ThemeProvider } from "./src/state/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { WishlistProvider } from "./src/state/WishlistContext";
import { useCart } from "./src/state/CartContext"; // ✅ we’ll use this inside Tabs()

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import ExploreScreen from "./src/screens/ExploreScreen";
import CartScreen from "./src/screens/CartScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ProductScreen from "./src/screens/ProductScreen";
import CheckoutScreen from "./src/screens/CheckoutScreen";

// Profile sub-pages
import AppearanceScreen from "./src/screens/AppearanceScreen";
import ManageAccountScreen from "./src/screens/ManageAccountScreen";
import AddressesScreen from "./src/screens/AddressesScreen";
import OffersScreen from "./src/screens/OffersScreen";
import TermsScreen from "./src/screens/TermsScreen";
import PrivacyScreen from "./src/screens/PrivacyScreen";
import WishlistScreen from "./src/screens/WishlistScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();

/** Small helper: overlay a rounded badge in the icon’s top-right corner */
function BadgeIcon({
  children,
  count,
  size,
}: {
  children: React.ReactNode;
  count: number;
  size: number;
}) {
  // Position scales with size so it sits nicely on all DPIs
  const right = Math.max(8, Math.round(size * 0.38));
  const top = -Math.max(4, Math.round(size * 0.25));

  return (
    <View
      style={{
        position: "relative",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
      {count > 0 && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right,
            top,
            minWidth: 16,
            height: 16,
            paddingHorizontal: 4,
            borderRadius: 8,
            backgroundColor: "#FF3366", // your accent
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.85)", // subtle ring
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "800", lineHeight: 12 }}>
            {count > 99 ? "99+" : count}
          </Text>
        </View>
      )}
    </View>
  );
}

// ✅ Profile stack
function ProfileStack() {
  return (
    <ProfileStackNav.Navigator>
      <ProfileStackNav.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStackNav.Screen name="Appearance" component={AppearanceScreen} />
      <ProfileStackNav.Screen name="ManageAccount" component={ManageAccountScreen} />
      <ProfileStackNav.Screen name="Addresses" component={AddressesScreen} />
      <ProfileStackNav.Screen name="Offers" component={OffersScreen} />
      <ProfileStackNav.Screen name="Terms" component={TermsScreen} />
      <ProfileStackNav.Screen name="Privacy" component={PrivacyScreen} />
      <ProfileStackNav.Screen name="Wishlist" component={WishlistScreen} />
    </ProfileStackNav.Navigator>
  );
}

// ✅ Bottom tabs with a custom Cart badge
function Tabs() {
  const { count = 0 } = useCart(); // live cart count

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF3366",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#121216", borderTopWidth: 0 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: "Cart",
          // ⚠️ Do NOT set tabBarBadge here; we draw our own badge.
          tabBarIcon: ({ color, size }) => (
            <BadgeIcon count={count} size={size}>
              <Ionicons name={count > 0 ? "cart" : "cart-outline"} size={size} color={color} />
            </BadgeIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ✅ Root stack (MainTabs + product/checkout)
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <WishlistProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={Tabs} />
                <Stack.Screen name="Product" component={ProductScreen} />
                <Stack.Screen name="Wishlist" component={WishlistScreen} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </WishlistProvider>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
