import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";

interface ExclusionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableIngredients: string[];
  currentExclusions: string[];
  onSave: (exclusions: string[]) => void;
}

export function ExclusionsModal({
  open,
  onOpenChange,
  availableIngredients,
  currentExclusions,
  onSave,
}: ExclusionsModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(currentExclusions));
  const [customInput, setCustomInput] = useState("");

  const handleToggle = (ingredient: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(ingredient)) {
      newSelected.delete(ingredient);
    } else {
      newSelected.add(ingredient);
    }
    setSelected(newSelected);
  };

  const handleAddCustom = () => {
    if (customInput.trim()) {
      const newSelected = new Set(selected);
      newSelected.add(customInput.trim());
      setSelected(newSelected);
      setCustomInput("");
    }
  };

  const handleSave = () => {
    onSave(Array.from(selected));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ingredientes a Evitar</DialogTitle>
          <DialogDescription>
            Selecione os ingredientes que você deseja evitar no seu plano alimentar. Eles não
            aparecerão nas receitas nem na lista de compras.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ingredientes disponíveis */}
          {availableIngredients.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Ingredientes informados:</h3>
              <div className="grid grid-cols-2 gap-3">
                {availableIngredients.map((ingredient) => (
                  <div key={ingredient} className="flex items-center space-x-2">
                    <Checkbox
                      id={`exclude-${ingredient}`}
                      checked={selected.has(ingredient)}
                      onCheckedChange={() => handleToggle(ingredient)}
                    />
                    <Label
                      htmlFor={`exclude-${ingredient}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {ingredient}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exclusões personalizadas */}
          <div>
            <h3 className="font-medium mb-3">Adicionar outro ingrediente:</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: pimentão, coentro, lactose..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
              />
              <Button type="button" onClick={handleAddCustom} disabled={!customInput.trim()}>
                Adicionar
              </Button>
            </div>
          </div>

          {/* Lista de exclusões selecionadas */}
          {selected.size > 0 && (
            <div>
              <h3 className="font-medium mb-3">Ingredientes que serão evitados:</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(selected).map((item) => (
                  <div
                    key={item}
                    className="bg-destructive/10 text-destructive px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      className="hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar ({selected.size} exclusões)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

