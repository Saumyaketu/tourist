import axios from "axios";

// This should be your backend server address
const API_BASE = "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

export async function sendPanic(payload) {
  try {
    const r = await api.post("/v1/panic", payload);
    return r.data;
  } catch (error) {
    throw new Error(`Failed to send panic: ${error.message}`);
  }
}

export async function postLocation(payload) {
  try {
    const r = await api.post("/v1/location", payload);
    return r.data;
  } catch (error) {
    throw new Error(`Failed to post location: ${error.message}`);
  }
}

export async function getSafetyScore(touristId) {
  try {
    const r = await api.get(`/v1/safety-score/${touristId}`);
    return r.data;
  } catch (error) {
    throw new Error(`Failed to get safety score: ${error.message}`);
  }
}

export default api;
