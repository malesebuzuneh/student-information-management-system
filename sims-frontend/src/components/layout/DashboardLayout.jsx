'use client';

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar />
      <div className="flex overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-x-hidden max-w-full">
          <div className="max-w-full overflow-x-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;