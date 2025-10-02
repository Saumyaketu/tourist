// apps/mobile-tourist/src/components/PanicButton.js
import React, { useState } from 'react';
import { Button, Alert } from 'react-native';
// Remove ALL location/API/AsyncStorage imports
import { executePanicFlow } from '../screens/PanicScreen'; // Import the consolidated logic

export default function PanicButton({ touristId }) {
  const [sending, setSending] = useState(false);

  async function onPanic() {
    if (!touristId) {
        Alert.alert('Error', 'Tourist ID not available. Please try logging in again.');
        return;
    }
    
    try {
      setSending(true);
      // Execute the entire flow contained within PanicScreen.js
      await executePanicFlow(touristId);
      
    } catch (err) {
      // Catch any errors thrown during the flow (like token missing or API failure)
      Alert.alert('Panic failed', err.message || String(err) + '. Check backend status.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Button
      title={sending ? 'Sending Alert...' : 'PANIC — Send alert'}
      color="red"
      onPress={onPanic}
      disabled={sending}
    />
  );
}