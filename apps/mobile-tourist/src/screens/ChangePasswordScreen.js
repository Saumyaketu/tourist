// apps/mobile-tourist/src/screens/ChangePasswordScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changePassword } from '../api/auth';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onChange() {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');
      await changePassword(token, currentPassword, newPassword);
      Alert.alert('Success', 'Password updated');
      // After change, redirect to Home
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Change failed', err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        secureTextEntry
        placeholder="Current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        placeholder="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />
      <Button title={loading ? 'Updating...' : 'Update password'} onPress={onChange} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 12, borderRadius: 6 },
});