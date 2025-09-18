import React, { useEffect, useState } from "react";
import MapView from "../components/MapView";
import AlertTable from "../components/AlertTable";
import { getAlerts, getTourists } from "../api/client";

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [tourists, setTourists] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const alertsRes = await getAlerts();
        setAlerts(alertsRes.items || []);
      } catch (e) {
        console.warn("load alerts failed", e);
      }
      try {
        const t = await getTourists();
        setTourists(t.items || []);
      } catch (e) {
        console.warn("load tourists failed", e);
      }
    }
    load();
    const t = setInterval(load, 7000); // refresh
    return () => clearInterval(t);
  }, []);

  const markers = alerts.map((a) => ({
    id: a.id,
    lat: a.location?.lat || 0,
    lon: a.location?.lon || 0,
    title: a.type,
    body: `${a.severity} — ${a.timestamp}`
  }));

  return (
    <div className="dashboard">
      <h2>Overview</h2>

      <div className="row">
        <div className="col-8">
          <MapView markers={markers} center={[26.1445, 91.7362]} zoom={7} />
        </div>
        <div className="col-4">
          <div className="card">
            <h3>Telemetry</h3>
            <p>Total alerts: {alerts.length}</p>
            <p>Active tourists: {tourists.length}</p>
          </div>
          <AlertTable alerts={alerts.slice(0, 6)} />
        </div>
      </div>
    </div>
  );
}
