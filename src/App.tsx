/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { Loader2 } from "lucide-react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";

export default function App() {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const updatePresence = async (status: boolean) => {
      try {
        const profileRef = doc(db, "profiles", user.uid);
        await updateDoc(profileRef, { isOnline: status, lastSeen: new Date() });
      } catch (err) {
        console.error("Presence error:", err);
      }
    };

    updatePresence(true);
    
    // Visibility change listener for more accurate presence
    const handleVisibilityChange = () => {
      updatePresence(document.visibilityState === 'visible');
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
          <Route path="/" element={user ? <Navigate to="/home" /> : <LandingPage />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/home" />} />
          
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />

          <Route path="/home" element={
            <ProtectedRoute>
              <Dashboard />
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


