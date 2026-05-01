import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Stethoscope } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signup(email.trim(), password.trim(), name.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-medical-600 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center ring-1 ring-white/30">
              <Stethoscope size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">Chikitsa</span>
          </div>
          
          <h1 className="text-7xl font-black leading-[0.9] mb-8 uppercase tracking-tighter">
            Join the <br />
            <span className="text-medical-200">Intelligence.</span>
          </h1>
          <p className="text-xl text-medical-50 max-w-md leading-relaxed font-semibold tracking-tight">
            Create an account to access clinical-grade insights and manage your synthesized health reports.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className="text-sm font-black italic mb-1 uppercase tracking-tighter text-medical-200">Neural Synthesis</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white opacity-60 font-bold">Optimized Symptom Mapping</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-sm font-black italic mb-1 uppercase tracking-tighter text-medical-200">Privacy First</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white opacity-60 font-bold">Secure Local PII Control</p>
            </div>
          </div>
        </div>

        {/* Abstract Background */}
        <div className="absolute inset-0">
           <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-medical-500/10 rounded-full blur-[100px]" />
           <motion.div 
             animate={{ scale: [1, 1.1, 1] }}
             transition={{ duration: 10, repeat: Infinity }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"
           />
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">Create Account</h2>
          <p className="text-slate-500 font-bold mb-10 tracking-tight leading-relaxed">Begin your journey with Chikitsa Clinical Intelligence.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 rounded-2xl font-bold text-sm">
                {error}
              </div>
            )}

            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2 group-focus-within:text-medical-500 transition-colors">Full Name</label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-16 pl-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] focus:ring-4 focus:ring-medical-500/10 focus:border-medical-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                  placeholder="John Doe"
                />
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medical-500 transition-colors" size={20} />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2 group-focus-within:text-medical-500 transition-colors">Email Address</label>
              <div className="relative">
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-16 pl-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] focus:ring-4 focus:ring-medical-500/10 focus:border-medical-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                  placeholder="name@clinic.com"
                />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medical-500 transition-colors" size={20} />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2 group-focus-within:text-medical-500 transition-colors">Create Password</label>
              <div className="relative">
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-16 pl-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] focus:ring-4 focus:ring-medical-500/10 focus:border-medical-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medical-500 transition-colors" size={20} />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-medical-500 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-medical-600 disabled:opacity-50 transition-all shadow-xl shadow-medical-500/20 active:scale-[0.98]"
            >
              {loading ? "Registering..." : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-500 font-bold text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-medical-600 font-black hover:underline underline-offset-4">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
