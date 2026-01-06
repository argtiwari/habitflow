import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scroll, PenTool, Save, Trash2, Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const JournalDrawer = ({ isOpen, onClose, history }) => {
  const [activeTab, setActiveTab] = useState('diary'); // 'diary' or 'history'
  const [noteText, setNoteText] = useState('');
  
  // Notes ko LocalStorage se load karein
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rpg_user_notes')) || []; } catch { return []; }
  });

  // Save Notes automatically
  useEffect(() => {
    localStorage.setItem('rpg_user_notes', JSON.stringify(notes));
  }, [notes]);

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    
    const newNote = {
      id: uuidv4(),
      text: noteText,
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      timestamp: new Date().toISOString()
    };

    setNotes([newNote, ...notes]);
    setNoteText(''); // Clear input
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" />
          
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 right-0 bottom-0 w-96 bg-[#1a1b26] border-l border-slate-700 z-50 flex flex-col shadow-2xl"
          >
            {/* Header with Tabs */}
            <div className="p-6 border-b border-slate-800 bg-[#16161e]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black italic text-white uppercase tracking-wider flex items-center gap-2">
                  <Scroll className="text-purple-400" /> Hero's Journal
                </h2>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20}/></button>
              </div>

              {/* Tabs Switcher */}
              <div className="flex bg-slate-900 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('diary')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'diary' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  ✍️ My Diary
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  📜 Battle Log
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1a1b26]">
              
              {/* --- TAB 1: DIARY MODE --- */}
              {activeTab === 'diary' && (
                <>
                  {/* Write New Note */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-lg">
                    <textarea 
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write your thoughts, ideas, or today's story..."
                      className="w-full h-32 bg-transparent text-slate-200 text-sm outline-none resize-none placeholder:text-slate-600 font-medium"
                    />
                    <div className="flex justify-between items-center mt-2 border-t border-slate-800 pt-3">
                      <span className="text-xs text-slate-500">{new Date().toLocaleDateString()}</span>
                      <button 
                        onClick={handleSaveNote}
                        disabled={!noteText.trim()}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all"
                      >
                        <Save size={14} /> Save Entry
                      </button>
                    </div>
                  </div>

                  {/* Saved Notes List */}
                  <div className="space-y-4 pb-10">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Past Entries</h3>
                    {notes.length === 0 ? (
                      <div className="text-center py-10 opacity-30">
                        <PenTool size={40} className="mx-auto mb-3" />
                        <p className="text-sm">The pages are empty...</p>
                      </div>
                    ) : (
                      notes.map(note => (
                        <div key={note.id} className="group relative bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                              <Calendar size={10} /> {note.date}
                            </span>
                            <button onClick={() => deleteNote(note.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">{note.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* --- TAB 2: HISTORY MODE (Old Feature) --- */}
              {activeTab === 'history' && (
                <div className="space-y-3 pb-10">
                  {history.length === 0 ? (
                    <div className="text-center py-10 opacity-50">No battles recorded yet.</div>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="bg-slate-900 p-4 rounded-xl border-l-4 border-cyan-500 flex justify-between items-center shadow-sm">
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{item.title}</h4>
                          <p className="text-[10px] text-slate-500 uppercase mt-1">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                          item.status === 'Victory' ? 'bg-green-500/20 text-green-400' : 
                          item.status === 'Defeat' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default JournalDrawer;