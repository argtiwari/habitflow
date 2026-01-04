import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Coins, Play, Zap, Trash2 } from 'lucide-react';

const QuestCard = ({ title, difficulty, xpReward, goldReward, streak, onComplete, onStartFocus, onDelete }) => {
  
  const getDifficultyColor = () => {
    if (difficulty === 'Hard') return 'border-red-500/50 shadow-red-900/20';
    if (difficulty === 'Medium') return 'border-orange-500/50 shadow-orange-900/20';
    return 'border-emerald-500/50 shadow-emerald-900/20';
  };

  const getBadgeColor = () => {
    if (difficulty === 'Hard') return 'bg-red-500 text-white';
    if (difficulty === 'Medium') return 'bg-orange-500 text-white';
    return 'bg-emerald-500 text-slate-900';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.99 }}
      className={`relative bg-slate-900/80 border-l-4 ${getDifficultyColor()} p-4 rounded-r-xl mb-3 flex flex-col gap-4 shadow-lg backdrop-blur-sm`}
    >
      
      {/* Top Row: Info + Delete */}
      <div className="flex justify-between items-start w-full">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getBadgeColor()}`}>
              {difficulty}
            </span>
            <h3 className="font-bold text-slate-100 text-lg">{title}</h3>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-yellow-400">
              <Coins size={12} /> {goldReward} G
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <Zap size={12} /> {xpReward} XP
            </span>
            {streak > 0 && (
              <span className="flex items-center gap-1 text-orange-500 animate-pulse">
                <Flame size={12} /> {streak}
              </span>
            )}
          </div>
        </div>

        {/* Delete Button (Top Right) */}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 text-slate-600 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Bottom Row: Actions (Focus & Check) */}
      <div className="flex gap-2 w-full">
        <button 
          onClick={(e) => { e.stopPropagation(); onStartFocus(); }}
          className="flex-1 py-3 bg-indigo-500/10 rounded-xl border border-indigo-500/30 flex items-center justify-center gap-2 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all active:scale-95 text-sm font-bold"
        >
          <Play size={16} fill="currentColor" /> FOCUS
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="flex-1 py-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center gap-2 text-slate-400 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all active:scale-95 text-sm font-bold"
        >
          <Check size={18} strokeWidth={3} /> DONE
        </button>
      </div>

    </motion.div>
  );
};

export default QuestCard;