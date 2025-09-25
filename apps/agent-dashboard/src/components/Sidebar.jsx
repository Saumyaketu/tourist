// src/components/Sidebar.jsx

import React from 'react';

// Sidebar component for navigation
const Sidebar = ({ currentPage, setCurrentPage, isSidebarOpen, toggleSidebar }) => {
  const NavItem = ({ pageName, label, icon }) => (
    <button
      onClick={() => {
        setCurrentPage(pageName);
        toggleSidebar(); // Close sidebar after clicking on mobile
      }}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
        currentPage === pageName
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
      }`}
    >
      <span className="w-6 h-6">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <>
      {/* Overlay for mobile view */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar content */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-30 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">Agent Dashboard</h1>
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="mt-8 space-y-2 flex-1">
            <NavItem pageName="dashboard" label="Dashboard" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />
            <NavItem pageName="create-id" label="Create Tourist ID" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>} />
            <NavItem pageName="view-ids" label="View All IDs" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
