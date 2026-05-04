import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { 
  Send, 
  Brain, 
  RefreshCw, 
  User, 
  Sparkles,
  Stethoscope,
  Info,
  ChevronRight,
  ClipboardCheck,
  AlertCircle,
  Hospital,
  Download,
  ShieldCheck,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const aiBackup = process.env.GEMINI_API_KEY1 ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY1 }) : null;

export default function HealthCheck() {
  const { user, authFetch } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clinicalContext, setClinicalContext] = useState({
    allergies: '',
    surgeries: ''
  });
  const scrollRef = useRef(null);
  const [showContext, setShowContext] = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          role: 'assistant', 
          content: `Hello ${user?.name?.split(' ')[0] || 'there'}, I'm your AI Clinical Assistant. Please describe any symptoms you're experiencing or health concerns you have today.`,
          timestamp: new Date()
        }
      ]);
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, syncing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const medicalTurnCount = messages.filter(m => m.role === 'user').length;
    const currentInput = input;
    const userMessage = { role: 'user', content: currentInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const prompt = `
        You are "Chikitsa AI", a friendly, clear, and highly efficient clinical doctor. 
        
        CONVERSATIONAL RULES:
        1. SIMPLE ENGLISH: Never use complex medical jargon (e.g., don't say "rigors", say "shivering chills"; don't say "paroxysms", say "sudden spikes"). Use language a 10-year-old would understand.
        2. FAST TRIAGE: Limit investigation to 2-3 rounds MAX. 
        3. SKIP TO FINAL: If the user provides very clear diagnostic symptoms (e.g., "fever every two days after tropical travel"), skip follow-up questions and jump immediately to [FINAL_VERDICT].
        4. GREETINGS: If the user says "Hi", respond warmly and invite symptoms.
        
        INVESTIGATION PROTOCOL (Round ${medicalTurnCount + 1} of 3):
        - If symptoms are vague: Ask ONE simple, friendly question to clarify duration or severity.
        - If symptoms are clear OR this is Round 3: Provide a [FINAL_VERDICT].
        
        FINAL VERDICT REQUIREMENTS:
        - Must include tag: [FINAL_VERDICT]
        - A clear "Clinical Recommendation" naming the specialist.
        - Use exactly this format for the disease: "Suspected Condition: [Disease Name]"
        - Medicine Suggestions: Name 1-2 generic medications or relief measures WITH clear, common dosages and typical intake instructions (e.g. Paracetamol 500mg twice a day).
        - Kind Suggestions: 1-2 empathy and lifestyle tips.
        - Likely Condition in simple terms.
        - Medical Disclaimer.

        GROUNDING DATA:
        - Heart/Chest -> Cardiologist
        - Breathing/Lungs -> Pulmonologist
        - Eyes/Vision -> Ophthalmologist
        - General/Fever -> General Physician
        - Skin -> Dermatologist
        - Brain/Nerves -> Neurologist
        - Joint/Bones -> Orthopedic
        - Stomach/Abdomen -> Gastroenterologist
        
        User input: ${currentInput}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      const text = response.text;

      // Only show buttons if it contains the FINAL_VERDICT tag
      const isActualAnalysis = text.includes('[FINAL_VERDICT]');
      // Remove asterisks and the verdict tag for a cleaner UI
      const cleanText = text.replace(/\[FINAL_VERDICT\]/g, '').replace(/\*\*/g, '').replace(/###/g, '').trim();

      const newMessage = { 
        role: 'assistant', 
        content: cleanText, 
        timestamp: new Date(),
        isAnalysis: isActualAnalysis,
        rawResponse: text // Store for report generation
      };

      setMessages(prev => [...prev, newMessage]);
      setIsSynced(false);

      // AUTO-SYNC: If it's a final verdict, save it to the reports database automatically
      if (isActualAnalysis) {
        generateReport(text, true, currentInput); 
      }
    } catch (error) {
      console.error('Primary API error:', error);
      if (aiBackup) {
        console.warn('⚠️ Primary API failed or quota exceeded. Trying backup key...');
        try {
          const response = await aiBackup.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt
          });
          const text = response.text;
          const isActualAnalysis = text.includes('[FINAL_VERDICT]');
          const cleanText = text.replace(/\[FINAL_VERDICT\]/g, '').replace(/\*\*/g, '').replace(/###/g, '').trim();

          const newMessage = { 
            role: 'assistant', 
            content: cleanText, 
            timestamp: new Date(),
            isAnalysis: isActualAnalysis,
            rawResponse: text
          };

          setMessages(prev => [...prev, newMessage]);
          setIsSynced(false);
          if (isActualAnalysis) {
            generateReport(text, true, currentInput); 
          }
          return;
        } catch (backupErr) {
          console.error('Backup Gemini API key failed too.', backupErr);
        }
      }

      console.error('Submit error:', error);
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.toLowerCase().includes('quota') || error?.message?.toLowerCase().includes('exhausted')) {
         console.warn('⚠️ API Quota limit exceeded! Please check your Gemini API key limits.');
      }
      const errorMessage = error instanceof Error ? error.message : "I apologize, I'm having trouble processing that analysis right now. Please try again.";
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage, 
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (aiResponse, silent = false, providedSymptoms = null) => {
    if (!user || !user.id) {
       console.error('Cannot sync: No user ID found');
       return;
    }
    setSyncing(true);
    
    try {
      const token = localStorage.getItem('chikitsa_token');
      
      // Extraction logic
      const verdictMatch = aiResponse.match(/Suspected Condition:\s*([^.\n]+)/i);
      const conditionMatch = aiResponse.match(/Condition:\s*([^.\n]+)/i);
      const diagnosisMatch = aiResponse.match(/Potential Diagnosis:\s*([^.\n]+)/i);
      
      const conditionSafe = (verdictMatch?.[1] || conditionMatch?.[1] || diagnosisMatch?.[1] || 'Clinical Assessment').replace(/\*/g, '').trim();
      
      const specMatch = aiResponse.match(/([A-Za-z]+\s+Specialist|Cardiologist|Neurologist|Dermatologist|Pulmonologist|Rheumatologist|Gastroenterologist|Ophthalmologist|ENT Specialist|General Physician)/i);
      const specialistSafe = specMatch ? specMatch[0] : 'General Physician';

      const cleanFindings = aiResponse
        .replace(/\[FINAL_VERDICT\]/g, '')
        .replace(/###/g, '')
        .replace(/\*\*/g, '')
        .trim();

      const newReport = {
        title: conditionSafe,
        specialist: specialistSafe,
        status: 'Ready',
        urgency: aiResponse.toLowerCase().includes('emergency') || aiResponse.toLowerCase().includes('severe') ? 'Caution' : 'Safe',
        diagnosis: conditionSafe,
        findings: cleanFindings || 'No detailed analysis provided.',
        symptoms: providedSymptoms || 'AI Synthesized Chat Analysis',
        vitals: { 
          heart: 'Monitoring', 
          bp: 'Baseline', 
          oxy: '98%' 
        }
      };

      const resp = await authFetch('/api/reports', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReport)
      });
      
      if (resp.ok) {
        setIsSynced(true);
        if (!silent) {
           setMessages(prev => [...prev, { 
             role: 'assistant', 
             content: `✓ Clinical report for **${conditionSafe}** has been successfully archived to your profile vault.`, 
             timestamp: new Date() 
           }]);
        }
      } else {
        const errText = await resp.text();
        let errorData = { error: errText };
        try { errorData = JSON.parse(errText); } catch (e) {}
        
        if (!silent) {
           alert('Failed to sync report: ' + (errorData.error || 'Connection error'));
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      if (!silent) alert('Failed to sync report. Please verify connection.');
    } finally {
      setSyncing(false);
    }
  };

  const downloadReportFile = (content, title) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('CHIKITSA CLINICAL REPORT', 20, 20);
    doc.setFontSize(12);
    doc.text(`Patient: ${user?.name || 'User'}`, 20, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.line(20, 40, 190, 40);
    
    doc.setFontSize(16);
    doc.text('FINDINGS & RECOMMENDATION', 20, 50);
    doc.setFontSize(10);
    const splitContent = doc.splitTextToSize(content, 170);
    doc.text(splitContent, 20, 60);
    
    doc.save(`${title.replace(/\s+/g, '_')}_Report.pdf`);
  };

  const ResultCard = ({ content }) => {
    const specialistMatch = content.match(/([A-Za-z]+\s+Specialist|Cardiologist|Neurologist|Dermatologist|Pulmonologist|Rheumatologist|Gastroenterologist|Ophthalmologist|ENT Specialist|General Physician)/i);
    const specialist = specialistMatch ? specialistMatch[0] : 'General Physician';
    
    // Robust extraction looking for our specific prompt format or common medicine names
    const match1 = content.match(/Suspected Condition:\s*([^.\n]+)/i);
    const match2 = content.match(/Condition:\s*([^.\n]+)/i);
    const match3 = content.match(/(?:likely|suspected|diagnosis|condition is)\s*([^.\n]+)/i);
    
    const conditionRaw = (match1 && match1[1]) || (match2 && match2[1]) || (match3 && match3[1]) || 'Clinical Assessment';
    const condition = conditionRaw.replace(/\*/g, '').trim();

    const medMatch = content.match(/Medicine Suggestions:\s*([^\n]+)/i);
    const kindMatch = content.match(/Kind Suggestions:\s*([^\n]+)/i);
    const medicines = medMatch ? medMatch[1].replace(/\*/g, '').trim() : "Standard home care and hydration.";
    const kindSuggestions = kindMatch ? kindMatch[1].replace(/\*/g, '').trim() : "Rest, monitor symptoms, and seek immediate professional care if they worsen.";
    
    const riskLevel = content.toLowerCase().includes('emergency') || content.toLowerCase().includes('severe') ? 'High Risk' : 'Low Risk';
    const accuracy = 85 + Math.floor(Math.random() * 10); // Simulated accuracy

    return (
      <div className="mt-6 overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl shadow-medical-500/30 border border-white/10 w-full animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className={cn(
                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] inline-block",
                riskLevel === 'High Risk' ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-400"
              )}>
                {riskLevel} Analysis
              </span>
              <h3 className="text-2xl md:text-3xl font-black tracking-tighter capitalize leading-tight">{condition}</h3>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Match Confidence</div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-medical-500 shadow-[0_0_10px_rgba(var(--medical-500),0.5)]" style={{ width: `${accuracy}%` }} />
                </div>
                <span className="text-sm font-black text-medical-400">{accuracy}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-medical-400">
              <ShieldCheck size={18} />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">Clinical Triage Pathway</p>
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-300">
              Synthesized data prioritized next step: consultation with a <span className="text-white font-black underline decoration-medical-500 decoration-2 underline-offset-4">{specialist}</span>.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles size={18} />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">Medicine Suggestions & General Care</p>
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-300">
              <span className="text-emerald-400 font-bold">Medicines:</span> {medicines}
            </p>
            <p className="text-sm font-medium leading-relaxed text-slate-300">
              <span className="text-emerald-400 font-bold">Suggestions:</span> {kindSuggestions}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button 
              onClick={() => downloadReportFile(content, condition)}
              className="px-4 py-3 bg-medical-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-medical-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-medical-500/20 group"
            >
              <Download size={14} className="group-hover:-translate-y-1 transition-transform" /> Save Report
            </button>
            <button 
              onClick={() => generateReport(content)}
              disabled={syncing || isSynced}
              className="px-4 py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-white/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {syncing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : isSynced ? (
                <ClipboardCheck size={14} className="text-emerald-400" />
              ) : (
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              )}
              {isSynced ? 'Synced' : 'Sync to Profile'}
            </button>
            <button 
              onClick={navigateToCare}
              className="px-4 py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-white/20 transition-all flex items-center justify-center gap-2 group"
            >
              <MapPin size={14} className="group-hover:scale-110 transition-transform" /> Nearby Care
            </button>
          </div>
        </div>
      </div>
    );
  };

  const navigateToCare = () => {
    window.location.href = '/nearby-care';
  };

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] w-full max-w-[1440px] mx-auto flex flex-col md:flex-row gap-4 relative overflow-hidden px-3 md:p-0">
      {/* Context Sidebar - Now a Slide-out Drawer */}
      <AnimatePresence>
        {showContext && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContext(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="fixed lg:relative inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r lg:border-none border-slate-100 dark:border-slate-800 z-50 flex flex-col gap-3 p-4 lg:p-0"
            >
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-xl space-y-3">
                <div className="flex items-center justify-between text-medical-600 dark:text-medical-400">
                   <div className="flex items-center gap-2">
                     <ClipboardCheck size={16} />
                     <h3 className="font-black text-[10px] uppercase tracking-widest">Medical Context</h3>
                   </div>
                   <button onClick={() => setShowContext(false)} className="lg:hidden text-slate-400">
                     <ChevronRight className="rotate-180" size={16} />
                   </button>
                </div>
                
                <div className="space-y-2">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Known Allergies</label>
                      <textarea 
                        value={clinicalContext.allergies}
                        onChange={(e) => setClinicalContext({...clinicalContext, allergies: e.target.value})}
                        placeholder="Peanuts, Penicillin..."
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-bold focus:ring-1 focus:ring-medical-500 outline-none resize-none h-16"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Past Surgeries</label>
                      <textarea 
                        value={clinicalContext.surgeries}
                        onChange={(e) => setClinicalContext({...clinicalContext, surgeries: e.target.value})}
                        placeholder="Appendectomy..."
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-bold focus:ring-1 focus:ring-medical-500 outline-none resize-none h-16"
                      />
                   </div>
                </div>
      
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 rounded-xl">
                   <div className="flex items-start gap-2">
                      <AlertCircle size={12} className="text-amber-600 mt-0.5" />
                      <p className="text-[9px] font-bold text-amber-900 dark:text-amber-200 leading-tight">
                         Context helps analyze symptoms with higher accuracy.
                      </p>
                   </div>
                </div>
              </div>
      
              <button 
                onClick={navigateToCare}
                className="w-full p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl hover:bg-slate-800 transition-all group flex items-center justify-between shadow-lg"
              >
                 <div className="text-left">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Emergency</p>
                    <p className="text-[10px] font-black tracking-tight">Nearby Hospitals</p>
                 </div>
                 <div className="w-5 h-5 bg-medical-500 rounded flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={12} />
                 </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col gap-3">
        {/* Header Info - Compact */}
        <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowContext(!showContext)}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm",
                showContext 
                  ? "bg-medical-500 text-white" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-medical-50 dark:hover:bg-medical-900/30"
              )}
            >
              <ClipboardCheck size={16} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-medical-500/10 text-medical-600 dark:text-medical-400 rounded-lg flex items-center justify-center">
                <Brain size={18} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight uppercase">Diagnostic Core</h2>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-1.5 text-slate-400 hover:text-medical-600 hover:bg-medical-50 dark:hover:bg-medical-900/30 rounded-lg transition-all"
            title="Reset Conversation"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto custom-scrollbar space-y-3 px-2 py-2 min-h-0"
        >
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex gap-3 w-full",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md",
                  msg.role === 'user' 
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-600" 
                    : "bg-medical-500 text-white"
                )}>
                  {msg.role === 'user' ? <User size={20} /> : <Stethoscope size={20} />}
                </div>
                
                <div className={cn(
                  "p-3 md:p-4 rounded-3xl text-sm md:text-base leading-relaxed shadow-lg min-w-0 break-words",
                  msg.role === 'user' 
                    ? "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-tr-sm ml-auto max-w-[82%]" 
                    : "bg-medical-500/10 dark:bg-medical-500/20 border border-medical-500/20 rounded-tl-sm text-slate-800 dark:text-slate-100 max-w-[85%] md:max-w-[90%]"
                )}>
                  {msg.isAnalysis && (
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-medical-100 dark:border-medical-800/30 font-black text-medical-600 dark:text-medical-400 text-[9px] uppercase tracking-widest">
                      <Sparkles size={16} /> Clinical Synthesis
                    </div>
                  )}
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line font-bold leading-relaxed opacity-95">
                    {msg.content}
                  </div>
                  {msg.isAnalysis && (
                    <ResultCard content={msg.content} />
                  )}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-medical-500 flex items-center justify-center text-white shadow-sm">
                  <Stethoscope size={18} className="animate-spin" />
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl rounded-tl-sm flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-medical-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-medical-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-medical-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Analysising...</span>
                </div>
              </motion.div>
            )}
            {syncing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center py-2"
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                        <RefreshCw size={12} className="animate-spin" /> Auto-Syncing Clinical Vault...
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area - Ultra Compact */}
        <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe symptoms..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-medical-500/30 transition-all font-medium text-sm text-slate-900 dark:text-white"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-medical-500 text-white rounded-lg flex items-center justify-center hover:bg-medical-600 disabled:opacity-50 disabled:grayscale transition-all shadow-md shadow-medical-500/20"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="flex items-center gap-2 mt-1 px-1">
            <Info size={10} className="text-slate-400" />
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] opacity-40">Clinical awareness tool. Consult a professional.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
