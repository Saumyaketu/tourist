import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useContext(AuthContext);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="logo">TouristSafety</div>
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Dashboard
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Alerts
          </NavLink>
          <NavLink to="/tourists" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Tourists
          </NavLink>
        </nav>
      </div>

      <div className="navbar-right">
        <span className="user">Admin{user ? ` — ${user.name || ""}` : ""}</span>
        <button className="btn small" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    </header>
  );
}
