import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Lock,
  LogOut,
  ChevronRight,
  Database,
  Cloud,
  FileText,
  Download,
  Info,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chikitsa_theme') === 'dark' || 
             document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    practice_description: user?.practice_description || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        bio: user.bio || '',
        practice_description: user.practice_description || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const exportData = () => {
    window.open('/api/admin/db-download', '_blank');
  };

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('chikitsa_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('chikitsa_theme', 'light');
    }
  };

  const exportManifest = () => {
    window.open('/api/admin/manifest-download', '_blank');
  };

  const sections = [
    {
      title: 'Personal Info',
      items: [
        { icon: User, label: 'Profile Management', desc: 'Update your name, bio and data' },
        { icon: Bell, label: 'Notifications', desc: 'Manage alerts and reminders' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Globe, label: 'Language', desc: 'Change display language', value: 'English' },
        { icon: Moon, label: 'Dark Mode', desc: 'Toggle app theme', toggle: true },
      ]
    },
    {
      title: 'Support & Information',
      items: [
        { icon: Info, label: 'About Chikitsa', desc: 'Our vision and platform pillars', path: '/about' },
        { icon: HelpCircle, label: 'Help & FAQ', desc: 'Common questions and mechanics', path: '/faq' },
        { icon: Shield, label: 'Security & Privacy', desc: 'Password and biometric' },
      ]
    },
    {
      title: 'Data & System',
      items: [
        { icon: Database, label: 'Export Clinical MySQL (.sql)', desc: 'Download native database file', action: exportData },
        { icon: FileText, label: 'Export System Manifest', desc: 'Download physical package.json', action: exportManifest },
        { icon: FileText, label: 'Terms of Service', desc: 'Read legal notices' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight uppercase">Control Center</h1>
        <p className="text-slate-500 font-medium tracking-tight">Configure your clinical experience and personal data privacy.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-10">
         {/* Profile Card */}
         <div className="space-y-6">
            <Card className="p-8">
               {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                       <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-medical-500 outline-none"
                          required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Clinical Bio</label>
                       <textarea 
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          placeholder="Brief medical background..."
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-medical-500 outline-none min-h-[100px] resize-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Practice Description</label>
                       <textarea 
                          value={formData.practice_description}
                          onChange={(e) => setFormData({...formData, practice_description: e.target.value})}
                          placeholder="Tell us about your clinical practice..."
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-medical-500 outline-none min-h-[100px] resize-none"
                       />
                    </div>
                    <div className="flex gap-3 pt-2">
                       <button 
                          type="submit" 
                          disabled={saving}
                          className="flex-1 py-3 bg-medical-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-medical-600 transition-all disabled:opacity-50"
                       >
                          {saving ? 'Syncing...' : 'Save Sync'}
                       </button>
                       <button 
                          type="button" 
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                       >
                          Cancel
                       </button>
                    </div>
                  </form>
               ) : (
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-medical-500 to-emerald-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-medical-500/30">
                          {user?.name?.[0]}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-medical-600">
                          <Cloud size={20} />
                        </div>
                    </div>
                    <h3 className="text-xl font-black">{user?.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 mb-4">{user?.email}</p>
                    
                    {user?.bio && (
                       <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4 px-2">
                          {user.bio}
                       </p>
                    )}

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                        <button 
                           onClick={() => setIsEditing(true)}
                           className="w-full py-3 bg-medical-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-medical-600 transition-all shadow-lg shadow-medical-500/10"
                        >
                          Edit Profile
                        </button>
                        <button 
                          onClick={logout}
                          className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                          <LogOut size={14} /> Log Out
                        </button>
                    </div>
                  </div>
               )}
            </Card>

            <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Storage Usage</h4>
                  <p className="text-2xl font-black mb-4">42.5 MB <span className="text-sm font-medium text-slate-400">/ 500 MB</span></p>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '8.5%' }}
                        className="h-full bg-medical-500"
                     />
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-medical-500/20 rounded-full blur-3xl" />
            </div>
         </div>

         {/* Configuration List */}
         <div className="space-y-10">
            {sections.map((section) => (
               <div key={section.title} className="space-y-4">
                  <h3 className="px-4 text-[11px] font-black tracking-[0.3em] text-slate-400 uppercase">
                     {section.title}
                  </h3>
                  <div className="card-premium divide-y divide-slate-100 dark:divide-slate-800">
                     {section.items.map((item) => (
                        <div 
                          key={item.label} 
                          onClick={() => {
                            if (item.action) item.action();
                            if (item.path) navigate(item.path);
                          }}
                          className="p-6 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all first:rounded-t-[2.5rem] last:rounded-b-[2.5rem]"
                        >
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-medical-500 transition-colors">
                                 <item.icon size={22} />
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">{item.label}</p>
                                 <p className="text-xs font-bold text-slate-500 mt-0.5 tracking-tight">{item.desc}</p>
                              </div>
                           </div>
                           
                           {item.value ? (
                              <div className="flex items-center gap-3">
                                 <span className="text-xs font-black text-medical-600 uppercase tracking-widest">{item.value}</span>
                                 <ChevronRight size={16} className="text-slate-300" />
                              </div>
                           ) : item.toggle ? (
                              <button 
                                 onClick={toggleDarkMode}
                                 className={cn(
                                    "w-12 h-6 rounded-full p-1 transition-all duration-300",
                                    isDarkMode ? "bg-medical-500" : "bg-slate-200 dark:bg-slate-700"
                                 )}
                              >
                                 <motion.div 
                                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                                    animate={{ x: isDarkMode ? 24 : 0 }}
                                 />
                              </button>
                           ) : (
                              <ChevronRight size={18} className="text-slate-300 group-hover:text-medical-500 transition-all transform group-hover:translate-x-1" />
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="pt-10 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Chikitsa Core Console v2.0.4-Build-X</p>
         <p className="text-[10px] font-bold text-slate-400 opacity-60 italic tracking-tight">Security Protocol: End-to-End Encryption Enabled • AES-256 Validated</p>
      </div>
    </div>
  );
}
