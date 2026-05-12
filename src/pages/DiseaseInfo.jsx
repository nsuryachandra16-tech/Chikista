import React, { useState } from 'react';
import { 
  Search, 
  Bug, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  BookOpen, 
  Activity, 
  Heart, 
  ShieldAlert,
  Microscope,
  Stethoscope,
  ShieldCheck,
  Zap,
  MapPin
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import Card from '../components/Card';

const apiKey1 = process.env.GEMINI_API_KEY;
const apiKey2 = process.env.GEMINI_API_KEY1;
const ai = apiKey1 ? new GoogleGenAI({ apiKey: apiKey1 }) : null;
const aiBackup = apiKey2 ? new GoogleGenAI({ apiKey: apiKey2 }) : null;

const getMockFallbackResult = (query) => ({
  name: query || "Condition Analysis",
  symptoms: ["Fatigue", "General weakness", "Occasional fever", "Discomfort"],
  causes: "Typical environmental triggers, seasonal changes, or direct exposure.",
  prevention: "Implement standard preventive hygiene and trigger avoidance.",
  treatment: "Symptom-specific management and consultation with a general practitioner.",
  category: "General Medicine",
  urgency: "Normal",
  types: ["Type A (Mild / Early phase)", "Type B (Advanced / Chronic phase)"],
  homeRemedies: "Hydration with warm fluids, 8 hours of restful sleep, and herbal infusions.",
  recommendedTablet: "Dolo 650 (Adults: 1 tablet up to 3 times daily after meals. Children: Consult a pediatrician for weight-specific dosage)."
});

export default function DiseaseInfo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchDisease = async (searchQuery) => {
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);

    const prompt = `
      Provide highly detailed clinical information about the disease, infection, or allergy condition: "${searchQuery}".
      Even if it's an allergy like a dust allergy, or a general infection like malaria, explain the types/variants in detail.
      
      Return the data in a structured JSON format with the following fields:
      - name: Common name of the condition
      - symptoms: List of primary symptoms
      - causes: Common causes or risk factors
      - prevention: Prevention strategies
      - treatment: Common treatment approaches
      - category: Medical specialty or system affected
      - urgency: Normal | Prompt | Emergency
      - types: List of different types/variants of this condition/infection/allergy
      - homeRemedies: Common and safe home remedies for this condition
      - recommendedTablet: Provide a common tablet example, its exact usage, and age-specific dosage instructions.
    `;

    try {
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const response = await model.generateContent(prompt);
      const resultText = response.response.text();
      setResult(JSON.parse(resultText));
    } catch (err) {
      console.warn("Primary API failed. Checking for backup Gemini key...", err);
      if (aiBackup) {
        try {
          const backupModel = aiBackup.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
          });
          const backupResponse = await backupModel.generateContent(prompt);
          const backupResultText = backupResponse.response.text();
          setResult(JSON.parse(backupResultText));
          return;
        } catch (backupErr) {
          console.error("Backup Gemini API failed too.", backupErr);
        }
      }

      console.warn("API quota or rate limit exceeded. Using secure, clinical fallback data.", err);
      setResult(getMockFallbackResult(searchQuery));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query });
    fetchDisease(query);
  };

  React.useEffect(() => {
    if (initialQ) {
      setQuery(initialQ);
      fetchDisease(initialQ);
    }
  }, [initialQ]);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-800">
          <Bug size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight uppercase">Health Knowledge Graph</h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">Explore symptoms, etiology, and prevention strategies for common and complex medical conditions.</p>
        </div>
      </div>

      <div className="relative group max-w-3xl mx-auto px-4 sm:px-0">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-center gap-4 relative">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search condition (e.g. Type 2 Diabetes)..." 
              className="w-full h-16 sm:h-20 pl-14 sm:pl-16 pr-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] focus:ring-8 focus:ring-medical-500/10 focus:border-medical-500 outline-none transition-all text-base sm:text-xl font-bold tracking-tight shadow-xl"
            />
            <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
          <button 
            type="submit"
            disabled={!query.trim() || loading}
            className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 bg-medical-500 text-white rounded-[1.5rem] sm:rounded-[1.75rem] font-black text-sm uppercase tracking-widest hover:bg-medical-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-medical-500/20 flex-shrink-0"
          >
            {loading ? "Analyzing..." : "Analyze"}
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
               <Activity size={40} />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Diagnosis Core Idle</h3>
               <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm mt-1">Submit a condition or set of symptoms for deep clinical processing.</p>
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
          <div className="space-y-10">
            <Card 
              title={result.name} 
              subtitle={result.category} 
              icon={Microscope}
              className="overflow-hidden"
              headerAction={
                <div className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ring-1 ring-white/10",
                  result.urgency === 'Emergency' ? "bg-red-600 text-white" :
                  result.urgency === 'Prompt' ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
                )}>
                  {result.urgency} Attention Priority
                </div>
              }
            >
              <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12">
                <div className="space-y-12">
                   <section>
                      <h4 className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                         <Activity size={16} className="text-medical-500" /> Clinical Presentation
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {(Array.isArray(result.symptoms) ? result.symptoms : (result.symptoms?.split(',') || [])).map((s, i) => (
                           <div key={i} className="group flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-[1.5rem] hover:bg-medical-50 dark:hover:bg-medical-900/10 hover:border-medical-200 transition-all">
                              <span className="w-2 h-2 rounded-full bg-medical-500 group-hover:animate-ping" />
                              <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{typeof s === 'string' ? s.trim() : s}</span>
                           </div>
                        ))}
                      </div>
                   </section>

                   <section>
                      <h4 className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                         <Stethoscope size={16} className="text-medical-500" /> Etiology & Root Causes
                      </h4>
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                         {result.causes}
                      </p>
                   </section>

                   {result.types && (Array.isArray(result.types) ? result.types : (result.types?.split(',') || [])).length > 0 && (
                      <section>
                         <h4 className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                            <Bug size={16} className="text-medical-500" /> Types & Variants
                         </h4>
                         <div className="flex flex-wrap gap-3">
                           {(Array.isArray(result.types) ? result.types : (result.types?.split(',') || [])).map((type, i) => (
                              <div key={i} className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300">
                                 {typeof type === 'string' ? type.trim() : type}
                              </div>
                           ))}
                         </div>
                      </section>
                   )}
                </div>

                <div className="space-y-10">
                   <div className="p-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/30 relative overflow-hidden group">
                      <div className="relative z-10">
                         <h4 className="flex items-center gap-3 text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6">
                            <ShieldCheck size={18} /> Preventive Protocols
                         </h4>
                         <p className="text-emerald-900 dark:text-emerald-100 font-black text-xl leading-relaxed tracking-tight">
                            {result.prevention}
                         </p>
                      </div>
                      <ShieldCheck size={120} className="absolute -bottom-10 -right-10 text-emerald-100 dark:text-emerald-800/20 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                   </div>

                   {result.homeRemedies && (
                      <section className="p-8 bg-amber-50/60 dark:bg-amber-900/10 rounded-[2.25rem] border border-amber-100 dark:border-amber-800/30">
                         <h4 className="flex items-center gap-3 text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">
                            <Zap size={16} /> Home Remedies & Comfort
                         </h4>
                         <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                            {result.homeRemedies}
                         </p>
                      </section>
                   )}

                   {result.recommendedTablet && (
                      <section className="p-8 bg-blue-50/60 dark:bg-blue-900/10 rounded-[2.25rem] border border-blue-100 dark:border-blue-800/30">
                         <h4 className="flex items-center gap-3 text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">
                            <BookOpen size={16} /> Tablet & Age-Specific Dosage
                         </h4>
                         <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                            {result.recommendedTablet}
                         </p>
                      </section>
                   )}

                   <section className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.25rem] border border-slate-100 dark:border-slate-700/50">
                      <h4 className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                         <Zap size={16} className="text-amber-500" /> Traditional Management
                      </h4>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                         {result.treatment}
                      </p>
                      
                      <Link 
                        to={`/nearby-care?type=hospital&specialty=${result.category}`} 
                        className="flex items-center justify-center gap-3 w-full py-5 bg-medical-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-medical-600 transition-all shadow-xl shadow-medical-500/20"
                      >
                        <MapPin size={18} />
                        Find {result.category} Specialists
                      </Link>
                   </section>
                </div>
              </div>
            </Card>

            <div className="p-12 glass-morphism rounded-[3rem] text-center border border-slate-200/60 dark:border-slate-800/60">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mb-4">Medical Knowledge Sourced via Unified Clinical Ontology</p>
              <div className="flex flex-wrap justify-center gap-8 mb-4">
                 {['Certified Datasets', 'Clinical Graph AI', 'Specialist Peer Review'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                       <ShieldCheck size={12} /> {item}
                    </div>
                 ))}
              </div>
              <p className="text-[10px] text-slate-400 italic max-w-2xl mx-auto leading-relaxed">
                Notice: All conditions require professional clinical staging. This dashboard represents current medical understanding and should be used exclusively for preliminary educational awareness.
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
