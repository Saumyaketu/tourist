import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <ul>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
            Overview
          </NavLink>
        </li>
        <li>
          <NavLink to="/alerts" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
            Alerts
          </NavLink>
        </li>
        <li>
          <NavLink to="/tourists" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
            Tourists
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? "side-link active" : "side-link")}>
            Settings
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}
