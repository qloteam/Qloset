// src/lib/session.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

export async function logout(navigation: any) {
  await AsyncStorage.removeItem('token');
  navigation.dispatch(
    CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
  );
}
