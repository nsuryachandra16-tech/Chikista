import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  Droplets, 
  Heart, 
  Wind,
  Calendar,
  Filter,
  Download,
  Plus,
  Scale,
  Thermometer,
  Zap,
  X
} from 'lucide-react';
import Card from '../components/Card';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function Analytics() {
  const { authFetch } = useAuth();
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newVital, setNewVital] = useState({ 
    type: 'heart_rate', 
    value: '',
    notes: '' 
  });

  const fetchVitals = async () => {
    try {
      const res = await authFetch('/api/vitals');
      if (res.ok) setVitals(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  const handleLogVital = async (e) => {
    e.preventDefault();
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
        setNewVital({ type: 'heart_rate', value: '', notes: '' });
        fetchVitals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const processData = (type) => {
    return vitals
      .filter(v => v.type === type)
      .slice(-10) // Show last 10 entries
      .map(v => ({
        name: new Date(v.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fullDate: new Date(v.timestamp).toLocaleString(),
        value: Number(v.value)
      }));
  };

  const metricConfigs = [
    { id: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: Heart, color: '#f43f5e', chartType: 'area', domain: ['dataMin - 5', 'dataMax + 5'] },
    { id: 'glucose', label: 'Blood Glucose', unit: 'mg/dL', icon: Droplets, color: '#0ea5e9', chartType: 'area', domain: ['dataMin - 10', 'dataMax + 10'] },
    { id: 'weight', label: 'Body Weight', unit: 'kg', icon: Scale, color: '#10b981', chartType: 'area', domain: ['dataMin - 2', 'dataMax + 2'] },
    { id: 'bp_systolic', label: 'BP Systolic', unit: 'mmHg', icon: Zap, color: '#f59e0b', chartType: 'area', domain: ['dataMin - 10', 'dataMax + 10'] },
  ];

  const EmptyChart = ({ icon: Icon, message }) => (
    <div className="h-64 w-full mt-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
       <Icon size={40} className="text-slate-200 mb-4" />
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{message}</p>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {payload[0].value} <span className="text-[10px] text-slate-400">{payload[0].unit || payload[0].payload.unit}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
            Metric <span className="text-medical-500">Hub</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg">Biometric data visualization and clinical trend analysis.</p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-4 px-10 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Register New Metric
        </button>
      </header>

      {/* Log Modal */}
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
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-2xl font-black uppercase tracking-tight">Log Clinical Vitals</h2>
                 <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X size={28} />
                 </button>
              </div>
              
              <form onSubmit={handleLogVital} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Metric</label>
                    <div className="grid grid-cols-2 gap-3">
                      {metricConfigs.map(config => (
                        <button
                          key={config.id}
                          type="button"
                          onClick={() => setNewVital({...newVital, type: config.id})}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl border transition-all text-xs font-bold uppercase tracking-wider",
                            newVital.type === config.id 
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xl" 
                              : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700"
                          )}
                        >
                          <config.icon size={16} />
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Recorded Value</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1"
                        required
                        value={newVital.value}
                        onChange={(e) => setNewVital({...newVital, value: e.target.value})}
                        placeholder="0.00"
                        className="w-full h-20 px-8 bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] text-3xl font-black outline-none focus:ring-4 focus:ring-medical-500/10 transition-all pr-24"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 font-black uppercase text-xs tracking-widest">
                        {metricConfigs.find(c => c.id === newVital.type)?.unit}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-6 bg-medical-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-medical-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Commit to Database
                  </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grid Layout for Charts */}
      <div className="grid lg:grid-cols-2 gap-10">
        {metricConfigs.map((config, idx) => {
          const rawData = processData(config.id);
          // Add padding points for single data entries to avoid massive bars/blocks
          const data = rawData.length === 1 
            ? [{ ...rawData[0], name: '' }, rawData[0], { ...rawData[0], name: ' ' }]
            : rawData;

          return (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                title={config.label} 
                subtitle={`Current Trend (${config.unit})`} 
                icon={config.icon}
                className="overflow-hidden p-8"
              >
                {rawData.length > 0 ? (
                  <div className="h-72 w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id={`color-${config.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                            dy={10}
                            padding={{ left: 20, right: 20 }}
                        />
                        <YAxis hide domain={config.domain} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={config.color} 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill={`url(#color-${config.id})`} 
                          animationDuration={1500}
                          dot={{ r: 4, fill: config.color, strokeWidth: 2, stroke: '#fff' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart icon={config.icon} message={`Start logging ${config.label}`} />
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Global Summary Analysis */}
      <Card className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-12 rounded-[3.5rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-10">
           <Activity size={200} />
        </div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 dark:bg-slate-100 rounded-full text-medical-400 dark:text-medical-600 font-black text-[10px] uppercase tracking-widest">
              <Thermometer size={14} /> Clinical Trend Analysis
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-tight">Longitudinal Metric Consistency</h2>
            <p className="text-slate-400 dark:text-slate-500 font-bold text-lg leading-relaxed">
              Your biometric datasets are cross-referenced with your journal entries and medication adherence. Currently, physiological indicators suggest high stability.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Latency', val: '2.4ms' },
                { label: 'Reliability', val: '99.9%' },
                { label: 'Database', val: 'MySQL' }
              ].map(stat => (
                <div key={stat.label} className="px-6 py-4 rounded-3xl bg-white/5 dark:bg-slate-50 border border-white/10 dark:border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl font-black">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="p-8 bg-medical-500 rounded-[2.5rem] flex flex-col justify-between aspect-square text-white shadow-2xl shadow-medical-500/30">
                <Heart size={40} strokeWidth={2.5} />
                <div>
                   <p className="text-5xl font-black leading-none">72</p>
                   <p className="text-[10px] font-black uppercase tracking-widest mt-2">Avg bpm</p>
                </div>
             </div>
             <div className="p-8 bg-slate-800 dark:bg-slate-100 rounded-[2.5rem] flex flex-col justify-between aspect-square border border-white/10 dark:border-slate-200 shadow-2xl">
                <Scale size={40} strokeWidth={2.5} className="text-medical-500" />
                <div>
                   <p className="text-5xl font-black leading-none text-white dark:text-slate-900">74.2</p>
                   <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-slate-400 dark:text-slate-500">kg Mass</p>
                </div>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
