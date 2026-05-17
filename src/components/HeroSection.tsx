import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";

const HeroSection = () => {
  const WHATSAPP_NUMBER = "25779186635";
  const EMAIL_ADDRESS = "thefuturefoundationbdi@gmail.com";
  const BOOK_TITLE = "L'Argent Révélé: La Clé de la Liberté financière";

  const handleWhatsAppOrder = () => {
    // Message modifié pour la pré-commande
    const message = encodeURIComponent(`Bonjour, je souhaite pré-commander l'ouvrage "${BOOK_TITLE}" et être informé dès sa sortie en octobre.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleEmailOrder = () => {
    // Sujet et corps modifiés pour la pré-commande
    const subject = encodeURIComponent(`Pré-commande : ${BOOK_TITLE} (Sortie Octobre)`);
    const body = encodeURIComponent(`Bonjour,\n\nJe suis très intéressé par votre futur ouvrage "${BOOK_TITLE}". Je souhaiterais le pré-commander afin de garantir mon exemplaire pour la sortie officielle en octobre.\n\nMerci de me tenir informé des modalités de réservation.`);
    window.location.href = `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`;
  };

  const openPrefaceModal = () => {
    const modal = document.getElementById('modal-preface');
    if (modal) {
      modal.classList.remove('hidden');
    }
  };

  return (
    <section id="accueil" className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/coverweb.png" 
          alt={BOOK_TITLE}
          className="w-full h-full object-cover object-center sm:object-right md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-900/80 to-emerald-950/90 md:bg-gradient-to-r md:from-emerald-950/95 md:via-emerald-900/70 md:to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl animate-fade-up">
          <span className="inline-block px-3 py-1 md:px-4 md:py-2 bg-secondary/20 backdrop-blur-sm rounded-full text-secondary font-semibold text-xs md:text-sm mb-4 md:mb-6">
            🇧🇮 Burundi • Éducation Financière
          </span>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-primary-foreground leading-[1.1] mb-6">
            L'Argent <span className="text-secondary">Révélé</span>
          </h1>
          
          <p className="text-base md:text-xl text-primary-foreground/90 mb-8 leading-relaxed max-w-lg">
            Bientôt, découvrez la clé de la liberté financière avec l'ouvrage de référence de 
            <strong> The Future Generation BDI</strong>. Préparez-vous à transformer votre vision 
            de l'argent pour bâtir un avenir prospère.
          </p>

          <div className="flex flex-col gap-6 md:gap-8">
            {/* Options de pré-commande */}
            <div className="space-y-4">
              <p className="text-secondary font-bold text-xs md:text-sm uppercase tracking-widest">
                Réserver mon exemplaire (Sortie Octobre) :
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <button 
                  onClick={handleWhatsAppOrder}
                  className="flex flex-1 sm:flex-none items-center justify-center bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-3 md:px-6 md:py-4 rounded-lg text-base md:text-lg font-bold transition-transform active:scale-95 shadow-lg"
                >
                  <MessageCircle className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                  WhatsApp
                </button>
                <button 
                  onClick={handleEmailOrder}
                  className="flex flex-1 sm:flex-none items-center justify-center bg-white text-emerald-900 hover:bg-gray-100 px-5 py-3 md:px-6 md:py-4 rounded-lg text-base md:text-lg font-bold transition-transform active:scale-95 shadow-lg"
                >
                  <Mail className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                  Email
                </button>
              </div>
            </div>

            {/* Bouton pour la préface */}
            <div className="flex">
              <Button 
                variant="heroOutline" 
                size="lg" 
                onClick={openPrefaceModal}
                className="group border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Lire un extrait
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
