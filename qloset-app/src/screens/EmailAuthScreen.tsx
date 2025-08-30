import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../lib/api';

export default function EmailAuthScreen({ navigation }: any) {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  const submit = async () => {
    try {
      const body: any = { email, password };
      if (mode === 'register' && name) body.name = name;

      const res = await fetch(`${API_BASE}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.message || 'Auth failed');

      await AsyncStorage.setItem('token', data.token);
      navigation.replace('Home'); // go into the app
    } catch (e: any) {
      Alert.alert('Error', String(e.message || e));
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{mode === 'login' ? 'Login' : 'Sign Up'}</Text>

      {mode === 'register' && (
        <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
      )}

      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>{mode === 'login' ? 'Login' : 'Create account'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.link}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#f4f4f5', borderRadius: 12, padding: 12, marginBottom: 10 },
  button: { backgroundColor: '#111827', padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontWeight: '800' },
  link: { marginTop: 12, textAlign: 'center', color: '#2563eb', fontWeight: '600' },
});
