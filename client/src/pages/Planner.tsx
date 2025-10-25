import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ChefHat, Loader2, Camera, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { InfoTooltip } from "@/components/InfoTooltip";
import { ExclusionsModal } from "@/components/ExclusionsModal";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Planner() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ingredients, setIngredients] = useState("");
  const [servings, setServings] = useState([10]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [showExclusionsModal, setShowExclusionsModal] = useState(false);
  const [objective, setObjective] = useState<"desperdicio" | "custo">("desperdicio");
  const [varieties, setVarieties] = useState([3]);
  const [allowNewIngredients, setAllowNewIngredients] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const generatePlan = trpc.mealPlan.generate.useMutation({
    onSuccess: (data) => {
      setLocation(`/plan/${data.planId}`);
    },
  });

  const parseIngredientsFromText = trpc.ingredients.parse.useMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsProcessingImage(true);

    // TODO: Implementar detecção de ingredientes por imagem
    // Por enquanto, apenas simula o processamento
    setTimeout(() => {
      setIsProcessingImage(false);
      setIngredients(
        "frango, arroz, feijão, cenoura, brócolis, batata, ovos, tomate, cebola, alho"
      );
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    try {
      generatePlan.mutate({
        ingredients: ingredients.trim(),
        servings: servings[0],
        exclusions,
        objective: objective === "desperdicio" ? "praticidade" : "economia",
      });
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
    }
  };

  // Extrai ingredientes do texto para o modal de exclusões
  const availableIngredients = ingredients
    .split(/[,;\n]/)
    .map((i) => i.trim())
    .filter((i) => i.length > 0);

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
                  <div className="flex items-center">
                    <Label htmlFor="ingredients">
                      O que você tem em casa? <span className="text-destructive">*</span>
                    </Label>
                    <InfoTooltip
                      content="Liste todos os ingredientes disponíveis na sua geladeira, despensa ou armário. Pode ser texto livre!"
                      examples={[
                        "Geladeira: frango, ovos, leite, queijo",
                        "Despensa: arroz, feijão, macarrão, óleo",
                        "Hortifruti: tomate, cebola, alho, cenoura",
                      ]}
                    />
                  </div>
                  <Textarea
                    id="ingredients"
                    placeholder="Ex: frango, arroz, feijão, cenoura, brócolis, batata, ovos, tomate, cebola, alho..."
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    rows={4}
                    required
                    disabled={isProcessingImage}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingImage}
                      className="gap-2"
                    >
                      {isProcessingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processando imagem...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          Detectar por foto
                        </>
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tire uma foto da geladeira ou armário
                    </p>
                  </div>
                </div>

                {/* Número de marmitas */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Label htmlFor="servings">
                      Quantas marmitas você quer? <span className="text-destructive">*</span>
                    </Label>
                    <InfoTooltip
                      content="Defina quantas refeições você precisa preparar para a semana"
                      examples={["8-10 marmitas: 1 pessoa, 5 dias", "12-14 marmitas: 2 pessoas, 5 dias"]}
                    />
                  </div>
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
                </div>

                {/* Número de variedades */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Label htmlFor="varieties">Quantas "misturas" diferentes na semana?</Label>
                    <InfoTooltip
                      content="Defina quantos pratos principais diferentes você quer preparar (ex: frango grelhado, carne moída, peixe assado)"
                      examples={[
                        "3 misturas: mais simples e rápido",
                        "4-5 misturas: mais variedade, menos repetição",
                      ]}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="varieties"
                      min={2}
                      max={6}
                      step={1}
                      value={varieties}
                      onValueChange={setVarieties}
                      className="flex-1"
                    />
                    <div className="w-16 text-center font-semibold text-lg">{varieties[0]}</div>
                  </div>
                </div>

                {/* Exclusões */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>Deseja evitar algum ingrediente?</Label>
                    <InfoTooltip
                      content="Selecione ingredientes que você não quer nas receitas (alergias, restrições ou preferências)"
                      examples={["Alergias: lactose, glúten, amendoim", "Preferências: pimentão, coentro"]}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowExclusionsModal(true)}
                    className="w-full"
                  >
                    {exclusions.length > 0
                      ? `${exclusions.length} ingrediente(s) selecionado(s)`
                      : "Selecionar ingredientes a evitar"}
                  </Button>
                  {exclusions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exclusions.slice(0, 5).map((item, index) => (
                        <div
                          key={index}
                          className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm"
                        >
                          {item}
                        </div>
                      ))}
                      {exclusions.length > 5 && (
                        <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                          +{exclusions.length - 5} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Abertura para novos ingredientes */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="allowNew"
                      checked={allowNewIngredients}
                      onCheckedChange={(checked) => setAllowNewIngredients(checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="allowNew"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Pode sugerir ingredientes novos
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Permita que o sistema sugira pratos com ingredientes que você não tem, mas
                        que esteja disposto a comprar (se te agradar)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Objetivo */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>Qual seu objetivo principal?</Label>
                    <InfoTooltip
                      content="Escolha o foco do seu planejamento"
                      examples={[
                        "Redução de desperdício: aproveita cascas, talos e sobras",
                        "Menor custo: prioriza ingredientes mais baratos",
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setObjective("desperdicio")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        objective === "desperdicio"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold mb-1">♻️ Redução de Desperdício</div>
                      <div className="text-sm text-muted-foreground">
                        Aproveita cascas, talos e sobras
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setObjective("custo")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        objective === "custo"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold mb-1">💰 Menor Custo</div>
                      <div className="text-sm text-muted-foreground">
                        Prioriza ingredientes mais baratos
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
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Erro ao gerar plano:</strong>{" "}
                      {generatePlan.error?.message || "Tente novamente em alguns instantes"}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de Exclusões */}
      <ExclusionsModal
        open={showExclusionsModal}
        onOpenChange={setShowExclusionsModal}
        availableIngredients={availableIngredients}
        currentExclusions={exclusions}
        onSave={setExclusions}
      />
    </div>
  );
}

