import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import { CartProvider, useCart } from './src/state/CartContext';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Product: { id: string };
  Cart: undefined;
  Checkout: undefined; // ← added
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
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              headerRight: () => <CartButton navigation={navigation} />,
            })}
          />
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
    </CartProvider>
  );
}
