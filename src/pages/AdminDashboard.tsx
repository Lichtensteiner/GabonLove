import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, query, limit, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { Shield, Users, AlertTriangle, CheckCircle, Ban, Trash2, Loader2, Circle } from "lucide-react";
import Button from "../components/ui/Button";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const isAdmin = user?.email === "ludo.consulting3@gmail.com";

  useEffect(() => {
    if (!isAdmin) return;
    
    // Real-time listener for all user profiles
    const q = query(collection(db, "profiles"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-8 text-center text-rose-600 font-bold">
        Accès refusé. Réservé aux administrateurs.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <Shield className="w-6 h-6" />
            <span className="font-bold uppercase tracking-widest text-sm">Panneau Admin</span>
          </div>
          <h1 className="text-4xl font-serif font-bold italic text-stone-900">GabonLove Dashboard</h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-3xl border border-stone-200 flex flex-col items-center min-w-[120px]">
            <span className="text-2xl font-bold">{users.length}</span>
            <span className="text-[10px] font-bold text-stone-400 uppercase">Utilisateurs</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-bold text-stone-700 flex items-center gap-2">
              <Users className="w-5 h-5 text-stone-400" />
              Gestion des utilisateurs
            </h2>
            <Button size="sm" variant="ghost">Voir tout</Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Ville</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.mainPhoto || "https://i.pravatar.cc/150"} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-stone-800">{u.displayName}</p>
                          <p className="text-xs text-stone-400">{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-stone-600">{u.city}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${u.isOnline ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                        {u.isOnline ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                        {u.isOnline ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-400 hover:text-rose-500">
                          <Ban className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-400 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-stone-700">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Signalements récents
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-400 mb-1">Signalé par: Marc</p>
                  <p className="text-sm font-semibold text-stone-800">Comportement inapproprié</p>
                </div>
                <Button size="sm" variant="outline">Gérer</Button>
              </div>
              <p className="text-center text-stone-400 text-sm italic">Aucun autre signalement en attente.</p>
            </div>
          </div>
          
          <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-bold mb-2">Conseil Admin</h3>
               <p className="text-sm text-stone-400 leading-relaxed">
                 Gardez une communauté saine en vérifiant régulièrement les nouveaux profils et les photos signalées.
               </p>
               <Button className="mt-6 bg-white text-stone-900 hover:bg-stone-100 border-none">
                 Lancer un audit
               </Button>
             </div>
             <Shield className="absolute -bottom-8 -right-8 w-40 h-40 text-white/5" />
          </div>
        </section>
      </main>
    </div>
  );
}
