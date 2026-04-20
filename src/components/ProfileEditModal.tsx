import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, User, MapPin, Calendar, Heart, FileText, Check } from "lucide-react";
import { db, auth } from "../lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import Button from "./ui/Button";

const GABON_CITIES = [
  "Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda", 
  "Mouila", "Lambaréné", "Tchibanga", "Koula-Moutou", "Makokou", "Diaspora"
];

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any;
}

export default function ProfileEditModal({ isOpen, onClose, initialData }: ProfileEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    gender: "",
    birthDate: "",
    city: "",
    bio: "",
    lookingFor: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        displayName: initialData.displayName || "",
        gender: initialData.gender || "",
        birthDate: initialData.birthDate || "",
        city: initialData.city || "",
        bio: initialData.bio || "",
        lookingFor: initialData.lookingFor || ""
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-10 md:top-20 bg-stone-50 rounded-t-[3rem] z-[101] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 bg-white border-b border-stone-100 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-love-red/10 text-love-red rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-serif font-bold italic">Modifier mon profil</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8 pb-32">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest px-1">Informations de base</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 ml-1">Pseudo</label>
                    <input 
                      type="text" 
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full h-12 px-4 bg-white border-stone-100 border rounded-2xl focus:ring-2 focus:ring-love-red/10 outline-none transition-all shadow-sm"
                      placeholder="Votre nom"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 ml-1">Genre</label>
                      <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full h-12 px-4 bg-white border-stone-100 border rounded-2xl outline-none shadow-sm"
                      >
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 ml-1">Naissance</label>
                      <input 
                        type="date" 
                        value={formData.birthDate}
                        onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                        className="w-full h-12 px-4 bg-white border-stone-100 border rounded-2xl outline-none shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* About & Bio */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest px-1">À propos de moi</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 ml-1">Ma Bio</label>
                    <textarea 
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full p-4 bg-white border-stone-100 border rounded-2xl outline-none resize-none shadow-sm focus:ring-2 focus:ring-love-red/10"
                      placeholder="Dites-en un peu plus sur vous..."
                    />
                  </div>
                </div>

                {/* Location & Intent */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest px-1">Social</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 ml-1">Ville</label>
                      <select 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full h-12 px-4 bg-white border-stone-100 border rounded-2xl outline-none shadow-sm"
                      >
                        {GABON_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 ml-1">Je recherche</label>
                      <select 
                        value={formData.lookingFor}
                        onChange={(e) => setFormData({...formData, lookingFor: e.target.value})}
                        className="w-full h-12 px-4 bg-white border-stone-100 border rounded-2xl outline-none shadow-sm"
                      >
                        <option value="serious">Relation sérieuse</option>
                        <option value="friendship">Amitié</option>
                        <option value="casual">Moment éphémère</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-white border-t border-stone-100 sticky bottom-0">
              <div className="max-w-xl mx-auto flex gap-4">
                <Button variant="ghost" onClick={onClose} className="flex-1 rounded-2xl border-stone-100">
                  Annuler
                </Button>
                <Button 
                  onClick={(e: any) => handleSubmit(e)} 
                  disabled={loading}
                  className="flex-[2] rounded-2xl shadow-lg shadow-rose-100 gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Enregistrer</>}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
