import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Scroll } from 'lucide-react';

const JournalDrawer = ({ isOpen, onClose, history }) => {
  
  // Date formatting helper
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 z-40" />
          
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-slate-900 border-l border-slate-700 z-50 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Scroll className="text-yellow-500" />
                <h2 className="text-xl font-black italic text-white uppercase tracking-wider">Chronicles</h2>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {history.length === 0 ? (
                <div className="text-center opacity-30 mt-20">
                  <Scroll size={48} className="mx-auto mb-2"/>
                  <p>No battles recorded yet.</p>
                </div>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className={`p-4 rounded-xl border-l-4 ${entry.status === 'Victory' ? 'bg-emerald-900/10 border-emerald-500' : 'bg-red-900/10 border-red-500'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{formatDate(entry.date)}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${entry.status === 'Victory' ? 'bg-emerald-500 text-emerald-950' : 'bg-red-500 text-white'}`}>
                        {entry.status}
                      </span>
                    </div>
                    <h3 className="text-slate-200 font-bold leading-tight">{entry.title}</h3>
                    {entry.reason && (
                      <p className="text-xs text-red-400 mt-2 italic">"{entry.reason}"</p>
                    )}
                  </div>
                ))
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default JournalDrawer;