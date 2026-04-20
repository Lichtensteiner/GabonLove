import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function checkOnboarding() {
      if (user) {
        const docRef = doc(db, "users", user.uid, "private", "info");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOnboardingComplete(docSnap.data().onboardingComplete === true);
        } else {
          setOnboardingComplete(false);
        }
      } else {
        setOnboardingComplete(null);
      }
    }
    checkOnboarding();
  }, [user]);

  if (loading || (user && onboardingComplete === null)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-stone-50">
        <Loader2 className="h-10 w-10 animate-spin text-love-red" />
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
