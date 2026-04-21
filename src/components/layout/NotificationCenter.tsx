import { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, limit } from "firebase/firestore";
import { Bell, Heart, MessageSquare, Flame, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      const docRef = doc(db, "notifications", id);
      await updateDoc(docRef, { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'match': return <Flame className="w-4 h-4 text-gabon-yellow fill-gabon-yellow" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-gabon-blue fill-gabon-blue" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-stone-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-stone-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-love-red text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-stone-100 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-stone-50 flex items-center justify-between">
                <h3 className="font-bold text-stone-800">Notifications</h3>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Récentes</span>
              </div>

              <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 flex gap-4 hover:bg-stone-50 transition-colors cursor-pointer border-b border-stone-50 last:border-0 ${!n.read ? 'bg-rose-50/30' : ''}`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-stone-100">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-stone-800 leading-snug">
                          <span className="font-bold">{n.fromName}</span> {n.content || (n.type === 'like' ? 'a aimé votre profil' : n.type === 'match' ? 'est votre nouveau match !' : 'vous a envoyé un message')}
                        </p>
                        <p className="text-[10px] text-stone-400 font-medium">
                          {n.timestamp ? formatDistanceToNow(n.timestamp.toDate(), { addSuffix: true, locale: fr }) : "À l'instant"}
                        </p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-love-red mt-2" />}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-stone-400 italic text-sm">
                    Aucune notification pour le moment.
                  </div>
                )}
              </div>

              <div className="p-3 bg-stone-50 text-center">
                <button className="text-xs font-bold text-love-red hover:underline uppercase tracking-widest">
                  Tout voir
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
