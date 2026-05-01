import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isCollapsed ? "lg:ml-20" : "lg:ml-80"
      )}>
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-20 px-6 md:px-10 lg:px-16 max-w-[1920px] mx-auto w-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
