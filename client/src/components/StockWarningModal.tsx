import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface StockWarningModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  onAdjust: () => void;
  insufficientIngredients: Array<{
    name: string;
    available: number;
    needed: number;
    unit: string;
  }>;
}

export function StockWarningModal({
  open,
  onClose,
  onContinue,
  onAdjust,
  insufficientIngredients,
}: StockWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-xl">Estoque Insuficiente</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Alguns ingredientes podem não ser suficientes para o número de marmitas solicitado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm font-medium text-muted-foreground">
            Ingredientes com possível insuficiência:
          </p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {insufficientIngredients.map((ing, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{ing.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Disponível: {ing.available}{ing.unit} • Necessário: ~{ing.needed}{ing.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Dica:</strong> Você pode continuar e a IA tentará ajustar as receitas,
              ou voltar e informar quantidades maiores.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onAdjust} className="w-full sm:w-auto">
            Voltar e Ajustar
          </Button>
          <Button onClick={onContinue} className="w-full sm:w-auto">
            Continuar Mesmo Assim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

