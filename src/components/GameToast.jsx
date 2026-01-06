import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';

const GameToast = ({ toast, onClose }) => {
  // Agar toast hai, toh 3 second baad auto-close karein
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  // Type ke hisaab se color aur icon set karein
  let styles = "bg-slate-900 border-slate-700 text-white";
  let icon = <Info size={20} className="text-cyan-400" />;

  if (toast.type === 'success') {
    styles = "bg-emerald-900/90 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.4)]";
    icon = <CheckCircle size={20} className="text-emerald-400" />;
  } else if (toast.type === 'error') {
    styles = "bg-red-900/90 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
    icon = <AlertTriangle size={20} className="text-red-400" />;
  } else if (toast.type === 'loot') {
    styles = "bg-yellow-900/90 border-yellow-500 text-yellow-100 shadow-[0_0_15px_rgba(234,179,8,0.4)]";
    icon = <span className="text-xl">💰</span>;
  }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.8 }}
          animate={{ y: 20, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed top-0 left-0 right-0 flex justify-center z-[100] pointer-events-none"
        >
          <div className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl border-2 backdrop-blur-md min-w-[300px] max-w-[90%] shadow-2xl ${styles}`}>
            {icon}
            <div className="flex-1">
              <p className="font-bold text-sm tracking-wide">{toast.message}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameToast;