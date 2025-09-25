// src/App.jsx

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateTouristID from './pages/CreateTouristID';
import ViewTouristIDs from './pages/ViewTouristIDs';

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to toggle sidebar visibility on small screens
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Main layout of the application
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          {/* Use a switch statement for simple page routing */}
          {(() => {
            switch (currentPage) {
              case 'dashboard':
                return <Dashboard />;
              case 'create-id':
                return <CreateTouristID />;
              case 'view-ids':
                return <ViewTouristIDs />;
              default:
                return <Dashboard />;
            }
          })()}
        </main>
      </div>
    </div>
  );
};

export default App;
