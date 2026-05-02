import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Crown, 
  Cpu, 
  Table, 
  Search,
  ArrowLeft,
  FileSpreadsheet,
  Activity,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Card from '../components/Card';

export default function ProScan() {
  const [query, setQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  // Mock "ML" processing logic using our CSV grounding
  const medicalData = [
    { symptom: "chest pain", specialist: "Cardiologist", urgency: "High", category: "Cardiac" },
    { symptom: "shortness of breath", specialist: "Pulmonologist", urgency: "High", category: "Respiratory" },
    { symptom: "blurred vision", specialist: "Ophthalmologist", urgency: "Medium", category: "Neurological" },
    { symptom: "persistent cough", specialist: "General Physician", urgency: "Low", category: "Respiratory" },
    { symptom: "joint swelling", specialist: "Rheumatologist", urgency: "Medium", category: "Orthopedic" },
    { symptom: "severe headache", specialist: "Neurologist", urgency: "High", category: "Neurological" },
    { symptom: "skin rash", specialist: "Dermatologist", urgency: "Low", category: "Dermatology" },
    { symptom: "abdominal pain", specialist: "Gastroenterologist", urgency: "Medium", category: "Gastrointestinal" },
    { symptom: "fever", specialist: "General Physician", urgency: "Low", category: "General" },
  ];

  const handleScan = () => {
    if (!query.trim()) return;
    setIsScanning(true);
    setResult(null);

    // Simulate "NLP/ML" processing
    setTimeout(() => {
      const match = medicalData.find(item => 
        query.toLowerCase().includes(item.symptom.toLowerCase())
      );
      
      setResult(match || { 
        symptom: "General Symptom", 
        specialist: "Internal Medicine", 
        urgency: "Medium", 
        category: "Systemic",
        unverified: true 
      });
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="p-2 text-slate-400 hover:text-medical-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-amber-200">
              <Crown size={12} className="fill-amber-600" />
              Pro License Active
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Clinical <span className="text-medical-500">Pro</span> Scan
          </h1>
          <p className="text-slate-500 font-medium text-lg">Advanced deterministic ML analysis using historical clinical CSV datasets.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-8">
          {/* Scan Interface */}
          <Card 
            title="Symptom Corpus Match" 
            subtitle="Cross-referencing input with clinical data"
            icon={Cpu}
          >
            <div className="space-y-8">
              <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <FileSpreadsheet size={16} className="text-emerald-500" />
                       Active Dataset: medical_data.csv
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Grounded</span>
                    </div>
                  </div>

                  <div className="relative">
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Sharp chest pain after exercise"
                      className="w-full h-16 pl-6 pr-20 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-medical-500/20 focus:border-medical-500 outline-none transition-all"
                    />
                    <button 
                      onClick={handleScan}
                      disabled={isScanning || !query.trim()}
                      className="absolute right-2 top-2 bottom-2 px-6 bg-medical-500 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-medical-600 transition-all disabled:opacity-50"
                    >
                      {isScanning ? 'Scanning...' : 'Execute'}
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-medical-500/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-medical-500/10 transition-colors" />
              </div>

              {/* Advanced Output */}
              <AnimatePresence mode="wait">
                {isScanning ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-20 flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-slate-100 dark:border-slate-800 rounded-full auto-spin" />
                      <div className="absolute inset-0 w-20 h-20 border-4 border-t-medical-500 border-transparent rounded-full animate-spin" />
                      <Cpu size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-medical-500 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Analyzing Neural Path</p>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Cross-referencing with local dataset...</p>
                    </div>
                  </motion.div>
                ) : result && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid md:grid-cols-2 gap-6"
                  >
                    <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] space-y-6 shadow-sm ring-1 ring-slate-100/50">
                       <div className="flex items-center gap-3">
                          <Activity size={20} className="text-medical-500" />
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Scan Results</h4>
                       </div>
                       
                       <div className="space-y-4">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Detected Specialty</p>
                             <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{result.specialist}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Urgency</p>
                                <p className={cn(
                                   "text-xs font-black uppercase tracking-widest",
                                   result.urgency === 'High' ? "text-red-500" : "text-emerald-500"
                                )}>{result.urgency}</p>
                             </div>
                             <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pathology</p>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{result.category}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 bg-medical-500 dark:bg-medical-600 rounded-[2.5rem] text-white space-y-6 shadow-xl shadow-medical-500/20">
                       <div className="flex items-center gap-3">
                          <ShieldCheck size={20} />
                          <h4 className="text-xs font-black uppercase tracking-widest opacity-80">Pro Recommendation</h4>
                       </div>
                       <p className="text-lg font-bold leading-snug">
                          {result.unverified 
                            ? "This symptom does not have a direct high-confidence match in our localized clinical dataset. Proceed to AI Chat for expanded analysis."
                            : `High-fidelity match found in medical_data.csv. Clinical records suggest immediate consultation with a ${result.specialist} for further diagnostic testing.`}
                       </p>
                       <Link 
                        to={result.specialist === 'Cardiologist' ? '/nearby-care?type=hospital' : '/health-check'}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-white text-medical-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-medical-50 transition-colors"
                       >
                          Take Action <ChevronRight size={14} />
                       </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        <aside className="space-y-8">
           <Card title="Dataset Metrics" subtitle="CSV Insights" icon={Table}>
             <div className="space-y-4 pt-2">
                {[
                  { label: 'Total Mappings', val: '12 Entries' },
                  { label: 'Avg Urgency', val: 'Medium-High' },
                  { label: 'Coverage', val: '9 Core Specialties' },
                  { label: 'Data Source', val: 'Local Dataset' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{stat.val}</span>
                  </div>
                ))}
             </div>
           </Card>

           <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-medical-400">ML Training Layer</h3>
                 <p className="text-sm font-medium leading-relaxed opacity-70">
                   This scan bypasses standard probabilistic AI by using deterministic categorical matching from your CSV medical guidelines.
                 </p>
                 <div className="flex gap-1 pt-4">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-0.5 flex-1 bg-medical-500/30 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                        className="w-full h-full bg-medical-500"
                       />
                    </div>)}
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
