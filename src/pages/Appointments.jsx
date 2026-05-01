import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  MapPin, 
  Star, 
  Clock, 
  Calendar, 
  CheckCircle2,
  ChevronRight,
  User,
  Stethoscope,
  XCircle,
  Video,
  Hospital
} from 'lucide-react';
import Card from '../components/Card';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function Appointments() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">ConsultConnect</h1>
          <p className="text-slate-500 font-medium tracking-tight">Direct clinical access to top-tier medical specialists.</p>
        </div>
      </div>

      <div className="relative min-h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800" />
        
        <div className="relative z-10 text-center max-w-xl px-10 space-y-8">
           <div className="w-24 h-24 bg-medical-50 dark:bg-medical-900/30 text-medical-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
              <Hospital size={48} />
           </div>
           
           <div className="space-y-4">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Feature <span className="text-medical-500">Coming Soon</span></h2>
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl shadow-sm italic text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                "We are currently partnering with major clinical centers and hospital networks to provide a direct, secure integration for seamless appointment scheduling. Our goal is to bring decentralized scheduling protocols directly to your Chikitsa workspace."
              </div>
           </div>

           <div className="flex flex-wrap items-center justify-center gap-6 opacity-60 grayscale">
              <div className="flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-medical-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hospital Syncing</span>
              </div>
              <div className="flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-medical-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Specialist Vetting</span>
              </div>
              <div className="flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-medical-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">API Integration</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
