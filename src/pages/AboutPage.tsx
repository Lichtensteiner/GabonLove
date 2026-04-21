import { motion } from "motion/react";
import { Heart, Users, Shield, Target, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="fixed top-0 w-full z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
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
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-serif font-bold mb-6">Notre Mission : Connecter les cœurs Gabonais</h1>
            <p className="text-lg text-stone-600 leading-relaxed">
              GabonLove est né d'une idée simple : créer un espace sécurisé et authentique où les célibataires du Gabon et de la diaspora peuvent se rencontrer, échanger et bâtir des relations durables basées sur nos valeurs communes.
            </p>
          </motion.div>

          <div className="grid gap-12">
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-love-red">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold font-serif">Pourquoi GabonLove ?</h2>
              </div>
              <p className="text-stone-600 leading-relaxed mb-4">
                Dans un monde de plus en plus connecté, trouver l'amour reste un défi, particulièrement au sein de notre communauté. Les applications internationales manquent souvent de la touche locale et de la compréhension de nos codes culturels. 
              </p>
              <p className="text-stone-600 leading-relaxed">
                Nous avons conçu GabonLove pour être différent : une plateforme où la bienveillance, le respect et l'authenticité sont au centre de chaque interaction.
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
                <Users className="w-10 h-10 text-gabon-green mb-4" />
                <h3 className="text-xl font-bold mb-3">Communauté Vérifiée</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Nous modérons chaque profil pour garantir une expérience de qualité et limiter les faux comptes.
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
                <Shield className="w-10 h-10 text-gabon-blue mb-4" />
                <h3 className="text-xl font-bold mb-3">Sécurité & Respect</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Vos données sont protégées et nous appliquons une politique de tolérance zéro envers le harcèlement.
                </p>
              </div>
            </div>

            <section className="text-center bg-gabon-yellow/10 p-12 rounded-[3rem] border border-gabon-yellow/20">
              <h2 className="text-3xl font-serif font-bold mb-6">L'équipe derrière le projet</h2>
              <p className="text-stone-600 mb-8 max-w-xl mx-auto">
                Basé à Libreville, GabonLove est porté par des passionnés de technologie et de relations humaines qui croient en la force de l'amour digital local.
              </p>
              <div className="flex flex-wrap justify-center gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-stone-200 rounded-full mx-auto mb-3 overflow-hidden shadow-inner border-2 border-white">
                     <img src="/Dev_4.png" alt="Ludo" className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold">Ludo Consulting</p>
                  <p className="text-xs text-stone-500">Fondateur & Lead Dev</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-12 px-4 border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <p className="text-sm text-stone-500">© 2024 GabonLove. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
