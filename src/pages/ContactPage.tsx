import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Mail, Phone, MapPin, Instagram, Facebook, ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Support technique",
    message: ""
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const mailtoUrl = `mailto:ludovicjusdorange@gmail.com?subject=${encodeURIComponent(formData.subject + " - " + formData.name)}&body=${encodeURIComponent("De: " + formData.name + " (" + formData.email + ")\n\n" + formData.message)}`;
    window.location.href = mailtoUrl;
  };

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
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-serif font-bold mb-6 text-stone-900">Besoin d'aide ?</h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Une question, un bug ou une suggestion ? Notre équipe est à votre écoute pour vous garantir la meilleure expérience sur GabonLove.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {[
                { 
                  icon: Mail, 
                  label: "Email", 
                  value: "ludovicjusdorange@gmail.com", 
                  color: "bg-blue-50 text-blue-600",
                  href: "mailto:ludovicjusdorange@gmail.com"
                },
                { 
                  icon: Phone, 
                  label: "WhatsApp", 
                  value: "074306108", 
                  color: "bg-green-50 text-green-600",
                  href: "https://wa.me/241074306108"
                },
                { 
                  icon: MapPin, 
                  label: "Bureau", 
                  value: "Libreville, Gabon", 
                  color: "bg-red-50 text-red-600",
                  href: null
                }
              ].map((item, i) => (
                <a 
                  key={i} 
                  href={item.href || '#'} 
                  target={item.href?.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className={`bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-start gap-4 transition-transform hover:scale-[1.02] ${!item.href ? 'cursor-default' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">{item.label}</p>
                    <p className="font-medium text-stone-900">{item.value}</p>
                  </div>
                </a>
              ))}

              <div className="bg-stone-900 text-white p-8 rounded-3xl space-y-6">
                <p className="font-serif text-xl font-bold">Suivez-nous</p>
                <div className="flex gap-4">
                  <a 
                    href="https://www.instagram.com/ludovic_jus_d_orange?igsh=MTB5azhqdzBqc2NtOA==" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-love-red hover:scale-110 transition-all"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a 
                    href="https://www.facebook.com/lesenateur.mvezogo" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                </div>
                <p className="text-sm text-stone-400 leading-relaxed italic">
                  "L'amour est à portée de clic. Rejoignez la discussion sur nos réseaux."
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[2.5rem] border border-stone-200 shadow-sm">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-700 ml-1">Nom complet</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="Votre nom"
                      className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-love-red/20 focus:border-love-red outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-700 ml-1">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      placeholder="votre@email.com"
                      className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-love-red/20 focus:border-love-red outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 ml-1">Sujet</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-love-red/20 focus:border-love-red outline-none transition-all appearance-none"
                  >
                    <option>Support technique</option>
                    <option>Signalement de profil</option>
                    <option>Partenariat</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 ml-1">Message</label>
                  <textarea 
                    rows={5} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    placeholder="Comment pouvons-nous vous aider ?"
                    className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-love-red/20 focus:border-love-red outline-none transition-all resize-none"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full md:w-auto px-12 group">
                  Envoyer le message
                  <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
