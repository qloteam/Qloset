// src/nav/Tabs.tsx
import * as React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

import HomeScreen from "../screens/HomeScreen";
import ExploreScreen from "../screens/ExploreScreen";
import CartScreen from "../screens/CartScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { useCart } from "../state/CartContext";

const Tab = createBottomTabNavigator();

/**
 * BadgeIcon
 * Wrap any icon and draw a small rounded badge in the top-right corner.
 * The badge position scales with the icon size so it looks right on all DPIs.
 */
function BadgeIcon({
  children,
  count,
  size,
}: {
  children: React.ReactNode;
  count: number;
  size: number; // pass tab icon "size" here for correct placement
}) {
  // Position the badge relative to icon size
  const right = Math.max(8, Math.round(size * 0.38));
  const top = -Math.max(4, Math.round(size * 0.25));

  return (
    <View style={{ position: "relative", width: size, height: size, alignItems: "center", justifyContent: "center" }}>
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
            backgroundColor: "#FF3366", // app accent
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.85)", // subtle ring for dark/light tabs
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

export default function Tabs() {
  const { count = 0 } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111216", // matches your dark UI
          borderTopColor: "#22242a",
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#9ca3af",
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: "Cart",
          // ⚠️ Do NOT also set tabBarBadge here, or you'll get two badges.
          tabBarIcon: ({ color, size }) => (
            <BadgeIcon count={count} size={size}>
              <Ionicons
                name={count > 0 ? "cart" : "cart-outline"}
                color={color}
                size={size}
              />
            </BadgeIcon>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
