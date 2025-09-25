// src/pages/CreateTouristID.jsx

import React, { useState } from 'react';
import { registerTourist } from '../api/identityService';

// Form component for creating a new Tourist ID
const CreateTouristID = () => {
  const [formData, setFormData] = useState({
    name: '',
    kycPayload: '',
    itinerary: '',
    contact: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    const payload = {
      name: formData.name,
      kycPayload: formData.kycPayload,
      itinerary: formData.itinerary,
      contact: formData.contact,
    };

    try {
      const data = await registerTourist(payload);
      setStatus(`Success! Tourist ID created: ${data.touristRef}`);
      setFormData({ name: '', kycPayload: '', itinerary: '', contact: '' });
    } catch (error) {
      console.error('Error creating tourist ID:', error);
      setStatus(`Error: Failed to create ID. Please check the service is running. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Tourist ID</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tourist Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>
        <div>
          <label htmlFor="kycPayload" className="block text-sm font-medium text-gray-700 mb-1">KYC Details (e.g., Aadhaar/Passport)</label>
          <textarea
            id="kycPayload"
            name="kycPayload"
            rows="4"
            value={formData.kycPayload}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          ></textarea>
        </div>
        <div>
          <label htmlFor="itinerary" className="block text-sm font-medium text-gray-700 mb-1">Trip Itinerary</label>
          <textarea
            id="itinerary"
            name="itinerary"
            rows="4"
            value={formData.itinerary}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          ></textarea>
        </div>
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Emergency Contacts</label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Creating ID...' : 'Create Digital ID'}
        </button>
      </form>
      {status && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default CreateTouristID;
