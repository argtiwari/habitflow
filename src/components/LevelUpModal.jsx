import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { X, Crown } from 'lucide-react';

const LevelUpModal = ({ isOpen, newLevel, onClose }) => {
  // Screen size nikalna confetti ke liye
  const { innerWidth: width, innerHeight: height } = window;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti (Puri screen par) */}
          <div className="fixed inset-0 z-[60] pointer-events-none">
            <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.2} />
          </div>

          {/* Dark Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              type="spring"
              className="bg-slate-900 border-2 border-yellow-500 rounded-3xl p-8 text-center max-w-sm w-full relative shadow-[0_0_50px_rgba(234,179,8,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Glowing Crown Icon */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 p-4 rounded-full border-2 border-yellow-500 shadow-xl shadow-yellow-500/20">
                <Crown size={48} className="text-yellow-400 animate-bounce" fill="currentColor" />
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 uppercase italic tracking-tighter">
                  Level Up!
                </h2>
                
                <p className="text-slate-300 text-lg">
                  You are now <span className="text-yellow-400 font-bold">Level {newLevel}</span>
                </p>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10 text-sm text-slate-400">
                  <p>✨ Max XP Increased</p>
                  <p>❤️ Health Restored</p>
                  <p>🔓 New Avatar Unlocked (Soon)</p>
                </div>

                <button 
                  onClick={onClose}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-4 rounded-xl text-lg shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform"
                >
                  CLAIM REWARDS
                </button>
              </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal;