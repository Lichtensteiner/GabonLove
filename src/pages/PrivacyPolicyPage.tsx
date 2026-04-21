import { motion } from "motion/react";
import { Heart, Shield, Lock, Eye, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl font-serif font-bold mb-6">Politique de Confidentialité</h1>
            <p className="text-stone-600 leading-relaxed italic mb-8 border-l-4 border-love-red pl-4">
              Dernière mise à jour : 21 Avril 2024. Chez GabonLove, la protection de votre vie privée est notre priorité absolue.
            </p>

            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-4 text-love-red">
                  <Eye className="w-6 h-6" />
                  <h2 className="text-2xl font-serif font-bold text-stone-900">1. Collecte des données</h2>
                </div>
                <p className="text-stone-600 leading-relaxed mb-4">
                  Pour vous offrir la meilleure expérience de rencontre, nous collectons certaines informations lors de votre inscription :
                </p>
                <ul className="list-disc list-inside space-y-2 text-stone-600 ml-4">
                  <li>Informations de profil (nom, âge, genre, ville).</li>
                  <li>Photos téléchargées pour votre profil.</li>
                  <li>Préférences de rencontre et biographie.</li>
                  <li>Données de localisation (uniquement si vous l'autorisez).</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4 text-gabon-green">
                  <Lock className="w-6 h-6" />
                  <h2 className="text-2xl font-serif font-bold text-stone-900">2. Utilisation de vos informations</h2>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Vos données sont utilisées exclusivement pour :
                </p>
                <ul className="list-disc list-inside space-y-2 text-stone-600 mt-2 ml-4">
                  <li>Vous proposer des profils pertinents.</li>
                  <li>Assurer la sécurité de la communauté et prévenir la fraude.</li>
                  <li>Améliorer nos services et fonctionnalités.</li>
                  <li>Vous envoyer des notifications importantes liées à votre compte.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4 text-gabon-blue">
                  <Shield className="w-6 h-6" />
                  <h2 className="text-2xl font-serif font-bold text-stone-900">3. Sécurité et Partage</h2>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  GabonLove ne vend jamais vos données personnelles à des tiers. Vos informations ne sont visibles que par les autres membres inscrits de la plateforme, selon vos paramètres de confidentialité. Nous utilisons des protocoles de sécurité avancés pour protéger vos échanges.
                </p>
              </section>

              <section className="bg-white p-8 rounded-3xl border border-stone-200">
                <h2 className="text-xl font-bold mb-4">4. Vos droits</h2>
                <p className="text-stone-600 mb-4 leading-relaxed">
                  Conformément aux lois sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez à tout moment supprimer votre compte et l'intégralité de vos photos depuis vos paramètres.
                </p>
                <p className="text-sm text-stone-400">
                  Pour toute question relative à vos données, contactez-nous à : privacy@gabonlove.com
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
