import { useState, FormEvent } from "react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import Button from "./ui/Button";

interface StoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  myProfile: any;
}

export default function StoryCreator({ isOpen, onClose, myProfile }: StoryCreatorProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await addDoc(collection(db, "stories"), {
        userId: user.uid,
        userName: myProfile?.displayName || "Anonyme",
        userPhoto: myProfile?.mainPhoto || "",
        content: content.trim(),
        timestamp: serverTimestamp(),
        expiresAt: expiresAt.toISOString()
      });

      setContent("");
      onClose();
    } catch (err) {
      console.error("Error posting story:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-100"
        >
          <div className="p-6 border-b border-stone-50 flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold italic flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-love-red" />
              Publier une Nouvelle
            </h3>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Quoi de neuf ?</label>
               <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Partagez un moment, une humeur ou une annonce..."
                className="w-full h-32 p-4 bg-stone-50 border-stone-100 border rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-love-red transition-all text-sm font-medium italic resize-none"
                maxLength={200}
               />
               <p className="text-right text-[10px] text-stone-300 font-bold">{content.length}/200</p>
            </div>

            <div className="flex items-center justify-between">
               <button type="button" className="flex items-center gap-2 px-4 py-2 bg-stone-50 text-stone-500 rounded-xl hover:bg-stone-100 transition-all text-[10px] font-black uppercase tracking-widest">
                  <ImageIcon className="w-4 h-4" />
                  Ajouter une Photo
               </button>

               <Button 
                type="submit" 
                disabled={!content.trim() || loading}
                className="rounded-2xl shadow-lg shadow-rose-100"
               >
                 {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                 Publier
               </Button>
            </div>
            
            <p className="text-[9px] text-center text-stone-300 italic">Visible pendant 24h par toute la communauté GabonLove</p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
