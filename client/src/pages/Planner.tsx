import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ChefHat, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Planner() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [ingredients, setIngredients] = useState("");
  const [servings, setServings] = useState([10]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [exclusionInput, setExclusionInput] = useState("");
  const [objective, setObjective] = useState<"praticidade" | "economia">("praticidade");

  const generatePlan = trpc.mealPlan.generate.useMutation({
    onSuccess: (data) => {
      // Redireciona para a página de resultado
      setLocation(`/plan/${data.planId}`);
    },
  });

  const handleAddExclusion = () => {
    if (exclusionInput.trim() && exclusions.length < 3) {
      setExclusions([...exclusions, exclusionInput.trim()]);
      setExclusionInput("");
    }
  };

  const handleRemoveExclusion = (index: number) => {
    setExclusions(exclusions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    generatePlan.mutate({
      ingredients: ingredients.trim(),
      servings: servings[0],
      exclusions,
      objective,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar logado para usar o planejador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href={getLoginUrl()} className="block">
              <Button className="w-full">Fazer Login</Button>
            </a>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Voltar para Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <ChefHat className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">{APP_TITLE}</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/history">
              <Button variant="ghost">Histórico</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">Crie seu plano semanal</h1>
            <p className="text-lg text-muted-foreground">
              Preencha as informações abaixo e deixe a IA criar seu cardápio personalizado
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Plano</CardTitle>
              <CardDescription>
                Quanto mais detalhes você fornecer, melhor será o resultado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Ingredientes */}
                <div className="space-y-2">
                  <Label htmlFor="ingredients">
                    O que você tem na geladeira? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="ingredients"
                    placeholder="Ex: frango, arroz, feijão, cenoura, brócolis, batata, ovos..."
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Digite os ingredientes separados por vírgula. Pode usar texto livre!
                  </p>
                </div>

                {/* Número de marmitas */}
                <div className="space-y-4">
                  <Label htmlFor="servings">
                    Quantas marmitas você quer? <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="servings"
                      min={6}
                      max={20}
                      step={1}
                      value={servings}
                      onValueChange={setServings}
                      className="flex-1"
                    />
                    <div className="w-16 text-center font-semibold text-lg">{servings[0]}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recomendamos entre 8-12 marmitas para uma semana
                  </p>
                </div>

                {/* Exclusões */}
                <div className="space-y-2">
                  <Label htmlFor="exclusions">Ingredientes para evitar (opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="exclusions"
                      placeholder="Ex: pimentão, coentro, lactose..."
                      value={exclusionInput}
                      onChange={(e) => setExclusionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddExclusion();
                        }
                      }}
                      disabled={exclusions.length >= 3}
                    />
                    <Button
                      type="button"
                      onClick={handleAddExclusion}
                      disabled={!exclusionInput.trim() || exclusions.length >= 3}
                    >
                      Adicionar
                    </Button>
                  </div>
                  {exclusions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exclusions.map((item, index) => (
                        <div
                          key={index}
                          className="bg-destructive/10 text-destructive px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => handleRemoveExclusion(index)}
                            className="hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">Máximo de 3 exclusões</p>
                </div>

                {/* Objetivo */}
                <div className="space-y-2">
                  <Label>Qual seu objetivo principal?</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setObjective("praticidade")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        objective === "praticidade"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold mb-1">⚡ Praticidade</div>
                      <div className="text-sm text-muted-foreground">
                        Receitas rápidas e simples
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setObjective("economia")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        objective === "economia"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold mb-1">💰 Economia</div>
                      <div className="text-sm text-muted-foreground">
                        Máximo aproveitamento e menor custo
                      </div>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={generatePlan.isPending || !ingredients.trim()}
                >
                  {generatePlan.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gerando seu plano...
                    </>
                  ) : (
                    "Gerar Meu Plano Semanal"
                  )}
                </Button>

                {generatePlan.isError && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
                    <strong>Erro ao gerar plano:</strong>{" "}
                    {generatePlan.error?.message || "Tente novamente"}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

