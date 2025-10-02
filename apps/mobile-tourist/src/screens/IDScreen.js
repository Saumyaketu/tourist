// apps/mobile-tourist/src/screens/IDScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IDScreen({ navigation }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                if (userJson) {
                    setProfile(JSON.parse(userJson));
                }
            } catch (err) {
                console.error("Error fetching user profile for ID screen:", err);
                Alert.alert("Error", "Could not load profile data.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return <ActivityIndicator style={styles.container} size="large" />;
    }

    if (!profile) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Digital ID</Text>
                <Text>Please sign in to view your ID.</Text>
                <Button title="Go to Login" onPress={() => navigation.replace('Login')} />
            </View>
        );
    }
    
    // Ensure ID is taken from the correct field
    const touristId = profile.tourist_id || profile.id;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Digital Tourist ID</Text>
            <View style={styles.card}>
                <Text style={styles.cardHeader}>{profile.name || profile.fullName || 'Tourist Profile'}</Text>
                <Text style={styles.cardRowLabel}>Tourist ID:</Text>
                <Text style={styles.cardRowValue}>{touristId}</Text>
                
                <Text style={styles.cardRowLabel}>Email:</Text>
                <Text style={styles.cardRowValue}>{profile.email || '—'}</Text>

                <Text style={styles.cardRowLabel}>Phone:</Text>
                <Text style={styles.cardRowValue}>{profile.phone || '—'}</Text>
                
                <Text style={styles.cardFooter}>Status: Verified</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f0f0f0', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: { 
        width: '90%', 
        backgroundColor: '#fff', 
        borderRadius: 10, 
        padding: 25, 
        shadowColor: '#000', 
        shadowOpacity: 0.1, 
        shadowRadius: 5, 
        elevation: 3 
    },
    cardHeader: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 15, 
        color: '#007bff' 
    },
    cardRowLabel: { 
        fontSize: 14, 
        marginTop: 10, 
        color: '#666' 
    },
    cardRowValue: { 
        fontSize: 16, 
        fontWeight: '500', 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee', 
        paddingBottom: 5 
    },
    cardFooter: { 
        marginTop: 20, 
        textAlign: 'center', 
        color: 'green', 
        fontWeight: 'bold' 
    }
});