import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

// Price IDs do Stripe (modo teste)
const STRIPE_PRICE_IDS = {
  pro: "price_1SUPvOKHYuEw9LKlDGmXKmjD", // Planna Pro - R$ 9,90/mês
  premium: "price_1SVInaKHYuEw9LKlKEAg3pps", // Planna Premium - R$ 14,99/mês
};

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
}

export function UpgradeModal({ open, onOpenChange, reason }: UpgradeModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<"pro" | "premium" | null>(null);

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      alert(error.message);
      setLoadingPlan(null);
    },
  });

  const handleUpgrade = (priceId: string, plan: "pro" | "premium") => {
    setLoadingPlan(plan);
    createCheckout.mutate({ priceId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Desbloqueie Todo o Potencial do Planna
          </DialogTitle>
          <DialogDescription>
            {reason || "Você atingiu o limite do plano gratuito. Faça upgrade para continuar criando planos ilimitados!"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Plano Pro */}
          <div className="border-2 border-primary rounded-lg p-6 space-y-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              Mais Popular
            </div>
            <div>
              <h3 className="text-xl font-bold">Pro</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold">R$ 9,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">10 planos por mês</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Todo do plano Gratuito</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Informações nutricionais</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Suporte a dietas especiais</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Histórico limitado</span>
              </li>
            </ul>
            <Button
              className="w-full"
              size="lg"
              onClick={() => handleUpgrade(STRIPE_PRICE_IDS.pro, "pro")}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "pro" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                "Assinar Pro"
              )}
            </Button>
          </div>

          {/* Plano Premium */}
          <div className="border rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold">Premium</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold">R$ 14,99</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Planos ilimitados</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Tudo do plano Pro</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Suporte prioritário</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Acesso antecipado a novas receitas</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Personalização avançada</span>
              </li>
            </ul>
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={() => handleUpgrade(STRIPE_PRICE_IDS.premium, "premium")}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === "premium" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                "Assinar Premium"
              )}
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4">
          💳 Pagamento seguro via Stripe • Cancele quando quiser • Sem taxas ocultas
        </div>
      </DialogContent>
    </Dialog>
  );
}

