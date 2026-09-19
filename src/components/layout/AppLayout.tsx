import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ParticlesBg } from '../ui/particles-bg';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0f1419]">
      {/* Global particles background — z-0, pointer-events-none, behind everything */}
      <ParticlesBg particleCount={50} connectionDistance={120} />

      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen pb-16 lg:pb-0">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
