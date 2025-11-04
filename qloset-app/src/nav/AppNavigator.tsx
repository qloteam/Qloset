import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Tabs from "./Tabs";
import PaymentScreen from "../screens/PaymentScreen";
import OrderConfirmationScreen from "../screens/OrderConfirmationScreen";
import SplashScreen from "../screens/SplashScreen";
import { useAuth } from "../contexts/AuthContext"; // ✅ add this

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth(); // ✅ get user + loading from context

  // ✅ While restoring the Supabase session, show loader
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF3366" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={user ? "Tabs" : "Splash"} // 👈 go straight to Tabs if user is logged in
      screenOptions={{ headerShown: false }}
    >
      {/* 🚀 Splash Screen */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      {/* 🧭 Main App Tabs */}
      <Stack.Screen name="Tabs" component={Tabs} />

      {/* 💳 Payment Flow */}
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          headerShown: true,
          title: "Payment",
          headerBackTitle: "Back",
        }}
      />

      {/* ✅ Order Confirmation */}
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{
          headerShown: true,
          title: "Order Confirmation",
          headerBackTitle: "Back",
        }}
      />
    </Stack.Navigator>
  );
}
