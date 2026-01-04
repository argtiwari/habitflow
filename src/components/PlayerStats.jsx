import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';

// Props mein 'avatarSeed' add kiya
const PlayerStats = ({ level, currentXP, maxXP, health, avatarSeed }) => {
  const xpPercentage = (currentXP / maxXP) * 100;

  // DiceBear API se Avatar URL generate karna
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;

  return (
    <div className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-2 border-white/20 p-1 shadow-lg shadow-indigo-500/30 overflow-hidden bg-slate-900"
          >
            {/* Dynamic Avatar Image */}
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <div className="absolute -bottom-2 -right-1 bg-yellow-500 text-slate-900 font-black text-xs px-2 py-0.5 rounded-md border border-yellow-300 shadow-sm">
            LVL {level}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
              <span className="flex items-center gap-1"><Shield size={12} className="text-red-400"/> HP</span>
              <span className="text-red-400">{health}/100</span>
            </div>
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${health}%` }}
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
              <span className="flex items-center gap-1"><Zap size={12} className="text-yellow-400"/> XP</span>
              <span className="text-yellow-400">{currentXP} / {maxXP}</span>
            </div>
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;