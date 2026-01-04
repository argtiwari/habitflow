import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, Shield, Skull } from 'lucide-react';

const AddQuestDrawer = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");

  // Difficulty ke hisab se rewards
  const rewards = {
    Easy: { xp: 50, gold: 10, color: "bg-emerald-500", icon: <Shield size={16}/> },
    Medium: { xp: 100, gold: 20, color: "bg-orange-500", icon: <Sword size={16}/> },
    Hard: { xp: 200, gold: 50, color: "bg-red-500", icon: <Skull size={16}/> },
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    
    // Naya quest object bhejna
    onAdd({
      title,
      difficulty,
      xp: rewards[difficulty].xp,
      gold: rewards[difficulty].gold
    });
    
    setTitle("");
    setDifficulty("Medium"); // Reset to default
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" 
          />
          
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
            transition={{ type: "spring", damping: 25 }} 
            className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-[32px] p-6 z-50 max-w-md mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black italic text-white uppercase tracking-wider">New Quest</h2>
              <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            <div className="space-y-6">
              {/* Input Name */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mission Name</label>
                <input 
                  autoFocus 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 p-4 rounded-xl text-white outline-none focus:border-cyan-500 text-lg font-bold transition-all mt-2"
                  placeholder="Ex: Kill the Bug (Debug Code)" 
                />
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.keys(rewards).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                        difficulty === level 
                        ? `${rewards[level].color} border-white text-slate-900 shadow-lg scale-105` 
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {rewards[level].icon}
                      <span className="text-xs font-black uppercase">{level}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reward Preview */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-xs text-slate-400">Rewards:</span>
                <div className="flex gap-3 font-bold text-sm">
                  <span className="text-yellow-400 flex items-center gap-1">🪙 {rewards[difficulty].gold}</span>
                  <span className="text-cyan-400 flex items-center gap-1">⚡ {rewards[difficulty].xp} XP</span>
                </div>
              </div>

              <button 
                onClick={handleCreate} 
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black p-4 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all uppercase tracking-widest text-lg"
              >
                Accept Quest
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddQuestDrawer;