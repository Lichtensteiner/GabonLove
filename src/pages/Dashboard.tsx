import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, getDoc, doc, onSnapshot, updateDoc, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Heart, X, MessageCircle, SlidersHorizontal, Loader2, Star, AlertTriangle, MessageSquareText, MoreVertical, ShieldAlert, UserX, Users, Plus, Sparkles } from "lucide-react";
import NavBar from "../components/layout/NavBar";
import Button from "../components/ui/Button";
import TestimonyModal from "../components/TestimonyModal";
import StoryCreator from "../components/StoryCreator";
import { useNavigate } from "react-router-dom";

interface Profile {
  userId: string;
  displayName: string;
  city: string;
  bio: string;
  gender: string;
  birthDate: string;
  mainPhoto?: string;
  lookingFor: string;
  isOnline?: boolean;
}

interface Story {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  timestamp: any;
  expiresAt: string;
}

export default function Dashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  // Track the user's own profile for notifications
  const [myProfile, setMyProfile] = useState<any>(null);
  const [isTestimonyOpen, setIsTestimonyOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    async function fetchMyProfile() {
      if (!currentUser) return;
      try {
        const docRef = doc(db, "profiles", currentUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) setMyProfile(snap.data());
      } catch (err: any) {
        if (err.code === 'permission-denied') setPermissionError(true);
        console.warn("Profil non trouvé ou accès restreint :", err);
      }
    }
    fetchMyProfile();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to real profiles in real-time
    const q = query(
      collection(db, "profiles"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => doc.data() as Profile);
      
      const others = data.filter(p => p.userId !== currentUser.uid);
      setProfiles(others);
      setOnlineUsers(others.filter(p => p.isOnline));
      setLoading(false);
      setPermissionError(false);
    }, (err) => {
      if (err.code === 'permission-denied') setPermissionError(true);
      console.error("Erreur d'accès aux profils :", err);
      setLoading(false);
    });

    // Listen to stories
    const qStories = query(
      collection(db, "stories"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubStories = onSnapshot(qStories, (snapshot) => {
      const allStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      const now = new Date().toISOString();
      const valid = allStories.filter(s => s.expiresAt > now);
      setStories(valid);
    });

    return () => {
      unsubscribe();
      unsubStories();
    };
  }, [currentUser]);

  const handleLike = async (targetOverride?: Profile) => {
    const target = targetOverride || currentProfile;
    if (!currentUser || !target || !myProfile) return;
    
    try {
      // 1. Save the like
      await addDoc(collection(db, "likes"), {
        fromId: currentUser.uid,
        toId: target.userId,
        timestamp: serverTimestamp()
      });

      // 2. Check for mutual like (Match)
      const qMutual = query(
        collection(db, "likes"),
        where("fromId", "==", target.userId),
        where("toId", "==", currentUser.uid)
      );
      const mutualSnap = await getDocs(qMutual);

      if (!mutualSnap.empty) {
        // Create match
        const matchRef = await addDoc(collection(db, "matches"), {
          users: [currentUser.uid, target.userId],
          timestamp: serverTimestamp(),
          lastMessage: "C'est un match ! Vous pouvez maintenant discuter."
        });

        // Match Notification
        await addDoc(collection(db, "notifications"), {
          recipientId: target.userId,
          type: "match",
          fromId: currentUser.uid,
          fromName: myProfile.displayName,
          matchId: matchRef.id,
          read: false,
          timestamp: serverTimestamp()
        });

        alert("C'est un Match !");
      } else {
        // Simple Like Notification
        await addDoc(collection(db, "notifications"), {
          recipientId: target.userId,
          type: "like",
          fromId: currentUser.uid,
          fromName: myProfile.displayName,
          read: false,
          timestamp: serverTimestamp()
        });
      }

      if (!targetOverride) nextProfile();
    } catch (err) {
      console.error("Error liking:", err);
    }
  };

  const handleMessage = async (target: Profile) => {
    if (!currentUser) return;
    try {
      // Check if match already exists
      const q = query(
        collection(db, "matches"),
        where("users", "array-contains", currentUser.uid)
      );
      const snap = await getDocs(q);
      const existing = snap.docs.find(d => (d.data().users as string[]).includes(target.userId));

      if (existing) {
        navigate(`/chat/${existing.id}`);
      } else {
        // Create one or just redirect to chat (logic can handle creation on first message or here)
        const matchRef = await addDoc(collection(db, "matches"), {
          users: [currentUser.uid, target.userId],
          timestamp: serverTimestamp(),
          lastMessage: "Nouveau message..."
        });
        navigate(`/chat/${matchRef.id}`);
      }
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  const nextProfile = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const currentProfile = profiles[currentIndex];

  useEffect(() => {
    if (!currentUser || !currentProfile) return;
    
    // Debounce view recording to save quota
    const timer = setTimeout(async () => {
      try {
        await addDoc(collection(db, "views"), {
          viewerId: currentUser.uid,
          profileId: currentProfile.userId,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error("Error recording view:", err);
      }
    }, 3000); // Record after 3s on profile

    return () => clearTimeout(timer);
  }, [currentIndex, currentUser, currentProfile]);

  return (
    <div className="min-h-screen bg-stone-50 md:pt-20">
      <NavBar />
      
      <main className="max-w-4xl mx-auto px-4 py-8 pb-32 md:pb-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold italic">Gabon<span className="text-love-red">Love</span></h1>
            <p className="text-stone-500 text-sm italic">Trouvez la perle rare au Gabon</p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-2xl border-stone-200"
            onClick={() => setIsStoryCreatorOpen(true)}
          >
            <Plus className="w-5 h-5 text-stone-600" />
          </Button>
        </header>

        {/* Stories Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-love-red flex items-center gap-2">
              <Sparkles className="w-2 h-2" />
              Les Nouvelles du Coeur
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 h-24">
            {/* Add Story Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsStoryCreatorOpen(true)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-stone-200 flex items-center justify-center group-hover:border-love-red/50 transition-colors">
                <Plus className="w-6 h-6 text-stone-300 group-hover:text-love-red" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter text-stone-400 group-hover:text-love-red">Publier</span>
            </motion.button>
            
            {/* User Stories */}
            {stories.map((story) => (
              <motion.button
                key={story.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStory(story)}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-3xl p-0.5 bg-gradient-to-tr from-love-red via-gabon-yellow to-gabon-blue">
                   <div className="w-full h-full rounded-[1.3rem] overflow-hidden border-2 border-white">
                      <img 
                        src={story.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.userId}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                   </div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-tighter text-stone-600 truncate max-w-[64px]">
                  {story.userName.split(' ')[0]}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Online Users Section */}
        <section className="mb-10 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-love-red flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-love-red animate-pulse" />
              En ligne au Gabon
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
            {onlineUsers.length > 0 ? onlineUsers.map((p) => (
              <motion.button
                key={p.userId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMessage(p)}
                className="flex-shrink-0 flex flex-col items-center gap-2 group relative"
              >
                <div className="w-16 h-16 rounded-3xl p-1 bg-white shadow-sm border border-stone-100 group-hover:border-love-red transition-all">
                  <img 
                    src={p.mainPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`} 
                    className="w-full h-full rounded-2xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-stone-50 rounded-full" />
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter truncate max-w-[64px]">
                  {p.displayName.split(' ')[0]}
                </span>
              </motion.button>
            )) : (
              <p className="text-[10px] text-stone-300 italic py-4">Revenez plus tard...</p>
            )}
          </div>
        </section>

        <div className="relative h-[600px] w-full max-w-md mx-auto">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-love-red animate-spin" />
            </div>
          ) : permissionError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-rose-50 rounded-[2.5rem] border-2 border-dashed border-rose-200">
              <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
              <h3 className="text-xl font-serif font-bold text-rose-700 mb-2">Configuration requise</h3>
              <p className="text-rose-600/70 text-sm italic mb-6">
                Votre projet Firebase refuse l'accès aux données. Vous devez copier les règles de sécurité dans votre console Firebase.
              </p>
              <Button variant="outline" className="border-rose-200 text-rose-700" onClick={() => window.location.reload()}>Actualiser</Button>
            </div>
          ) : currentProfile ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProfile.userId}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, x: 100, rotate: 10 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-100 flex flex-col"
              >
                {/* Photo Area */}
                <div className="relative flex-1 bg-stone-200">
                  <img 
                    src={currentProfile.mainPhoto || `https://picsum.photos/seed/${currentProfile.userId}/600/800`} 
                    alt={currentProfile.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-3xl font-bold">{currentProfile.displayName}</h2>
                      <span className="text-xl opacity-80">{calculateAge(currentProfile.birthDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-sm opacity-90">
                      <MapPin className="w-4 h-4" />
                      {currentProfile.city}, Gabon
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 space-y-4">
                  <p className="text-stone-600 line-clamp-3 text-sm leading-relaxed italic">
                    "{currentProfile.bio}"
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      {currentProfile.lookingFor === 'serious' ? 'Relation sérieuse' : currentProfile.lookingFor === 'friendship' ? 'Amitié' : 'Moment éphémère'}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-4">
                    <div className="flex gap-3">
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={nextProfile}
                        className="w-12 h-12 rounded-2xl border border-stone-100 text-stone-400 hover:text-stone-600 hover:border-stone-300 transition-all flex items-center justify-center bg-stone-50 shadow-sm"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                      
                      <div className="relative">
                        <motion.button 
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                          className={`w-12 h-12 rounded-2xl border border-stone-100 text-stone-400 transition-all flex items-center justify-center bg-white shadow-sm ${isMoreMenuOpen ? 'bg-stone-100 text-stone-900 border-stone-200' : 'hover:text-stone-600'}`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </motion.button>

                        <AnimatePresence>
                          {isMoreMenuOpen && (
                            <>
                              <div className="fixed inset-0 z-[60]" onClick={() => setIsMoreMenuOpen(false)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute bottom-14 left-0 w-52 bg-white rounded-2xl shadow-2xl border border-stone-100 py-2 z-[70] overflow-hidden"
                              >
                                <button 
                                  onClick={async () => {
                                    if (!currentUser || !currentProfile) return;
                                    await addDoc(collection(db, "interactions"), {
                                      type: "report",
                                      fromId: currentUser.uid,
                                      toId: currentProfile.userId,
                                      timestamp: serverTimestamp()
                                    });
                                    alert("Signalement enregistré.");
                                    setIsMoreMenuOpen(false);
                                  }}
                                  className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-stone-500 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                  Signaler
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (!currentUser || !currentProfile) return;
                                    await addDoc(collection(db, "interactions"), {
                                      type: "block",
                                      fromId: currentUser.uid,
                                      toId: currentProfile.userId,
                                      timestamp: serverTimestamp()
                                    });
                                    alert("Utilisateur bloqué.");
                                    setIsMoreMenuOpen(false);
                                    nextProfile();
                                  }}
                                  className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-stone-500 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                                >
                                  <UserX className="w-4 h-4" />
                                  Bloquer
                                </button>
                                <div className="h-px bg-stone-50 my-1 mx-2" />
                                <button 
                                  onClick={() => setIsTestimonyOpen(true)}
                                  className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-amber-500 hover:bg-amber-50 flex items-center gap-3 transition-colors"
                                >
                                  <Star className="w-4 h-4" />
                                  Témoigner
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMessage(currentProfile)}
                        className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-lg hover:bg-stone-800 transition-all"
                      >
                        <MessageSquareText className="w-5 h-5" />
                      </motion.button>

                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLike()}
                        className="w-16 h-16 rounded-[2rem] bg-love-red text-white flex items-center justify-center shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all group"
                      >
                        <Heart className="w-8 h-8 fill-current group-hover:scale-110 transition-transform" />
                      </motion.button>
                    </div>
                  </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-stone-100 rounded-[2.5rem] border-2 border-dashed border-stone-300">
                <Users className="w-12 h-12 text-stone-300 mb-4" />
                <p className="text-stone-500 font-serif italic text-lg">Plus de profils à afficher pour le moment.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Actualiser</Button>
              </div>
            )}
          </div>
        </main>
        
        {currentProfile && (
          <TestimonyModal 
            isOpen={isTestimonyOpen}
            onClose={() => setIsTestimonyOpen(false)}
            targetId={currentProfile.userId}
            targetName={currentProfile.displayName}
          />
        )}

        <StoryCreator 
          isOpen={isStoryCreatorOpen}
          onClose={() => setIsStoryCreatorOpen(false)}
          myProfile={myProfile}
        />

        {/* Story Viewer Modal */}
        <AnimatePresence>
          {selectedStory && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedStory(null)}
                className="absolute inset-0 bg-stone-900/90 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-sm bg-white rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={selectedStory.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStory.userId}`} 
                      className="w-12 h-12 rounded-2xl object-cover border border-stone-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-serif font-bold italic">{selectedStory.userName}</h4>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Posté récemment</p>
                    </div>
                  </div>
                  <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 italic text-stone-700 leading-relaxed">
                    "{selectedStory.content}"
                  </div>
                  <Button 
                    className="w-full rounded-2xl"
                    onClick={() => {
                      handleMessage({ userId: selectedStory.userId, displayName: selectedStory.userName } as any);
                      setSelectedStory(null);
                    }}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Répondre à la Nouvelle
                  </Button>
                </div>
                <button 
                  onClick={() => setSelectedStory(null)}
                  className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const month = now.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
