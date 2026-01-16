import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Reorder } from 'framer-motion'; // Drag & Drop
import { 
  Plus, Settings, Scroll, LogIn, LogOut, Cloud, Gift 
} from 'lucide-react';

// Components
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
import RewardsDrawer from './components/RewardsDrawer';
import GameToast from './components/GameToast';
import SplashScreen from './components/SplashScreen';

// Firebase
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Helper: Aaj ki date string
const getTodayString = () => new Date().toISOString().split('T')[0];

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // --- UI STATES ---
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [focusQuest, setFocusQuest] = useState(null);
  const [failingQuestId, setFailingQuestId] = useState(null);
  const [toast, setToast] = useState(null);

  // --- USER & DATA STATES ---
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- THEME ---
  const [theme, setTheme] = useState(() => localStorage.getItem('rpg_theme') || 'theme-midnight');
  
  useEffect(() => {
    localStorage.setItem('rpg_theme', theme);
    document.body.className = theme;
  }, [theme]);

  // --- LOAD DATA FROM LOCAL STORAGE ---
  const [player, setPlayer] = useState(() => {
    try {
      const saved = localStorage.getItem('rpg_player_v7');
      return saved ? JSON.parse(saved) : { 
        level: 1, currentXP: 0, maxXP: 500, health: 100, gold: 0, 
        avatarSeed: 'kai', unlockedAvatars: ['kai'] 
      };
    } catch { 
      return { level: 1, currentXP: 0, maxXP: 500, health: 100, gold: 0, avatarSeed: 'kai', unlockedAvatars: ['kai'] }; 
    }
  });

  const [quests, setQuests] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rpg_quests_v7')) || []; } catch { return []; }
  });

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rpg_history_v1')) || []; } catch { return []; }
  });

  const [rewards, setRewards] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rpg_rewards_v1')) || []; } catch { return []; }
  });

  // --- 🌅 THE SUNRISE PROTOCOL (Daily Reset Logic) ---
  useEffect(() => {
    const today = getTodayString();
    const lastLoginDate = localStorage.getItem('rpg_last_login');

    if (lastLoginDate !== today) {
      console.log("🌞 A New Day Begins! Resetting Dailies...");
      
      // Update Quests: Daily walon ko reset karo agar needed ho
      // (Visual reset hum render logic me handle karte hain, par yahan hum penalty logic laga sakte hain future me)
      
      localStorage.setItem('rpg_last_login', today);
    }
  }, []);

  // --- 🔔 NOTIFICATION & TIME CHECKER (Every Minute) ---
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // "14:30"
      
      quests.forEach(quest => {
        // Agar Time match ho, aur task complete na ho
        if (quest.scheduledTime === currentTime && !quest.completed) {
           
           // Daily Logic Check: Agar aaj already kar liya hai to ignore karo
           const today = getTodayString();
           if(quest.type === 'daily' && quest.lastCompletedDate === today) return;

           // Send Notification
           new Notification(`⚔️ Mission Time: ${quest.title}`, {
             body: "It's time to act, Hero! Don't lose your streak.",
             icon: '/logo.png'
           });
           playSound('coin'); 
        }
      });
    }, 60000); // 60 seconds loop

    return () => clearInterval(interval);
  }, [quests]);

  // --- 🔥 CLOUD SYNC (Firebase) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsSyncing(true);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if(data.player) setPlayer(data.player);
          if(data.quests) setQuests(data.quests);
          if(data.history) setHistory(data.history);
          if(data.rewards) setRewards(data.rewards);
        } else {
          await setDoc(docRef, { player, quests, history, rewards });
        }
        setIsSyncing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-Save to LocalStorage & Cloud
  useEffect(() => {
    localStorage.setItem('rpg_player_v7', JSON.stringify(player));
    localStorage.setItem('rpg_quests_v7', JSON.stringify(quests));
    localStorage.setItem('rpg_history_v1', JSON.stringify(history));
    localStorage.setItem('rpg_rewards_v1', JSON.stringify(rewards));

    if (user) {
      const saveToCloud = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          await setDoc(docRef, { player, quests, history, rewards }, { merge: true });
        } catch (e) { console.error("Save Error:", e); }
      };
      const timeout = setTimeout(saveToCloud, 2000); // Debounce save
      return () => clearTimeout(timeout);
    }
  }, [player, quests, history, rewards, user]);


  // --- AUDIO SYSTEM ---
  const playSound = (type) => {
    const sounds = {
      coin: 'https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/bonus.wav',
      levelup: 'https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a',
      success: 'https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3',
      buy: 'https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/pause.wav',
      defeat: 'https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/explosion_01.wav'
    };
    try {
      const audio = new Audio(sounds[type]);
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio blocked:", e));
    } catch (e) { console.error(e); }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    if (type === 'success') playSound('success');
    if (type === 'error') playSound('defeat');
    if (type === 'loot') playSound('coin');
  };

  // --- CORE GAME ACTIONS ---
  
  const addQuest = (questData) => {
    const newQuest = { 
      id: uuidv4(), 
      ...questData, 
      streak: 0, 
      lastCompletedDate: null 
    };
    setQuests([newQuest, ...quests]);
    setIsDrawerOpen(false);
  };

  const deleteQuest = (id) => {
    setQuests(quests.filter(q => q.id !== id));
  };

  const handleNormalComplete = (id) => {
    const quest = quests.find(q => q.id === id);
    const today = getTodayString();

    // Daily Logic Check
    if (quest.type === 'daily' && quest.lastCompletedDate === today) {
       showToast("Mission already accomplished for today! 🛡️", "info");
       return; 
    }

    // Process Rewards
    processRewards(id, 1, 0);
    showToast(`Victory! +${quest.xp} XP | +${quest.gold} Gold`, "success");

    // Update Quest State
    if (quest.type === 'daily') {
      setQuests(quests.map(q => q.id === id ? { 
        ...q, 
        streak: (q.streak || 0) + 1, 
        lastCompletedDate: today,
        history: { ...(q.history || {}), [today]: true } 
      } : q));
    } else {
      // One-time quest delete
      deleteQuest(id);
    }
  };

  const processRewards = (questId, bonusMultiplier = 1, extraGold = 0) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    // Add to History
    const newHistoryItem = {
        id: uuidv4(), 
        date: new Date().toISOString(), 
        title: quest.title, 
        status: 'Victory'
    };
    setHistory([newHistoryItem, ...history]);

    playSound('coin');

    // Calculate XP & Gold
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
      playSound('levelup');
    }

    setPlayer({ 
      ...player, 
      level: newLevel, 
      currentXP: newXP, 
      maxXP: newMaxXP, 
      gold: player.gold + earnedGold, 
      health: isLevelUp ? 100 : Math.min(100, player.health + 5) 
    });

    if (isLevelUp) setShowLevelUp(true);
  };

  const handleDefeatConfirm = () => {
    const quest = quests.find(q => q.id === failingQuestId);
    if (quest) {
      setHistory([{
          id: uuidv4(), 
          date: new Date().toISOString(), 
          title: quest.title, 
          status: 'Defeat'
      }, ...history]);

      setPlayer({ ...player, health: Math.max(0, player.health - 10) });
      
      // Reset Streak
      setQuests(quests.map(q => q.id === failingQuestId ? { ...q, streak: 0 } : q));
    }
    setFailingQuestId(null);
  };

  // --- REWARDS SYSTEM ---
  const handleAddReward = (reward) => {
      setRewards([...rewards, { id: uuidv4(), ...reward }]);
  };
  
  const handleBuyReward = (reward) => {
    if (player.gold >= reward.cost) {
      playSound('buy');
      setPlayer({ ...player, gold: player.gold - reward.cost });
      
      // History Update
      setHistory([{
        id: uuidv4(), 
        date: new Date().toISOString(), 
        title: `Bought: ${reward.title}`, 
        status: 'Shopping'
      }, ...history]);

      showToast(`Item Acquired: ${reward.title}`, 'loot');
    } else {
      showToast("Not enough Gold!", "error");
    }
  };

  // --- RENDER ---
  if (isLoading) {
    return <SplashScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen font-sans pb-28 overflow-x-hidden selection:bg-[var(--accent)] selection:text-white" style={{ backgroundColor: 'var(--bg-primary)', color: 'white' }}>
      
      <GameToast toast={toast} onClose={() => setToast(null)} />
      
      {/* --- MODALS & DRAWERS --- */}
      <LevelUpModal isOpen={showLevelUp} newLevel={player.level} onClose={() => setShowLevelUp(false)} />
      
      <AddQuestDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAdd={addQuest} />
      
      <RewardsDrawer 
        isOpen={isRewardsOpen} 
        onClose={() => setIsRewardsOpen(false)} 
        userGold={player.gold} 
        rewards={rewards} 
        onAddReward={handleAddReward} 
        onBuyReward={handleBuyReward} 
        onDeleteReward={(id) => setRewards(rewards.filter(r => r.id !== id))} 
      />
      
      <DefeatModal isOpen={!!failingQuestId} onClose={() => setFailingQuestId(null)} onConfirm={handleDefeatConfirm} />
      
      <JournalDrawer isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} history={history} />
      
      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentTheme={theme} 
        onThemeChange={setTheme} 
        onReset={() => { if(confirm("Reset Game Data?")) { localStorage.clear(); window.location.reload(); }}} 
      />
      
      <AvatarShop 
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)} 
        currentAvatar={player.avatarSeed} 
        userGold={player.gold} 
        unlockedAvatars={player.unlockedAvatars} 
        userLevel={player.level} 
        onBuy={(av) => { 
            if(player.gold>=av.cost) { 
                playSound('buy'); 
                setPlayer({...player, gold: player.gold-av.cost, unlockedAvatars: [...player.unlockedAvatars, av.id], avatarSeed: av.id}); 
            } else { 
                showToast("Need more Gold!", "error"); 
            }
        }} 
        onSelect={(id) => setPlayer({...player, avatarSeed: id})} 
      />
      
      <FocusMode 
        isOpen={!!focusQuest} 
        onClose={() => setFocusQuest(null)} 
        activeQuest={focusQuest} 
        player={player} 
        onCompleteSession={(mins) => { 
            const q=focusQuest; 
            processRewards(q.id, 2, Math.floor(mins/5)); 
            showToast("Focus Session Complete!", "success"); 
            if(q.type==='daily') { 
                const today = getTodayString(); 
                setQuests(prev => prev.map(x => x.id === q.id ? { ...x, streak: x.streak+1, lastCompletedDate: today, history: { ...(x.history||{}), [today]: true } } : x)); 
            } else { 
                setQuests(prev => prev.filter(x => x.id !== q.id)); 
            } 
            setFocusQuest(null); 
        }} 
      />

      {/* --- HEADER --- */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 backdrop-blur-md z-30 border-b border-[var(--border-color)] bg-[var(--bg-secondary-opacity)]">
        <h1 className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">HABIT QUEST</h1>
        
        <div className="flex gap-2 items-center">
          {user ? (
             <div className="flex items-center gap-2">
               {isSyncing ? <Cloud size={18} className="animate-pulse text-green-500"/> : <Cloud size={18} className="text-green-500"/>}
             </div>
          ) : (
             <button onClick={() => signInWithPopup(auth, googleProvider)} className="bg-[var(--accent)] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-[var(--accent)]/20 active:scale-90">
               <LogIn size={14} />
             </button>
          )}

          <div className="w-[1px] h-6 bg-[var(--border-color)] mx-1"></div>

          <button onClick={() => setIsRewardsOpen(true)} className="bg-[var(--bg-secondary)] p-2 rounded-full border border-[var(--border-color)] text-pink-500 active:scale-90 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
            <Gift size={18} />
          </button>
          <button onClick={() => setIsJournalOpen(true)} className="bg-[var(--bg-secondary)] p-2 rounded-full border border-[var(--border-color)] text-cyan-500 active:scale-90">
            <Scroll size={18} />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="bg-[var(--bg-secondary)] p-2 rounded-full border border-[var(--border-color)] text-slate-500 active:scale-90">
            <Settings size={18} />
          </button>
          
          <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-lg">
            <span className="text-lg">🪙</span><span className="text-yellow-400 font-bold font-mono">{player.gold}</span>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
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
          
          {quests.length === 0 ? (
             // --- NO MISSIONS (CLICKABLE) ---
             <div 
                onClick={() => setIsDrawerOpen(true)} 
                className="text-center py-12 opacity-50 border-2 border-dashed border-[var(--border-color)] rounded-2xl cursor-pointer hover:opacity-80 hover:bg-white/5 transition-all group"
             >
               <p className="group-hover:scale-105 transition-transform">No active missions.</p> 
               <p className="text-sm mt-2 font-bold group-hover:text-cyan-400 transition-colors" style={{ color: 'var(--accent)' }}>
                 Tap here to start!
               </p>
             </div>
          ) : (
            // --- 🤚 DRAG AND DROP LIST ---
            <Reorder.Group axis="y" values={quests} onReorder={setQuests} className="space-y-3">
              {quests.map(quest => (
                <Reorder.Item key={quest.id} value={quest} dragListener={true}>
                  <QuestCard 
                    {...quest} 
                    xpReward={quest.xp} 
                    goldReward={quest.gold}
                    onComplete={() => handleNormalComplete(quest.id)}
                    onStartFocus={() => setFocusQuest(quest)}
                    onDelete={() => deleteQuest(quest.id)}
                    onFail={() => setFailingQuestId(quest.id)}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
      </main>

      <button onClick={() => setIsDrawerOpen(true)} className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg active:scale-90 transition-all z-40 bg-[var(--accent)] shadow-[0_0_20px_var(--accent)]">
        <Plus size={28} strokeWidth={3} />
      </button>
    </div>
  );
}

export default App;