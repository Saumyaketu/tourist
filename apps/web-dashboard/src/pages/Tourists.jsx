import React, { useEffect, useState } from "react";
import { getTourists } from "../api/client";

export default function Tourists() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const r = await getTourists();
        setItems(r.items || []);
      } catch (e) {
        console.warn(e);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h2>Registered Tourists</h2>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Ref</th><th>Name</th><th>Valid Till</th><th>Contact</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan="4">No registered tourists</td></tr>}
            {items.map((t) => (
              <tr key={t.id}>
                <td>{t.touristRef || t.id}</td>
                <td>{t.name || "—"}</td>
                <td>{t.validTill || "—"}</td>
                <td>{t.contact?.phone || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
