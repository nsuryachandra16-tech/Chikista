import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, RefreshCcw } from 'lucide-react';

export default function Verify() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Email passed via state from Signup or Login
  const email = location.state?.email || '';

  const [resendStatus, setResendStatus] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Missing email address. Please log in or sign up again.');
      return;
    }
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Automatically login on verification success
      localStorage.setItem('token', data.token);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Missing email address.');
      return;
    }

    setResendStatus('');
    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setResendStatus('A new code has been sent to your email.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans select-none relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-medical-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="w-16 h-16 bg-medical-50 dark:bg-medical-950/40 text-medical-500 rounded-3xl flex items-center justify-center border border-medical-200/50 dark:border-medical-800/30">
            <ShieldCheck size={36} className="animate-pulse" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none"
        >
          Verify <span className="text-medical-500">Account</span>
        </motion.h2>

        <p className="mt-2 text-sm font-bold text-slate-500">
          Enter the 6-digit verification code sent to <br />
          <span className="text-slate-900 dark:text-white underline">{email || 'your email inbox'}</span>
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl py-8 px-6 border border-slate-200/60 dark:border-slate-800/60 shadow-2xl rounded-[2.5rem] sm:px-10 flex flex-col gap-6">
          <form className="space-y-6" onSubmit={handleVerify}>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-800/60 text-xs font-black uppercase tracking-wider rounded-2xl"
              >
                {error}
              </motion.div>
            )}

            {resendStatus && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60 text-xs font-black uppercase tracking-wider rounded-2xl"
              >
                {resendStatus}
              </motion.div>
            )}

            <div>
              <label htmlFor="code" className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                maxLength={6}
                required
                placeholder="Ex: 482910"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="block w-full px-5 py-4 text-center tracking-[0.5em] text-3xl font-black bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-4 bg-medical-500 hover:bg-medical-600 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleResend}
              className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-medical-500 dark:text-slate-400 dark:hover:text-medical-400 transition-colors"
            >
              <RefreshCcw size={14} />
              Didn't receive the code? Resend Code
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
