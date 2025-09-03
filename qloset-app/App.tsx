// App.tsx
import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

// Contexts
import { CartProvider } from './src/state/CartContext';
import { ThemeProvider } from './src/state/ThemeContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProductScreen from './src/screens/ProductScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';

// Profile sub-pages
import AppearanceScreen from './src/screens/AppearanceScreen';
import ManageAccountScreen from './src/screens/ManageAccountScreen';
import AddressesScreen from './src/screens/AddressesScreen';
import OffersScreen from './src/screens/OffersScreen';
import TermsScreen from './src/screens/TermsScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();

// ✅ Profile stack (Profile + sub-pages)
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
    </ProfileStackNav.Navigator>
  );
}

// ✅ Bottom tabs
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FF3366',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#121216', borderTopWidth: 0 },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Explore') iconName = 'compass';
          else if (route.name === 'Cart') iconName = 'cart';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// ✅ Root stack (MainTabs + product/checkout)
export default function App() {
  return (
    <CartProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={Tabs} />
            <Stack.Screen name="Product" component={ProductScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </CartProvider>
  );
}
