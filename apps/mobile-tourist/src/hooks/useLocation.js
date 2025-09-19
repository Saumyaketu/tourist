import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { LOCATION_TASK_NAME } from "../background-task";

export default function useLocationBackground() {
  const subRef = useRef(null);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (subRef.current) {
        subRef.current.remove();
      }
      // do not stop background tasks here
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

  return { startForegroundWatch, stopForegroundWatch, startBackground, stopBackground };
}
