// src/pages/ViewTouristIDs.jsx

import React, { useState, useEffect } from 'react';
import { fetchTourists } from '../api/identityService';

// Component to view all registered IDs
const ViewTouristIDs = () => {
    const [tourists, setTourists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getTourists = async () => {
            try {
                const fetchedTourists = await fetchTourists();
                setTourists(fetchedTourists);
            } catch (err) {
                console.error('Failed to fetch tourists:', err);
                setError('Failed to load tourist data.');
            } finally {
                setLoading(false);
            }
        };

        getTourists();
    }, []);

    if (loading) {
        return <div className="text-center text-lg text-gray-500 p-8">Loading tourist data...</div>;
    }

    if (error) {
        return <div className="text-center text-lg text-red-500 p-8">{error}</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">All Registered Tourist IDs</h2>
            {tourists.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tourist ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Itinerary
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Emergency Contact
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tourists.map((tourist, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {tourist.touristRef}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tourist.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tourist.itinerary}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tourist.contact}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500">No tourist IDs have been created yet.</p>
            )}
        </div>
    );
};

export default ViewTouristIDs;
