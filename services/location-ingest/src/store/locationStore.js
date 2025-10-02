// services/location-agent/src/store/locationStore.js
const latestLocations = new Map();

// Helper to simulate a tourist reporting location
// For testing, call this from a mock endpoint or script
function simulateLocationUpdate(touristId, lat = 34.0522, lon = -118.2437) {
  const data = {
    touristId,
    latitude: lat + (Math.random() - 0.5) * 0.01,
    longitude: lon + (Math.random() - 0.5) * 0.01,
    timestamp: new Date().toISOString(),
    accuracy: 10
  };
  latestLocations.set(touristId, data);
  return data;
}

// Ensure at least one mock location exists for testing
simulateLocationUpdate('T-mg935j83-z1tavg');
simulateLocationUpdate('T-TEST-CURL', 35.6895, 139.6917); 


function getLatestLocation(touristId) {
  return latestLocations.get(touristId) || null;
}

module.exports = { getLatestLocation, simulateLocationUpdate };