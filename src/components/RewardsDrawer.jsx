import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Plus, Trash2, ShoppingBag } from 'lucide-react';

const RewardsDrawer = ({ isOpen, onClose, userGold, rewards, onAddReward, onBuyReward, onDeleteReward }) => {
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title || !cost) return;
    onAddReward({ title, cost: parseInt(cost) });
    setTitle('');
    setCost('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" />
          
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-slate-900 border-l border-slate-700 z-50 p-6 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Gift className="text-pink-500" />
                <h2 className="text-xl font-black italic text-white uppercase">Loot Box</h2>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            {/* Gold Display */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 p-4 rounded-2xl border border-yellow-500/30 mb-6 flex justify-between items-center">
              <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">Available Funds</span>
              <span className="text-xl font-mono font-black text-yellow-400 flex items-center gap-2">🪙 {userGold}</span>
            </div>

            {/* Add New Reward Form */}
            <form onSubmit={handleAdd} className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Create Reward</h3>
              <input 
                type="text" placeholder="Reward Name (e.g. Pizza)" 
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-pink-500 outline-none"
              />
              <div className="flex gap-2">
                <input 
                  type="number" placeholder="Cost" 
                  value={cost} onChange={(e) => setCost(e.target.value)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-yellow-500 outline-none"
                />
                <button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded-lg border border-slate-700 transition-all">
                  + Add
                </button>
              </div>
            </form>

            {/* Rewards List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {rewards.length === 0 ? (
                <div className="text-center opacity-30 mt-10">
                  <ShoppingBag size={48} className="mx-auto mb-2"/>
                  <p className="text-xs">No rewards set yet.</p>
                </div>
              ) : (
                rewards.map((reward) => (
                  <div key={reward.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-slate-200">{reward.title}</h4>
                      <p className="text-xs text-yellow-500 font-mono">🪙 {reward.cost}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onBuyReward(reward)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all shadow-lg ${
                          userGold >= reward.cost 
                          ? 'bg-pink-600 text-white hover:bg-pink-500 hover:scale-105 cursor-pointer' 
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                        }`}
                      >
                        Buy
                      </button>
                      <button onClick={() => onDeleteReward(reward.id)} className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14}/>
                      </button>
                    </div>
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

export default RewardsDrawer;