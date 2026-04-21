import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onSnapshot, doc, collection, query, where } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  MapPin, 
  Heart, 
  LogOut, 
  ChevronRight, 
  Loader2,
  Eye,
  Flame,
  Settings,
  ShieldCheck,
  CreditCard,
  Bell,
  Sparkles,
  Phone,
  Briefcase,
  GraduationCap,
  Music,
  Dumbbell,
  Users,
  Home,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/layout/NavBar";
import Button from "../components/ui/Button";
import { signOut } from "firebase/auth";
import ImageUpload from "../components/ui/ImageUpload";
import ProfileEditModal from "../components/ProfileEditModal";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [stats, setStats] = useState({ likes: 0, matches: 0, views: 0 });
  const [activeTab, setActiveTab] = useState<"account" | "preferences" | "stats">("account");
  const user = auth.currentUser;
  const isAdmin = user?.email === "ludovicjusdorange@gmail.com" || user?.email === "ludo.consulting3@gmail.com";

  useEffect(() => {
    if (!user) return;
    
    // 1. Real-time profile
    const unsubProfile = onSnapshot(doc(db, "profiles", user.uid), (snapshot) => {
      if (snapshot.exists()) setProfile(snapshot.data());
      setLoading(false);
    });

    // 2. Real-time stats (Likes)
    const qLikes = query(collection(db, "likes"), where("toId", "==", user.uid));
    const unsubLikes = onSnapshot(qLikes, (snap) => {
      setStats(prev => ({ ...prev, likes: snap.size }));
    });

    // 3. Real-time stats (Matches)
    const qMatches = query(collection(db, "matches"), where("users", "array-contains", user.uid));
    const unsubMatches = onSnapshot(qMatches, (snap) => {
      setStats(prev => ({ ...prev, matches: snap.size }));
    });

    // 4. Real-time stats (Views)
    const qViews = query(collection(db, "views"), where("profileId", "==", user.uid));
    const unsubViews = onSnapshot(qViews, (snap) => {
      setStats(prev => ({ ...prev, views: snap.size }));
    });

    return () => {
      unsubProfile();
      unsubLikes();
      unsubMatches();
      unsubViews();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 animate-spin text-love-red" />
      </div>
    );
  }

  const OptionItem = ({ icon: Icon, label, value, onClick, color = "text-stone-600" }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl hover:border-love-red/20 transition-all hover:bg-stone-50/50 group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-stone-50 group-hover:bg-white transition-colors ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-stone-800">{label}</p>
          {value && <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{value}</p>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-love-red transition-colors" />
    </button>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <NavBar />
      
      <main className="max-w-xl mx-auto px-4 pt-10 sm:pt-24 space-y-8">
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-stone-200 ring-1 ring-stone-100">
              <img 
                src={profile?.mainPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                alt="Profil" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 transform hover:scale-110 transition-transform">
              <ImageUpload />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-8">
            <h1 className="text-3xl font-serif font-bold italic text-stone-900">{profile?.displayName || "Nom d'utilisateur"}</h1>
            {profile?.isVerified && (
              <div className="bg-blue-500 p-1.5 rounded-lg shadow-lg shadow-blue-500/20" title="Profil Vérifié">
                <Shield className="w-4 h-4 text-white fill-current" />
              </div>
            )}
            {isAdmin && (
              <div className="bg-rose-600 p-1.5 rounded-lg shadow-lg shadow-rose-600/20" title="Administrateur Certifié">
                <Shield className="w-4 h-4 text-white fill-current" />
              </div>
            )}
          </div>
          <p className="text-stone-500 font-medium flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-love-red" />
            {profile?.city || "Libreville"}, Gabon
          </p>
        </section>

        {/* Real-time Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center justify-center space-y-1 hover:border-love-red/20 transition-all">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-500 mb-1">
               <Heart className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-black text-stone-900 tracking-tighter">{stats.likes}</span>
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Likes</span>
          </div>
          
          <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center justify-center space-y-1 hover:border-gabon-yellow/50 transition-all">
            <div className="p-2 rounded-xl bg-amber-50 text-gabon-yellow mb-1">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-black text-stone-900 tracking-tighter">{stats.matches}</span>
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Matchs</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center justify-center space-y-1 hover:border-gabon-blue/50 transition-all">
            <div className="p-2 rounded-xl bg-blue-50 text-gabon-blue mb-1">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-stone-900 tracking-tighter">{stats.views}</span>
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Vues</span>
          </div>
        </section>

        {/* Action Tabs & Options */}
        <section className="space-y-4">
          <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl">
            {(['account', 'preferences', 'stats'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  activeTab === tab ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab === 'account' ? 'Compte' : tab === 'preferences' ? 'Préférences' : 'Activité'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {activeTab === 'account' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Général</h3>
                    <OptionItem 
                      icon={User} 
                      label="Modifier le profil" 
                      value="Bio, Infos, Photos" 
                      color="text-love-red" 
                      onClick={() => setIsEditModalOpen(true)}
                    />
                    {(user?.email === "ludovicjusdorange@gmail.com" || user?.email === "ludo.consulting3@gmail.com") && (
                      <OptionItem 
                        icon={ShieldCheck} 
                        label="Panneau Admin" 
                        value="Gestion système" 
                        color="text-rose-600" 
                        onClick={() => navigate("/admin")}
                      />
                    )}
                    <OptionItem icon={Bell} label="Notifications" value="Configurées" color="text-gabon-blue" />
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Détails Personnels</h3>
                    <div className="grid grid-cols-1 gap-2">
                       <div className="bg-white p-6 rounded-[2rem] border border-stone-100 space-y-6">
                          <div className="grid grid-cols-2 gap-y-6">
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-stone-300" />
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase">Téléphone</p>
                                <p className="text-sm font-semibold">{profile?.phone || "Non renseigné"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Home className="w-4 h-4 text-stone-300" />
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase">Quartier</p>
                                <p className="text-sm font-semibold">{profile?.neighborhood || "Non renseigné"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Users className="w-4 h-4 text-stone-300" />
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase">Enfants</p>
                                <p className="text-sm font-semibold">{profile?.childrenCount || "0"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Briefcase className="w-4 h-4 text-stone-300" />
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase">Fonction</p>
                                <p className="text-sm font-semibold">{profile?.occupation || "Non renseigné"}</p>
                              </div>
                            </div>
                          </div>

                          <div className="h-px bg-stone-50 w-full" />

                          <div className="grid grid-cols-2 gap-y-6">
                            <div className="flex items-center gap-3">
                              <GraduationCap className="w-4 h-4 text-stone-300" />
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase">Diplôme</p>
                                <p className="text-sm font-semibold">{profile?.diploma || "Non renseigné"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-4 h-4 text-stone-300" />
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase">Salaire</p>
                                <p className="text-sm font-semibold">{profile?.salary || "Non renseigné"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Music className="w-4 h-4 text-stone-300" />
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase">Musique</p>
                                <p className="text-sm font-semibold">{profile?.musicStyle || "Non renseigné"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Dumbbell className="w-4 h-4 text-stone-300" />
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase">Sport</p>
                                <p className="text-sm font-semibold">{profile?.sport || "Non renseigné"}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-2">
                             <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">Loisirs & Divertissement</p>
                             <p className="text-sm text-stone-600 italic">
                                {profile?.hobbies || profile?.entertainment ? `${profile.hobbies}${profile.hobbies && profile.entertainment ? ' • ' : ''}${profile.entertainment}` : "Non renseigné"}
                             </p>
                          </div>
                       </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'preferences' && (
                <>
                  <div className="bg-gradient-to-br from-love-red to-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-100 flex flex-col items-center text-center gap-4 mb-4">
                     <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                     </div>
                     <div>
                       <h3 className="font-serif font-bold text-lg italic">Invitez des amis !</h3>
                       <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest leading-normal">Aidez la communauté à grandir et débloquez des avantages exclusifs.</p>
                     </div>
                     <Button 
                      className="w-full bg-white text-love-red hover:bg-stone-50 rounded-2xl shadow-lg shadow-black/10"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Rejoignez-moi sur GabonLove !',
                            text: 'La meilleure application pour rencontrer des Gabonais(es) de qualité.',
                            url: window.location.origin
                          }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(window.location.origin);
                          alert("Lien copié dans le presse-papier !");
                        }
                      }}
                     >
                        Partager l'application
                     </Button>
                  </div>
                  
                  <OptionItem 
                    icon={Heart} 
                    label="Je recherche" 
                    value={profile?.lookingFor || "Sérieux"} 
                    onClick={() => setIsEditModalOpen(true)}
                  />
                  <OptionItem 
                    icon={MapPin} 
                    label="Localisation" 
                    value={profile?.city || "Gabon"} 
                    onClick={() => setIsEditModalOpen(true)}
                  />
                  <OptionItem 
                    icon={Settings} 
                    label="Filtres avancés" 
                    value="Âge, Intérêts" 
                    onClick={() => setIsEditModalOpen(true)}
                  />
                </>
              )}

              {activeTab === 'stats' && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 text-center space-y-4">
                  <div className="w-16 h-16 bg-stone-50 rounded-3xl flex items-center justify-center mx-auto text-stone-300">
                    <Settings className="w-8 h-8 animate-spin-slow" />
                  </div>
                  <h3 className="font-serif font-bold text-lg">Analyses détaillées</h3>
                  <p className="text-xs text-stone-400 italic">Bientôt disponible pour nos membres Premium !</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Logout */}
        <section className="pt-4">
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center justify-center gap-2 p-5 border-2 border-stone-200 text-stone-400 rounded-[2rem] hover:bg-rose-50 hover:border-rose-100 hover:text-rose-500 transition-all font-black uppercase tracking-widest text-xs"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </section>

        <footer className="text-center pb-20 text-[10px] text-stone-300 font-bold uppercase tracking-widest">
          GabonLove v1.0.5 • Ludo_Consulting
        </footer>
      </main>

      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        initialData={profile} 
      />
    </div>
  );
}
