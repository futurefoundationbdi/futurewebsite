import { useState } from "react";
import { X, Smartphone, Globe, Home, CheckCircle2, ShieldCheck, CreditCard, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationModal = ({ isOpen, onClose }: DonationModalProps) => {
  const [currency, setCurrency] = useState<"USD" | "BIF">("USD");
  const [amount, setAmount] = useState<string>("");
  const [showStripe, setShowStripe] = useState(false);

  if (!isOpen) return null;

  const amountsUSD = ["5", "10", "20", "50"];
  const amountsBIF = ["2000", "5000", "10000", "50000"];

  const minAmount = currency === "USD" ? 5 : 2000;
  const isInvalid = amount !== "" && parseFloat(amount) < minAmount;

  // REMPLACE par le lien Stripe réel créé par Kercie
  const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_3cl8wP6bDg4Lr3pma3u00";

  const handleWhatsAppConfirm = () => {
    const WHATSAPP_NUMBER = "25779186635";
    const message = encodeURIComponent(
      `Bonjour, j'aimerais soutenir The Future Foundation BDI par un don. Pouvez-vous me guider ?`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleClose = () => {
    setShowStripe(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-primary/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-5 md:p-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-primary">Faire un Don</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Soutenez la jeunesse burundaise</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION MAINTENANCE (VISIBLE) */}
        <div className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-[#164d3b]" />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-[#164d3b]">Bientôt disponible</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Notre système de donation automatique est en cours de configuration pour garantir une sécurité maximale à vos transactions.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">Pour nous soutenir dès maintenant</p>
            <p className="text-sm font-bold text-primary">Contactez-nous au +257 79 186 635</p>
          </div>

          <Button 
            onClick={handleWhatsAppConfirm}
            className="w-full h-14 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold flex gap-3 rounded-xl shadow-lg shadow-green-100 transition-transform active:scale-95"
          >
            <MessageCircle className="w-6 h-6" /> Faire un don via WhatsApp
          </Button>

          <p className="text-[9px] text-center text-muted-foreground uppercase tracking-widest pt-4">
            The Future Foundation BDI
          </p>
        </div>

        {/* ANCIENNE SECTION TECHNIQUE (MISE EN COMMENTAIRE POUR PLUS TARD)
        <div className="hidden p-5 md:p-6 overflow-y-auto custom-scrollbar space-y-5">
          {!showStripe ? (
            <>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg shrink-0">
                <button onClick={() => { setCurrency("USD"); setAmount(""); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[13px] md:text-sm font-bold transition-all ${currency === "USD" ? "bg-white shadow text-primary" : "text-slate-500"}`}>
                  <Globe className="w-4 h-4" /> International
                </button>
                <button onClick={() => { setCurrency("BIF"); setAmount(""); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[13px] md:text-sm font-bold transition-all ${currency === "BIF" ? "bg-white shadow text-primary" : "text-slate-500"}`}>
                  <Home className="w-4 h-4" /> Burundi
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(currency === "USD" ? amountsUSD : amountsBIF).map((val) => (
                  <button key={val} onClick={() => setAmount(val)} className={`py-2 border-2 rounded-xl text-xs md:text-sm font-bold transition-all ${amount === val ? "border-secondary bg-secondary/10 text-primary" : "border-slate-100 hover:border-slate-200"}`}>
                    {val}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input type="number" placeholder={`Montant (min ${minAmount})`} value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full p-3 md:p-4 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm md:text-base ${isInvalid ? "border-red-500 focus:ring-red-200" : "border-slate-100 focus:ring-primary/20"}`} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">{currency === "USD" ? "$" : "Fbu"}</span>
              </div>

              <div className="space-y-4">
                {currency === "USD" ? (
                  <div className="space-y-3">
                    <Button disabled={isInvalid || !amount} onClick={() => setShowStripe(true)} className="w-full h-12 md:h-14 bg-[#635bff] hover:bg-[#5349e0] flex gap-3 text-base md:text-lg font-bold"><CreditCard className="w-5 h-5" /> Continuer vers Stripe</Button>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span className="text-[10px] uppercase font-bold tracking-wider italic">Sécurisé & Chiffré</span></div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-3 text-[13px]"><Smartphone className="w-4 h-4" /> Instructions de transfert</h4>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {["/lumicash_logo.png", "/beenoti_logo.png", "/ihela_logo.png"].map((img, i) => (
                          <div key={i} className="h-8 md:h-10 bg-white rounded border border-emerald-100 flex items-center justify-center p-1"><img src={img} alt="logo" className="h-full object-contain" /></div>
                        ))}
                      </div>
                      <div className="space-y-2 text-[11px] md:text-[12px] text-emerald-700 leading-tight">
                        <p>• <strong>LUMICASH / ECOCASH :</strong> *150# ou *444#</p>
                        <p>• <strong>Compte :</strong> 79 186 635</p>
                        <p className="mt-2 pt-2 border-t border-emerald-200 font-bold text-emerald-900">Total : {amount || "0"} Fbu</p>
                      </div>
                    </div>
                    <Button disabled={isInvalid || !amount} onClick={handleWhatsAppConfirm} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white flex gap-2 h-12 text-sm md:text-base"><CheckCircle2 className="w-5 h-5" /> Confirmer mon don</Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col h-[520px] animate-fade-in">
              <iframe src={`${STRIPE_PAYMENT_LINK}?prefilled_email=&client_reference_id=don_${amount}`} className="w-full h-full rounded-xl border-0 shadow-inner bg-slate-50" title="Paiement Sécurisé Stripe" allow="payment" />
              <button onClick={() => setShowStripe(false)} className="mt-4 text-sm text-slate-500 font-bold hover:text-primary underline flex items-center justify-center">← Modifier le montant ({amount}$)</button>
            </div>
          )}
        </div>
        */}
      </div>
    </div>
  );
};

export default DonationModal;
