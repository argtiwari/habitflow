import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check, Shield, Zap, Crown } from 'lucide-react';
import { HEROES } from '../data/heroes'; // Data import kiya

const AvatarShop = ({ isOpen, onClose, currentAvatar, userGold, unlockedAvatars, userLevel, onBuy, onSelect }) => {
  
  // Helper to render Evolution Stage
  const renderStage = (heroId, stageNum, requiredLevel, currentLevel, isHeroUnlocked) => {
    const isStageUnlocked = isHeroUnlocked && currentLevel >= requiredLevel;
    const imgPath = `/avatars/${heroId}/${stageNum}.png`;

    return (
      <div className="flex flex-col items-center gap-1">
        <div className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden bg-slate-900 ${isStageUnlocked ? 'border-cyan-400 shadow-cyan-500/20 shadow-lg' : 'border-slate-700 opacity-60'}`}>
          
          {/* Image */}
          <img 
            src={imgPath} 
            className={`w-full h-full object-cover ${!isStageUnlocked ? 'grayscale blur-[2px]' : ''}`} 
            alt={`Stage ${stageNum}`}
            onError={(e) => { e.target.style.display = 'none'; }} // Agar image na mile to hide kar do
          />

          {/* Lock Overlay */}
          {!isStageUnlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-xs font-bold text-white">
              {isHeroUnlocked ? (
                <>
                  <Lock size={12} className="mb-0.5 text-slate-400"/>
                  <span className="text-[8px] uppercase tracking-wider text-slate-300">Lvl {requiredLevel}</span>
                </>
              ) : (
                <Lock size={14} className="text-slate-500"/>
              )}
            </div>
          )}
        </div>
        
        {/* Stage Label */}
        <span className={`text-[8px] font-bold uppercase tracking-widest ${isStageUnlocked ? 'text-cyan-400' : 'text-slate-600'}`}>
          {stageNum === 1 ? 'Rookie' : stageNum === 2 ? 'Warrior' : 'Legend'}
        </span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
          
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} 
            className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-700 rounded-t-[32px] p-6 z-50 h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black italic text-white uppercase tracking-wider">Hero Evolution</h2>
                <p className="text-xs text-yellow-400 font-bold">Your Gold: 🪙 {userGold} | Level: {userLevel}</p>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            {/* List */}
            <div className="overflow-y-auto pb-10 space-y-6">
              {HEROES.map((hero) => {
                const isUnlocked = unlockedAvatars.includes(hero.id);
                const isSelected = currentAvatar === hero.id;
                const canAfford = userGold >= hero.cost;

                return (
                  <div key={hero.id} className={`bg-slate-900 border-2 rounded-2xl p-4 ${isSelected ? 'border-cyan-500' : 'border-slate-800'}`}>
                    
                    {/* Hero Info Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                          {hero.name}
                          {isSelected && <span className="text-[10px] bg-cyan-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase">Active</span>}
                        </h3>
                        <p className="text-xs text-slate-500">{hero.description}</p>
                      </div>
                      
                      {/* Buy/Select Button */}
                      {isUnlocked ? (
                        <button 
                          onClick={() => onSelect(hero.id)}
                          disabled={isSelected}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            isSelected ? "bg-slate-800 text-slate-500 cursor-default" : "bg-cyan-600 text-white hover:bg-cyan-500"
                          }`}
                        >
                          {isSelected ? "Equipped" : "Equip"}
                        </button>
                      ) : (
                        <button 
                          onClick={() => canAfford && onBuy(hero)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1 ${
                            canAfford ? "bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-lg shadow-yellow-500/20" : "bg-slate-800 text-slate-500 opacity-50"
                          }`}
                        >
                          {canAfford ? `Unlock ${hero.cost} G` : <><Lock size={12}/> {hero.cost} G</>}
                        </button>
                      )}
                    </div>

                    {/* Evolution Stages Display */}
                    <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                      {renderStage(hero.id, 1, 1, userLevel, isUnlocked)}
                      
                      {/* Arrow */}
                      <div className="h-0.5 w-4 bg-slate-700"></div>
                      
                      {renderStage(hero.id, 2, 10, userLevel, isUnlocked)}
                      
                      {/* Arrow */}
                      <div className="h-0.5 w-4 bg-slate-700"></div>
                      
                      {renderStage(hero.id, 3, 20, userLevel, isUnlocked)}
                    </div>

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