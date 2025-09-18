import React, { useState } from "react";

export default function Settings() {
  const [apiBase, setApiBase] = useState(localStorage.getItem("apiBase") || "");

  function save() {
    localStorage.setItem("apiBase", apiBase);
    alert("Saved");
  }

  return (
    <div>
      <h2>Settings</h2>
      <div className="card">
        <label>API Base URL</label>
        <input value={apiBase} onChange={(e) => setApiBase(e.target.value)} placeholder="http://localhost:4000" />
        <div style={{ marginTop: 10 }}>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
