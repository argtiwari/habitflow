import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull, AlertCircle } from 'lucide-react';

const REASONS = [
  "Too Tired (Low Mana)",
  "Procrastinated",
  "Too Busy",
  "Forgot",
  "Bad Mood",
  "Too Hard"
];

const DefeatModal = ({ isOpen, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-slate-900 border-2 border-red-500/50 rounded-3xl p-6 relative shadow-[0_0_50px_rgba(239,68,68,0.2)]"
          >
            
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-red-500/10 p-4 rounded-full mb-4 border border-red-500/20">
                <Skull size={40} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-widest">Accept Defeat?</h2>
              <p className="text-red-400 text-xs font-bold mt-1 uppercase tracking-wider">Health Penalty: -10 HP</p>
            </div>

            <p className="text-slate-400 text-sm mb-3 font-bold">Why did you fail?</p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedReason === reason 
                    ? "bg-red-500 text-white border-red-400 shadow-lg scale-105" 
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <button 
              onClick={() => onConfirm(selectedReason)}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <AlertCircle size={20} /> CONFIRM DEFEAT
            </button>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DefeatModal;