// src/components/Navbar.jsx

import React from 'react';

// The top navigation bar, primarily for mobile sidebar toggling
const Navbar = ({ toggleSidebar }) => (
  <header className="bg-white shadow p-4 md:hidden flex justify-between items-center z-10">
    <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 rounded-md p-1">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <h1 className="text-xl font-bold text-gray-800">Agent Dashboard</h1>
  </header>
);

export default Navbar;
