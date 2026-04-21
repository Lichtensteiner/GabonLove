/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import { db, auth } from "./lib/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const updatePresence = async (status: boolean) => {
      try {
        const profileRef = doc(db, "profiles", user.uid);
        // We use getDoc first to see if profile exists, to avoid permission errors on non-existent profiles
        // We catch errors locally and do nothing to avoid console noise
        const snap = await getDoc(profileRef).catch(() => null);
        if (snap && snap.exists()) {
          await setDoc(profileRef, { isOnline: status, lastSeen: serverTimestamp() }, { merge: true }).catch(() => null);
        }
      } catch (_err) {
        // Double safety catch
      }
    };

    updatePresence(true);
    
    // Visibility change listener for more accurate presence
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      updatePresence(false);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-stone-50">
        <Loader2 className="h-12 w-12 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/home" />} />
          
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />

          <Route path="/home" element={
            <ProtectedRoute>
              {(user?.email === "ludovicjusdorange@gmail.com" || user?.email === "ludo.consulting3@gmail.com") ? (
                <Navigate to="/admin" replace />
              ) : (
                <Dashboard />
              )}
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/chat/:chatId" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


