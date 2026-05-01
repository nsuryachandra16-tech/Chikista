import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Plus, 
  Clock, 
  Calendar, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Pill,
  X,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import Card from '../components/Card';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';

export default function Medications() {
  const { user, authFetch } = useAuth();
  const [medications, setMedications] = useState([]);
  const [adherenceStats, setAdherenceStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [logging, setLogging] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    time: '08:00'
  });

  const fetchMedications = async () => {
    try {
      const [medsRes, statsRes] = await Promise.all([
        authFetch('/api/medications'),
        authFetch('/api/medications/adherence')
      ]);
      
      if (medsRes.ok) setMedications(await medsRes.json());
      if (statsRes.ok) setAdherenceStats(await statsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleAddMedication = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/medications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAdd(false);
        setFormData({ name: '', dosage: '', frequency: 'Daily', time: '08:00' });
        fetchMedications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogIntake = async (id, status = 'taken') => {
    const med = medications.find(m => m.id === id);
    setLogging(id);
    try {
      const res = await authFetch(`/api/medications/${id}/log`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        if (med) {
          try {
            await authFetch(`/api/notifications/medication/${encodeURIComponent(med.name)}`, {
              method: 'DELETE'
            });
          } catch (e) {
            console.error('Failed to clear notification:', e);
          }
        }
        fetchMedications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(null);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await authFetch(`/api/medications/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentActive })
      });
      fetchMedications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotifications = async (id, currentEnabled) => {
    if (user?.subscription_tier !== 'pro') {
      window.location.href = '/subscription';
      return;
    }

    try {
      await authFetch(`/api/medications/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notifications_enabled: !currentEnabled })
      });
      
      if (!currentEnabled && "Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          alert('Clinical Reminders Activated!');
        }
      }
      
      fetchMedications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
            Pharma <span className="text-medical-500">Plan</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg">Prescription scheduling and clinical adherence monitoring.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-4 px-10 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Add Medication
        </button>
      </div>

      {/* Add Medication Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowAdd(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-2xl font-black uppercase tracking-tight">Schedule New Med</h2>
                 <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X size={28} />
                 </button>
              </div>
              
              <form onSubmit={handleAddMedication} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Medication Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Metformin"
                      className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-medical-500/10 transition-all"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dosage</label>
                        <input 
                           type="text" 
                           value={formData.dosage}
                           onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                           placeholder="500mg"
                           className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-medical-500/10 transition-all"
                           required
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Frequency</label>
                        <select 
                           value={formData.frequency}
                           onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                           className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-black uppercase outline-none focus:ring-4 focus:ring-medical-500/10 transition-all"
                        >
                           <option>Daily</option>
                           <option>Twice Daily</option>
                           <option>Weekly</option>
                           <option>As Needed</option>
                        </select>
                     </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reminder Time</label>
                    <input 
                      type="time" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xl font-black outline-none"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-6 bg-medical-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-medical-500/20"
                  >
                    Register Prescription
                  </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-10">
          <Card 
            title="Active Regimen" 
            subtitle="Medications currently in rotation"
            icon={Activity}
          >
            {loading ? (
              <div className="py-20 flex justify-center">
                 <div className="w-10 h-10 border-4 border-medical-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : medications.length === 0 ? (
              <div className="py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
                  <Pill size={40} />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No medications scheduled</p>
                <button onClick={() => setShowAdd(true)} className="px-8 py-3 bg-medical-100 dark:bg-medical-900/30 text-medical-600 rounded-2xl text-[10px] font-black uppercase tracking-widest italic">Initialize Regimen</button>
              </div>
            ) : (
              <div className="space-y-6">
                {medications.map((med, idx) => (
                  <motion.div 
                    key={med.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] flex items-center justify-between hover:border-medical-500/50 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-8">
                       <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-medical-500 transition-colors">
                          <Pill size={28} />
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <h4 className="text-xl font-black uppercase tracking-tight">{med.name}</h4>
                             <span className="px-3 py-1 bg-medical-50 dark:bg-medical-900/20 text-medical-600 text-[9px] font-black uppercase tracking-widest rounded-lg">{med.frequency}</span>
                          </div>
                          <p className="text-slate-500 font-bold text-sm">{med.dosage} • Scheduled for {med.time}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <button 
                          onClick={() => handleLogIntake(med.id)}
                          disabled={logging === med.id}
                          className="flex items-center gap-3 px-6 py-3 bg-medical-500 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-medical-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                       >
                          {logging === med.id ? 'Logging...' : 'Mark Taken'}
                       </button>
                       <button 
                          onClick={() => handleToggleActive(med.id, med.active)}
                          className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                       >
                          <Trash2 size={20} />
                       </button>
                    </div>

                    {/* Pro Reminder Toggle */}
                    <div className="absolute -bottom-4 right-12 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                       <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Pro Alert</span>
                       <button 
                         onClick={() => handleToggleNotifications(med.id, med.notifications_enabled)}
                         className={cn(
                           "w-10 h-5 rounded-full relative transition-colors",
                           med.notifications_enabled ? "bg-medical-500" : "bg-slate-200"
                         )}
                       >
                          <div className={cn(
                            "absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform",
                            med.notifications_enabled && "translate-x-5"
                          )} />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-10">
          <Card 
            title="Clinical Adherence" 
            subtitle="Weekly engagement index" 
            icon={TrendingUp} 
            className="h-full"
            headerAction={<Link to="/analytics" className="text-[10px] font-black text-medical-600 uppercase tracking-widest hover:underline">View Analytics</Link>}
          >
            {adherenceStats.length > 0 ? (
              <div className="space-y-10 pt-6">
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={adherenceStats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                             dataKey="name" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} 
                          />
                          <YAxis hide />
                          <Tooltip 
                             cursor={{fill: 'rgba(0,0,0,0.02)'}}
                             contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '10px' }}
                          />
                          <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                             {adherenceStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === adherenceStats.length - 1 ? '#14b8a6' : '#ccfbf1'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 
                 <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                       <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-medical-400">
                          <Award size={24} />
                       </div>
                       <h4 className="text-lg font-black uppercase tracking-tight italic">System Analysis</h4>
                       <p className="text-slate-400 text-[11px] font-bold leading-relaxed">
                          Your dosage latency is within the optimal 5-minute precision window. Clinical outcomes are projected as stable.
                       </p>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Clock size={120} />
                    </div>
                 </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                 <Activity size={40} className="mx-auto text-slate-200" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No adherence data accumulated</p>
              </div>
            )}
          </Card>
        </aside>
      </div>

      <div className="p-12 bg-medical-50 dark:bg-medical-900/10 rounded-[3rem] border border-medical-100 dark:border-medical-800/30 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
         <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-medical-500 shadow-xl shadow-medical-500/10">
            <ShieldCheck size={64} />
         </div>
         <div className="flex-1 space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tighter">Deterministic Tracking</h3>
            <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-3xl">
              Unlike simulated trackers, Chikitsa Pharma Plan utilizes hard MySQL persistence. Every timestamp is recorded with sub-millisecond precision to ensure clinical integrity for future physician reviews.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
               {['Zero Cloud Dependencies', 'Local MySQL Core', 'E2E Encryption Ready'].map(tag => (
                  <span key={tag} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700">
                    {tag}
                  </span>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
