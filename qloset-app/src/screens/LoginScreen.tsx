import * as React from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { requestOtp, verifyOtp } from '../lib/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const TOKEN_KEY = 'token';

export default function LoginScreen({ navigation }: Props) {
  const [stage, setStage] = React.useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // NOTE: No auto-redirect effect here. App.tsx controls initial route.

  const onRequest = async () => {
    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Enter a valid 10-digit phone');
      return;
    }
    try {
      setLoading(true);
      await requestOtp(phone);
      setStage('otp');
      Alert.alert('OTP sent', 'Use code 123456 in dev');
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    try {
      setLoading(true);
      const res = await verifyOtp(phone, otp);
      if ((res as any)?.token) {
        await AsyncStorage.setItem(TOKEN_KEY, (res as any).token);
        // Simple navigate is enough; App.tsx won’t remount here.
        navigation.replace('Home');
      } else {
        Alert.alert('Invalid code');
      }
    } catch (e: any) {
      Alert.alert('Error', String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Qloset</Text>

        {stage === 'phone' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              returnKeyType="done"
            />
            {loading ? <ActivityIndicator /> : <Button title="Get OTP" onPress={onRequest} />}
          </>
        ) : (
          <>
            <Text style={{ marginBottom: 8 }}>OTP sent to {phone}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP (123456 in dev)"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              returnKeyType="done"
            />
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Button title="Verify & Continue" onPress={onVerify} />
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});
