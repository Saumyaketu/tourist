// apps/mobile-tourist/src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PanicButton from '../components/PanicButton';

export default function HomeScreen({ navigation }) {
    const [touristId, setTouristId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchId = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                if (userJson) {
                    const profile = JSON.parse(userJson);
                    // Fetch tourist ID for the Panic Button
                    setTouristId(profile.id || profile.tourist_id);
                }
            } catch (e) {
                console.error("Failed to load tourist ID for home screen:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchId();
    }, []);

    if (loading) {
        return <ActivityIndicator style={styles.container} size="large" />;
    }
    
    // Fallback if user data is missing
    if (!touristId) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Welcome</Text>
                <Text>Please sign in again to enable safety features.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome, Tourist!</Text>
                <Text style={styles.subtitle}>Your current ID: {touristId}</Text>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Emergency Services</Text>
                    <View style={styles.panicContainer}>
                        {/* The Panic Button now lives here */}
                        <PanicButton touristId={touristId} />
                        <Text style={styles.warning}>Press only in a genuine, immediate emergency.</Text>
                    </View>
                </View>
                
                {/* Future content blocks can be added here */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Links</Text>
                    <Text style={styles.link} onPress={() => navigation.navigate('Profile')}>View Full Profile</Text>
                    <Text style={styles.link} onPress={() => navigation.navigate('MapView')}>Check Map</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
        color: '#007bff',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        color: '#666',
    },
    section: {
        width: '100%',
        marginTop: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    panicContainer: {
        width: '100%',
        marginTop: 10,
        alignItems: 'center',
    },
    warning: {
        marginTop: 10,
        color: 'red',
        textAlign: 'center',
        fontSize: 12,
    },
    link: {
        color: '#007bff',
        paddingVertical: 5,
    }
});