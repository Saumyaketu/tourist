import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AlertTable from '../components/AlertTable';
import api from '../api/client';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/alerts');
      setAlerts(response.data.items);
      setError(null);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to fetch alerts.');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Poll for new alerts every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 bg-gray-100 min-h-screen">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Alerts Dashboard</h1>
          {loading && <p>Loading alerts...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && <AlertTable alerts={alerts} refreshData={fetchAlerts} />}
        </main>
      </div>
    </div>
  );
};

export default AlertsPage;