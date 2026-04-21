import { useState, useEffect, useMemo } from "react";
import { db, auth } from "../lib/firebase";
import { collection, query, limit, doc, updateDoc, deleteDoc, onSnapshot, orderBy, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Ban, 
  Trash2, 
  Activity, 
  UserPlus, 
  Calendar,
  Search,
  Filter,
  Download,
  LayoutDashboard,
  LogOut,
  Bell,
  Settings,
  User,
  Megaphone,
  Zap,
  TrendingUp,
  Heart
} from "lucide-react";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [adminPassword, setAdminPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'reports'>('overview');
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isUpdatingBroadcast, setIsUpdatingBroadcast] = useState(false);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const navigate = useNavigate();
  
  const user = auth.currentUser;
  const isAdminEmail = user?.email === "ludovicjusdorange@gmail.com" || user?.email === "ludo.consulting3@gmail.com";

  useEffect(() => {
    if (!isAdminEmail || !isUnlocked) return;
    
    // Real-time listener for all user profiles
    const usersQ = query(collection(db, "profiles"), orderBy("updatedAt", "desc"), limit(200));
    const unsubUsers = onSnapshot(usersQ, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Real-time listener for broadcast
    const unsubBroadcast = onSnapshot(doc(db, "settings", "config"), (snap) => {
      if (snap.exists()) setBroadcastMessage(snap.data().broadcast || "");
    });

    // Real-time listener for recent matches
    const matchesQ = query(collection(db, "matches"), orderBy("timestamp", "desc"), limit(5));
    const unsubMatches = onSnapshot(matchesQ, (snapshot) => {
      setRecentMatches(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Real-time counts for indicators
    const unsubTotalLikes = onSnapshot(collection(db, "likes"), (snap) => setTotalLikes(snap.size));
    const unsubTotalMatches = onSnapshot(collection(db, "matches"), (snap) => setTotalMatches(snap.size));
    const unsubTotalViews = onSnapshot(collection(db, "views"), (snap) => setTotalViews(snap.size));

    return () => {
      unsubUsers();
      unsubBroadcast();
      unsubMatches();
      unsubTotalLikes();
      unsubTotalMatches();
      unsubTotalViews();
    };
  }, [isAdminEmail, isUnlocked]);

  const stats = useMemo(() => {
    const total = users.length;
    const online = users.filter(u => u.isOnline).length;
    const banned = users.filter(u => u.isBanned).length;
    const women = users.filter(u => u.gender === 'Femme').length;
    
    return { 
      total, 
      online, 
      banned, 
      women,
      likes: totalLikes,
      matches: totalMatches,
      views: totalViews
    };
  }, [users, totalLikes, totalMatches, totalViews]);

  // Real-time chart data base on user registrations (updatedAt proxy)
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        date: d.toISOString().split('T')[0], 
        label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        count: 0 
      };
    });

    users.forEach(u => {
      if (u.updatedAt) {
        const date = u.updatedAt.toDate ? u.updatedAt.toDate() : new Date(u.updatedAt);
        const dayStr = date.toISOString().split('T')[0];
        const day = last7Days.find(d => d.date === dayStr);
        if (day) day.count++;
      }
    });

    return last7Days.map(d => ({ 
      name: d.label.charAt(0).toUpperCase() + d.label.slice(1), 
      users: d.count 
    }));
  }, [users]);

  const handleVerify = () => {
    if (adminPassword === "password") {
      setIsUnlocked(true);
    } else {
      alert("Mot de passe incorrect.");
    }
  };

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "profiles", userId), {
        isBanned: !currentStatus
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.")) return;
    try {
      await deleteDoc(doc(db, "profiles", userId));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "profiles", userId), {
        isVerified: !currentStatus
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateBroadcast = async () => {
    setIsUpdatingBroadcast(true);
    try {
      await setDoc(doc(db, "settings", "config"), {
        broadcast: broadcastMessage,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email
      });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du message global.");
    } finally {
      setIsUpdatingBroadcast(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdminEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 p-8 text-center text-white font-bold">
        <div className="space-y-4">
          <Shield className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-serif">Accès restreint</h2>
          <p className="text-stone-400 font-normal">Connectez-vous avec le compte Ludovic pour accéder à cette zone.</p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] space-y-8"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-rose-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20">
              <Shield className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-serif font-bold italic">Système Admin</h2>
            <p className="text-stone-400 text-sm mt-3 font-medium px-4">Authentification de sécurité requise pour accéder au coeur du système.</p>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
              <input 
                type="password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Clé de sécurité"
                className="w-full h-16 pl-12 pr-6 bg-stone-50 border-stone-100 border rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/5 transition-all font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>
            <Button onClick={handleVerify} className="w-full h-16 rounded-[1.5rem] bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 text-lg">
              Déverrouiller le Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex">
      {/* Sidebar sidebar */}
      <aside className="w-72 bg-stone-900 hidden lg:flex flex-col p-6 text-white sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/40">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl italic tracking-tight">GabonLove</h2>
            <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest leading-none">Console Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink active={activeView === 'overview'} icon={LayoutDashboard} label="Vue d'ensemble" onClick={() => setActiveView('overview')} />
          <SidebarLink active={activeView === 'users'} icon={Users} label="Utilisateurs" onClick={() => setActiveView('users')} />
          <SidebarLink active={activeView === 'reports'} icon={AlertTriangle} label="Signalements" onClick={() => setActiveView('reports')} />
          <div className="h-px bg-stone-800 my-4" />
          <SidebarLink active={false} icon={LayoutDashboard} label="Accès Découverte" onClick={() => navigate("/home?mode=user")} />
          <SidebarLink active={false} icon={User} label="Mon Profil" onClick={() => navigate("/profile")} />
          <SidebarLink active={false} icon={Settings} label="Paramètres" />
        </nav>

        <div className="pt-8 border-t border-stone-800">
           <div className="bg-stone-800/50 p-4 rounded-2xl mb-4">
              <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-2">Connecté en tant que</p>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-xs">L</div>
                 <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{user?.email}</p>
                    <p className="text-[10px] text-green-500">Administrateur</p>
                 </div>
              </div>
           </div>
           <Button variant="ghost" className="w-full text-stone-400 hover:text-white justify-start gap-3 h-12" onClick={() => auth.signOut()}>
              <LogOut className="w-4 h-4" /> Déconnexion
           </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto no-scrollbar">
        {/* Top Header */}
        <header className="p-8 pb-0 flex items-center justify-between">
           <div>
              <h1 className="text-3xl font-serif font-bold text-stone-900 italic">Bonjour, Ludovic</h1>
              <p className="text-stone-400 text-sm mt-1">Voici l'état actuel de votre plateforme GabonLove.</p>
           </div>
           <div className="flex gap-4">
              <div className="bg-white px-4 py-2 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-3">
                 <Calendar className="w-5 h-5 text-stone-400" />
                 <span className="text-sm font-bold text-stone-600">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
              </div>
              <button className="w-12 h-12 bg-white rounded-2xl border border-stone-100 shadow-sm flex items-center justify-center hover:bg-stone-50 transition-colors">
                 <Bell className="w-5 h-5 text-stone-500" />
              </button>
           </div>
        </header>

        <div className="p-8 space-y-8 pb-32">
          {activeView === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard icon={Users} label="Total Utilisateurs" value={stats.total} trend={`${stats.online} en ligne`} color="text-rose-600" bg="bg-rose-50" />
                 <StatCard icon={Heart} label="Total Likes" value={stats.likes} trend="Cœur" color="text-pink-600" bg="bg-pink-50" />
                 <StatCard icon={TrendingUp} label="Matches" value={stats.matches} trend="Direct" color="text-green-600" bg="bg-green-50" />
                 <StatCard icon={Activity} label="Vues Profil" value={stats.views} trend="Intérêt" color="text-blue-600" bg="bg-blue-50" />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                       <div>
                          <h3 className="font-bold text-stone-800 text-lg">Croissance des utilisateurs</h3>
                          <p className="text-sm text-stone-400">Activité des 7 derniers jours</p>
                       </div>
                       <Button size="sm" variant="outline" className="rounded-xl">Semaine</Button>
                    </div>
                    <div className="h-[300px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                             <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#E11D48" stopOpacity={0.1}/>
                                   <stop offset="95%" stopColor="#E11D48" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                             <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                             <Tooltip 
                                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}}
                             />
                             <Area type="monotone" dataKey="users" stroke="#E11D48" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between overflow-hidden relative group">
                    <div className="relative z-10">
                       <Megaphone className="w-10 h-10 text-rose-500 mb-6" />
                       <h3 className="text-2xl font-serif font-bold italic mb-4">Message Global</h3>
                       <p className="text-stone-400 text-sm mb-6 leading-relaxed">
                          Ce message sera visible par tous les utilisateurs en haut de leur écran.
                       </p>
                       <div className="space-y-4 mb-4">
                          <textarea 
                             value={broadcastMessage}
                             onChange={(e) => setBroadcastMessage(e.target.value)}
                             placeholder="Ex: Bienvenue sur la nouvelle version de GabonLove ! 🇬🇦"
                             className="w-full bg-stone-800 border-none rounded-2xl p-4 text-sm text-white placeholder:text-stone-600 outline-none focus:ring-2 focus:ring-rose-500/50 transition-all resize-none h-24"
                          />
                       </div>
                       <Button 
                          onClick={updateBroadcast}
                          disabled={isUpdatingBroadcast}
                          className="w-full h-14 bg-white text-stone-900 hover:bg-stone-100 rounded-2xl font-bold gap-2"
                       >
                          {isUpdatingBroadcast ? "Mise à jour..." : "Publier l'Annonce"}
                          <Zap className="w-4 h-4 fill-current" />
                       </Button>
                    </div>
                    <Megaphone className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                 </div>
              </div>

              {/* Live Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                             <UserPlus className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-stone-800 text-lg">Dernières Inscriptions</h3>
                       </div>
                    </div>
                    <div className="space-y-4">
                       {users.slice(0, 5).map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-transparent hover:border-stone-200 transition-all">
                             <div className="flex items-center gap-3">
                                <img src={u.mainPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                                <div>
                                   <p className="text-sm font-bold text-stone-800">{u.displayName}</p>
                                   <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest">{u.city}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] text-stone-400 font-bold uppercase">Nouveau membre</p>
                                <span className="text-[10px] text-green-500 font-bold">À l'instant</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                             <Heart className="w-5 h-5 fill-current" />
                          </div>
                          <h3 className="font-bold text-stone-800 text-lg">Matches en Direct</h3>
                       </div>
                    </div>
                    <div className="space-y-4">
                       {recentMatches.length > 0 ? recentMatches.map((m) => (
                          <div key={m.id} className="flex items-center justify-between p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50">
                             <div className="flex items-center -space-x-4">
                                <div className="w-10 h-10 rounded-xl bg-stone-200 border-2 border-white overflow-hidden shadow-sm flex items-center justify-center text-[10px] font-bold text-rose-600 italic">U1</div>
                                <div className="w-10 h-10 rounded-xl bg-stone-200 border-2 border-white overflow-hidden shadow-sm flex items-center justify-center text-[10px] font-bold text-rose-700 italic">U2</div>
                             </div>
                             <div className="flex-1 px-8">
                                <p className="text-xs font-bold text-stone-800">Nouveau match !</p>
                                <p className="text-[10px] text-stone-400 uppercase tracking-widest">Coup de foudre ⚡️</p>
                             </div>
                             <TrendingUp className="w-5 h-5 text-rose-400" />
                          </div>
                       )) : (
                          <div className="h-40 flex flex-col items-center justify-center text-stone-300 gap-2">
                             <Heart className="w-8 h-8 opacity-20" />
                             <p className="text-xs font-medium italic">En attente de nouveaux matches...</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeView === 'users' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
               <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm">
                  <div className="relative flex-1 w-full">
                     <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                     <input 
                        type="text"
                        placeholder="Rechercher par nom, email, ville..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 bg-stone-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/10 text-stone-600 transition-all"
                     />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                     <Button variant="outline" className="h-14 px-6 rounded-2xl gap-2 text-stone-500 flex-1">
                        <Filter className="w-4 h-4" /> Filtres
                     </Button>
                     <Button variant="outline" className="h-14 px-6 rounded-2xl gap-2 text-stone-500 flex-1">
                        <Download className="w-4 h-4" /> Exporter
                     </Button>
                  </div>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-stone-50/50 text-[10px] uppercase font-black text-stone-400 tracking-widest">
                          <th className="px-8 py-6">Profil Utilisateur</th>
                          <th className="px-8 py-6">Ville & Quartier</th>
                          <th className="px-8 py-6">Date de naissance</th>
                          <th className="px-8 py-6">État</th>
                          <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-stone-50/30 transition-colors group">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                   <img src={u.mainPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-12 h-12 rounded-[1.25rem] object-cover ring-2 ring-stone-100" />
                                   {u.isOnline && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />}
                                </div>
                                <div className="max-w-[200px]">
                                  <p className={`font-bold block truncate ${u.isBanned ? 'text-rose-600' : 'text-stone-800'}`}>
                                    {u.displayName}
                                    {u.isVerified && <Shield className="w-3 h-3 text-blue-500 fill-blue-500 inline ml-1" />}
                                  </p>
                                  <p className="text-[10px] font-medium text-stone-400 truncate tracking-tight">{u.email || u.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                               <p className="text-sm font-semibold text-stone-600">{u.city}</p>
                               <p className="text-[10px] text-stone-400 font-bold uppercase">{u.neighborhood || 'N/A'}</p>
                            </td>
                            <td className="px-8 py-5">
                               <p className="text-sm font-medium text-stone-600">{u.birthDate ? new Date(u.birthDate).toLocaleDateString('fr-FR') : "N/A"}</p>
                               <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">{u.gender || 'Autre'}</p>
                            </td>
                            <td className="px-8 py-5">
                               <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.isBanned ? 'bg-rose-50 text-rose-600' : 'bg-green-50 text-green-600'}`}>
                                 {u.isBanned ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                 {u.isBanned ? 'Banni' : 'Actif'}
                               </span>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => toggleVerification(u.id, !!u.isVerified)}
                                  className={`h-10 w-10 ${u.isVerified ? 'text-blue-600' : 'text-stone-400'} hover:text-blue-600 bg-stone-50 rounded-xl`}
                                  title={u.isVerified ? "Révoquer Certification" : "Certifier"}
                                >
                                  <Shield className={`w-4 h-4 ${u.isVerified ? 'fill-current' : ''}`} />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => toggleBan(u.id, !!u.isBanned)}
                                  className={`h-10 w-10 text-stone-400 hover:text-rose-600 bg-stone-50 rounded-xl`}
                                  title={u.isBanned ? "Débannir" : "Bannir"}
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => deleteUser(u.id)}
                                  className="h-10 w-10 text-stone-400 hover:text-rose-600 bg-stone-50 rounded-xl"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="p-20 text-center">
                               <div className="flex flex-col items-center gap-4 text-stone-400">
                                  <Users className="w-12 h-12 opacity-20" />
                                  <p className="font-serif italic text-lg">Aucun utilisateur trouvé pour "{searchQuery}"</p>
                               </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            </motion.div>
          )}

          {activeView === 'reports' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto py-20 text-center space-y-4">
               <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto opacity-20" />
               <h2 className="text-2xl font-serif font-bold italic">Module de Modération Avancée</h2>
               <p className="text-stone-400 max-w-sm mx-auto">Cette section sera disponible lors de la prochaine mise à jour du système pour une gestion plus fine des signalements.</p>
               <Button onClick={() => setActiveView('overview')} className="rounded-2xl h-14 px-8">Retour au Dashboard</Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full h-12 flex items-center gap-4 px-4 rounded-xl transition-all ${
        active 
          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' 
          : 'text-stone-400 hover:bg-stone-800/50 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-bold">{label}</span>
      {active && <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, trend, color, bg }: { icon: any, label: string, value: any, trend: string, color: string, bg: string }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
       <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center`}>
             <Icon className="w-6 h-6" />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${trend.includes('+') ? 'text-green-500' : 'text-stone-400'}`}>
             {trend}
          </span>
       </div>
       <div>
          <p className="text-2xl font-bold text-stone-900">{value}</p>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">{label}</p>
       </div>
    </div>
  );
}

