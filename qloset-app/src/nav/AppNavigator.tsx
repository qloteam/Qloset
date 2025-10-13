import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Tabs from "./Tabs";
import PaymentScreen from "../screens/PaymentScreen";
import OrderConfirmationScreen from "../screens/OrderConfirmationScreen";
import SplashScreen from "../screens/SplashScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
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
