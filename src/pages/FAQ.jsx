import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Stethoscope,
  Search,
  MessageSquare,
  Clock
} from 'lucide-react';
import Card from '../components/Card';
import { cn } from '../lib/utils';

const FAQItem = ({ question, answer, isOpen, onToggle, index }) => {
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-none">
      <button
        onClick={onToggle}
        className="w-full py-8 flex items-center justify-between text-left group transition-all"
      >
        <span className={cn(
          "text-lg font-black uppercase tracking-tight transition-colors",
          isOpen ? "text-medical-500" : "text-slate-700 dark:text-slate-300 group-hover:text-medical-400"
        )}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            isOpen ? "bg-medical-500 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
          )}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-slate-500 dark:text-slate-400 font-bold leading-relaxed pr-12">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqData = [
    {
      category: 'System Mechanics',
      icon: Stethoscope,
      items: [
        {
          q: "How does the Symptom Tracker work?",
          a: "Describe your symptoms in natural language. Our clinical pattern analyzer evaluates inputs against broad medical datasets to provide preliminary insights without storing raw sensitive text in public servers."
        },
        {
          q: "Is my personal health data safe?",
          a: "Absolute integrity is our core priority. Your medical history, clinical documents, and vital telemetry are strictly private. We utilize secure JWT tokens, local MySQL persistence, and industry-standard encryption for all data layers."
        }
      ]
    },
    {
      category: 'Medical Guardrails',
      icon: ShieldCheck,
      items: [
        {
          q: "Does this replace real medical advice?",
          a: "Categorically, no. Chikitsa is an information and tracking engine designed strictly for early evaluation and clinical logging. Always consult a board-certified healthcare professional for primary diagnosis and treatment plans."
        },
        {
          q: "How accurate is the AI Analysis?",
          a: "The Gemini-powered analysis uses high-density clinical datasets. While highly sophisticated, it functions as a decision-support tool, not a diagnostic authority. Reliability is best when paired with verified doctor reviews."
        }
      ]
    },
    {
      category: 'Usage & Controls',
      icon: BookOpen,
      items: [
        {
          q: "How do I use the Medication Planner?",
          a: "Leverage our Pharma Knowledge search (powered by clinical NLP) to find your medications. Once identified, save them directly to your personal regimen with custom dosage schedules and automated intake reminders."
        },
        {
          q: "Can I export my clinical logs?",
          a: "Yes. All biometric telemetry—from heart rate trends to journal reflections—is stored in a structured format designed for easy export during your next physician appointment."
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-24">
      {/* Search/Header Header */}
      <section className="text-center space-y-8 pt-10">
        <div className="w-20 h-20 bg-medical-50 dark:bg-medical-900/30 text-medical-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm ring-1 ring-medical-100 dark:ring-medical-800">
           <HelpCircle size={40} />
        </div>
        <div className="space-y-3">
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
            Help <span className="text-medical-500">Center</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg">Clear answers for a more informed healthcare journey.</p>
        </div>
      </section>

      {/* Accordion Categories */}
      <div className="space-y-16">
        {faqData.map((category, catIdx) => (
          <motion.div
             key={category.category}
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: catIdx * 0.1 }}
             className="space-y-8"
          >
            <div className="flex items-center gap-4 px-2">
               <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                  <category.icon size={18} />
               </div>
               <h2 className="text-xl font-black uppercase tracking-[0.2em]">{category.category}</h2>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-xl shadow-slate-200/20 dark:shadow-none">
              {category.items.map((item, itemIdx) => {
                const combinedIndex = `${catIdx}-${itemIdx}`;
                return (
                  <FAQItem
                    key={item.q}
                    question={item.q}
                    answer={item.a}
                    isOpen={openIndex === combinedIndex}
                    onToggle={() => setOpenIndex(openIndex === combinedIndex ? null : combinedIndex)}
                  />
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Prompt */}
      <section className="p-10 bg-medical-500 rounded-[3rem] text-center space-y-4 shadow-2xl shadow-medical-500/20">
         <p className="text-white/80 font-black uppercase tracking-widest text-[10px]">Still have clinical inquiries?</p>
         <h3 className="text-2xl font-black text-white uppercase tracking-tight">Access Our Expert Support Vector</h3>
         <button className="mt-4 px-10 py-5 bg-white text-medical-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all">
            Initiate Secure Dialogue
         </button>
      </section>
    </div>
  );
}
