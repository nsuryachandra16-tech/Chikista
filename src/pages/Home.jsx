import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  ShieldCheck, 
  Activity, 
  Brain, 
  ArrowRight,
  Sparkles,
  Zap,
  Microscope,
  LineChart,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: Brain,
    title: "Clinical Intelligence",
    desc: "Advanced neural networks trained on certified medical datasets for accurate symptom clustering."
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    desc: "Real-time risk assessment badges and emergency escalation protocols for critical conditions."
  },
  {
    icon: Microscope,
    title: "Deep Analysis",
    desc: "Comprehensive logic gates that analyze subtle physiological patterns to identify rare conditions."
  }
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      {/* Hero Section */}
      <div className="text-center mb-32 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 rounded-full text-xs font-black uppercase tracking-widest mb-10 shadow-sm border border-medical-100 dark:border-medical-800"
        >
          <Sparkles size={14} className="animate-pulse" />
          <span>v2.0 Performance Medical Engine</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tight mb-10 leading-[0.9] uppercase"
        >
          Clinical Minds. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 to-emerald-600">AI Precision.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed font-semibold tracking-tight"
        >
          Chikitsa is a premium clinical intelligence layer for personal health monitoring. We bridge the gap between symptoms and verified medical knowledge.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link 
            to="/health-check" 
            className="w-full sm:w-auto px-10 py-5 bg-medical-500 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-medical-600 shadow-xl shadow-medical-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
          >
            New Health Check
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
          <Link 
            to="/dashboard" 
            className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            Access Console
          </Link>
        </motion.div>

        {/* Hero Shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-full -z-10 blur-[120px] opacity-20 pointer-events-none">
           <div className="absolute top-0 left-0 w-64 h-64 bg-medical-500 rounded-full" />
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500 rounded-full" />
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-32">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card-premium p-10 hover:-translate-y-2"
          >
            <div className="w-16 h-16 bg-medical-50 dark:bg-medical-900/40 text-medical-600 dark:text-medical-400 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
              <f.icon size={32} />
            </div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{f.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Trust Section */}
      <div className="bg-slate-900 dark:bg-medical-900/20 rounded-[3.5rem] p-12 md:p-20 text-white flex flex-col lg:flex-row items-center justify-between gap-16 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10">
              <Lock size={12} /> Privacy First Data Architecture
           </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase leading-tight">Advanced Logic. <br /> Human Context.</h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">Our system processes longitudinal health patterns to provide assessment guides that evolve with your data.</p>
          <div className="grid grid-cols-2 gap-8">
             <div>
                <p className="text-3xl font-black text-medical-500">92k+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Data Mappings</p>
             </div>
             <div>
                <p className="text-3xl font-black text-emerald-500">24/7</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Cloud Monitoring</p>
             </div>
          </div>
        </div>
        
        <div className="relative z-10 w-full lg:w-auto">
           <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/10 space-y-8">
              {[
                 { label: 'Clinical Accuracy', val: 98, icon: Activity },
                 { label: 'Response Latency', val: 4, icon: Zap },
                 { label: 'Data Integrity', val: 100, icon: LineChart },
              ].map((stat) => (
                 <div key={stat.label} className="w-64 space-y-3">
                    <div className="flex justify-between items-end">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                       <p className="text-sm font-black text-medical-500">{stat.val === 4 ? '4ms' : `${stat.val}%`}</p>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.val}%` }}
                          transition={{ duration: 2 }}
                          className="h-full bg-medical-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                       />
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-medical-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
