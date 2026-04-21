import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { Heart, Mail, Lock, Chrome, ArrowLeft, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/home");
    } catch (err: any) {
      setError("Erreur lors de la connexion Google: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/home");
    } catch (err: any) {
      console.error("Auth error code:", err.code);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Cet e-mail est déjà utilisé. Essayez de vous connecter à la place.");
          break;
        case "auth/invalid-email":
          setError("L'adresse e-mail n'est pas valide.");
          break;
        case "auth/weak-password":
          setError("Le mot de passe est trop court (minimum 6 caractères).");
          break;
        case "auth/wrong-password":
          setError("Mot de passe incorrect.");
          break;
        case "auth/user-not-found":
          setError("Aucun compte trouvé avec cet e-mail.");
          break;
        case "auth/invalid-credential":
          setError("Identifiants incorrects ou compte inexistant.");
          break;
        default:
          setError("Une erreur est survenue lors de l'authentification.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="absolute top-8 left-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-stone-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-love-red/10 text-love-red items-center justify-center rounded-3xl mb-4 transform rotate-12">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-serif font-bold">Gabon<span className="text-love-red">Love</span></h1>
          <p className="text-stone-500 mt-2">
            {isLogin ? "Heureux de vous revoir !" : "Commencez votre histoire aujourd'hui."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="p-4 bg-love-red/5 rounded-3xl border border-love-red/10 space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-love-red">Pourquoi s'inscrire ?</h3>
                <ul className="space-y-2">
                  {[
                    "Rencontrez des profils vérifiés au Gabon",
                    "Messagerie instantanée en temps réel",
                    "Découvrez qui a visité votre profil",
                    "Recevez des mots doux de vos admirateurs"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                      <div className="w-1 h-1 rounded-full bg-love-red" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-500 uppercase ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full h-12 pl-12 pr-4 bg-stone-50 border-stone-100 border rounded-2xl focus:ring-2 focus:ring-love-red/20 focus:border-love-red outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-500 uppercase ml-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-12 pl-12 pr-4 bg-stone-50 border-stone-100 border rounded-2xl focus:ring-2 focus:ring-love-red/20 focus:border-love-red outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-rose-500 text-sm text-center bg-rose-50 p-3 rounded-xl border border-rose-100">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Se connecter" : "S'inscrire")}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-500">
          {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="ml-1 text-love-red font-bold hover:underline"
          >
            {isLogin ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
