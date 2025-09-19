import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { postLocation } from "./api/client";

export const LOCATION_TASK_NAME = "SMART_TOURIST_LOCATION_TASK";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background task error:", error);
    return;
  }
  if (!data) return;
  try {
    const { locations } = data;
    if (!locations || locations.length === 0) return;
    const loc = locations[0];
    const payload = {
      deviceId: "mobile-demo-1",
      timestamp: new Date(loc.timestamp).toISOString(),
      lat: loc.coords.latitude,
      lon: loc.coords.longitude,
    };

    // best-effort send to backend (no await blocking)
    postLocation(payload).catch((e) => console.warn("bg post fail", e));
    console.log("Background location posted:", payload);
  } catch (e) {
    console.error("Error handling background location", e);
  }
});
