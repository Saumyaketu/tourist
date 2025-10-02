// apps/mobile-tourist/src/screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProfile } from '../api/auth';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          navigation.replace('Login');
          return;
        }
        const payload = await fetchProfile(token);
        // Accept both { user: {...} } or direct {...}
        const user = payload?.user || payload;
        setProfile(user);
      } catch (err) {
        console.warn('Profile fetch failed', err.message);
        Alert.alert('Error', 'Unable to fetch profile. Try login again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigation]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (!profile) return (
    <View style={styles.container}>
      <Text>No profile found</Text>
      <Button title="Back to Login" onPress={() => navigation.replace('Login')} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{profile.name || profile.fullName || profile.id}</Text>
      <Text style={styles.row}>Tourist ID: {profile.tourist_id || profile.id}</Text>
      <Text style={styles.row}>Email: {profile.email || '—'}</Text>
      <Text style={styles.row}>Phone: {profile.phone || '—'}</Text>

      {/* Removed: PanicButton */}

      <Button title="Change password" onPress={() => navigation.navigate('ChangePassword')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 8 },
  row: { marginVertical: 4 },
});