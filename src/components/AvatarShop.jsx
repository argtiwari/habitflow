import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check } from 'lucide-react';

// 10 Unique Characters (Seeds)
const AVATARS = [
  { id: 'Felix', name: 'Rookie', cost: 0 },
  { id: 'Aneka', name: 'Mage', cost: 0 },
  { id: 'Shadow', name: 'Ninja', cost: 0 }, // Free Characters
  { id: 'Luna', name: 'Healer', cost: 100 },
  { id: 'Blade', name: 'Warrior', cost: 250 },
  { id: 'Cyber', name: 'Hacker', cost: 500 },
  { id: 'King', name: 'Paladin', cost: 800 },
  { id: 'Demon', name: 'Slayer', cost: 1000 },
  { id: 'Angel', name: 'Guardian', cost: 1500 },
  { id: 'God', name: 'Legend', cost: 5000 },
];

const AvatarShop = ({ isOpen, onClose, currentAvatar, userGold, unlockedAvatars, onBuy, onSelect }) => {
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" 
          />
          
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
            transition={{ type: "spring", damping: 25 }} 
            className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-[32px] p-6 z-50 h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black italic text-white uppercase tracking-wider">Hero Shop</h2>
                <p className="text-xs text-yellow-400 font-bold">Your Gold: 🪙 {userGold}</p>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            <div className="overflow-y-auto pb-10 grid grid-cols-2 gap-4">
              {AVATARS.map((avatar) => {
                const isUnlocked = unlockedAvatars.includes(avatar.id);
                const isSelected = currentAvatar === avatar.id;
                const canAfford = userGold >= avatar.cost;

                return (
                  <div 
                    key={avatar.id} 
                    className={`relative bg-slate-800 rounded-2xl p-4 border-2 flex flex-col items-center transition-all ${
                      isSelected ? "border-cyan-500 bg-cyan-900/20" : "border-slate-700"
                    }`}
                  >
                    {/* Avatar Image */}
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatar.id}`} 
                      className={`w-20 h-20 mb-2 rounded-full bg-slate-900 ${!isUnlocked && "grayscale opacity-50"}`}
                      alt={avatar.name}
                    />
                    
                    <h3 className="font-bold text-sm text-slate-200">{avatar.name}</h3>

                    {isUnlocked ? (
                      <button 
                        onClick={() => onSelect(avatar.id)}
                        className={`mt-2 w-full py-2 rounded-lg text-xs font-bold uppercase ${
                          isSelected ? "bg-cyan-500 text-slate-950" : "bg-slate-700 text-white"
                        }`}
                      >
                        {isSelected ? <span className="flex items-center justify-center gap-1"><Check size={12}/> Equipped</span> : "Select"}
                      </button>
                    ) : (
                      <button 
                        onClick={() => canAfford && onBuy(avatar)}
                        disabled={!canAfford}
                        className={`mt-2 w-full py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-1 ${
                          canAfford ? "bg-yellow-500 text-slate-900 hover:bg-yellow-400" : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {canAfford ? `Buy ${avatar.cost} G` : <><Lock size={12}/> {avatar.cost} G</>}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AvatarShop;