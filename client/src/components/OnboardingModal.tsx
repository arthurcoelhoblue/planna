import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { ChefHat } from "lucide-react";
import { useState } from "react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [dietType, setDietType] = useState<string>("");

  const savePreferences = trpc.preferences.update.useMutation({
    onSuccess: () => {
      onComplete();
    },
  });

  const handleNext = () => {
    setStep(2);
  };

  const handleSubmit = () => {
    savePreferences.mutate({ 
      skillLevel,
      dietType: dietType || undefined 
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Bem-vindo ao Planna!</DialogTitle>
          <DialogDescription className="text-center">
            {step === 1 
              ? "Para personalizar sua experiência, nos conte: qual é seu nível de experiência na cozinha?"
              : "Você segue alguma dieta específica? (Opcional)"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <button
            type="button"
            onClick={() => setSkillLevel("beginner")}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              skillLevel === "beginner"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold">👶 Iniciante</div>
            <div className="text-sm text-muted-foreground">
              Estou começando agora, preciso de instruções detalhadas
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSkillLevel("intermediate")}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              skillLevel === "intermediate"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold">👨‍🍳 Intermediário</div>
            <div className="text-sm text-muted-foreground">
              Já cozinho regularmente, conheço o básico
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSkillLevel("advanced")}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              skillLevel === "advanced"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold">⭐ Avançado</div>
            <div className="text-sm text-muted-foreground">
              Tenho bastante experiência, consigo fazer várias coisas ao mesmo tempo
            </div>
          </button>
        </div>

        {step === 1 ? (
          <Button onClick={handleNext} className="w-full" size="lg">
            Próximo
          </Button>
        ) : (
          <>
            <div className="space-y-3">
              <input
                type="text"
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                placeholder="Ex: vegetariana, vegana, low carb, sem glúten..."
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco se não segue nenhuma dieta específica
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={savePreferences.isPending}
                className="flex-1"
                size="lg"
              >
                {savePreferences.isPending ? "Salvando..." : "Finalizar"}
              </Button>
            </div>
          </>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Você pode alterar isso depois nas configurações
        </p>
      </DialogContent>
    </Dialog>
  );
}

