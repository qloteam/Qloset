import React, { useEffect } from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// define your stack param list
type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
  Product: undefined;
  Wishlist: undefined;
  Checkout: undefined;
};

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("MainTabs"); // ✅ Go to MainTabs, not Home
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/logo.png")}
        style={{ width: 120, height: 120 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#FF3366" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121216",
    justifyContent: "center",
    alignItems: "center",
  },
});
