import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Home, BookOpen, MessageSquare, ClipboardCheck, AlertTriangle, Map, TrendingUp, Users, Zap } from 'lucide-react';

const navItems = [
  { label: 'Home', icon: Home, route: '/dashboard' },
  { label: 'Learn', icon: BookOpen, route: '/learn' },
  { label: 'Teach Back', icon: MessageSquare, route: '/teach-back' },
  { label: 'Assessment', icon: ClipboardCheck, route: '/assessment' },
  { label: 'My Gaps', icon: AlertTriangle, route: '/gaps' },
  { label: 'Learning Path', icon: Map, route: '/learning-path' },
  { label: 'Progress', icon: TrendingUp, route: '/progress' },
  { label: 'Parent Updates', icon: Users, route: '/parent-updates' },
];

const mobileNavItems = navItems.filter(item => 
  ['Home', 'Learn', 'Teach Back', 'Assessment', 'My Gaps', 'Progress'].includes(item.label)
);

export const Sidebar: React.FC = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-20">
        <div className="flex items-center gap-2 px-6 py-5">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span className="text-xl font-bold">
            <span className="text-indigo-500">Echo</span>
            <span className="text-slate-900">Learn</span>
          </span>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.route}
                to={item.route}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg mx-3 transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-500 border-l-2 border-indigo-500'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 mt-auto">
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 text-amber-600 font-medium">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-sm">EchoPoints</span>
            </div>
            <span className="font-bold text-amber-700">—</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 pb-safe">
        <div className="flex justify-around items-center h-16 px-2 overflow-x-auto">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.route}
                to={item.route}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                    isActive ? 'text-indigo-500' : 'text-slate-500'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};
