import React from "react";
import { formatTimestamp } from "../utils/formatters";

export default function AlertTable({ alerts = [], onAcknowledge = () => {} }) {
  return (
    <div className="card">
      <h3>Recent Alerts</h3>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Location</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 12 }}>
                  No alerts
                </td>
              </tr>
            )}
            {alerts.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.type}</td>
                <td>{a.severity}</td>
                <td>
                  {a.location?.lat?.toFixed(4)}, {a.location?.lon?.toFixed(4)}
                </td>
                <td>{formatTimestamp(a.timestamp)}</td>
                <td>
                  <button className="btn" onClick={() => onAcknowledge(a.id)}>
                    Acknowledge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
