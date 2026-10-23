'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 flex items-center gap-3 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-2xl shadow-amber-500/20 backdrop-blur-md border border-white/20"
        >
          <div className="bg-white/20 p-1.5 rounded-full">
            <WifiOff className="w-4 h-4 text-white" />
          </div>
          <span>Offline Mode — Using cached data.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
