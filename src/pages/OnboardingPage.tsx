import { useState } from "react";
import { motion } from "motion/react";
import { db, auth } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { Loader2, User, Calendar, MapPin, Heart, FileText } from "lucide-react";

const GABON_CITIES = [
  "Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda", 
  "Mouila", "Lambaréné", "Tchibanga", "Koula-Moutou", "Makokou"
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    gender: "",
    birthDate: "",
    city: "",
    bio: "",
    lookingFor: ""
  });

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Save public profile
      await setDoc(doc(db, "profiles", user.uid), {
        ...formData,
        userId: user.uid,
        mainPhoto: user.photoURL || "",
        photos: user.photoURL ? [user.photoURL] : [],
        updatedAt: serverTimestamp(),
        isOnline: true
      });

      // Save private info
      await setDoc(doc(db, "users", user.uid, "private", "info"), {
        email: user.email,
        onboardingComplete: true,
        lastLogin: serverTimestamp()
      });

      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de votre profil.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-stone-100 flex">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-full flex-1 transition-all duration-500 ${s <= step ? 'bg-love-red' : 'bg-transparent'}`} 
            />
          ))}
        </div>

        <div className="p-8 md:p-12">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-love-red/10 text-love-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold italic">Qui êtes-vous ?</h2>
                <p className="text-stone-500 text-sm mt-2">Parlons un peu de vous pour commencer.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase ml-1">Pseudo</label>
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    placeholder="Comment vous appelle-t-on ?"
                    className="w-full h-12 px-4 bg-stone-50 border-stone-100 border rounded-2xl focus:ring-2 focus:ring-love-red/20 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase ml-1">Genre</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Homme", "Femme"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setFormData({...formData, gender: g})}
                        className={`h-12 rounded-2xl border transition-all ${formData.gender === g ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 border-stone-100 text-stone-600 hover:border-stone-300'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase ml-1">Date de naissance</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input 
                      type="date" 
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className="w-full h-12 pl-12 pr-4 bg-stone-50 border-stone-100 border rounded-2xl outline-none"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={nextStep} className="w-full h-12" disabled={!formData.displayName || !formData.gender || !formData.birthDate}>
                Continuer
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-love-red/10 text-love-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold italic">Où vivez-vous ?</h2>
                <p className="text-stone-500 text-sm mt-2">Nous vous proposerons des profils proches de vous.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase ml-1">Ville au Gabon</label>
                  <select 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full h-12 px-4 bg-stone-50 border-stone-100 border rounded-2xl outline-none"
                  >
                    <option value="">Sélectionnez votre ville</option>
                    {GABON_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Diaspora">Diaspora (Hors Gabon)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase ml-1">Que recherchez-vous ?</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: "serious", label: "Relation sérieuse", icon: "💍" },
                      { id: "friendship", label: "Amitié", icon: "🤝" },
                      { id: "casual", label: "Rencontre éphémère", icon: "✨" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setFormData({...formData, lookingFor: item.id})}
                        className={`h-14 px-6 flex items-center gap-4 rounded-2xl border transition-all ${formData.lookingFor === item.id ? 'bg-stone-900 text-white border-stone-900 shadow-lg' : 'bg-stone-50 border-stone-100 text-stone-600 hover:border-stone-200'}`}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-bold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={prevStep} className="flex-1 h-12">Retour</Button>
                <Button onClick={nextStep} className="flex-[2] h-12" disabled={!formData.city || !formData.lookingFor}>Continuer</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-love-red/10 text-love-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold italic">Une petite présentation ?</h2>
                <p className="text-stone-500 text-sm mt-2">Dites-en plus sur vous pour attirer l'attention.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase ml-1">Bio / À propos de vous</label>
                <textarea 
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Décrivez-vous en quelques mots..."
                  className="w-full p-4 bg-stone-50 border-stone-100 border rounded-2xl outline-none resize-none focus:ring-2 focus:ring-love-red/20"
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={prevStep} className="flex-1 h-12">Retour</Button>
                <Button onClick={handleSubmit} className="flex-[2] h-12 gap-2" disabled={loading || !formData.bio}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Terminer"}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
