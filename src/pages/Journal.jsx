import React, { useState, useEffect } from 'react';
import {
  NotebookPen,
  Search,
  Plus,
  Trash2,
  Calendar,
  Tag,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { cn } from '../lib/utils';

export default function Journal() {
  const { authFetch } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  const fetchNotes = async () => {
    try {
      const res = await authFetch('/api/notes');
      if (res.ok) setNotes(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNote)
      });
      if (res.ok) {
        setNewNote({ title: '', content: '', category: 'general' });
        setIsAdding(false);
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await authFetch(`/api/notes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (selectedNote?.id === id) setSelectedNote(null);
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || note.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = [
    { id: 'all', label: 'All Entries', color: 'bg-slate-500' },
    { id: 'symptoms', label: 'Symptoms', color: 'bg-rose-500' },
    { id: 'chronology', label: 'Timeline', color: 'bg-emerald-500' },
    { id: 'general', label: 'General', color: 'bg-sky-500' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-medical-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase">
            Clinical <span className="text-medical-500">Journal</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Document your journey, symptoms, and health chronology.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl"
        >
          <Plus size={18} />
          Append Entry
        </button>
      </header>

      <div className="grid lg:grid-cols-[400px_1fr] gap-8 h-[calc(100vh-320px)] min-h-[600px]">
        {/* Sidebar: List */}
        <div className="flex flex-col gap-6 h-full overflow-hidden">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medical-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search your records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 pl-16 pr-6 bg-white dark:bg-slate-900 rounded-[1.5rem] border-none shadow-sm focus:ring-4 focus:ring-medical-500/10 font-bold outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  filter === cat.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 border border-slate-100 dark:border-slate-800"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {filteredNotes.map(note => (
              <motion.button
                layout
                key={note.id}
                onClick={() => {
                  setSelectedNote(note);
                  setIsAdding(false);
                }}
                className={cn(
                  "w-full text-left p-6 rounded-[2rem] transition-all border group",
                  selectedNote?.id === note.id
                    ? "bg-white dark:bg-slate-900 border-medical-500 shadow-xl shadow-medical-500/10"
                    : "bg-white/50 dark:bg-slate-900/50 border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter",
                    note.category === 'symptoms' ? 'bg-rose-100 text-rose-600' :
                      note.category === 'chronology' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-sky-100 text-sky-600'
                  )}>
                    {note.category}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(note.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white truncate mb-1">{note.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{note.content}</p>
              </motion.button>
            ))}
            {filteredNotes.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <NotebookPen size={48} className="mx-auto text-slate-200" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No matches found</p>
              </div>
            )}
          </div>
        </div>

        {/* Main: Note View/Edit */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden h-full flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-medical-500/[0.03] rounded-full blur-3xl -mr-32 -mt-32" />

          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.form
                key="add-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSave}
                className="space-y-8 flex-1 flex flex-col relative z-10"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black uppercase tracking-tight">New Journal Entry</h2>
                  <button type="button" onClick={() => setIsAdding(false)} className="p-2 hover:text-red-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title</label>
                    <input
                      type="text"
                      required
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="Symptoms starting today..."
                      className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] font-bold outline-none focus:ring-4 focus:ring-medical-500/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                    <div className="flex gap-2">
                      {['general', 'symptoms', 'chronology'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewNote({ ...newNote, category: cat })}
                          className={cn(
                            "flex-1 py-4 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            newNote.category === cat
                              ? "bg-medical-500 text-white shadow-lg shadow-medical-500/20"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Observation Details</label>
                  <textarea
                    required
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Describe your feelings, incidents, or clinical changes..."
                    className="w-full flex-1 p-8 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] font-medium leading-relaxed outline-none focus:ring-4 focus:ring-medical-500/10 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl active:scale-95 transition-all"
                >
                  Confirm Entry Persistence
                </button>
              </motion.form>
            ) : selectedNote ? (
              <motion.div
                key="view-note"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col relative z-10"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-4">
                    <div className={cn(
                      "inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]",
                      selectedNote.category === 'symptoms' ? 'bg-rose-100 text-rose-600' :
                        selectedNote.category === 'chronology' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-sky-100 text-sky-600'
                    )}>
                      {selectedNote.category}
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{selectedNote.title}</h2>
                    <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                      <Calendar size={14} className="text-medical-500" />
                      {new Date(selectedNote.timestamp).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedNote.id)}
                    className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>

                <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] p-10 border border-slate-50 dark:border-slate-800 overflow-y-auto custom-scrollbar">
                  <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-medium">
                    {selectedNote.content}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center text-slate-200 border border-slate-100 dark:border-slate-800 shadow-inner">
                  <NotebookPen size={64} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Select an entry to view details</h3>
                  <p className="text-slate-400 font-medium max-w-sm mx-auto">Your clinical observations are stored locally and encrypted in the MySQL engine.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
