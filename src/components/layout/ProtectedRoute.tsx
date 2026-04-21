import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState, ReactNode } from "react";
import { Loader2, Ban } from "lucide-react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function checkUserStatus() {
      if (user) {
        try {
          // Check public profile for ban status
          const profileSnap = await getDoc(doc(db, "profiles", user.uid));
          if (profileSnap.exists() && profileSnap.data().isBanned) {
            setIsBanned(true);
            return;
          }

          const docRef = doc(db, "users", user.uid, "private", "info");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setOnboardingComplete(docSnap.data().onboardingComplete === true);
          } else {
            setOnboardingComplete(false);
          }
        } catch (err) {
          console.error("User status check error:", err);
          setOnboardingComplete(false);
        }
      } else {
        setOnboardingComplete(null);
      }
    }
    checkUserStatus();
  }, [user]);

  if (loading || (user && onboardingComplete === null && !isBanned)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-stone-50">
        <Loader2 className="h-10 w-10 animate-spin text-love-red" />
      </div>
    );
  }

  if (isBanned) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-900 text-white p-8 text-center">
        <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-rose-500/20">
          <Ban className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold italic mb-4 text-rose-400">Compte Suspendu</h1>
        <p className="text-stone-400 max-w-md leading-relaxed">
          Votre compte a été suspendu par l'administration de GabonLove pour non-respect de nos conditions d'utilisation.
        </p>
        <button 
          onClick={() => auth.signOut()}
          className="mt-8 px-8 py-3 bg-white text-stone-900 rounded-2xl font-bold hover:bg-stone-200 transition-all"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (onboardingComplete === false && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  
  if (onboardingComplete === true && location.pathname === "/onboarding") {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
