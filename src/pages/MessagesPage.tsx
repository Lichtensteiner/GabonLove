import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { MessageCircle, Search, ChevronRight, Users } from "lucide-react";
import NavBar from "../components/layout/NavBar";
import { Link } from "react-router-dom";

export default function MessagesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // Listen to real matches
    const q = query(
      collection(db, "matches"),
      where("users", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const matchData = await Promise.all(snapshot.docs.map(async (matchDoc) => {
        const data = matchDoc.data();
        const otherUserId = data.users.find((id: string) => id !== user.uid);
        
        // Fetch other user profile
        const profileSnap = await getDoc(doc(db, "profiles", otherUserId));
        const profile = profileSnap.exists() ? profileSnap.data() : null;

        return {
          id: matchDoc.id,
          otherUserId,
          profile,
          lastMessage: "Cliquez pour discuter", // This could be made real-time too
          timestamp: data.timestamp
        };
      }));

      setMatches(matchData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <NavBar />
      
      <main className="max-w-2xl mx-auto px-4 pt-10 sm:pt-24">
        <header className="mb-8">
          <h1 className="text-3xl font-serif font-bold italic">Discussions</h1>
          <p className="text-stone-500 text-sm italic">Vos matches et conversations</p>
        </header>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
          <input 
            type="text" 
            placeholder="Rechercher un match..."
            className="w-full h-12 pl-12 pr-4 bg-white border-stone-100 border rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-rose-500/10"
          />
        </div>

        {/* Matches Horizontal Scroll (New matches) */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 ml-1 text-love-red">Nouveaux Matches</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {matches.length > 0 ? matches.map((match) => (
              <Link 
                key={match.id} 
                to={`/chat/${match.id}`}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-full border-2 border-love-red p-1 group-hover:scale-105 transition-transform">
                  <img 
                    src={match.profile?.mainPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.otherUserId}`} 
                    className="w-full h-full rounded-full object-cover bg-stone-100" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-bold text-stone-600 uppercase truncate max-w-[70px]">
                  {match.profile?.displayName || "Anonyme"}
                </span>
              </Link>
            )) : (
              <div className="text-stone-300 text-xs italic p-4">Pas encore de matches. Continuez à découvrir !</div>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 ml-1">Discussions actives</h2>
          {matches.length > 0 ? matches.map((match) => (
            <Link 
              key={match.id} 
              to={`/chat/${match.id}`}
              className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-stone-100 shadow-sm hover:border-love-red/20 transition-all active:scale-[0.98]"
            >
              <div className="relative">
                <img 
                  src={match.profile?.mainPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.otherUserId}`} 
                  className="w-14 h-14 rounded-2xl object-cover bg-stone-100" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-stone-900 truncate">{match.profile?.displayName || "Utilisateur GabonLove"}</h3>
                </div>
                <p className="text-sm truncate text-stone-400 italic">
                  {match.lastMessage}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-200" />
            </Link>
          )) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-stone-300 border-2 border-dashed border-stone-200 rounded-[2.5rem]">
              <MessageCircle className="w-12 h-12 mb-2" />
              <p className="text-sm">Aucune discussion pour le moment</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

