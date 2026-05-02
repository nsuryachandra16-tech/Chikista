import React, { useState } from 'react';
import { Bell, Search, Menu, Moon, Sun, Search as SearchIcon, X, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchablePages = [
    { title: 'Dashboard', url: '/dashboard', desc: 'Main clinical control panel' },
    { title: 'AI Health Check', url: '/health-check', desc: 'Scan symptoms instantly' },
    { title: 'Diagnostic Reports', url: '/reports', desc: 'View medical files & logs' },
    { title: 'Analytics Hub', url: '/analytics', desc: 'Clinical trends & charts' },
    { title: 'Nearby Care', url: '/nearby-care', desc: 'Find local clinics & hospitals' },
    { title: 'Medicine Search', url: '/medicine-search', desc: 'Search medicines & dosages' },
    { title: 'Disease Info', url: '/disease-info', desc: 'Browse health conditions' },
    { title: 'Pro Scan', url: '/pro-scan', desc: 'Advanced diagnostics' },
    { title: 'Medications', url: '/medications', desc: 'Manage your pill schedules' },
    { title: 'Appointments', url: '/appointments', desc: 'Schedule doctor visits' },
    { title: 'Clinical Journal', url: '/journal', desc: 'Log your daily symptoms' },
    { title: 'About Us & Visionaries', url: '/about', desc: 'The team behind Chikitsa' },
    { title: 'FAQ Help Center', url: '/faq', desc: 'Got questions? We have answers' },
    { title: 'Subscription tier', url: '/subscription', desc: 'Upgrade your health plan' },
    { title: 'Account Settings', url: '/settings', desc: 'Preferences and profiles' }
  ];

  const filteredPages = searchablePages.filter(p => 
    searchQuery && (
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [lastCheck, setLastCheck] = useState(Date.now());

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('chikitsa_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > notifications.length && notifications.length > 0) {
          setHasNew(true);
        }
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const checkDueMedications = async () => {
    if (user?.subscription_tier !== 'pro') return;
    
    try {
      const res = await fetch('/api/medications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('chikitsa_token')}`
        }
      });
      if (res.ok) {
        const meds = await res.json();
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        
        const dueMeds = meds.filter(m => m.active && m.notifications_enabled && m.time === timeStr);
        
        for (const med of dueMeds) {
          // Only notify once per minute
          const notofiedKey = `notified_${med.id}_${timeStr}`;
          if (!sessionStorage.getItem(notofiedKey)) {
            // Create notification in DB
            await fetch('/api/notifications', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('chikitsa_token')}`
              },
              body: JSON.stringify({
                title: 'Clinical Reminder',
                message: `Time to take your ${med.name} (${med.dosage}).`
              })
            });
            sessionStorage.setItem(notofiedKey, 'true');
            
            // Local Browser Notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Chikitsa Reminder", {
                body: `Time for ${med.name}`,
                icon: "/pill.png"
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to check meds:', err);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
      const nInterval = setInterval(fetchNotifications, 15000);
      
      const mInterval = setInterval(checkDueMedications, 30000); // Check every 30s
      
      return () => {
        clearInterval(nInterval);
        clearInterval(mInterval);
      };
    }
  }, [user]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setHasNew(false);
  };

  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-10 glass-morphism sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 lg:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center gap-3 px-4 h-11 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 w-72 focus-within:w-96 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all group relative">
          <SearchIcon size={18} className="text-slate-400 group-focus-within:text-medical-500" />
          <input 
            type="text" 
            placeholder="Search symptoms, meds..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-500"
          />

          <AnimatePresence>
            {isSearchFocused && filteredPages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-12 left-0 w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
              >
                {filteredPages.map((p) => (
                  <button
                    key={p.url}
                    onClick={() => {
                      navigate(p.url);
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex flex-col gap-0.5 border-b border-slate-50 dark:border-slate-800/40 last:border-0"
                  >
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">{p.title}</span>
                    <span className="text-xs font-medium text-slate-400">{p.desc}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 text-slate-500 hover:text-medical-600 dark:hover:text-medical-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="p-2.5 text-slate-500 hover:text-medical-600 dark:hover:text-medical-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative"
          >
            <Bell size={20} />
            {(notifications.length > 0 || hasNew) && (
              <span className={cn(
                "absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-colors",
                hasNew ? "bg-red-500 animate-pulse" : "bg-medical-500"
              )} />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden"
                >
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-black text-sm tracking-tight">Notifications</h3>
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-[10px] font-black text-medical-600 uppercase tracking-widest hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-50 dark:border-slate-800 grid grid-cols-[auto_1fr] gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          n.type === 'success' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                          n.type === 'warning' ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" : "bg-medical-50 dark:bg-medical-900/20 text-medical-600"
                        )}>
                          {n.type === 'success' ? <CheckCircle2 size={20} /> : n.type === 'warning' ? <AlertTriangle size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1 uppercase">
                            <Clock size={10} /> {n.time}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-10 text-center space-y-3">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
                          <Bell size={20} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 text-center">
                      <button className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">See all notifications</button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black tracking-tight">{user?.name}</p>
            {user?.subscription_tier === 'pro' && (
              <p className="text-[10px] font-bold text-medical-600 uppercase tracking-widest leading-none">Pro User</p>
            )}
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-medical-500/20 ring-4 ring-slate-50 dark:ring-slate-900">
            {user?.name?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
}
