import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import Tabs from './src/nav/Tabs';
import ThemeProvider from './src/theme/Provider';
import { CartProvider, useCart } from './src/state/CartContext';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;            // tabs
  Product: { id: string };
  Cart: undefined;
  Checkout: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function CartButton({ navigation }: any) {
  const { count } = useCart();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
      <Text style={{ fontSize: 16 }}>{`🛒 ${count}`}</Text>
    </TouchableOpacity>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShadowVisible: false }}>
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
