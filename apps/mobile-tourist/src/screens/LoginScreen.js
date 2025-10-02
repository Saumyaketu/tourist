// apps/mobile-tourist/src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithPassword } from '../api/auth';

export default function LoginScreen({ navigation }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    try {
      setLoading(true);
      const payload = await loginWithPassword(id.trim(), password);
      // Expect { token, user }
      const token = payload.token || payload.accessToken;
      const user = payload.user || payload;
      if (!token) throw new Error('No token received from server');

      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // If backend flagged temporary password, force change
      if (user?.temporaryPassword) {
        // navigate to change password screen
        navigation.replace('ChangePassword');
      } else {
        // *** MODIFIED: Navigate to 'Main' (the Tab Navigator) ***
        navigation.replace('Main');
      }
    } catch (err) {
      Alert.alert('Login failed', err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <TextInput
        placeholder="ID or email"
        value={id}
        onChangeText={setId}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="default"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title={loading ? 'Signing in...' : 'Sign in'} onPress={onLogin} disabled={loading} />
      <View style={{ height: 8 }} />
      <Button title="Agent registration info" onPress={() => navigation.navigate('RegisterInfo')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 12, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 12, borderRadius: 6 },
});