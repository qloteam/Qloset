// App.tsx
import "react-native-gesture-handler";
import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";

// Contexts
import { CartProvider, useCart } from "./src/state/CartContext";
import { ThemeProvider } from "./src/state/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { WishlistProvider } from "./src/state/WishlistContext";

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import ExploreScreen from "./src/screens/ExploreScreen";
import CartScreen from "./src/screens/CartScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ProductScreen from "./src/screens/ProductScreen";
import CheckoutScreen from "./src/screens/CheckoutScreen";
import SplashScreen from "./src/screens/SplashScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import OrderConfirmationScreen from "./src/screens/OrderConfirmationScreen";

// Profile sub-pages
import AppearanceScreen from "./src/screens/AppearanceScreen";
import ManageAccountScreen from "./src/screens/ManageAccountScreen";
import AddressesScreen from "./src/screens/AddressesScreen";
import OffersScreen from "./src/screens/OffersScreen";
import TermsScreen from "./src/screens/TermsScreen";
import PrivacyScreen from "./src/screens/PrivacyScreen";
import WishlistScreen from "./src/screens/WishlistScreen";

// 🧭 Global navigation ref (fixes “Unable to find parent navigator”)
import { navigationRef } from "./src/nav/navigationRef";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();

/* 🏷️ Badge Icon Component */
function BadgeIcon({
  children,
  count,
  size,
}: {
  children: React.ReactNode;
  count: number;
  size: number;
}) {
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
            backgroundColor: "#FF3366",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.85)",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 10,
              fontWeight: "800",
              lineHeight: 12,
            }}
          >
            {count > 99 ? "99+" : count}
          </Text>
        </View>
      )}
    </View>
  );
}

/* 👤 Profile Stack */
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

/* 🧭 Bottom Tabs */
function Tabs() {
  const { count = 0 } = useCart();
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <BadgeIcon count={count} size={size}>
              <Ionicons
                name={count > 0 ? "cart" : "cart-outline"}
                size={size}
                color={color}
              />
            </BadgeIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/* 🚀 Root App Stack */
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <WishlistProvider>
            {/* ✅ Attach global navigation ref */}
            <NavigationContainer ref={navigationRef}>
              <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName="Splash"
              >
                {/* Startup */}
                <Stack.Screen name="Splash" component={SplashScreen} />

                {/* Main Tabs */}
                <Stack.Screen name="MainTabs" component={Tabs} />

                {/* Product & Checkout Flow */}
                <Stack.Screen name="Product" component={ProductScreen} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} />

                {/* ✅ Payment + Confirmation */}
                <Stack.Screen
                  name="Payment"
                  component={PaymentScreen}
                  options={{ headerShown: true, title: "Payment" }}
                />
                <Stack.Screen
                  name="OrderConfirmation"
                  component={OrderConfirmationScreen}
                  options={{ headerShown: false }}
                />

                {/* Optional Wishlist */}
                <Stack.Screen name="Wishlist" component={WishlistScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </WishlistProvider>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
