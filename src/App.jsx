import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import PlayerStats from './components/PlayerStats';
import QuestCard from './components/QuestCard';
import LevelUpModal from './components/LevelUpModal';
import AddQuestDrawer from './components/AddQuestDrawer';
import AvatarShop from './components/AvatarShop';
import FocusMode from './components/FocusMode';
import ShareModal from './components/ShareModal';
import DefeatModal from './components/DefeatModal';
import JournalDrawer from './components/JournalDrawer';
import SettingsDrawer from './components/SettingsDrawer';
import GameToast from './components/GameToast'; // New import
import { Plus, Settings, Share2, Scroll, LogIn, LogOut, Cloud } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';


import RewardsDrawer from './components/RewardsDrawer'; // New Import
import { Gift } from 'lucide-react'; // Gift icon

// Upar imports mein ye add karein
import SplashScreen from './components/SplashScreen';
import { AnimatePresence } from 'framer-motion'; // Ye check karein ki ye import hai


// --- HELPER: AAJ KI DATE ---
const getTodayString = () => new Date().toISOString().split('T')[0];

function App() {
  // --- UI STATES ---
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [focusQuest, setFocusQuest] = useState(null);
  const [failingQuestId, setFailingQuestId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- TOAST STATE ---
  const [toast, setToast] = useState(null); // { message: "Msg", type: "success" }

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    // Sound bhi play kar sakte hain yahan!
    if (type === 'success') playSound('success');
    if (type === 'error') playSound('defeat');
    if (type === 'loot') playSound('coin');
  };

  // --- USER STATE (Login Info) ---
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- THEME ---
  const [theme, setTheme] = useState(() => localStorage.getItem('rpg_theme') || 'theme-midnight');
  useEffect(() => {
    localStorage.setItem('rpg_theme', theme);
    document.body.className = theme;
  }, [theme]);

  // --- GAME DATA STATES ---
  const [player, setPlayer] = useState(() => {
    try {
      const saved = localStorage.getItem('rpg_player_v7'); // Version bumped to v7
      return saved ? JSON.parse(saved) : { level: 1, currentXP: 0, maxXP: 500, health: 100, gold: 0, avatarSeed: 'kai', unlockedAvatars: ['kai'] };
    } catch { return { level: 1, currentXP: 0, maxXP: 500, health: 100, gold: 0, avatarSeed: 'kai', unlockedAvatars: ['kai'] }; }
  });

  const [quests, setQuests] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rpg_quests_v7')) || []; } catch { return []; }
  });

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rpg_history_v1')) || []; } catch { return []; }
  });


  // ... Baki states ke saath
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);

  // Storage se Rewards load karo (ya empty array)
  const [rewards, setRewards] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rpg_rewards_v1')) || []; } catch { return []; }
  });

  // Save to LocalStorage
  useEffect(() => { localStorage.setItem('rpg_rewards_v1', JSON.stringify(rewards)); }, [rewards]);

  // --- REWARD ACTIONS ---
  const addReward = (reward) => {
    setRewards([...rewards, { id: uuidv4(), ...reward }]);
  };

  const deleteReward = (id) => {
    setRewards(rewards.filter(r => r.id !== id));
  };

 const buyReward = (reward) => {
    if (player.gold >= reward.cost) {
      // 🔥 SOUND 4: Treat Yo Self Sound
      playSound('buy'); 
      
      setPlayer({ ...player, gold: player.gold - reward.cost });
      addToHistory(`Bought Reward: ${reward.title}`, 'Shopping');
      showToast(`🎉 Item Acquired: ${reward.title}`, "loot");
    } else {
      showToast("Not enough Gold! Complete more quests.", "error");
    }
  };
  // --- 🌅 THE SUNRISE PROTOCOL (Daily Reset Logic) ---
  useEffect(() => {
    const today = getTodayString();
    const lastLoginDate = localStorage.getItem('rpg_last_login');

    if (lastLoginDate !== today) {
      console.log("🌞 A New Day Begins!");
      // Future Feature: Yahan hum "Streak Break Penalty" logic laga sakte hain
      localStorage.setItem('rpg_last_login', today);
    }
  }, []);

  // --- 🔥 CLOUD SYNC LOGIC ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsSyncing(true);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.player) setPlayer(data.player);
          if (data.quests) setQuests(data.quests);
          if (data.history) setHistory(data.history);
        } else {
          await setDoc(docRef, { player, quests, history });
        }
        setIsSyncing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('rpg_player_v7', JSON.stringify(player));
    localStorage.setItem('rpg_quests_v7', JSON.stringify(quests));
    localStorage.setItem('rpg_history_v1', JSON.stringify(history));

    if (user) {
      const saveToCloud = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          await setDoc(docRef, { player, quests, history }, { merge: true });
        } catch (e) { console.error("Save Error:", e); }
      };
      const timeout = setTimeout(saveToCloud, 1000);
      return () => clearTimeout(timeout);
    }
  }, [player, quests, history, user]);

  // --- LOGIN / LOGOUT ---
  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (error) { showToast("Login Failed: " + error.message); }
  };
  const handleLogout = async () => {
    if (confirm("Logout? Local data will persist.")) await signOut(auth);
  };

  // --- GAME ACTIONS ---
 const handleBuyAvatar = (avatar) => {
    if (player.gold >= avatar.cost) {
      // 🔥 SOUND 3: Khareedari ki awaaz
      playSound('buy');
      
      setPlayer({ ...player, gold: player.gold - avatar.cost, unlockedAvatars: [...player.unlockedAvatars, avatar.id], avatarSeed: avatar.id });
      addToHistory(`Unlocked Hero: ${avatar.name}`, 'Shopping'); // History me bhi daal diya
    } else {
      showToast("Not enough Gold!");
    }
  };

  const addToHistory = (questTitle, status, reason = null) => {
    const entry = { id: uuidv4(), date: new Date().toISOString(), title: questTitle, status, reason };
    setHistory([entry, ...history]);
  };

  const addQuest = (questData) => {
    // questData mein ab 'type' (daily/one-time) bhi aayega Drawer se
    setQuests([{ id: uuidv4(), ...questData, streak: 0, lastCompletedDate: null }, ...quests]);
    setIsDrawerOpen(false);
  };

  const deleteQuest = (id) => setQuests(quests.filter(q => q.id !== id));

  // --- CORE LOGIC: XP & GOLD ---
  // --- CORE LOGIC: XP & GOLD ---
  const processRewards = (questId, bonusMultiplier = 1, extraGold = 0) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    addToHistory(quest.title, 'Victory');

    // 🔥 SOUND 1: Coin milne ki awaaz
    playSound('coin'); 
    

    let earnedXP = quest.xp * bonusMultiplier;
    let earnedGold = (quest.gold * bonusMultiplier) + extraGold;
    let newXP = player.currentXP + earnedXP;
    let newLevel = player.level;
    let newMaxXP = player.maxXP;
    let isLevelUp = false;

    if (newXP >= player.maxXP) {
      isLevelUp = true;
      newLevel++;
      newXP -= player.maxXP;
      newMaxXP = Math.floor(player.maxXP * 1.5);
      
      // 🔥 SOUND 2: Level Up ki dhamakedar awaaz
      playSound('levelup');
    }
    
    setPlayer({ ...player, level: newLevel, currentXP: newXP, maxXP: newMaxXP, gold: player.gold + earnedGold, health: isLevelUp ? 100 : Math.min(100, player.health + 5) });
    if (isLevelUp) setShowLevelUp(true);
  };
// --- UPDATED COMPLETE FUNCTION (History Tracking ke sath) ---
  const handleNormalComplete = (id) => {
    const quest = quests.find(q => q.id === id);
    const today = getTodayString();

    // 1. Agar Daily hai aur Aaj kar chuke hain -> Roko
    if (quest.type === 'daily' && quest.lastCompletedDate === today) {
       showToast("Mission already accomplished for today! 🛡️", "info");
       return; 
    }

    // 2. Rewards do
    processRewards(id, 1, 0);
    showToast(`Victory! +${quest.xp} XP | +${quest.gold} Gold`, "success"); // Toast add kiya

    // 3. Quest Update Logic (HISTORY ADDED HERE 👇)
    if (quest.type === 'daily') {
      setQuests(quests.map(q => q.id === id ? { 
        ...q, 
        streak: (q.streak || 0) + 1, 
        lastCompletedDate: today,
        // Nayi Line: Aaj ki date ko 'true' mark kar diya
        history: { ...(q.history || {}), [today]: true } 
      } : q));
    } else {
      deleteQuest(id);
    }
  };

  const handleFocusSessionComplete = (minutes) => {
    if (!focusQuest) return;
    // Focus mode ke baad bhi hum same logic use karenge manually
    const today = getTodayString();

    processRewards(focusQuest.id, 2, Math.floor(minutes / 5));

    if (focusQuest.type === 'daily') {
      setQuests(prev => prev.map(q => q.id === focusQuest.id ? { ...q, streak: (q.streak || 0) + 1, lastCompletedDate: today } : q));
    } else {
      deleteQuest(focusQuest.id);
    }
    setFocusQuest(null);
  };

  const handleDefeatConfirm = (reason) => {
    const quest = quests.find(q => q.id === failingQuestId);
    if (quest) {
      addToHistory(quest.title, 'Defeat', reason);
      setPlayer({ ...player, health: Math.max(0, player.health - 10) });
      // Streak Reset on failure
      setQuests(quests.map(q => q.id === failingQuestId ? { ...q, streak: 0 } : q));
    }
    setFailingQuestId(null);
  };

  const resetGame = () => { if (confirm("Full Reset?")) { localStorage.clear(); window.location.reload(); } };


 const playSound = (type) => {
    // Google & Coursera hosted reliable sounds
    const sounds = {
      coin: 'https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/bonus.wav', // Tring!
      levelup: 'https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a', // Winning Sound
      success: 'https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3', // Pop sound
      buy: 'https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/pause.wav', // Blip
      defeat: 'https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/explosion_01.wav' // Boom
    };
    
    try {
      const audio = new Audio(sounds[type]);
      audio.volume = 0.5; // Volume 50%
      // Promise handle kiya taaki error dikhe
      audio.play().catch((error) => console.log("Sound Blocked by Browser:", error));
    } catch (e) {
      console.error("Audio Error:", e);
    }
  };


 return (
    <>
      <AnimatePresence>
        {isLoading && (
          <SplashScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
    <div className="min-h-screen font-sans pb-28 overflow-x-hidden selection:bg-[var(--accent)] selection:text-white" style={{ backgroundColor: 'var(--bg-primary)', color: 'white' }}>

      <LevelUpModal isOpen={showLevelUp} newLevel={player.level} onClose={() => setShowLevelUp(false)} />

      <FocusMode isOpen={!!focusQuest} onClose={() => setFocusQuest(null)} activeQuest={focusQuest} player={player} onCompleteSession={handleFocusSessionComplete} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} player={player} />
      <AvatarShop isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} currentAvatar={player.avatarSeed} userGold={player.gold} unlockedAvatars={player.unlockedAvatars} userLevel={player.level} onBuy={handleBuyAvatar} onSelect={(seed) => setPlayer({ ...player, avatarSeed: seed })} />
      <DefeatModal isOpen={!!failingQuestId} onClose={() => setFailingQuestId(null)} onConfirm={handleDefeatConfirm} />
      <JournalDrawer isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} history={history} />
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentTheme={theme} onThemeChange={setTheme} onReset={resetGame} />

      {/* Drawer ko onAdd pass kiya */}
      <AddQuestDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAdd={addQuest} />

      {/* Jahan baki Drawers/Modals hain wahan ye line daal dein */}
      <RewardsDrawer
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        userGold={player.gold}
        rewards={rewards}
        onAddReward={addReward}
        onBuyReward={buyReward}
        onDeleteReward={deleteReward}
      />

      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 backdrop-blur-md z-30 border-b border-[var(--border-color)]" style={{ backgroundColor: 'var(--bg-secondary-opacity)' }}>
        <h1 className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--text-highlight))' }}>HABIT QUEST</h1>

        <div className="flex gap-2 items-center">
          {user ? (
            <div className="flex items-center gap-2">
              {isSyncing ? <Cloud size={18} className="animate-pulse text-green-500" /> : <Cloud size={18} className="text-green-500" />}
              <button onClick={handleLogout} className="bg-red-500/20 p-2 rounded-full border border-red-500/50 text-red-500 active:scale-90"><LogOut size={16} /></button>
            </div>
          ) : (
            <button onClick={handleLogin} className="bg-[var(--accent)] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-[var(--accent)]/20 active:scale-90">
              <LogIn size={14} /> LOGIN
            </button>
          )}

          <div className="w-[1px] h-6 bg-[var(--border-color)] mx-1"></div>

          <button onClick={() => setIsJournalOpen(true)} className="bg-[var(--bg-secondary)] p-2 rounded-full border border-[var(--border-color)] active:scale-90" style={{ color: 'var(--accent)' }}><Scroll size={18} /></button>
          <button onClick={() => setIsSettingsOpen(true)} className="bg-[var(--bg-secondary)] p-2 rounded-full border border-[var(--border-color)] text-slate-500 active:scale-90"><Settings size={18} /></button><button onClick={() => setIsRewardsOpen(true)} className="bg-[var(--bg-secondary)] p-2 rounded-full border border-[var(--border-color)] text-pink-500 active:scale-90 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
            <Gift size={18} />
          </button>

          <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-lg">
            <span className="text-lg">🪙</span><span className="text-yellow-400 font-bold font-mono">{player.gold}</span>
          </div>
        </div>
      </header>

      <main className="px-5 mt-4 space-y-8">
        <div onClick={() => setIsShopOpen(true)} className="cursor-pointer transition-transform hover:scale-[1.02]">
          <PlayerStats level={player.level} currentXP={player.currentXP} maxXP={player.maxXP} health={player.health} avatarSeed={player.avatarSeed} />
          <p className="text-center text-xs opacity-50 -mt-4 mb-4 animate-pulse">Tap character to change Hero</p>
        </div>

        <div>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-sm font-bold opacity-60 uppercase tracking-widest">Mission Board</h2>
            <span className="text-xs opacity-50">{quests.length} Active</span>
          </div>
          <div className="space-y-3">
            {quests.length === 0 ? (
              <div className="text-center py-12 opacity-50 border-2 border-dashed border-[var(--border-color)] rounded-2xl">
                <p>No active missions.</p>
                <p className="text-sm mt-2 font-bold" style={{ color: 'var(--accent)' }}>Tap + to start!</p>
              </div>
            ) : (
              quests.map(quest => (
                <QuestCard
                  key={quest.id}
                  title={quest.title}
                  difficulty={quest.difficulty}
                  xpReward={quest.xp}
                  goldReward={quest.gold}
                  streak={quest.streak}
                  // New Props 👇
                  type={quest.type}
                  lastCompletedDate={quest.lastCompletedDate}

                  onComplete={() => handleNormalComplete(quest.id)}
                  onStartFocus={() => setFocusQuest(quest)}
                  onDelete={() => deleteQuest(quest.id)}
                  onFail={() => setFailingQuestId(quest.id)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <button onClick={() => setIsDrawerOpen(true)} className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg active:scale-90 transition-all z-40" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 20px var(--accent)' }}><Plus size={28} strokeWidth={3} /></button>

      {/* --- GAME TOAST NOTIFICATION --- */}
      <GameToast toast={toast} onClose={() => setToast(null)} />

    </div>
  )}
    </>
  );
}

export default App;