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
  const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");

  const savePreferences = trpc.preferences.update.useMutation({
    onSuccess: () => {
      onComplete();
    },
  });

  const handleSubmit = () => {
    savePreferences.mutate({ skillLevel });
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
            Para personalizar sua experiência, nos conte: qual é seu nível de experiência na cozinha?
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

        <Button
          onClick={handleSubmit}
          disabled={savePreferences.isPending}
          className="w-full"
          size="lg"
        >
          {savePreferences.isPending ? "Salvando..." : "Continuar"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Você pode alterar isso depois nas configurações
        </p>
      </DialogContent>
    </Dialog>
  );
}

