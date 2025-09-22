import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from './api/client';

export const LOCATION_TASK_NAME = 'location-ingest';
const LAST_LOCATION_KEY = 'last_location';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    // Save the latest location to AsyncStorage
    await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));

    // Correctly map the keys for the backend
    const payload = {
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      deviceId: 'mobile-demo-android-1', // You may need to get this from AsyncStorage as well
      timestamp: new Date().toISOString(),
    };
    
    const maxRetries = 3;
    let retries = 0;
    while (retries < maxRetries) {
      try {
        await client.post('/v1/location', payload);
        console.log('Location posted successfully!');
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (e) {
        console.warn(`Failed to post location, retry ${retries + 1}/${maxRetries}`);
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    
    console.error('Failed to post location after multiple retries.');
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
  return BackgroundFetch.BackgroundFetchResult.NoData;
});

export const requestPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted' || bgStatus !== 'granted') {
    throw new Error('Background location permission denied');
  }
};
