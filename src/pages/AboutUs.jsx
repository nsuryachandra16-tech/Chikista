import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Globe, 
  Quote,
  Github,
  Twitter,
  Linkedin,
  Rocket,
  Heart
} from 'lucide-react';
import Card from '../components/Card';
import { cn } from '../lib/utils';

const VisionaryCard = ({ name, title, quote, color, index, image, badge }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.8, ease: "circOut" }}
      style={{ perspective: "1200px" }}
      className="relative group"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        className={cn(
          "relative w-full max-w-[400px] sm:aspect-[4/5] min-h-[420px] rounded-[3rem] p-6 sm:p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 shadow-2xl transition-all duration-300",
          "group-hover:shadow-[0_0_80px_rgba(20,184,166,0.1)] dark:group-hover:shadow-[0_0_80px_rgba(255,255,255,0.05)]",
          color === 'emerald' ? 'hover:border-emerald-500/50' : 'hover:border-sky-500/50'
        )}
      >
        {/* Glow Effect */}
        <div className={cn(
          "absolute -inset-1 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
          color === 'emerald' ? 'bg-emerald-500' : 'bg-sky-500'
        )} />

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="space-y-6">
            <div className={cn(
              "w-24 h-24 rounded-[2rem] flex items-center justify-center text-white shadow-xl overflow-hidden",
              color === 'emerald' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-sky-400 to-sky-600'
            )}>
              {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover" />
              ) : (
                <Rocket size={40} />
              )}
            </div>
            <div className="space-y-1">
              {badge && (
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 border rounded-full font-black text-[9px] uppercase tracking-widest w-fit mb-2 shadow-sm",
                  color === 'emerald' ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" : "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800"
                )}>
                  {badge}
                </div>
              )}
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-tight">{name}</h3>
              <p className={cn(
                "text-[10px] font-black uppercase tracking-[0.3em] pt-1",
                color === 'emerald' ? 'text-emerald-500' : 'text-sky-500'
              )}>
                {title}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="relative">
              <Quote className="absolute -top-4 -left-4 w-12 h-12 text-slate-100 dark:text-white/5" />
              <p className="text-base font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed relative z-10">
                "{quote}"
              </p>
            </div>

            <div className="flex gap-4">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <button key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-medical-500 hover:bg-medical-50 transition-all">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function AboutUs() {
  const pillars = [
    { 
      title: 'Patient Privacy First', 
      desc: 'Fully encrypted clinical logs and secure JWT-based identity tokens ensure data remains exactly where it belongs.',
      icon: ShieldCheck,
      color: 'bg-emerald-500'
    },
    { 
      title: 'Accessible Insights', 
      desc: 'Transforming dense medical jargon into clinical trend analysis using high-end Recharts visualization metrics.',
      icon: TrendingUp,
      color: 'bg-sky-500'
    },
    { 
      title: 'Care Networking', 
      desc: 'Low-latency infrastructure connecting patients to local health hubs through advanced spatial mapping.',
      icon: Globe,
      color: 'bg-rose-500'
    }
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative text-center space-y-10 pt-10">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="space-y-4"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-medical-50 dark:bg-medical-900/30 rounded-full border border-medical-100 dark:border-medical-800 text-medical-600 dark:text-medical-400 font-black text-[10px] uppercase tracking-widest">
             <Heart size={14} fill="currentColor" /> The Visionaries
          </div>
          <h1 className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white">
            Beyond the <span className="text-medical-500">Interface</span>
          </h1>
          <p className="text-slate-500 font-bold text-xl max-w-2xl mx-auto">
            Chikitsa represents a paradigm shift in personalized healthcare telemetry, built by engineers who value clinical integrity.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 pt-12">
          <VisionaryCard 
            index={0}
            name="Nimmagadda Suryachandra"
            title="Chief Systems Architect"
            quote="Pioneered the end-to-end technical development, taking the project from early concept to a fully production-ready clinical ecosystem."
            color="emerald"
            badge="Ideation to Implementation"
          />
          <VisionaryCard 
            index={1}
            name="Vissamsetti Srujan"
            title="Strategic Operations Lead"
            quote="Conceived the original vision and core concepts, laying down the foundational roadmap for advanced patient-first telemetry."
            color="sky"
            badge="Conceptual Visionary"
          />
        </div>
      </section>

      {/* Pillars Section */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
           <h2 className="text-4xl font-black uppercase tracking-tight">Our Core Pillars</h2>
           <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">Deterministic Standards for Better Outcomes</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
           {pillars.map((p, i) => (
             <motion.div
               key={p.title}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:border-medical-500 transition-all"
             >
               <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg", p.color)}>
                  <p.icon size={28} />
               </div>
               <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-slate-900 dark:text-white">{p.title}</h3>
               <p className="text-slate-500 font-medium leading-relaxed">{p.desc}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Final CTA/Vision */}
      <section className="p-8 sm:p-16 bg-slate-900 dark:bg-white rounded-[2rem] sm:rounded-[4rem] text-center space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 space-y-6">
           <h2 className="text-2xl sm:text-4xl font-black text-white dark:text-slate-900 uppercase tracking-tighter">Join the Chikitsa Movement</h2>
           <p className="text-slate-400 dark:text-slate-500 font-bold text-lg max-w-xl mx-auto uppercase tracking-widest text-xs">A local-first healthcare engine designed for the future of decentralized care logs.</p>
           <button className="px-12 py-6 bg-medical-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-medical-500/20 hover:scale-105 transition-all">
             Initialize Health Cloud
           </button>
        </div>
      </section>
    </div>
  );
}
