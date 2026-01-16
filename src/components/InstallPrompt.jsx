import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Check karo ki kya user ne pehle kabhi ye dekha hai?
    const hasSeenPrompt = localStorage.getItem('install_prompt_seen');
    if (hasSeenPrompt) return; // Agar dekh chuka hai, to yahi ruk jao.

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // 2. Sirf tabhi dikhao agar pehle nahi dekha
      setTimeout(() => {
        setIsVisible(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    
    // Install click kiya, ab dubara mat dikhana
    localStorage.setItem('install_prompt_seen', 'true');
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    // User ne close kiya, ab dubara mat dikhana
    localStorage.setItem('install_prompt_seen', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 p-4 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.2)] relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>

            {/* Close Button with Save Logic */}
            <button 
              onClick={handleDismiss} 
              className="absolute top-2 right-2 text-slate-500 hover:text-white p-1"
            >
              <X size={16} />
            </button>

            <div className="flex gap-4 items-center">
              <div className="bg-cyan-500/20 p-3 rounded-xl border border-cyan-500/50">
                <Smartphone className="text-cyan-400" size={24} />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">Install App</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add to Home Screen for full gaming experience!</p>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Download size={16} />
              INSTALL NOW
            </button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;