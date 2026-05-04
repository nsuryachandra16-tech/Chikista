import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Search,
  Calendar,
  Filter,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Crown,
  Printer,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/Card';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expandedReport, setExpandedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [medications, setMedications] = useState([]);
  const [vitals, setVitals] = useState([]);

  const isPro = user?.subscription_tier === 'pro';

  const fetchData = async (isManual = false) => {
    if (!user) return;
    if (isManual) setRefreshing(true);
    else setLoading(true);
    
    try {
      const [reportsRes, medsRes, vitalsRes] = await Promise.all([
        authFetch('/api/reports'),
        authFetch('/api/medications'),
        authFetch('/api/vitals')
      ]);
      
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (medsRes.ok) setMedications(await medsRes.json());
      if (vitalsRes.ok) setVitals(await vitalsRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handlePrintSummary = () => {
    if (!isPro) {
      navigate('/subscription');
      return;
    }

    if (reports.length === 0 && medications.length === 0 && vitals.length === 0) {
      alert('Your clinical workspace is currently empty. Add medical data to generate a summary.');
      return;
    }
    
    const doc = new jsPDF();
    const primaryColor = [14, 165, 233]; // Blue-500
    
    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CLINICAL HEALTH SUMMARY', 15, 25);
    
    doc.setFontSize(10);
    doc.text(`CHIKITSA PRO VERIFIED • ${new Date().toLocaleDateString()}`, 15, 33);
    
    // User Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text('PATIENT PROFILE', 15, 55);
    doc.setFontSize(10);
    doc.text(`Name: ${user?.name || 'Anonymous User'}`, 15, 62);
    doc.text(`Email: ${user?.email || 'N/A'}`, 15, 67);
    doc.text(`ID: ${user?.id || 'N/A'}`, 15, 72);

    // Latest Vitals
    let currentY = 85;
    if (vitals.length > 0) {
      doc.setFontSize(12);
      doc.text('LATEST BIOMETRICS', 15, currentY);
      const latestVitals = vitals.slice(0, 5).map(v => [
        new Date(v.timestamp).toLocaleDateString(),
        v.type.toUpperCase(),
        `${v.value} ${v.unit}`
      ]);
      
      doc.autoTable({
        startY: currentY + 5,
        head: [['Date', 'Metric', 'Value']],
        body: latestVitals,
        theme: 'striped',
        headStyles: { fillColor: primaryColor }
      });
      currentY = doc.lastAutoTable?.finalY + 15 || currentY + 45;
    }

    // Active Medications
    const activeMeds = medications.filter(m => m.active);
    if (activeMeds.length > 0) {
      doc.setFontSize(12);
      doc.text('ACTIVE MEDICATION REGIMEN', 15, currentY);
      
      doc.autoTable({
        startY: currentY + 5,
        head: [['Medication', 'Dosage', 'Frequency']],
        body: activeMeds.map(m => [m.name, m.dosage, m.frequency]),
        theme: 'grid',
        headStyles: { fillColor: primaryColor }
      });
      currentY = doc.lastAutoTable?.finalY + 15 || currentY + 45;
    }

    // Clinical Reports
    if (reports.length > 0) {
      doc.setFontSize(12);
      doc.text('HISTORICAL CLINICAL REPORTS', 15, currentY);
      
      doc.autoTable({
        startY: currentY + 5,
        head: [['Date', 'Report Type', 'Specialist', 'Status']],
        body: reports.map(r => [new Date(r.timestamp).toLocaleDateString(), r.title, r.specialist, r.status]),
        theme: 'striped',
        headStyles: { fillColor: primaryColor }
      });
      currentY = doc.lastAutoTable?.finalY + 15 || currentY + 45;
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`This document is for clinical summary purposes only. Produced via Chikitsa Cloud. Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`Clinical_Summary_${user?.name || 'User'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const deleteReport = async (id) => {
    if (window.confirm('Delete this clinical record from your secure archive?')) {
      try {
        const resp = await authFetch(`/api/reports/${id}`, {
          method: 'DELETE'
        });
        if (resp.ok) {
          setReports(reports.filter(r => r.id !== id));
        } else {
          alert('Failed to delete report from clinical archive.');
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredReports = reports.filter(r => 
    (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.specialist || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Premium Pro CTA for Clinical Summary */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl",
          isPro ? "bg-slate-900 text-white" : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10"
        )}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
              <div className={cn(
                "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-xl",
                isPro ? "bg-medical-500 text-white" : "bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400"
              )}>
                 <Printer size={32} />
              </div>
              <div className="space-y-1">
                 <h2 className={cn(
                   "text-2xl font-black uppercase tracking-tight",
                   isPro ? "text-white" : "text-slate-900 dark:text-white"
                 )}>Clinical Health Report Generator</h2>
                 <p className={cn("text-sm font-bold", isPro ? "text-slate-400" : "text-slate-500 dark:text-slate-400")}>
                    {isPro 
                       ? "You are authorized to generate unified medical summaries." 
                       : "Upgrade to Pro to generate a beautiful, single-page health summary."}
                 </p>
              </div>
           </div>
           
           <button 
             onClick={handlePrintSummary}
             className={cn(
               "px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all hover:scale-105 active:scale-95",
               isPro 
                 ? "bg-white text-slate-900 shadow-xl" 
                 : "bg-medical-500 text-white shadow-xl shadow-medical-500/20"
             )}
           >
              {isPro ? (
                <>Generate Pro Summary <Sparkles size={14} /></>
              ) : (
                <>Unlock Pro Feature <Crown size={14} /></>
              )}
           </button>
        </div>
        {isPro && (
           <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none">
              <Crown size={120} />
           </div>
        )}
      </motion.div>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Clinical Reports</h1>
          <p className="text-slate-500 font-medium tracking-tight">Access and export your synthesized medical history.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => fetchData(true)}
            className={cn(
              "p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-medical-600 transition-all",
              refreshing && "animate-spin text-medical-500"
            )}
            title="Refresh Reports"
          >
            <RefreshCw size={20} />
          </button>
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-medical-500 transition-all font-medium"
            />
          </div>
          <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Reports Timeline */}
      <div className="space-y-6 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-px before:bg-slate-100 dark:before:bg-slate-800">
        {filteredReports.map((report) => (
          <div key={report.id} className="relative pl-16 group">
            {/* Timeline dot */}
            <div className={cn(
              "absolute left-6 top-10 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-950 transition-all z-10",
              report.status === 'Ready' ? "bg-emerald-500" : "bg-amber-500"
            )} />
            
            <motion.div 
              layout
              className={cn(
                "card-premium overflow-hidden cursor-pointer",
                expandedReport === report.id ? "ring-2 ring-medical-500/30" : ""
              )}
              onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
            >
              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-6">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-medical-600 transition-colors flex-shrink-0">
                      <FileText size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          report.urgency === 'Caution' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {report.urgency}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Calendar size={12} /> {report.timestamp ? new Date(report.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent Analysis'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{report.title}</h3>
                      <p className="text-sm font-bold text-slate-500 mt-1 tracking-tight">Analyzed by {report.specialist}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 self-start md:self-center">
                    {report.status === 'Ready' ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest">
                        <CheckCircle2 size={16} /> Ready
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl text-xs font-black uppercase tracking-widest">
                        <Clock size={16} className="animate-spin" /> In Review
                      </div>
                    )}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-medical-600 transition-transform">
                      <ChevronDown size={20} className={cn("transition-transform duration-300", expandedReport === report.id ? "rotate-180" : "")} />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedReport === report.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800 grid md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Symptom Summary</h4>
                            <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400 italic">
                              "{report.diagnosis || report.findings || 'No detailed summary available.'}"
                            </p>
                          </div>
                          {report.vitals && (
                            <div>
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Detected Vitals</h4>
                               <div className="grid grid-cols-3 gap-4">
                                  {Object.entries(report.vitals).map(([k, v]) => (
                                    <div key={k} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{k}</p>
                                      <p className="text-xs font-black text-slate-900 dark:text-white">{v}</p>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                           <div className="p-6 bg-medical-50 dark:bg-medical-900/20 rounded-2xl border border-medical-100 dark:border-medical-800/30">
                              <h4 className="flex items-center gap-2 text-xs font-black text-medical-600 uppercase tracking-widest mb-3">
                                 <AlertCircle size={14} /> AI Recommendation
                              </h4>
                              <p className="text-xs font-bold text-medical-700 dark:text-medical-300 leading-relaxed">
                                 Based on current clinical markers, we recommend professional follow-up within 7 days. Avoid environmental irritants and maintain hydration levels above 2L/day.
                              </p>
                           </div>

                           <div className="flex gap-3">
                              <button className="flex-1 px-6 py-3 bg-medical-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-medical-700 transition-all shadow-lg shadow-medical-500/20">
                                 <Download size={18} /> Export PDF
                              </button>
                              <button 
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    deleteReport(report.id);
                                 }}
                                 className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                              >
                                 <Trash2 size={20} />
                              </button>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="py-24 text-center space-y-6">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200 border border-slate-100 dark:border-slate-800">
            <FileText size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Clinical Archive Empty</h3>
            <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm mt-1">Your analysis journey hasn't started yet. Initialize a Health Check to generate your first report.</p>
          </div>
        </div>
      )}
    </div>
  );
}
