import { motion } from "motion/react";
import { Heart, Scale, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-stone-500" />
            <span className="font-medium text-stone-600">Retour</span>
          </Link>
          <div className="flex items-center gap-2 pr-12">
            <div className="w-8 h-8 bg-love-red rounded-lg flex items-center justify-center transform rotate-12">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900">Gabon<span className="text-love-red">Love</span></span>
          </div>
          <div />
        </div>
      </header>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-serif font-bold mb-6">Conditions Générales d'Utilisation (CGU)</h1>
            
            <div className="bg-stone-900 text-white p-6 rounded-2xl mb-12 shadow-xl">
              <p className="flex items-start gap-3 text-sm leading-relaxed">
                <AlertCircle className="w-5 h-5 text-gabon-yellow shrink-0 mt-0.5" />
                En utilisant GabonLove, vous acceptez sans réserve les présentes conditions. Notre mission est de favoriser des rencontres respectueuses au Gabon.
              </p>
            </div>

            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-4 text-stone-800">
                  <CheckCircle className="w-6 h-6" />
                  <h2 className="text-2xl font-serif font-bold">1. Éligibilité</h2>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  L'accès à GabonLove est strictement réservé aux personnes âgées de **18 ans et plus**. En vous inscrivant, vous certifiez l'exactitude de votre âge. Tout profil ne respectant pas cette règle sera supprimé sans préavis.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4 text-stone-800">
                  <Scale className="w-6 h-6" />
                  <h2 className="text-2xl font-serif font-bold">2. Règles de conduite</h2>
                </div>
                <p className="text-stone-600 leading-relaxed mb-4">
                  Pour maintenir un environnement sain pour tous, vous vous engagez à :
                </p>
                <ul className="grid gap-3">
                  {[
                    "Utiliser des photos réelles et récentes de vous-même.",
                    "Être courtois et respectueux envers les autres membres.",
                    "Ne pas tenir de propos haineux, racistes ou discriminatoires.",
                    "Ne pas utiliser la plateforme à des fins commerciales ou de spam.",
                    "Ne pas partager de contenu à caractère pornographique."
                  ].map((rule, i) => (
                    <li key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100 text-sm italic">
                      <span className="w-1.5 h-1.5 rounded-full bg-love-red" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-serif font-bold mb-4">3. Sécurité des comptes</h2>
                <p className="text-stone-600 leading-relaxed">
                  Vous êtes responsable de maintenir la confidentialité de vos identifiants. GabonLove ne pourra être tenu responsable de toute perte ou dommage résultant d'un accès non autorisé à votre compte dû à une négligence de votre part.
                </p>
              </section>

              <section className="p-8 bg-love-red/5 rounded-3xl border border-love-red/10">
                <h2 className="text-2xl font-serif font-bold mb-4 text-love-red">4. Sanctions</h2>
                <p className="text-stone-600 leading-relaxed">
                  Le non-respect de ces CGU peut entraîner un avertissement, une suspension temporaire ou la suppression définitive de votre compte. La sécurité de notre communauté gabonaise est notre priorité absolue.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
