import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Zap, Crown, Trash2, Code } from 'lucide-react'; // Code icon add kiya

const SettingsDrawer = ({ isOpen, onClose, currentTheme, onThemeChange, onReset }) => {
  
  const themes = [
    { id: 'theme-midnight', name: 'Midnight', icon: <Moon size={18}/>, color: 'bg-cyan-500' },
    { id: 'theme-cyberpunk', name: 'Cyberpunk', icon: <Zap size={18}/>, color: 'bg-fuchsia-500' },
    { id: 'theme-gold', name: 'Royal Gold', icon: <Crown size={18}/>, color: 'bg-yellow-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 z-40" />
          
          <motion.div 
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} 
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] z-50 p-6 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black italic text-white uppercase tracking-wider">Settings</h2>
              <button onClick={onClose} className="p-2 bg-black/20 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            {/* --- THEME SWITCHER (Same as before) --- */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Visual Style</h3>
              <div className="space-y-3">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onThemeChange(t.id)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all border-2 ${
                      currentTheme === t.id 
                      ? `border-white bg-white/10` 
                      : 'border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className={`p-2 rounded-full text-slate-900 ${t.color}`}>{t.icon}</div>
                    <span className="font-bold text-sm">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1"></div>

            {/* --- DANGER ZONE & CREDITS (Updated) --- */}
            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={onReset}
                className="w-full p-4 rounded-xl border border-red-500/30 text-red-500 bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center gap-2 text-sm font-bold transition-all"
              >
                <Trash2 size={16} /> RESET GAME DATA
              </button>

              {/* --- YOUR CREDIT HERE --- */}
              {/* "[Apna Naam]" ki jagah apna asli naam likhein */}
              <div className="mt-8 text-center">
                <p className="text-sm font-bold flex items-center justify-center gap-2" style={{ color: 'var(--accent)' }}>
                  <Code size={16} /> Developed by <a href="https://www.instagram.com/argcoding/" className="inline-flex items-center gap-2 text-sm font-black  tracking-widest underline hover:scale-105 transition-all cursor-pointer group group-hover:rotate-12 transition-transform">ArgCoding</a>
                </p>
                <p className="text-[10px] text-slate-500 mt-1">HabitQuest v1.0 • RPG Edition</p>
              </div>

            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsDrawer;