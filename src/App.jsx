import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import PlayerStats from './components/PlayerStats';
import QuestCard from './components/QuestCard';
import LevelUpModal from './components/LevelUpModal';
import AddQuestDrawer from './components/AddQuestDrawer';
import AvatarShop from './components/AvatarShop';
import FocusMode from './components/FocusMode';
import ShareModal from './components/ShareModal';
import { Plus, Settings, Trash2, Share2 } from 'lucide-react';

function App() {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [focusQuest, setFocusQuest] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [player, setPlayer] = useState(() => {
    try {
      const savedPlayer = localStorage.getItem('rpg_player_v4');
      return savedPlayer ? JSON.parse(savedPlayer) : {
        level: 1, currentXP: 0, maxXP: 500, health: 100, gold: 0, avatarSeed: 'Felix', unlockedAvatars: ['Felix', 'Aneka', 'Shadow']
      };
    } catch (e) { return { level: 1, currentXP: 0, maxXP: 500, health: 100, gold: 0, avatarSeed: 'Felix', unlockedAvatars: ['Felix', 'Aneka', 'Shadow'] }; }
  });

  const [quests, setQuests] = useState(() => {
    try {
      const savedQuests = localStorage.getItem('rpg_quests_v4');
      return savedQuests ? JSON.parse(savedQuests) : [];
    } catch (e) { return []; }
  });

  useEffect(() => { localStorage.setItem('rpg_player_v4', JSON.stringify(player)); }, [player]);
  useEffect(() => { localStorage.setItem('rpg_quests_v4', JSON.stringify(quests)); }, [quests]);

  const playSound = (type) => {
    const sounds = {
      coin: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
      levelup: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      buy: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const addQuest = (questData) => {
    const newQuest = { id: uuidv4(), ...questData, streak: 0 };
    setQuests([newQuest, ...quests]);
    setIsDrawerOpen(false);
  };

  // FIX: Direct Delete (No Confirm Dialog)
  const deleteQuest = (id) => {
    setQuests(quests.filter(q => q.id !== id));
  };

  const handleBuyAvatar = (avatar) => {
    if (player.gold >= avatar.cost) {
      playSound('buy');
      setPlayer({ ...player, gold: player.gold - avatar.cost, unlockedAvatars: [...player.unlockedAvatars, avatar.id], avatarSeed: avatar.id });
    }
  };
  const handleSelectAvatar = (seed) => { setPlayer({ ...player, avatarSeed: seed }); };

  const processCompletion = (questId, bonusMultiplier = 1, extraGold = 0) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    playSound(bonusMultiplier > 1 ? 'success' : 'coin');

    let earnedXP = quest.xp * bonusMultiplier;
    let earnedGold = (quest.gold * bonusMultiplier) + extraGold;

    let newXP = player.currentXP + earnedXP;
    let newGold = player.gold + earnedGold;
    let newLevel = player.level;
    let newMaxXP = player.maxXP;
    let isLevelUp = false;

    if (newXP >= player.maxXP) {
      isLevelUp = true;
      newLevel += 1;
      newXP -= player.maxXP;
      newMaxXP = Math.floor(player.maxXP * 1.5);
    }

    setPlayer({
      ...player,
      level: newLevel,
      currentXP: newXP,
      maxXP: newMaxXP,
      gold: newGold,
      health: isLevelUp ? 100 : player.health,
      avatarSeed: player.avatarSeed,
      unlockedAvatars: player.unlockedAvatars
    });

    setQuests(quests.map(q => q.id === questId ? { ...q, streak: q.streak + 1 } : q));
    if (isLevelUp) setTimeout(() => { playSound('levelup'); setShowLevelUp(true); }, 500);
  };

  const handleNormalComplete = (id) => processCompletion(id, 1, 0);
  
  const handleFocusSessionComplete = (minutes) => {
    if (!focusQuest) return;
    const timeBonus = Math.floor(minutes / 5); 
    processCompletion(focusQuest.id, 2, timeBonus);
    setFocusQuest(null);
  };

  const resetGame = () => {
    if(confirm("Full Reset?")) { localStorage.clear(); window.location.reload(); }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-28 overflow-x-hidden selection:bg-cyan-500/30">
      <LevelUpModal isOpen={showLevelUp} newLevel={player.level} onClose={() => setShowLevelUp(false)} />

        <ShareModal 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        player={player} 
      />
      
      <FocusMode 
        isOpen={!!focusQuest} 
        onClose={() => setFocusQuest(null)}
        activeQuest={focusQuest}
        avatarSeed={player.avatarSeed}
        onCompleteSession={handleFocusSessionComplete}
      />

      <AvatarShop 
        isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} 
        currentAvatar={player.avatarSeed} userGold={player.gold} unlockedAvatars={player.unlockedAvatars} 
        onBuy={handleBuyAvatar} onSelect={handleSelectAvatar}
      />

     {/* HEADER UPDATE */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-slate-950/80 backdrop-blur-md z-30 border-b border-white/5">
        <h1 className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">HABIT QUEST</h1>
        <div className="flex gap-3">
          
          {/* NEW: Share Button */}
          <button onClick={() => setIsShareOpen(true)} className="bg-slate-900 p-2 rounded-full border border-slate-700 text-cyan-500 shadow-lg shadow-cyan-900/20 active:scale-90 transition-transform">
            <Share2 size={18} />
          </button>

          <button onClick={resetGame} className="bg-slate-900 p-2 rounded-full border border-slate-700 text-slate-500"><Settings size={18} /></button>
          
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
            <span className="text-lg">🪙</span><span className="text-yellow-400 font-bold font-mono">{player.gold}</span>
          </div>
        </div>
      </header>

      <main className="px-5 mt-4 space-y-8">
        <div onClick={() => setIsShopOpen(true)} className="cursor-pointer transition-transform hover:scale-[1.02]">
          <PlayerStats level={player.level} currentXP={player.currentXP} maxXP={player.maxXP} health={player.health} avatarSeed={player.avatarSeed} />
          <p className="text-center text-xs text-slate-500 -mt-4 mb-4 animate-pulse">Tap character to change Hero</p>
        </div>

        <div>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Mission Board</h2>
            <span className="text-xs text-slate-600">{quests.length} Active</span>
          </div>
          
          <div className="space-y-3">
            {quests.length === 0 ? (
              <div className="text-center py-12 opacity-50 border-2 border-dashed border-slate-800 rounded-2xl">
                <p>No active missions.</p> <p className="text-sm text-cyan-500 mt-2">Tap + to start a new quest!</p>
              </div>
            ) : (
              quests.map(quest => (
                <QuestCard 
                  key={quest.id}
                  title={quest.title} difficulty={quest.difficulty} xpReward={quest.xp} goldReward={quest.gold} streak={quest.streak}
                  onComplete={() => handleNormalComplete(quest.id)}
                  onStartFocus={() => setFocusQuest(quest)}
                  onDelete={() => deleteQuest(quest.id)} // Pass delete function
                />
              ))
            )}
          </div>
        </div>
      </main>

      <button onClick={() => setIsDrawerOpen(true)} className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-90 transition-all z-40"><Plus size={28} strokeWidth={3} /></button>
      <AddQuestDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAdd={addQuest} />
    </div>
  );
}

export default App;