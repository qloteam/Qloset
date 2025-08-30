// App.tsx
import * as React from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import Tabs from './src/nav/Tabs';
import ThemeProvider from './src/theme/Provider';
import { CartProvider, useCart } from './src/state/CartContext';

import { API_BASE } from './src/lib/api';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;            // tabs
  Product: { id: string };
  Cart: undefined;
  Checkout: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const TOKEN_KEY = 'token';

function CartButton({ navigation }: any) {
  const { count } = useCart();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
      <Text style={{ fontSize: 16 }}>{`🛒 ${count}`}</Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const [booted, setBooted] = React.useState(false);
  const [hasToken, setHasToken] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);

        if (!token) {
          setHasToken(false);
        } else {
          // Validate token with API
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            setHasToken(true);
          } else {
            await AsyncStorage.removeItem(TOKEN_KEY);
            setHasToken(false);
          }
        }
      } catch {
        setHasToken(false);
      } finally {
        setBooted(true);
      }
    })();
  }, []);

  if (!booted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <CartProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={hasToken ? 'Home' : 'Login'}
            screenOptions={{ headerShadowVisible: false }}
          >
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="Product"
              component={ProductScreen}
              options={({ navigation }) => ({
                title: 'Product',
                headerRight: () => <CartButton navigation={navigation} />,
              })}
            />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </CartProvider>
  );
}
