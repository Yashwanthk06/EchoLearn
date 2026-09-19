import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Home, BookOpen, Gift, MessageSquare, ClipboardCheck, AlertTriangle, Map, TrendingUp, Users, Zap } from 'lucide-react';
import { useEchoPoints } from '../../hooks/useMockData';

const navItems = [
  { label: 'Home', icon: Home, route: '/dashboard' },
  { label: 'Learn', icon: BookOpen, route: '/learn' },
  { label: 'Rewards Store', icon: Gift, route: '/rewards' },
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
  const { balance } = useEchoPoints();
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-[#161d26] border-r border-slate-200 dark:border-[#2f3a46] h-screen fixed left-0 top-0 z-20">
        <div className="flex items-center gap-2 px-6 py-5">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-xl font-bold">
            <span className="text-primary">Echo</span>
            <span className="text-slate-900 dark:text-[#e7e9ea]">Learn</span>
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
                      ? 'bg-primary-50 dark:bg-[#12352a] text-primary border-l-2 border-primary'
                      : 'text-slate-500 dark:text-[#9aa3ad] hover:bg-slate-50 dark:hover:bg-[#242d38] hover:text-slate-900 dark:hover:text-[#e7e9ea]'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-[#2f3a46] mt-auto">
          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-[#2b2a1d] rounded-lg border border-amber-100 dark:border-[#4a4426]">
            <div className="flex items-center gap-2 text-amber-600 font-medium">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-sm">EchoPoints</span>
            </div>
            <span className="font-bold text-amber-700 dark:text-amber-400">{balance.toLocaleString()}</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#161d26] border-t border-slate-200 dark:border-[#2f3a46] z-30 pb-safe">
        <div className="flex justify-around items-center h-16 px-2 overflow-x-auto">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.route}
                to={item.route}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                    isActive ? 'text-primary' : 'text-slate-500 dark:text-[#9aa3ad]'
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
