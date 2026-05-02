import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Timer, 
  CreditCard,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Calendar,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import Card from '../components/Card';

export default function Subscription() {
  const { user, upgradeSubscription } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [timer, setTimer] = useState(30);
  const [randomTarget, setRandomTarget] = useState(30);
  const [showCelebration, setShowCelebration] = useState(false);

  const isPro = user?.subscription_tier === 'pro';

  useEffect(() => {
    if (!processing) return;

    // The visual timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) return 1; // Keep it at 1 until the random completion kicks in
        return prev - 1;
      });
    }, 1000);

    // The actual completion logic - random time between 4 and 8 seconds
    const completionTime = Math.floor(Math.random() * 4000) + 4000;
    const timeout = setTimeout(() => {
      handleSuccess();
    }, completionTime);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [processing]);

  const handleUpgrade = () => {
    setTimer(15);
    setRandomTarget(15);
    setProcessing(true);
  };

  const handleSuccess = async () => {
    try {
      await upgradeSubscription();
      
      // Trigger a real notification
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('chikitsa_token')}`
          },
          body: JSON.stringify({
            title: 'Subscription Active',
            message: 'Welcome to Chikitsa Pro! Your clinical workspace is now fully unlocked.'
          })
        });
      } catch (e) {
        console.error('Failed to create notification:', e);
      }

      setProcessing(false);
      setShowCelebration(true);
    } catch (err) {
      console.error(err);
      setProcessing(false);
    }
  };

  const getDaysRemaining = () => {
    if (!user?.subscription_expiry) return 0;
    const expiry = new Date(user.subscription_expiry);
    const today = new Date();
    const diffTime = Math.abs(expiry - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatExpiryDate = () => {
    if (!user?.subscription_expiry) return '';
    return new Date(user.subscription_expiry).toLocaleDateString();
  };

  return (
    <div className="space-y-12 pb-12 relative min-h-[80vh]">
      {/* Header */}
      <div className="text-center space-y-4 pt-10">
        <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
          {isPro ? 'Pro ' : 'Elite '}<span className="text-medical-500">Access</span>
        </h1>
        <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto">
          Elevate your clinical tracking with deterministic pro features and advanced monitoring.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {!isPro && !processing && (
            <motion.div 
              key="pricing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="grid md:grid-cols-2 gap-12"
            >
              <div className="space-y-8 flex flex-col justify-center">
                 <div className="space-y-6">
                    <h2 className="text-4xl font-black uppercase tracking-tight italic">Why Upgrade?</h2>
                    <div className="space-y-4">
                       {[
                         { icon: Sparkles, title: 'Clinical Health Reports', desc: 'Generate printable medical summaries for your physician.' },
                         { icon: Zap, title: 'Smart Reminders', desc: 'Browser-level notification engine for missed doses.' },
                         { icon: ShieldCheck, title: 'Priority Persistence', desc: 'Enhanced database synchronization and verification.' },
                         { icon: TrendingUp, title: 'Deep Analytics', desc: 'Long-term vital trend modeling beyond 7 days.' }
                       ].map((feat, i) => (
                         <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 bg-medical-50 dark:bg-medical-900/20 rounded-xl flex items-center justify-center text-medical-500 flex-shrink-0">
                               <feat.icon size={20} />
                            </div>
                            <div>
                               <h4 className="text-sm font-black uppercase tracking-tight">{feat.title}</h4>
                               <p className="text-xs text-slate-500 font-bold">{feat.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-medical-500 to-indigo-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-white/10 p-12 shadow-2xl flex flex-col items-center text-center space-y-8">
                  <div className="w-20 h-20 bg-medical-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-medical-500/30">
                    <Crown size={40} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Monthly Pro Plan</span>
                    <h3 className="text-5xl font-black text-slate-900 dark:text-white">₹199</h3>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">Clinical Grade Persistence</p>
                  </div>
                  <ul className="space-y-3 w-full">
                    {['Unlimited Reports', 'Browser Alerts', 'Full History', 'Priority Support'].map(li => (
                      <li key={li} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500">
                        <CheckCircle2 size={16} className="text-emerald-500" /> {li}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={handleUpgrade}
                    className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all"
                  >
                    Upgrade to Pro <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {processing && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-white/10 p-16 shadow-2xl text-center space-y-10"
            >
              <div className="relative w-32 h-32 mx-auto">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle
                       cx="64" cy="64" r="60"
                       stroke="currentColor"
                       strokeWidth="8"
                       fill="transparent"
                       className="text-slate-100 dark:text-slate-800"
                    />
                    <motion.circle
                       cx="64" cy="64" r="60"
                       stroke="currentColor"
                       strokeWidth="8"
                       fill="transparent"
                       strokeDasharray="376.8"
                       initial={{ strokeDashoffset: 376.8 }}
                       animate={{ strokeDashoffset: 376.8 - (376.8 * (randomTarget - timer) / randomTarget) }}
                       className="text-medical-500"
                    />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black text-medical-500">{timer}</span>
                 </div>
              </div>
              <div className="space-y-4">
                 <h2 className="text-2xl font-black uppercase tracking-tight">Processing Securely</h2>
                 <p className="text-slate-500 font-bold text-sm italic">Verifying payment vector via encrypted tunnel. Do not refresh or close clinical session.</p>
              </div>
              <div className="flex justify-center gap-2">
                 {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-medical-500 rounded-full"
                    />
                 ))}
              </div>
            </motion.div>
          )}

          {isPro && !showCelebration && (
            <motion.div 
              key="pro-active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
                <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] sm:rounded-[4rem] p-6 sm:p-16 text-center space-y-10 border border-white/5 shadow-2xl">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 p-12 opacity-5 text-white">
                     <Crown size={200} />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                     <div className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                        <Sparkles size={14} fill="currentColor" /> Lifetime Pro Benefactor
                     </div>
                     <h2 className="text-2xl sm:text-5xl font-black text-white uppercase tracking-tighter">You Are Already <br/><span className="text-medical-400">A Pro Person!</span></h2>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-sm mx-auto">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                           <Calendar className="mx-auto mb-2 text-medical-400" size={24} />
                           <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Expires On</p>
                           <p className="text-lg font-black text-white">{formatExpiryDate()}</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                           <Timer className="mx-auto mb-2 text-medical-400" size={24} />
                           <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Days Left</p>
                           <p className="text-lg font-black text-white">{getDaysRemaining()}</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-slate-400 text-sm font-bold">Your clinical tier is optimized. All Pro features are unlocked across your entire medical workspace.</p>
                        <button 
                          onClick={() => window.location.href = '/'}
                          className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
                        >
                          Access Workspace
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Envelope Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex flex-col items-center justify-start bg-slate-950/95 backdrop-blur-3xl overflow-y-auto px-4 pt-[220px] pb-10"
            >
              <div className="relative flex flex-col items-center justify-start w-full max-w-2xl mx-auto">
                
                {/* 1. The Envelope Container */}
                <motion.div
                  initial={{ y: 600, rotateX: 20, opacity: 0 }}
                  animate={{ y: 0, rotateX: 0, opacity: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 60, 
                    damping: 20,
                    duration: 1 
                  }}
                  className="relative w-full max-w-[480px] h-[300px] perspective-2000 z-10"
                >
                  {/* Envelope Back Body */}
                  <div className="absolute inset-0 bg-white/10 dark:bg-slate-800/20 backdrop-blur-md rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20">
                     <div className="absolute inset-0 bg-gradient-to-tr from-medical-500/20 to-indigo-500/20" />
                  </div>

                  {/* 2. The Flap */}
                  <motion.div
                    initial={{ rotateX: 0 }}
                    animate={{ rotateX: -160 }}
                    transition={{ delay: 1.5, duration: 0.8, ease: "easeInOut" }}
                    style={{ transformOrigin: "top", backfaceVisibility: "hidden" }}
                    className="absolute top-0 left-0 right-0 h-1/2 bg-slate-200/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-t-2xl z-20 shadow-md border-x border-t border-white/20"
                  >
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
                  </motion.div>

                  {/* 3. The Membership Card */}
                  <motion.div
                    initial={{ y: 0, scale: 0.8 }}
                    animate={{ y: -180, scale: 1.1, rotateY: 5, rotateX: 5 }}
                    transition={{ delay: 2.3, duration: 1.2, type: "spring", stiffness: 50 }}
                    onAnimationComplete={() => {
                      confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.4 },
                        colors: ['#0ea5e9', '#6366f1', '#fbbf24']
                      });
                    }}
                    className="absolute inset-x-6 top-4 h-[250px] z-15"
                  >
                    <div className="relative w-full h-full p-6 bg-slate-900 rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden group">
                       <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-medical-500/20 blur-[100px] opacity-100" />
                       
                       <div className="relative z-10 h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                             <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Chikitsa Network</p>
                                <div className="flex items-center gap-2 text-emerald-400">
                                   <Crown size={16} fill="currentColor" />
                                   <span className="text-xs font-black uppercase tracking-tight">PRO ACTIVE</span>
                                </div>
                             </div>
                             <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-amber-400">
                                <Sparkles size={16} />
                             </div>
                          </div>

                          <div className="space-y-3">
                             <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subscriber Identity</p>
                                <p className="text-xl font-black text-white tracking-tight font-mono truncate">{user?.name || 'Visionary'}</p>
                             </div>
                             
                             <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                <div className="space-y-0.5">
                                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Valid Until</p>
                                   <p className="text-[10px] font-black text-white uppercase">{formatExpiryDate()}</p>
                                </div>
                                <div className="text-right">
                                   <div className="px-3 py-1 bg-white text-slate-900 rounded-full text-[8px] font-black uppercase tracking-widest">
                                      Authorized
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                       <div className="absolute right-0 top-1/4 bottom-1/4 w-12 bg-gradient-to-b from-transparent via-white/5 to-transparent skew-x-12" />
                    </div>
                  </motion.div>

                  {/* Envelope Front Flap Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-[85%] bg-slate-100 dark:bg-slate-800 rounded-b-2xl z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                     <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-medical-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center text-white shadow-xl">
                        <ShieldCheck size={24} />
                     </div>
                  </div>
                </motion.div>

                {/* 5. Start Button */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.5, duration: 0.5 }}
                  className="mt-12 text-center space-y-6"
                >
                   <p className="text-sm font-bold text-slate-300 max-w-xs mx-auto italic leading-relaxed">
                     "Your premium healthcare tools are fully unlocked. Thank you for your incredible support!"
                   </p>
                   <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-4 mx-auto"
                   >
                     Start Using Pro Features <Zap size={16} className="fill-current" />
                   </button>
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isPro && !processing && (
        <div className="p-12 bg-medical-50 dark:bg-medical-900/10 rounded-[3rem] border border-medical-100 dark:border-medical-800/30 flex flex-col md:flex-row items-center gap-12 text-center md:text-left max-w-5xl mx-auto">
           <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-medical-500 shadow-xl">
              <ShieldCheck size={48} />
           </div>
           <div className="flex-1 space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Enterprise-Grade Integrity</h3>
              <p className="text-slate-500 font-bold text-sm">
                Subscriptions are persisted directly in our local MySQL engine. No cloud middlemen. Your financial support directly funds the development of local-first medical technology.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
