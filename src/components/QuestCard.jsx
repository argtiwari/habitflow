import React from 'react';
import { motion } from 'framer-motion';
// 'X' icon ko import kiya hai cross ke liye 👇
import { Check, Flame, Coins, Play, Zap, Trash2, Skull, Repeat, CalendarCheck, Clock, X } from 'lucide-react';

const QuestCard = ({ 
  title, 
  difficulty, 
  xpReward, 
  goldReward, 
  streak, 
  onComplete, 
  onStartFocus, 
  onDelete, 
  onFail, 
  type, 
  lastCompletedDate, 
  history = {},
  scheduledTime // ✅ Fixed: 'props' hata kar seedha variable use kiya
}) => {
  
  // Dates Logic
  const today = new Date().toISOString().split('T')[0];
  const isDaily = type === 'daily';
  const isDoneToday = isDaily && lastCompletedDate === today;

  // --- 🗓️ WEEKLY TRACKER (Tick & Cross Style) ---
  const renderWeeklyTracker = () => {
    if (!isDaily) return null;

    const days = [];
    // Pichle 6 din + Aaj calculate kar rahe hain
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    return (
      <div className="flex gap-2 mt-4 mb-2 items-center">
        {days.map((date, index) => {
          const isDone = history[date] === true;
          const isToday = date === today;
          const isPast = date < today; // Aaj se pehle ka din

          return (
            <div key={date} className="group relative flex flex-col items-center">
               
               {/* 1. ✅ DONE (Green Tick) */}
               {isDone ? (
                 <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                   <Check size={12} className="text-emerald-500" strokeWidth={3} />
                 </div>
               ) 
               /* 2. ❌ MISSED (Red Cross) - Sirf past dates ke liye */
               : isPast ? (
                 <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center opacity-70">
                   <X size={12} className="text-red-500" strokeWidth={3} />
                 </div>
               )
               /* 3. ⏳ TODAY PENDING (Pulsing Dot) */
               : (
                 <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isToday ? 'border-slate-500 bg-slate-800 animate-pulse' : 'border-slate-800 bg-slate-900'}`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                 </div>
               )}

               {/* Tooltip (Date dikhane ke liye) */}
               <div className="absolute bottom-full mb-2 bg-black/90 border border-slate-700 text-[10px] text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                 {isToday ? "Today" : new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
               </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getDifficultyColor = () => {
    if (isDoneToday) return 'border-slate-700 bg-slate-900/40';
    if (difficulty === 'Hard') return 'border-red-500/50 shadow-red-900/20 bg-slate-900/80';
    if (difficulty === 'Medium') return 'border-orange-500/50 shadow-orange-900/20 bg-slate-900/80';
    return 'border-emerald-500/50 shadow-emerald-900/20 bg-slate-900/80';
  };

  const getBadgeColor = () => {
    if (isDoneToday) return 'bg-slate-700 text-slate-400';
    if (difficulty === 'Hard') return 'bg-red-500 text-white';
    if (difficulty === 'Medium') return 'bg-orange-500 text-white';
    return 'bg-emerald-500 text-slate-900';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: isDoneToday ? 0.6 : 1, y: 0 }} whileTap={!isDoneToday ? { scale: 0.99 } : {}}
      className={`relative border-l-4 ${getDifficultyColor()} p-4 rounded-r-xl mb-3 flex flex-col gap-2 shadow-lg backdrop-blur-sm transition-all select-none`}
    >
      
      {/* Top Row */}
      <div className="flex justify-between items-start w-full">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${getBadgeColor()}`}>
              {isDaily && <Repeat size={10} />}
              {difficulty}
            </span>
            <h3 className={`font-bold text-lg ${isDoneToday ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{title}</h3>
          </div>

          {!isDoneToday && (
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium flex-wrap">
              <span className="flex items-center gap-1 text-yellow-400"><Coins size={12} /> {goldReward} G</span>
              <span className="flex items-center gap-1 text-cyan-400"><Zap size={12} /> {xpReward} XP</span>
              
              {/* Streak Fire */}
              {streak > 0 && <span className="flex items-center gap-1 text-orange-500 animate-pulse"><Flame size={12} /> {streak}</span>}
              
              {/* ⏰ TIME BADGE - Error Fix: 'props.scheduledTime' ki jagah 'scheduledTime' */}
              {scheduledTime && (
                <span className="flex items-center gap-1 text-purple-400 border border-purple-500/30 px-1.5 rounded bg-purple-500/10">
                  <Clock size={10} /> {scheduledTime}
                </span>
              )}
            </div>
          )}
        </div>

        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {/* --- RENDER NEW TRACKER --- */}
      {renderWeeklyTracker()}

      {/* Actions */}
      <div className="flex gap-2 w-full mt-2">
        {isDoneToday ? (
          <div className="w-full py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider cursor-not-allowed">
            <CalendarCheck size={16} /> Done for Today
          </div>
        ) : (
          <>
            <button onClick={(e) => { e.stopPropagation(); onFail(); }} className="w-10 bg-red-500/10 rounded-xl border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95">
              <Skull size={16} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onStartFocus(); }} className="flex-1 py-3 bg-indigo-500/10 rounded-xl border border-indigo-500/30 flex items-center justify-center gap-2 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all active:scale-95 text-xs font-bold uppercase tracking-wider">
              <Play size={14} fill="currentColor" /> Focus
            </button>
            <button onClick={(e) => { e.stopPropagation(); onComplete(); }} className="flex-1 py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-2 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 text-xs font-bold uppercase tracking-wider">
              <Check size={16} strokeWidth={3} /> Complete
            </button>
          </>
        )}
      </div>

    </motion.div>
  );
};

export default QuestCard;