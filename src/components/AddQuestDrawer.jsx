import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Zap, Coins, Repeat, Clock } from 'lucide-react';

const AddQuestDrawer = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [xp, setXp] = useState(20);
  const [gold, setGold] = useState(10);
  const [isDaily, setIsDaily] = useState(false);
  const [time, setTime] = useState(''); // New State for Time

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    onAdd({
      title,
      difficulty,
      xp: parseInt(xp),
      gold: parseInt(gold),
      type: isDaily ? 'daily' : 'one-time',
      scheduledTime: time || null, // Time save kar rahe hain
      lastCompletedDate: null,
      history: {}
    });

    // Reset
    setTitle('');
    setDifficulty('Medium');
    setXp(20);
    setGold(10);
    setIsDaily(false);
    setTime('');
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
              <div className="relative">
                <Target className="absolute top-3.5 left-3 text-cyan-500" size={20} />
                <input 
                  type="text" placeholder="Mission Title (e.g. Gym Workout)" 
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none font-bold"
                  autoFocus
                />
              </div>

              {/* Time Picker & Daily Checkbox Row */}
              <div className="flex gap-3">
                {/* Time Input */}
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center px-3 focus-within:border-cyan-500 transition-colors">
                    <Clock size={18} className="text-slate-400 mr-2" />
                    <input 
                        type="time" 
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="bg-transparent text-white font-bold w-full py-3 outline-none appearance-none" 
                    />
                </div>

                {/* Daily Checkbox */}
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${isDaily ? 'bg-indigo-500/20 border-indigo-500' : 'bg-slate-950 border-slate-800'}`}>
                  <input type="checkbox" checked={isDaily} onChange={(e) => setIsDaily(e.target.checked)} className="hidden" />
                  <Repeat size={18} className={isDaily ? "text-indigo-400" : "text-slate-500"} />
                  <span className={`text-sm font-bold ${isDaily ? 'text-indigo-300' : 'text-slate-500'}`}>Daily</span>
                </label>
              </div>

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