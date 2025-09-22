import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { LOCATION_TASK_NAME } from "../background-task";
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_LOCATION_KEY = 'last_location';

export default function useLocationBackground() {
  const subRef = useRef(null);
  const [lastKnownLocation, setLastKnownLocation] = useState(null);

  useEffect(() => {
    async function loadLastLocation() {
      try {
        const storedLocation = await AsyncStorage.getItem(LAST_LOCATION_KEY);
        if (storedLocation) {
          setLastKnownLocation(JSON.parse(storedLocation));
        }
      } catch (e) {
        console.error("Failed to load last known location:", e);
      }
    }
    loadLastLocation();

    return () => {
      if (subRef.current) {
        subRef.current.remove();
      }
    };
  }, []);

  async function startForegroundWatch(cb) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") throw new Error("permission denied");
    subRef.current = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, distanceInterval: 50 }, cb);
    return subRef.current;
  }

  async function stopForegroundWatch() {
    if (subRef.current) {
      subRef.current.remove();
      subRef.current = null;
    }
  }

  async function startBackground() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (status !== "granted" || bgStatus !== "granted") throw new Error("background permission denied");

    const registered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (!registered) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 15000,
        distanceInterval: 50,
        foregroundService: {
          notificationTitle: "Tourist Safety",
          notificationBody: "Your location is being tracked for safety.",
        },
        pausesUpdatesAutomatically: false,
      });
    }
  }

  async function stopBackground() {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }

  return { startForegroundWatch, stopForegroundWatch, startBackground, stopBackground, lastKnownLocation };
}
