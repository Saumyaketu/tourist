import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Tourists from "./pages/Tourists";
import Settings from "./pages/Settings";

import { AuthProvider } from "./context/AuthContext";
import "./styles/dashboard.css";

export default function App() {
  return (
    <AuthProvider>
      <div className="app-root">
        <Navbar />
        <div className="app-body">
          <Sidebar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/tourists" element={<Tourists />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
