import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Zap, Coins, Repeat } from 'lucide-react';

const AddQuestDrawer = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [xp, setXp] = useState(20);
  const [gold, setGold] = useState(10);
  const [isDaily, setIsDaily] = useState(false); // New State for Daily Checkbox

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    onAdd({
      title,
      difficulty,
      xp: parseInt(xp),
      gold: parseInt(gold),
      // New Data Fields 👇
      type: isDaily ? 'daily' : 'one-time', 
      lastCompletedDate: null, 
      history: {} 
    });

    // Form Reset
    setTitle('');
    setDifficulty('Medium');
    setXp(20);
    setGold(10);
    setIsDaily(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" />
          
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6 z-50"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black italic text-white uppercase">New Mission</h2>
              <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Input */}
              <div className="relative">
                <Target className="absolute top-3.5 left-3 text-cyan-500" size={20} />
                <input 
                  type="text" placeholder="Mission Title (e.g. Read 10 Pages)" 
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none font-bold"
                  autoFocus
                />
              </div>

              {/* Difficulty & Rewards */}
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff} type="button"
                    onClick={() => {
                      setDifficulty(diff);
                      if(diff==='Easy') { setXp(10); setGold(5); }
                      if(diff==='Medium') { setXp(20); setGold(10); }
                      if(diff==='Hard') { setXp(50); setGold(25); }
                    }}
                    className={`py-2 rounded-lg text-xs font-black uppercase border-2 transition-all ${
                      difficulty === diff ? 'border-white bg-white/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-500'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 text-sm font-bold text-slate-400 justify-center py-2">
                <span className="flex items-center gap-1 text-cyan-400"><Zap size={14}/> {xp} XP</span>
                <span className="flex items-center gap-1 text-yellow-400"><Coins size={14}/> {gold} G</span>
              </div>

              {/* --- NEW: DAILY CHECKBOX --- */}
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${isDaily ? 'bg-indigo-500/10 border-indigo-500' : 'bg-slate-950 border-slate-800'}`}>
                <div className={`w-6 h-6 rounded flex items-center justify-center border-2 ${isDaily ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-600'}`}>
                  {isDaily && <Repeat size={14} />}
                </div>
                <input type="checkbox" checked={isDaily} onChange={(e) => setIsDaily(e.target.checked)} className="hidden" />
                <div className="flex-1">
                  <p className={`font-bold text-sm ${isDaily ? 'text-white' : 'text-slate-400'}`}>Repeat Daily</p>
                  <p className="text-[10px] text-slate-500">Task will reset every morning</p>
                </div>
              </label>

              {/* Create Button */}
              <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-xl text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all">
                CREATE MISSION
              </button>
            </form>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddQuestDrawer;