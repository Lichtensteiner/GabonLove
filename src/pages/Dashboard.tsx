import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, getDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Heart, X, MessageCircle, SlidersHorizontal, Loader2 } from "lucide-react";
import NavBar from "../components/layout/NavBar";
import Button from "../components/ui/Button";

interface Profile {
  userId: string;
  displayName: string;
  city: string;
  bio: string;
  gender: string;
  birthDate: string;
  mainPhoto?: string;
  lookingFor: string;
}

export default function Dashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentUser = auth.currentUser;

  // Track the user's own profile for notifications
  const [myProfile, setMyProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchMyProfile() {
      if (!currentUser) return;
      const docRef = doc(db, "profiles", currentUser.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) setMyProfile(snap.data());
    }
    fetchMyProfile();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to real profiles in real-time
    const q = query(
      collection(db, "profiles"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => doc.data() as Profile)
        .filter(p => p.userId !== currentUser.uid); // Exclude self
      setProfiles(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const handleLike = async () => {
    if (!currentUser || !currentProfile || !myProfile) return;
    
    try {
      // 1. Save the like
      await addDoc(collection(db, "likes"), {
        fromId: currentUser.uid,
        toId: currentProfile.userId,
        timestamp: serverTimestamp()
      });

      // 2. Create notification for the recipient
      await addDoc(collection(db, "notifications"), {
        recipientId: currentProfile.userId,
        type: "like",
        fromId: currentUser.uid,
        fromName: myProfile.displayName,
        read: false,
        timestamp: serverTimestamp()
      });

      nextProfile();
    } catch (err) {
      console.error("Error liking:", err);
    }
  };

  const nextProfile = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const currentProfile = profiles[currentIndex];

  useEffect(() => {
    if (!currentUser || !currentProfile) return;
    
    const recordView = async () => {
      try {
        await addDoc(collection(db, "views"), {
          viewerId: currentUser.uid,
          profileId: currentProfile.userId,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error("Error recording view:", err);
      }
    };

    recordView();
  }, [currentIndex, currentUser, currentProfile]);

  return (
    <div className="min-h-screen bg-stone-50 md:pt-20">
      <NavBar />
      
      <main className="max-w-4xl mx-auto px-4 py-8 pb-32 md:pb-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">Découvrir</h1>
            <p className="text-stone-500 text-sm italic">Trouvez la perle rare au Gabon</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-2xl">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </header>

        <div className="relative h-[600px] w-full max-w-md mx-auto">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-love-red animate-spin" />
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

                  <div className="pt-2 flex items-center justify-center gap-6">
                    <button 
                      onClick={nextProfile}
                      className="w-14 h-14 rounded-full border-2 border-stone-100 text-stone-400 hover:text-stone-600 hover:border-stone-300 transition-all flex items-center justify-center bg-white shadow-sm active:scale-95"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={handleLike}
                      className="w-16 h-16 rounded-full bg-love-red text-white flex items-center justify-center shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95 group"
                    >
                      <Heart className="w-8 h-8 fill-current group-hover:scale-110 transition-transform" />
                    </button>
                    <button className="w-14 h-14 rounded-full border-2 border-stone-100 text-stone-400 hover:text-stone-600 transition-all flex items-center justify-center bg-white shadow-sm active:scale-95">
                      <MessageCircle className="w-6 h-6" />
                    </button>
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

const Users = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
