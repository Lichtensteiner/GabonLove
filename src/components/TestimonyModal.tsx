import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Loader2, Star, MessageSquare } from "lucide-react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, limit } from "firebase/firestore";
import Button from "./ui/Button";

interface TestimonyModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetName: string;
}

export default function TestimonyModal({ isOpen, onClose, targetId, targetName }: TestimonyModalProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [testimonies, setTestimonies] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!targetId || !isOpen) return;

    const q = query(
      collection(db, "reviews"),
      where("targetId", "==", targetId),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setTestimonies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [targetId, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "reviews"), {
        authorId: user.uid,
        targetId,
        content: content.trim(),
        timestamp: serverTimestamp(),
      });
      setContent("");
    } catch (err) {
      console.error("Error sending testimony:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-x-0 bottom-0 max-h-[80vh] bg-stone-50 rounded-t-[2.5rem] z-[101] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 bg-white border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold italic">Laissez un mot doux</h2>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Encouragez {targetName}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-stone-300 hover:text-stone-500"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/50">
              {/* Existing testimonies */}
              <div className="space-y-4">
                {testimonies.length > 0 ? (
                  testimonies.map((t) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={t.id} 
                      className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 relative group"
                    >
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-3 h-3" />
                      </div>
                      <p className="text-sm text-stone-600 italic leading-relaxed">"{t.content}"</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 text-stone-400">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1">Soyez le premier</p>
                    <p className="text-[10px] italic">à laisser un message d'encouragement !</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white border-t border-stone-100">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Un petit mot pour ${targetName}...`}
                  className="flex-1 h-12 px-4 bg-stone-50 border-stone-100 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-200 transition-all text-sm"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !content.trim()} 
                  className="h-12 w-12 rounded-2xl bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100"
                  size="icon"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
