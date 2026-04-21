import { motion } from "motion/react";
import { Heart, Shield, Users, Globe, ChevronRight } from "lucide-react";
import Button from "../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";

export default function LandingPage() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-love-red rounded-lg flex items-center justify-center transform rotate-12">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-stone-900">Gabon<span className="text-love-red">Love</span></span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => auth.signOut()}>Déconnexion</Button>
                <Button size="sm" onClick={() => navigate("/home")}>Mon Compte</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate("/auth")}>Connexion</Button>
                <Button size="sm" onClick={() => navigate("/auth")}>S'inscrire</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="pt-32 pb-20 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-gabon-yellow/20 text-stone-800 px-3 py-1 rounded-full text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-gabon-yellow animate-pulse" />
                La plateforme de rencontre #1 au Gabon
              </div>
              <h1 className="text-6xl md:text-7xl font-serif font-bold leading-[1.1] mb-6 text-stone-900">
                L'amour est au <span className="text-gabon-green underline decoration-gabon-yellow decoration-4 underline-offset-8">Gabon</span>.
              </h1>
              <p className="text-lg text-stone-600 mb-10 max-w-lg leading-relaxed">
                Rejoignez des milliers de célibataires gabonais à la recherche de relations sérieuses et authentiques. Une plateforme sécurisée, locale et adaptée à notre culture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group" onClick={() => navigate(user ? "/home" : "/auth")}>
                  {user ? "Accéder à mon espace" : "Commencer l'aventure"}
                  <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                {!user && (
                  <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                    En savoir plus
                  </Button>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white aspect-[4/5] max-w-md mx-auto transform rotate-2">
                <img 
                  src="/Dev_4.png" 
                  alt="Ludovic - GabonLove" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white p-4">
                  <p className="font-serif text-xl italic">"J'ai trouvé mon âme sœur à Libreville grâce à GabonLove."</p>
                  <p className="text-sm opacity-80 mt-1 font-bold">— Dev Ludovic, 30 ans</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-1/2 -right-4 w-32 h-32 bg-gabon-blue/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-love-red/10 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-stone-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif mb-4">Pourquoi choisir GabonLove ?</h2>
              <p className="text-stone-500 max-w-2xl mx-auto">Conçu spécifiquement pour notre pays, avec des garanties de sécurité et une modération locale.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: "Sécurité Maximale", desc: "Profils vérifiés et protection rigoureuse de vos données personnelles." },
                { icon: Users, title: "Communauté Locale", desc: "Rencontrez des personnes près de chez vous ou de la diaspora." },
                { icon: Globe, title: "Culture Gabonaise", desc: "Une interface adaptée aux codes et aux valeurs de notre pays." }
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200"
                >
                  <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center mb-6 text-love-red">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-stone-500 leading-relaxed text-sm">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 px-4 border-t border-stone-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <div className="w-6 h-6 bg-love-red rounded-md flex items-center justify-center transform rotate-12">
                <Heart className="w-4 h-4 text-white fill-current" />
              </div>
              <span className="font-serif text-xl font-bold">GabonLove</span>
            </div>
            <p className="text-sm text-stone-500">© 2024 Ludo_Consulting. Fait avec passion à Libreville.</p>
          </div>
          <div className="flex gap-8 text-sm font-medium text-stone-600">
            <Link to="/about" className="hover:text-love-red transition-colors">À propos</Link>
            <Link to="/privacy" className="hover:text-love-red transition-colors">Confidentialité</Link>
            <Link to="/terms" className="hover:text-love-red transition-colors">CGU</Link>
            <Link to="/contact" className="hover:text-love-red transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
