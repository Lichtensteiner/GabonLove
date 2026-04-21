import { Heart, MessageCircle, User, LogOut, Home, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import NotificationCenter from "./NotificationCenter";

export default function NavBar() {
  const location = useLocation();
  const user = auth.currentUser;
  const isAdmin = user?.email === "ludovicjusdorange@gmail.com" || user?.email === "ludo.consulting3@gmail.com";

  const tabs = [
    { name: "Accueil", icon: Home, path: "/" },
    { name: "Découvrir", icon: Heart, path: "/home" },
    { name: "Messages", icon: MessageCircle, path: "/messages" },
    { name: "Profil", icon: User, path: "/profile" },
  ];

  if (isAdmin) {
    tabs.splice(2, 0, { name: "Admin", icon: Shield, path: "/admin" });
  }

  return (
    <nav className="fixed bottom-0 sm:top-0 sm:bottom-auto w-full bg-white/80 backdrop-blur-md border-t sm:border-t-0 sm:border-b border-stone-200 z-50 h-16 shadow-lg sm:shadow-sm">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        <Link to="/" className="hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 bg-love-red rounded-lg flex items-center justify-center transform rotate-12">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="font-serif text-xl font-bold">Gabon<span className="text-love-red">Love</span></span>
        </Link>

        <div className="flex flex-1 justify-around sm:justify-center sm:gap-12 h-full">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link 
                key={tab.path} 
                to={tab.path} 
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 justify-center px-4 transition-colors relative ${isActive ? 'text-love-red' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <tab.icon className={`w-6 h-6 ${isActive ? 'fill-current/10' : ''}`} />
                <span className="text-[10px] sm:text-sm font-bold uppercase tracking-wider">{tab.name}</span>
                {isActive && <span className="absolute bottom-0 w-8 h-1 bg-love-red rounded-t-full hidden sm:block" />}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <NotificationCenter />
          <button 
            onClick={() => signOut(auth)} 
            className="hidden sm:flex items-center gap-2 text-stone-400 hover:text-rose-500 transition-colors px-4"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}

