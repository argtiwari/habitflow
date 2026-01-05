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
import { Plus, Settings, Share2, Scroll, LogIn, LogOut, Cloud } from 'lucide-react'; // Icons add kiye

// --- FIREBASE IMPORTS ---
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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

  // --- USER STATE (Login Info) ---
  const [user, setUser] = useState(null); 
  const [isSyncing, setIsSyncing] = useState(false); // Cloud loading state

  // --- THEME ---
  const [theme, setTheme] = useState(() => localStorage.getItem('rpg_theme') || 'theme-midnight');
  useEffect(() => {
    localStorage.setItem('rpg_theme', theme);
    document.body.className = theme; 
  }, [theme]);

  // --- GAME DATA STATES ---
  const [player, setPlayer] = useState(() => {
    try {
      const saved = localStorage.getItem('rpg_player_v6');
      return saved ? JSON.parse(saved) : { level: 1, currentXP: 0, maxXP: 500, health: 100, gold: 0, avatarSeed: 'kai', unlockedAvatars: ['kai'] };
    } catch { return { level: 1, currentXP: 0, maxXP: 500, health: 100, gold: 0, avatarSeed: 'kai', unlockedAvatars: ['kai'] }; }
  });

  const [quests, setQuests] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rpg_quests_v6')) || []; } catch { return []; }
  });

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rpg_history_v1')) || []; } catch { return []; }
  });

  // --- 🔥 CLOUD SYNC LOGIC (The Magic) ---

  // 1. Auth Listener: Check karo user aaya ya gaya
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsSyncing(true);
        // Cloud se data mangwao
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Data mila! Load karo
          const data = docSnap.data();
          if(data.player) setPlayer(data.player);
          if(data.quests) setQuests(data.quests);
          if(data.history) setHistory(data.history);
          console.log("Cloud Save Loaded!");
        } else {
          // Data nahi hai (New Login)? Local data upload kardo
          await setDoc(docRef, { player, quests, history });
          console.log("Local Data Uploaded to Cloud!");
        }
        setIsSyncing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Auto-Save: Jab bhi data badle, Cloud pe bhejo
  useEffect(() => {
    // Local Save (Hamesha)
    localStorage.setItem('rpg_player_v6', JSON.stringify(player));
    localStorage.setItem('rpg_quests_v6', JSON.stringify(quests));
    localStorage.setItem('rpg_history_v1', JSON.stringify(history));

    // Cloud Save (Sirf agar logged in hai)
    if (user) {
      const saveToCloud = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          await setDoc(docRef, { player, quests, history }, { merge: true });
        } catch (e) { console.error("Save Error:", e); }
      };
      // Thoda wait karke save karo (Debounce) taaki server hang na ho
      const timeout = setTimeout(saveToCloud, 1000); 
      return () => clearTimeout(timeout);
    }
  }, [player, quests, history, user]);

  // --- LOGIN / LOGOUT FUNCTIONS ---
  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (error) { alert("Login Failed: " + error.message); }
  };

  const handleLogout = async () => {
    if(confirm("Are you sure? Local data will remain on this device.")) {
      await signOut(auth);
      // Optional: Reset game on logout? Abhi rehne dete hain.
    }
  };

  // --- GAME ACTIONS (Same as before) ---
  const handleBuyAvatar = (avatar) => {
    if (player.gold >= avatar.cost) {
      setPlayer({ ...player, gold: player.gold - avatar.cost, unlockedAvatars: [...player.unlockedAvatars, avatar.id], avatarSeed: avatar.id });
    }
  };

  const addToHistory = (questTitle, status, reason = null) => {
    const entry = { id: uuidv4(), date: new Date().toISOString(), title: questTitle, status, reason };
    setHistory([entry, ...history]);
  };

  const addQuest = (questData) => {
    setQuests([{ id: uuidv4(), ...questData, streak: 0 }, ...quests]);
    setIsDrawerOpen(false);
  };

  const deleteQuest = (id) => setQuests(quests.filter(q => q.id !== id));

  const processCompletion = (questId, bonusMultiplier = 1, extraGold = 0) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;
    addToHistory(quest.title, 'Victory');
    let earnedXP = quest.xp * bonusMultiplier;
    let earnedGold = (quest.gold * bonusMultiplier) + extraGold;
    let newXP = player.currentXP + earnedXP;
    let newLevel = player.level;
    let newMaxXP = player.maxXP;
    let isLevelUp = false;
    if (newXP >= player.maxXP) { isLevelUp = true; newLevel++; newXP -= player.maxXP; newMaxXP = Math.floor(player.maxXP * 1.5); }
    setPlayer({ ...player, level: newLevel, currentXP: newXP, maxXP: newMaxXP, gold: player.gold + earnedGold, health: isLevelUp ? 100 : Math.min(100, player.health + 5) });
    setQuests(quests.map(q => q.id === questId ? { ...q, streak: q.streak + 1 } : q));
    if (isLevelUp) setShowLevelUp(true);
  };

  const handleDefeatConfirm = (reason) => {
    const quest = quests.find(q => q.id === failingQuestId);
    if (quest) {
      addToHistory(quest.title, 'Defeat', reason);
      setPlayer({ ...player, health: Math.max(0, player.health - 10) });
      setQuests(quests.map(q => q.id === failingQuestId ? { ...q, streak: 0 } : q));
    }
    setFailingQuestId(null);
  };

  const handleNormalComplete = (id) => processCompletion(id, 1, 0);
  const handleFocusSessionComplete = (minutes) => { if (focusQuest) { processCompletion(focusQuest.id, 2, Math.floor(minutes / 5)); setFocusQuest(null); } };
  const resetGame = () => { if(confirm("Full Reset?")) { localStorage.clear(); window.location.reload(); } };

  return (
    <div className="min-h-screen font-sans pb-28 overflow-x-hidden selection:bg-[var(--accent)] selection:text-white" style={{ backgroundColor: 'var(--bg-primary)', color: 'white' }}>
      <LevelUpModal isOpen={showLevelUp} newLevel={player.level} onClose={() => setShowLevelUp(false)} />
      <FocusMode isOpen={!!focusQuest} onClose={() => setFocusQuest(null)} activeQuest={focusQuest} player={player} onCompleteSession={handleFocusSessionComplete} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} player={player} />
      <AvatarShop isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} currentAvatar={player.avatarSeed} userGold={player.gold} unlockedAvatars={player.unlockedAvatars} userLevel={player.level} onBuy={handleBuyAvatar} onSelect={(seed) => setPlayer({ ...player, avatarSeed: seed })} />
      <DefeatModal isOpen={!!failingQuestId} onClose={() => setFailingQuestId(null)} onConfirm={handleDefeatConfirm} />
      <JournalDrawer isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} history={history} />
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentTheme={theme} onThemeChange={setTheme} onReset={resetGame} />
      <AddQuestDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAdd={addQuest} />

      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 backdrop-blur-md z-30 border-b border-[var(--border-color)]" style={{ backgroundColor: 'var(--bg-secondary-opacity)' }}>
        <h1 className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, var(--accent), var(--text-highlight))' }}>HABIT QUEST</h1>
        
        <div className="flex gap-2 items-center">
          {/* LOGIN / SYNC STATUS */}
          {user ? (
             <div className="flex items-center gap-2">
               {isSyncing ? <Cloud size={18} className="animate-pulse text-green-500"/> : <Cloud size={18} className="text-green-500"/>}
               <button onClick={handleLogout} className="bg-red-500/20 p-2 rounded-full border border-red-500/50 text-red-500 active:scale-90"><LogOut size={16} /></button>
             </div>
          ) : (
             <button onClick={handleLogin} className="bg-[var(--accent)] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-[var(--accent)]/20 active:scale-90">
               <LogIn size={14} /> LOGIN
             </button>
          )}

          <div className="w-[1px] h-6 bg-[var(--border-color)] mx-1"></div>

          <button onClick={() => setIsJournalOpen(true)} className="bg-[var(--bg-secondary)] p-2 rounded-full border border-[var(--border-color)] active:scale-90" style={{ color: 'var(--accent)' }}><Scroll size={18} /></button>
          <button onClick={() => setIsSettingsOpen(true)} className="bg-[var(--bg-secondary)] p-2 rounded-full border border-[var(--border-color)] text-slate-500 active:scale-90"><Settings size={18} /></button>
          
          <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-lg">
            <span className="text-lg">🪙</span><span className="text-yellow-400 font-bold font-mono">{player.gold}</span>
          </div>
        </div>
      </header>

      <main className="px-5 mt-4 space-y-8">
        {/* Same Main Content as before */}
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
                  key={quest.id} title={quest.title} difficulty={quest.difficulty} xpReward={quest.xp} goldReward={quest.gold} streak={quest.streak}
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
    </div>
  );
}

export default App;