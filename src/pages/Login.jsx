import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, ArrowRight, Stethoscope } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message?.includes('unverified') || err.message?.includes('403')) {
        navigate('/verify', { state: { email: email.trim() } });
      } else {
        setError(err.message || 'Failed to login. Please check your credentials.');
      }
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
            Intelligence <br />
            <span className="text-medical-200">Refined.</span>
          </h1>
          <p className="text-xl text-medical-50 max-w-md leading-relaxed font-semibold tracking-tight">
            The platform designed for clinical precision and intelligent health monitoring.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
            <p className="italic text-medical-50 mb-6 font-medium leading-relaxed">"Chikitsa transformed the way we handle initial investigations. The clustering engine is remarkably accurate."</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center font-black">AS</div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">Dr. Aryan Sharma</p>
                <p className="text-[10px] text-medical-200 uppercase tracking-[0.2em] font-black">Medical Director</p>
              </div>
            </div>
          </div>
        </div>

        {/* Abstract Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/20 rounded-full blur-[120px]" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-white/10 rounded-full" 
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[1px] border-white/5 rounded-full" 
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
          <div className="lg:hidden mb-12 flex justify-center">
            <div className="w-16 h-16 bg-medical-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-medical-500/20">
              <Stethoscope size={32} />
            </div>
          </div>

          <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">Welcome Back</h2>
          <p className="text-slate-500 font-bold mb-10 tracking-tight leading-relaxed">Enter your clinical credentials to access the console.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 rounded-2xl font-bold text-sm">
                {error}
              </div>
            )}

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
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2 group-focus-within:text-medical-500 transition-colors">Security Key</label>
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
              {loading ? "Verifying..." : (
                <>
                  Enter Console
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-500 font-bold text-sm">
            Don't have a practice account?{' '}
            <Link to="/signup" className="text-medical-600 font-black hover:underline underline-offset-4">Request Access</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
