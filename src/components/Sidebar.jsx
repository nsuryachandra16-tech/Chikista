import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  ClipboardList, 
  LineChart, 
  MapPin, 
  Pill, 
  Bug, 
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
  NotebookPen,
  Info,
  HelpCircle,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const sections = [
  {
    title: 'MAIN',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Stethoscope, label: 'Health Check', path: '/health-check' },
      { icon: ClipboardList, label: 'Reports', path: '/reports' },
      { icon: NotebookPen, label: 'Journal', path: '/journal' },
    ]
  },
  {
    title: 'HEALTH STREAM',
    items: [
      { icon: LineChart, label: 'Vitals & Metrics', path: '/analytics' },
      { icon: ShieldCheck, label: 'Medications', path: '/medications' },
      { icon: CalendarDays, label: 'Appointments', path: '/appointments' },
    ]
  },
  {
    title: 'DISCOVERY',
    items: [
      { icon: MapPin, label: 'Nearby Care', path: '/nearby-care' },
      { icon: Pill, label: 'Medicine Search', path: '/medicine-search' },
      { icon: Bug, label: 'Disease Info', path: '/disease-info' },
    ]
  },
  {
    title: 'INFO',
    items: [
      { icon: Info, label: 'About Us', path: '/about' },
      { icon: HelpCircle, label: 'FAQ', path: '/faq' },
      { icon: Crown, label: 'Subscription', path: '/subscription' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ]
  }
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform lg:translate-x-0",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        isCollapsed ? "w-20" : "w-80"
      )}>
        <div className="h-full flex flex-col">
          {/* Brand & Toggle */}
          <div className={cn(
            "p-6 flex items-center justify-between",
            isCollapsed && "px-4 justify-center"
          )}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-medical-500/30">
                <Stethoscope size={22} strokeWidth={2.5} />
              </div>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400"
                >
                  Chikitsa
                </motion.span>
              )}
            </div>
            {!isCollapsed && (
              <button 
                onClick={onToggleCollapse}
                className="hidden lg:flex p-2 text-slate-400 hover:text-medical-500 hover:bg-medical-50 dark:hover:bg-medical-900/20 rounded-xl transition-all"
              >
                <PanelLeftClose size={18} />
              </button>
            )}
          </div>

          {isCollapsed && (
            <button 
              onClick={onToggleCollapse}
              className="hidden lg:flex mx-auto p-2 mb-4 text-slate-400 hover:text-medical-500 hover:bg-medical-50 dark:hover:bg-medical-900/20 rounded-xl transition-all"
            >
              <PanelLeftOpen size={20} />
            </button>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 overflow-y-auto space-y-8 py-4 no-scrollbar">
            {sections.map((section) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 text-[10px] font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-6 uppercase"
                  >
                    {section.title}
                  </motion.h3>
                )}
                <div className="space-y-1.5">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose && onClose()}
                        className={cn(
                          "flex items-center group px-4 py-3.5 rounded-[1.25rem] transition-all duration-300 relative overflow-hidden",
                          isActive 
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-white/5 ring-1 ring-slate-900/5 dark:ring-white/10" 
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100",
                          isCollapsed && "px-0 justify-center"
                        )}
                      >
                        <div className={cn(
                          "flex items-center gap-4 relative z-10",
                          isCollapsed && "gap-0"
                        )}>
                          <item.icon size={20} className={cn(
                            isActive ? "text-medical-400 dark:text-medical-600" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors",
                            isCollapsed && "scale-110"
                          )} />
                          {!isCollapsed && (
                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                          )}
                        </div>
                        {!isCollapsed && isActive && (
                          <motion.div 
                            layoutId="active-indicator"
                            className="ml-auto"
                          >
                            <div className="w-1.5 h-1.5 bg-medical-500 rounded-full" />
                          </motion.div>
                        )}
                        {isCollapsed && isActive && (
                          <div className="absolute inset-y-2 left-0 w-1 bg-medical-500 rounded-full" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile */}
          <div className={cn(
            "p-6 mt-auto",
            isCollapsed && "p-4 flex flex-col items-center gap-4"
          )}>
            {user && (
              <div className={cn(
                "flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800",
                isCollapsed && "p-0 bg-transparent border-none"
              )}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-medical-500 to-emerald-400 flex items-center justify-center text-white font-black uppercase shadow-lg shadow-medical-500/20">
                    {user.name?.[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{user.email.split('@')[0]}</p>
                  </div>
                )}
                {!isCollapsed && (
                  <button 
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                  >
                    <LogOut size={18} />
                  </button>
                )}
              </div>
            )}
            {isCollapsed && (
               <button 
                onClick={logout}
                className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
