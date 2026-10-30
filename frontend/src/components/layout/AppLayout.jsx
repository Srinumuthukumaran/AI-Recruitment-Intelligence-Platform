import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import ResponsibleAIBanner from '../common/ResponsibleAIBanner';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="min-h-screen bg-[#080B16] text-[#F8FAFC] flex flex-col font-sans">
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="flex flex-1 w-full relative">
        <Sidebar
          isOpen={isSidebarOpen}
          closeSidebar={closeSidebar}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />

        {/* Main Content Area with Dynamic Padding */}
        <main
          className={`flex-1 ${
            isCollapsed ? 'md:pl-20' : 'md:pl-64'
          } flex flex-col min-w-0 transition-all duration-300`}
        >
          <div className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-1 flex flex-col">
            <ResponsibleAIBanner />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
