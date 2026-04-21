import { useState, useEffect, useRef, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, limit, deleteDoc } from "firebase/firestore";
import { ArrowLeft, Send, Loader2, Phone, Video, MoreVertical, Trash2, ShieldAlert, UserX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Button from "../components/ui/Button";
import CallModal from "../components/CallModal";

export default function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<{ type: 'video' | 'audio', isOpen: boolean }>({ type: 'video', isOpen: false });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!chatId || !user) return;

    // Fetch chat partners info
    async function fetchChatInfo() {
      const chatSnap = await getDoc(doc(db, "matches", chatId!));
      if (chatSnap.exists()) {
        const otherId = chatSnap.data().users.find((id: string) => id !== user!.uid);
        const profileSnap = await getDoc(doc(db, "profiles", otherId));
        if (profileSnap.exists()) setOtherUser(profileSnap.data());
      }
    }
    fetchChatInfo();

    // Listen to messages
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      // Auto scroll
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId, user]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !user) return;

    const content = newMessage.trim();
    setNewMessage("");

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: user.uid,
        content,
        timestamp: serverTimestamp(),
        read: false
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteConversation = async () => {
    if (!chatId || !window.confirm("Supprimer cette conversation définitivement ?")) return;
    try {
      await deleteDoc(doc(db, "matches", chatId));
      navigate("/messages");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 animate-spin text-love-red" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-stone-50 z-[60]">
      {/* Header */}
      <header className="h-16 bg-white border-b border-stone-200 px-4 flex items-center justify-between shadow-sm relative z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/messages")} className="p-2 -ml-2 text-stone-400 hover:text-stone-900 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="relative">
            <img 
              src={otherUser?.mainPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.userId}`} 
              className="w-10 h-10 rounded-xl object-cover bg-stone-100" 
            />
            {otherUser?.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
          </div>
          <div>
            <h2 className="font-bold text-sm text-stone-900 leading-none">{otherUser?.displayName || "Chargement..."}</h2>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">
              {otherUser?.isOnline ? "En ligne" : "Hors ligne"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-stone-400 hover:bg-stone-50"
            onClick={() => setActiveCall({ type: 'audio', isOpen: true })}
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-stone-400 hover:bg-stone-50"
            onClick={() => setActiveCall({ type: 'video', isOpen: true })}
          >
            <Video className="w-5 h-5" />
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`text-stone-400 hover:bg-stone-50 ${isMoreMenuOpen ? 'bg-stone-100 text-stone-900' : ''}`}
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>

            <AnimatePresence>
              {isMoreMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMoreMenuOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-stone-100 py-2 z-20"
                  >
                    <button 
                      onClick={async () => {
                        if (!user || !otherUser) return;
                        await addDoc(collection(db, "interactions"), {
                          type: "report",
                          fromId: user.uid,
                          toId: otherUser.userId,
                          timestamp: serverTimestamp()
                        });
                        alert("Signalement enregistré.");
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-stone-600 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-stone-400" />
                      Signaler l'utilisateur
                    </button>
                    <button 
                      onClick={async () => {
                        if (!user || !otherUser) return;
                        await addDoc(collection(db, "interactions"), {
                          type: "block",
                          fromId: user.uid,
                          toId: otherUser.userId,
                          timestamp: serverTimestamp()
                        });
                        alert("Utilisateur bloqué.");
                        setIsMoreMenuOpen(false);
                        navigate("/messages");
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-stone-600 hover:bg-stone-50 flex items-center gap-3 transition-colors"
                    >
                      <UserX className="w-4 h-4 text-stone-400" />
                      Bloquer le profil
                    </button>
                    <div className="h-px bg-stone-100 my-1 mx-2" />
                    <button 
                      onClick={deleteConversation}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer la fenêtre
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <div className="text-center py-8">
          <p className="text-[10px] text-stone-400 uppercase font-bold tracking-[0.2em] mb-2">Conversation sécurisée</p>
          <div className="w-12 h-1 bg-stone-200 mx-auto rounded-full" />
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              key={msg.id || i}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.senderId === user?.uid 
                  ? 'bg-love-red text-white rounded-tr-none shadow-rose-200' 
                  : 'bg-white text-stone-800 rounded-tl-none border border-stone-100'
                }`}
              >
                {msg.content}
                <div className={`text-[9px] mt-1 opacity-60 text-right`}>
                  {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "..."}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={scrollRef} />
      </main>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-200">
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto relative flex items-center gap-2">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="w-full h-12 pl-4 pr-12 bg-stone-50 border-stone-100 border rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-love-red transition-all"
            />
          </div>
          <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl shadow-lg shadow-rose-100" disabled={!newMessage.trim()}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>

      <CallModal 
        isOpen={activeCall.isOpen}
        type={activeCall.type}
        otherUser={otherUser}
        onClose={() => setActiveCall(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
