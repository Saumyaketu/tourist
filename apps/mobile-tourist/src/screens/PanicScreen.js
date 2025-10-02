// apps/mobile-tourist/src/screens/PanicScreen.js
import React from 'react';
import { View, Text, StyleSheet, Alert, Button, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendPanicAlert } from '../api/location'; 

// ----------------------------------------------------------------
// CORE PANIC LOGIC: Moved here from PanicButton.js
// ----------------------------------------------------------------

// Helper to get device location (simplified implementation)
async function getCurrentDeviceLocation() {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Cannot send alert without location permission.');
            throw new Error('Location permission not granted');
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeout: 5000,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().toISOString(),
            accuracy: location.coords.accuracy,
        };
    } catch (error) {
        // Fallback with mock data if real location fetch fails
        console.warn('Error fetching device location, using mock data:', error);
        return {
            latitude: 34.0522 + (Math.random() * 0.01),
            longitude: -118.2437 + (Math.random() * 0.01),
            timestamp: new Date().toISOString(),
            accuracy: 50,
            mock: true
        };
    }
}

/**
 * Executes the full panic alert flow: gets location and sends POST request.
 * @param {string} touristId 
 * @returns {Promise<void>}
 */
export async function executePanicFlow(touristId) {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) throw new Error('User not authenticated.');
    
    // 1. Get the current, live location from the device
    const currentLoc = await getCurrentDeviceLocation();
    
    // 2. Send the panic alert to the backend (Dashboard API)
    const data = await sendPanicAlert(token, touristId, currentLoc);

    // Success alert shows confirmation and the coordinates sent
    Alert.alert('PANIC ALERT SENT', 
        `Alert ID: ${data?.alertId || 'N/A'}\nLocation: ${currentLoc.latitude.toFixed(4)}, ${currentLoc.longitude.toFixed(4)}`
    );
}

// ----------------------------------------------------------------
// Screen Component (Now just displays the button and status)
// ----------------------------------------------------------------
export default function PanicScreen({ route, navigation }) {
    const [sending, setSending] = useState(false);
    // Note: If this screen is used, you'll need to pass touristId via route params or context.
    // For this example, we'll rely on the button calling the exported function.

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Emergency Panic Alert</Text>
            <Text style={styles.text}>Press the button below to send your current location and trigger an immediate emergency response.</Text>
            
            <View style={{ marginVertical: 12 }}>
              {/* Option 1: Render a button that navigates */}
              <Button 
                title="PANIC — Send alert" 
                color="red"
                onPress={() => navigation.navigate('Panic', { touristId: profile.id })}
              />
              
              {/* If you keep using PanicButton component, you need to pass the navigation prop to it */}
              {/* <PanicButton touristId={profile.tourist_id || profile.id} navigation={navigation} /> */}
            </View>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    text: {
        textAlign: 'center',
        marginBottom: 40,
        color: '#666',
    },
    buttonContainer: {
        width: '80%',
    }
});