// services/location-agent/src/controllers/locationController.js
const locationStore = require('../store/locationStore');

/**
 * GET /v1/locations/latest?touristId=ID
 * Fetches the latest known location for a given tourist.
 */
exports.getLatestLocation = function(req, res) {
    const touristId = req.query.touristId;

    if (!touristId) {
        return res.status(400).json({ error: 'touristId query parameter is required.' });
    }

    const locationData = locationStore.getLatestLocation(touristId);

    if (!locationData) {
        return res.status(404).json({ 
            error: `Location not found for touristId: ${touristId}`, 
            message: 'No recent location data available.'
        });
    }

    // Simulate sending back real location data
    return res.json({
        success: true,
        location: locationData,
        message: 'Latest location retrieved successfully.'
    });
};

// Expose a health endpoint (optional)
exports.healthz = function(req, res) {
    res.json({ ok: true, service: 'location-agent' });
};