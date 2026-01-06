import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, Database, ShieldCheck } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fast Loading Logic (Every 50ms)
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Har baar 2% se 8% ke beech badhega (Bahut tezi se)
        const randomJump = Math.floor(Math.random() * 8) + 2; 
        const newProgress = Math.min(prev + randomJump, 100);
        
        if (newProgress === 100) {
          clearInterval(interval);
          // 100% hone ke turant baad (200ms delay) App khul jayega
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 200);
        }
        return newProgress;
      });
    }, 50); // Speed: Har 0.05 second mein update

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0f172a] flex flex-col items-center justify-center font-mono"
    >
      {/* --- MAIN TITLE: LIFE OPERATING SYSTEM --- */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-8 relative"
      >
        <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full"></div>
        
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <Cpu size={48} className="text-cyan-400 animate-pulse" />
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
          LIFE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">OS</span>
        </h1>
        <p className="text-slate-400 text-xs tracking-[0.4em] mt-2 uppercase font-bold">
          System Initializing...
        </p>
      </motion.div>

      {/* --- PROGRESS BAR --- */}
      <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
        <motion.div 
          className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear" }}
        />
      </div>

      {/* --- LOADING STATUS TEXT --- */}
      <div className="mt-4 flex justify-between w-64 text-[10px] text-slate-500 uppercase font-bold">
        <span>Loading Modules</span>
        <span className="text-cyan-400">{progress}%</span>
      </div>

    </motion.div>
  );
};

export default SplashScreen;