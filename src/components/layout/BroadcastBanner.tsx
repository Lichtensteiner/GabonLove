import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Megaphone, X } from "lucide-react";

export default function BroadcastBanner() {
  const [broadcast, setBroadcast] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "config"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.broadcast && data.broadcast.trim() !== "") {
          setBroadcast(data.broadcast);
          setIsVisible(true);
        } else {
          setBroadcast(null);
        }
      }
    });
    return () => unsub();
  }, []);

  if (!broadcast || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-love-red text-white relative z-[100]"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <Megaphone className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider truncate">
              {broadcast}
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
