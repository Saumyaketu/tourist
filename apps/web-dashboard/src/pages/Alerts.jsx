import React, { useEffect, useState } from "react";
import AlertTable from "../components/AlertTable";
import { getAlerts, acknowledgeAlert } from "../api/client";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await getAlerts();
      if (mounted) setAlerts(res.items || []);
    }
    load();
    const t = setInterval(load, 5000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  async function onAck(id) {
    try {
      await acknowledgeAlert(id);
      setAlerts((s) => s.filter((a) => a.id !== id));
    } catch (e) {
      alert("Failed to acknowledge");
    }
  }

  return (
    <div>
      <h2>Alerts</h2>
      <AlertTable alerts={alerts} onAcknowledge={onAck} />
    </div>
  );
}
