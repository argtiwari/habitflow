import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, AlertTriangle } from 'lucide-react';
import { getAvatarImage } from '../utils/getAvatar'; // Make sure ye path sahi ho

const FocusMode = ({ isOpen, onClose, activeQuest, onCompleteSession, player }) => { // player prop zaroori hai
  const [minutes, setMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      onCompleteSession(minutes);
      setTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, minutes, onCompleteSession]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setTimeLeft(minutes * 60);
    setIsRunning(true);
  };

  const giveUp = () => {
    setIsRunning(false);
    setTimeLeft(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6"
        >
          {isRunning && <div className="absolute inset-0 bg-indigo-900/20 animate-pulse z-0 pointer-events-none"></div>}

          <div className="z-10 w-full max-w-md flex flex-col items-center text-center">
            <button onClick={giveUp} className="absolute top-6 right-6 p-2 bg-slate-900 rounded-full text-slate-500 z-50"><X size={24} /></button>

            {/* Avatar Evolution Logic */}
            <motion.div 
              animate={isRunning ? { scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] overflow-hidden bg-slate-900 mb-8"
            >
              <img 
                src={player ? getAvatarImage(player.avatarSeed, player.level) : ""} 
                className="w-full h-full object-cover" 
                onError={(e) => { e.target.style.display = 'none'; }}
                alt="Avatar"
              />
            </motion.div>

            <h2 className="text-2xl font-black italic text-white mb-2 uppercase tracking-widest">{isRunning ? "Focus Battle!" : "Prepare for Battle"}</h2>
            <p className="text-indigo-400 font-bold mb-8">Quest: {activeQuest?.title}</p>

            {!isRunning ? (
              <div className="w-full bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between gap-4 mb-8">
                  <button onClick={() => setMinutes(Math.max(5, minutes - 5))} className="p-3 bg-slate-800 rounded-lg text-white border border-slate-700">-5</button>
                  <span className="text-5xl font-black font-mono text-white">{minutes}</span>
                  <button onClick={() => setMinutes(minutes + 5)} className="p-3 bg-slate-800 rounded-lg text-white border border-slate-700">+5</button>
                </div>
                <button onClick={startTimer} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-xl text-lg shadow-lg shadow-indigo-500/25 active:scale-95 transition-all">START FOCUS</button>
              </div>
            ) : (
              <div className="w-full">
                <div className="text-[5rem] font-black font-mono text-white leading-none mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{formatTime(timeLeft)}</div>
                <button onClick={giveUp} className="px-6 py-3 rounded-full border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center gap-2 mx-auto"><AlertTriangle size={16} /> Give Up</button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FocusMode;