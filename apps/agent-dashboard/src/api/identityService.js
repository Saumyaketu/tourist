// src/api/identityService.js

/*
 * A centralized API client for all interactions with the backend identity service.
 */

const API_BASE_URL = '/v1';

/*
 * Registers a new tourist with the identity service.
 * @param {object} touristData - The data for the new tourist.
 * @returns {Promise<object>} The response data from the API.
 */
export const registerTourist = async (touristData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(touristData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error registering tourist:', error);
    throw error;
  }
};

/*
 * Fetches a list of all registered tourists from the identity service.
 * @returns {Promise<Array<object>>} A list of tourist data.
 */
export const fetchTourists = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tourists`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching tourists:', error);
    throw error;
  }
};
