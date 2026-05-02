import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  ArrowRight, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Search,
  Bell,
  Stethoscope,
  Heart,
  Droplets,
  Wind,
  Crown,
  ChevronRight,
  XCircle,
  BookOpen,
  FileText,
  Clock,
  ShieldCheck,
  Pill
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState(0);
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [newVital, setNewVital] = useState({ type: 'heart_rate', value: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const accepted = localStorage.getItem(`chikitsa_disclaimer_${user.id}`);
      if (!accepted) {
        setShowDisclaimer(true);
      }
    }
  }, [user]);

  const handleAcceptDisclaimer = () => {
    if (user?.id) {
      localStorage.setItem(`chikitsa_disclaimer_${user.id}`, 'true');
    }
    setShowDisclaimer(false);
  };

  const fetchData = async () => {
    const startTime = performance.now();
    
    try {
      const [reportsRes, notifsRes, healthRes, vitalsRes, notesRes, medsRes] = await Promise.all([
        authFetch('/api/reports'),
        authFetch('/api/notifications'),
        fetch('/api/health'),
        authFetch('/api/vitals'),
        authFetch('/api/notes'),
        authFetch('/api/medications')
      ]);

      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));

      if (reportsRes.ok) setReports(await reportsRes.json());
      if (notifsRes.ok) setNotifications(await notifsRes.json());
      if (vitalsRes.ok) setVitals(await vitalsRes.json());
      if (notesRes.ok) setNotes(await notesRes.json());
      if (medsRes.ok) setMedications(await medsRes.json());
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setDbStatus(healthData.database === 'connected' ? 'Active' : 'Offline');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setDbStatus('Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
    const interval = setInterval(fetchData, 60000); // Pulse every 1 min
    return () => clearInterval(interval);
  }, [user]);

  const handleLogVital = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch('/api/vitals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVital)
      });
      if (res.ok) {
        setShowLogModal(false);
        setNewVital({ type: 'heart_rate', value: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getLatestVital = (type) => {
    const latest = vitals.filter(v => v.type === type).pop();
    return latest ? latest.value : '--';
  };

  const stats = [
    { 
      label: 'Journal Entries', 
      value: notes.length, 
      icon: BookOpen, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      path: '/journal'
    },
    { 
      label: 'Saved Reports', 
      value: reports.length, 
      icon: FileText, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      path: '/reports'
    },
    { 
      label: 'Sync Status', 
      value: `${latency}ms`, 
      icon: ShieldCheck, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      path: '/settings'
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 max-w-xl w-full shadow-2xl relative overflow-hidden text-center flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 bg-medical-50 dark:bg-medical-950/30 text-medical-500 rounded-3xl flex items-center justify-center mb-2">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">
                Chikitsa <span className="text-medical-500">Notice</span>
              </h3>
              <p className="text-sm font-bold text-slate-500 max-w-sm">
                Chikitsa is designed to assist you in making informed decisions and saving money on healthcare costs. It is <span className="text-slate-900 dark:text-white underline">not a replacement</span> for professional medical advice or qualified doctors.
              </p>
              <button
                onClick={handleAcceptDisclaimer}
                className="w-full mt-2 px-8 py-5 bg-medical-500 hover:bg-medical-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                Accept & Proceed
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Header */}
      <section className="flex flex-col md:flex-row gap-8 justify-between items-start max-w-7xl mx-auto">
        <div className="space-y-3">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            Health <span className="text-medical-500">Pulse</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg max-w-xl">
             Welcome back, <span className="text-slate-900 dark:text-white">{user?.name}</span>. Your clinical telemetry is stable and synchronizing.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowLogModal(true)}
            className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
          >
            <Plus size={18} />
            Quick Vitals
          </button>
        </div>
      </section>

      {/* Metric Quick-View Banner */}
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative h-full"
          >
            <Link 
              to={stat.path}
              className="relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer group-hover:border-medical-500/50 group-hover:shadow-2xl group-active:scale-95 transition-all shadow-sm h-full"
            >
              <div className="flex items-center gap-6">
                <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-medical-500 group-hover:text-white transition-all shrink-0">
                <ArrowRight size={18} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* VitalStream Visualization */}
      <div className="max-w-7xl mx-auto w-full">
        <Card className="p-6 md:p-10 border-none bg-slate-900 text-white overflow-hidden relative shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center gap-10">
             <div className="sm:border-r border-slate-800 sm:pr-10">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 mb-2">
                   <Activity className="text-medical-400" />
                   VitalStream™
                </h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Telemetry Active</p>
             </div>
             
             <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Resting Heart Rate</p>
                <div className="flex items-baseline gap-2">
                   <span className={cn("text-5xl font-black min-w-[60px]", getLatestVital('heart_rate') !== '--' ? "text-rose-400" : "text-slate-800")}>
                     {getLatestVital('heart_rate')}
                   </span>
                   <span className="text-xs font-bold text-slate-600 uppercase">bpm</span>
                </div>
             </div>

             <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Plasma Glucose</p>
                <div className="flex items-baseline gap-2">
                   <span className={cn("text-5xl font-black min-w-[60px]", getLatestVital('glucose') !== '--' ? "text-emerald-400" : "text-slate-800")}>
                     {getLatestVital('glucose')}
                   </span>
                   <span className="text-xs font-bold text-slate-600 uppercase">mg/dL</span>
                </div>
             </div>

             <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Physical Mass</p>
                <div className="flex items-baseline gap-2">
                   <span className={cn("text-5xl font-black min-w-[60px]", getLatestVital('weight') !== '--' ? "text-sky-400" : "text-slate-800")}>
                     {getLatestVital('weight')}
                   </span>
                   <span className="text-xs font-bold text-slate-600 uppercase">kg</span>
                </div>
             </div>
          </div>
          
          {/* Background Decorative Grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#14b8a6 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-medical-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        </Card>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-7xl mx-auto w-full">
         <div 
            onClick={() => window.location.href = '/medications'}
            className="group relative bg-emerald-500 hover:bg-emerald-400 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-2xl shadow-emerald-500/10 overflow-hidden min-h-[250px] md:min-h-[280px]"
         >
            <div className="w-16 h-16 rounded-3xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors shadow-inner">
               <Plus size={32} className="text-white" />
            </div>
            <div className="relative z-10">
               <div className="space-y-1 mb-6">
                  <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em]">Active Prescriptions</p>
                  <p className="text-6xl font-black text-white tracking-tighter leading-none">
                     {medications?.filter(m => m.active).length || 0}
                  </p>
               </div>
               <h3 className="text-sm font-black text-white uppercase tracking-[0.4em]">Meds Hub</h3>
            </div>
            <div className="absolute top-0 right-0 p-10 opacity-10">
               <Pill size={150} className="text-white" />
            </div>
         </div>

         <div 
            onClick={() => window.location.href = '/analytics'}
            className="group relative bg-slate-900 hover:bg-slate-800 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-2xl shadow-black/20 border border-slate-800 overflow-hidden min-h-[250px] md:min-h-[280px]"
         >
            <div className="w-16 h-16 rounded-3xl bg-white/10 hover:bg-white/15 backdrop-blur-md flex items-center justify-center transition-colors shadow-inner">
               <TrendingUp size={32} className="text-white" />
            </div>
            <div className="relative z-10">
               <div className="space-y-1 mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Latest Health Metrics</p>
                  <div className="flex items-baseline gap-2">
                     <p className="text-6xl font-black text-white tracking-tighter leading-none">
                        {vitals && vitals.length > 0 ? vitals[vitals.length - 1].value : "0"}
                     </p>
                     <span className="text-xs font-bold text-slate-500 uppercase">{vitals && vitals.length > 0 ? vitals[vitals.length - 1].unit || '' : ''}</span>
                  </div>
               </div>
               <h3 className="text-sm font-black text-white uppercase tracking-[0.4em]">Trends</h3>
            </div>
            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
               <Activity size={150} className="text-white" />
            </div>
         </div>
      </div>

      {/* Main Feature Grid */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-10 max-w-7xl mx-auto">
        <div className="space-y-10">
          {/* Recent Journal Entries */}
          <Card 
            title="Clinical Journal" 
            subtitle="Latest patient reflections"
            headerAction={<Link to="/journal" className="text-xs font-black text-medical-600 uppercase tracking-widest hover:underline">Full Access</Link>}
          >
            <div className="grid gap-6">
              {notes.length > 0 ? notes.slice(0, 3).map((note, i) => (
                <div key={note.id} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-6 hover:scale-[1.01] transition-all group">
                  <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-medical-500 shadow-sm">
                    <BookOpen size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{note.title}</h4>
                      <span className="text-[9px] font-black uppercase text-slate-400">
                        {note.timestamp ? new Date(note.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-4">{note.content}</p>
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-medical-100 dark:bg-medical-900/30 text-medical-600 text-[9px] font-black uppercase tracking-widest rounded-full">{note.category}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center space-y-4">
                   <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200">
                      <BookOpen size={40} />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Silence in the journal</p>
                   <Link to="/journal" className="inline-block px-8 py-3 bg-medical-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Write First Entry</Link>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Tools */}
          <div className="grid md:grid-cols-2 gap-8">
             <Card title="Pharma Desk" subtitle="Verify medications" icon={Search}>
                <div className="space-y-4 pt-2">
                   <p className="text-sm text-slate-500 font-bold leading-relaxed">Cross-reference drugs with clinical databases via AI Intelligence Core.</p>
                   <Link to="/medicine-search" className="w-full h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-between px-6 hover:bg-medical-500 hover:text-white transition-all group">
                      <span className="text-xs font-black uppercase tracking-widest">Launch Search</span>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-white" />
                   </Link>
                </div>
             </Card>
             <Card title="Command Scan" subtitle="System Diagnostics" icon={Activity}>
                 <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database</span>
                       <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Online
                       </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Protocol</span>
                       <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">MySQL</span>
                    </div>
                 </div>
             </Card>
          </div>
        </div>

        {/* Sidebar Interactions */}
        <aside className="space-y-10">
          {/* Notifications Premium Card */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="font-black uppercase tracking-widest text-xs">Alerts & Intel</h3>
              <Bell size={20} className="text-medical-500" />
            </div>
            <div className="space-y-8 relative z-10">
              {notifications.length > 0 ? notifications.slice(0, 3).map((n, i) => (
                <div key={i} className="flex gap-5">
                   <div className="w-1.5 h-full min-h-[40px] bg-medical-500 rounded-full" />
                   <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{n.title}</h4>
                      <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">
                        {n.time ? new Date(n.time).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Just now'}
                      </p>
                   </div>
                </div>
              )) : (
                <div className="py-10 text-center opacity-40">
                   <Bell size={40} className="mx-auto mb-4 text-slate-300" />
                   <p className="text-[10px] font-black uppercase tracking-widest">All clear</p>
                </div>
              )}
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-medical-500/5 rounded-full blur-3xl pointer-events-none" />
          </div>
        </aside>
      </div>

      {/* Quick Vitals Modal Overlay */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowLogModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl p-12 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-2xl font-black uppercase tracking-tight">Register Vital</h2>
                 <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <XCircle size={32} />
                 </button>
              </div>
              
              <form onSubmit={handleLogVital} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transmission Stream</label>
                    <select 
                      value={newVital.type}
                      onChange={(e) => setNewVital({...newVital, type: e.target.value})}
                      className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-medical-500 outline-none appearance-none"
                    >
                      <option value="heart_rate">Heart Rate (bpm)</option>
                      <option value="weight">Body Mass (kg)</option>
                      <option value="glucose">Blood Glucose (mg/dL)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Numerical Value</label>
                    <input 
                      type="number" 
                      step="0.1"
                      autoFocus
                      value={newVital.value}
                      onChange={(e) => setNewVital({...newVital, value: e.target.value})}
                      placeholder="0.0"
                      className="w-full h-20 px-8 bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] text-3xl font-black focus:ring-4 focus:ring-medical-500/10 outline-none"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full py-6 bg-medical-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-medical-500/20 hover:bg-medical-600 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {saving ? 'Transmitting...' : 'Commit to Database'}
                  </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
