import React, { useState } from 'react';
import { 
  Search, 
  Pill, 
  CheckCircle2, 
  FlaskConical,
  ShieldAlert,
  ArrowRight,
  Plus,
  X,
  AlertTriangle,
  BookOpen,
  Clock
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import Card from '../components/Card';

const apiKey1 = process.env.GEMINI_API_KEY;
const apiKey2 = process.env.GEMINI_API_KEY1;
const ai = apiKey1 ? new GoogleGenAI({ apiKey: apiKey1 }) : null;
const aiBackup = apiKey2 ? new GoogleGenAI({ apiKey: apiKey2 }) : null;

export default function MedicineSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    dosage: '',
    frequency: 'Daily',
    time: '08:00'
  });

  const fetchMedicine = async (searchQuery) => {
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);

    const prompt = `
      Provide comprehensive clinical information about the medicine: "${searchQuery}".
      Return the data in a structured JSON format with the following fields:
      - name: Common name of the medicine
      - uses: How it's used
      - precautions: Key precautions to take (string or array)
      - safeDosage: General safe dosage information
      - sideEffects: Common side effects
      - category: Therapeutic class
      - warning: Critical safety warning if any
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const data = JSON.parse(response.text);
      setResult(data);
    } catch (err) {
      console.warn("Primary API key failed in Medicine Search. Checking backup key...", err);
      if (aiBackup) {
        try {
          const backupResponse = await aiBackup.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });
          setResult(JSON.parse(backupResponse.text));
          return;
        } catch (backupErr) {
          console.error("Backup Gemini API key failed too in Medicine Search.", backupErr);
        }
      }

      console.error(err);
      setError("Unable to find information for this medication. Please verify the name.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query });
    fetchMedicine(query);
  };

  React.useEffect(() => {
    if (initialQ) {
      setQuery(initialQ);
      fetchMedicine(initialQ);
    }
  }, [initialQ]);

  const handleAddToSchedule = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('chikitsa_token');
    try {
      const res = await authFetch('/api/medications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           name: result.name,
           dosage: scheduleData.dosage || result.safeDosage.split('.')[0],
           frequency: scheduleData.frequency,
           time: scheduleData.time
        })
      });
      if (res.ok) {
        setShowScheduleForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      {/* Quick Log Modal Overlay */}
      <AnimatePresence>
        {showScheduleForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowScheduleForm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black uppercase tracking-tight">Schedule {result?.name}</h2>
                 <button onClick={() => setShowScheduleForm(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X size={24} />
                 </button>
              </div>
              
              <form onSubmit={handleAddToSchedule} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Personalized Dosage</label>
                    <input 
                      type="text" 
                      value={scheduleData.dosage}
                      onChange={(e) => setScheduleData({...scheduleData, dosage: e.target.value})}
                      placeholder="e.g. 500mg (as prescribed)"
                      className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-medical-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Frequency</label>
                       <select 
                          value={scheduleData.frequency}
                          onChange={(e) => setScheduleData({...scheduleData, frequency: e.target.value})}
                          className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase outline-none"
                       >
                          <option>Daily</option>
                          <option>Twice Daily</option>
                          <option>As Needed</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reminder Time</label>
                       <input 
                          type="time"
                          value={scheduleData.time}
                          onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                          className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none"
                       />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full py-5 bg-medical-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-medical-500/20 hover:bg-medical-600 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Scheduling...' : 'Save to My Medications'}
                  </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-medical-50 dark:bg-medical-900/40 text-medical-600 dark:text-medical-400 rounded-3xl flex items-center justify-center mx-auto shadow-sm ring-1 ring-medical-100 dark:ring-medical-800">
          <Pill size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight uppercase">Pharma Knowledge</h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">Verified clinical data, usage guidelines, and safety protocols for global medications.</p>
        </div>
      </div>

      <div className="relative group max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 relative">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medicine (e.g. Metformin)..." 
              className="w-full h-16 sm:h-20 pl-14 sm:pl-16 pr-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] focus:ring-8 focus:ring-medical-500/10 focus:border-medical-500 outline-none transition-all text-base sm:text-xl font-bold tracking-tight shadow-xl"
            />
            <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
          <button 
            type="submit"
            disabled={!query.trim() || loading}
            className="w-full sm:w-auto px-8 h-16 sm:h-20 bg-medical-500 text-white rounded-[1.5rem] sm:rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-medical-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-medical-500/20 whitespace-nowrap"
          >
            {loading ? "Analyzing..." : "Search"}
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {(!result && !loading && !error) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center space-y-6"
          >
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
               <Search size={40} />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Search not started yet</h3>
               <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm mt-1">Enter a pharmaceutical name above to begin clinical analysis.</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 rounded-[2.5rem] font-bold flex items-center gap-4 text-lg"
          >
            <ShieldAlert size={32} />
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-[1fr_380px] gap-8"
          >
            <div className="space-y-8">
               <Card 
                  title={result.name} 
                  subtitle={result.category} 
                  icon={FlaskConical}
                  headerAction={
                    <button 
                      onClick={() => setShowScheduleForm(true)}
                      className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-medical-500 text-white rounded-xl shadow-lg shadow-medical-500/20 hover:bg-medical-600 transition-all font-black uppercase tracking-widest text-[10px]"
                    >
                      <Plus size={14} />
                      Add to Schedule
                    </button>
                  }
               >
                  <div className="space-y-12">
                     <section>
                        <h4 className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                           <BookOpen size={16} className="text-medical-500" /> Usage & Indications
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold text-lg">
                           {result.uses}
                        </p>
                     </section>

                     <section>
                        <h4 className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                           <Clock size={16} className="text-medical-500" /> Standard Protocol
                        </h4>
                        <div className="p-8 bg-medical-50 dark:bg-medical-900/20 text-medical-700 dark:text-medical-300 rounded-[2.5rem] border border-medical-100 dark:border-medical-800/30 text-xl font-black tracking-tight leading-relaxed">
                           {result.safeDosage}
                        </div>
                     </section>

                     <section className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 italic">Side Effects Profile</h4>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                           {result.sideEffects}
                        </p>
                     </section>
                  </div>
               </Card>
            </div>

            <div className="space-y-8">
               <Card title="Safety Checklist" subtitle="Critical Precautions" icon={ShieldAlert} className="h-full">
                  <div className="space-y-8">
                     <div className="space-y-4">
                        {(Array.isArray(result.precautions) ? result.precautions : (result.precautions?.split('.') || [])).filter(p => typeof p === 'string' ? p.trim() : p).map((p, i) => (
                           <div key={i} className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors group">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{typeof p === 'string' ? p.trim() : p}{typeof p === 'string' && !p.endsWith('.') ? '.' : ''}</p>
                           </div>
                        ))}
                     </div>

                     {result.warning && (
                        <div className="p-8 bg-red-600 text-white rounded-[2rem] shadow-xl shadow-red-500/20 active:scale-[0.98] transition-transform">
                           <div className="flex items-center gap-2 mb-4">
                              <AlertTriangle size={20} className="animate-pulse" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Black Box Warning</h4>
                           </div>
                           <p className="text-sm font-black leading-relaxed">{result.warning}</p>
                        </div>
                     )}

                     <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-medical-50 dark:hover:bg-medical-900/30 group transition-all">
                           <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-medical-600">Clinical Alternatives</span>
                           <ArrowRight size={16} className="text-slate-400 group-hover:text-medical-500 transition-all" />
                        </button>
                     </div>
                  </div>
               </Card>
            </div>

            <div className="lg:col-span-2 p-10 bg-slate-50 dark:bg-slate-800/50 text-center rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2">Automated Extraction via Chikitsa Clinical NLP Core</p>
              <p className="text-[9px] text-slate-400 font-bold italic tracking-tight opacity-60 max-w-2xl mx-auto uppercase leading-loose">The information provided is derived from broad clinical datasets. Chikitsa AI does not provide medical prescriptions. Always validate usage with your treating physician before administration.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="grid md:grid-cols-3 gap-6 opacity-60 grayscale blur-[0.5px]">
          {[1,2,3].map(i => <div key={i} className="card-premium h-48 animate-pulse" />)}
        </div>
      )}
    </div>
  );
}
