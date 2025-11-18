import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ChefHat, Loader2, Camera, AlertCircle, X, ImageIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { InfoTooltip } from "@/components/InfoTooltip";
import { ExclusionsModal } from "@/components/ExclusionsModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { AuthModal } from "@/components/AuthModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { StockWarningModal } from "@/components/StockWarningModal";
import { validateStock } from "@/utils/stockValidation";
import { parseIngredients } from "../../../server/ingredients-dictionary";
import { storagePut } from "../../../server/storage";
interface UploadedImage {
  file: File;
  preview: string;
  url?: string;
}

export default function Planner() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ingredients, setIngredients] = useState("");
  const [servings, setServings] = useState([10]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [showExclusionsModal, setShowExclusionsModal] = useState(false);
  const [objective, setObjective] = useState<"normal" | "aproveitamento">("normal");
  const [sophistication, setSophistication] = useState<"simples" | "gourmet">("simples");
  const [calorieLimit, setCalorieLimit] = useState<number | null>(null);
  const [planMode, setPlanMode] = useState<"weekly" | "single">("weekly");
  const [varieties, setVarieties] = useState([3]);
  const [allowNewIngredients, setAllowNewIngredients] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [shouldReplaceIngredients, setShouldReplaceIngredients] = useState<boolean | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [stockWarningOpen, setStockWarningOpen] = useState(false);
  const [insufficientIngredients, setInsufficientIngredients] = useState<Array<{
    name: string;
    available: number;
    needed: number;
    unit: string;
  }>>([]);
  const [pendingGeneration, setPendingGeneration] = useState<any>(null);
  const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [availableTime, setAvailableTime] = useState<number | null>(null);
  const [dietType, setDietType] = useState<string>("");

  const { data: preferences } = trpc.preferences.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mostrar onboarding se usuário autenticado e sem preferências
  useEffect(() => {
    if (isAuthenticated && preferences === null) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, preferences]);

  const generatePlan = trpc.mealPlan.generate.useMutation({
    onSuccess: (data) => {
      setLocation(`/plan/${data.planId}`);
    },
    onError: (error) => {
      // Detecta erro de limite de planos
      if (error.message.includes("limite") || error.message.includes("upgrade") || error.message.includes("plano")) {
        setUpgradeReason(error.message);
        setUpgradeModalOpen(true);
      } else {
        alert(error.message);
      }
    },
  });

  const detectFromMultipleImages = trpc.ingredients.detectFromMultipleImages.useMutation();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = [];
    const remainingSlots = 3 - uploadedImages.length;
    const filesToAdd = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      const preview = URL.createObjectURL(file);
      newImages.push({
        file,
        preview,
      });
    }

    setUploadedImages([...uploadedImages, ...newImages]);
    
    // Limpa o input para permitir upload da mesma imagem novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
  };

  const handleDetectIngredients = async () => {
    if (uploadedImages.length === 0) {
      alert("Por favor, adicione pelo menos uma foto");
      return;
    }

    // Se já tem ingredientes, perguntar se quer substituir
    if (ingredients.trim() && shouldReplaceIngredients === null) {
      const replace = window.confirm(
        "Você já tem ingredientes no campo. Deseja:\n\nOK = Substituir tudo\nCancelar = Adicionar aos existentes"
      );
      setShouldReplaceIngredients(replace);
      if (!replace) {
        // Continua com a detecção, mas vai adicionar
      }
    }

    setIsProcessingImages(true);

    try {
      // Upload das imagens para S3 primeiro
      const uploadedUrls: Array<{ url: string }> = [];
      
      for (const img of uploadedImages) {
        // Converte File para base64 ou Blob
        const reader = new FileReader();
        const fileData = await new Promise<ArrayBuffer>((resolve) => {
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.readAsArrayBuffer(img.file);
        });

        // Faz upload para S3 usando a API do servidor
        const response = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: fileData,
        });

        if (!response.ok) {
          throw new Error("Erro ao fazer upload da imagem");
        }

        const { url } = await response.json();
        uploadedUrls.push({ url });
      }

      // Detecta ingredientes nas imagens
      const result = await detectFromMultipleImages.mutateAsync({
        images: uploadedUrls,
      });

      // Atualiza o campo de ingredientes
      if (result.ingredients && result.ingredients.length > 0) {
        const newIngredients = result.ingredients.join(", ");
        
        // Se deve substituir ou se não tem ingredientes ainda
        if (shouldReplaceIngredients || !ingredients.trim()) {
          setIngredients(newIngredients);
        } else {
          // Adiciona aos existentes
          const existing = ingredients
            .replace(/(\d),(\d)/g, "$1·$2") // Protege vírgula decimal
            .split(",")
            .map(i => i.trim().replace(/·/g, ",")) // Restaura vírgula
            .filter(Boolean);
          const detected = result.ingredients;
          const uniqueSet = new Set([...existing, ...detected]);
          const combined = Array.from(uniqueSet);
          setIngredients(combined.join(", "));
        }
        
        // Reseta o estado de substituição
        setShouldReplaceIngredients(null);
      } else {
        alert("Não foi possível detectar ingredientes nas imagens. Tente com fotos mais claras.");
      }
    } catch (error) {
      console.error("Erro ao detectar ingredientes:", error);
      alert("Erro ao processar as imagens. Tente novamente.");
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    const generationParams = {
      ingredients: ingredients.trim(),
      servings: planMode === "single" ? 1 : servings[0],
      exclusions,
      objective,
      varieties: planMode === "single" ? 1 : varieties[0],
      allowNewIngredients,
      sophistication,
      skillLevel,
      availableTime: availableTime || undefined,
      dietType: dietType || undefined,
      calorieLimit: calorieLimit || undefined,
    };

    // Valida estoque se houver quantidades informadas
    const parsed = parseIngredients(ingredients.trim());
    const withQuantities = parsed.filter(p => p.quantity && p.inputUnit);
    
    if (withQuantities.length > 0) {
      const insufficient = validateStock(
        withQuantities.map(p => ({
          name: p.canonical || p.original,
          quantity: p.quantity,
          unit: p.inputUnit,
        })),
        generationParams.servings
      );

      if (insufficient.length > 0) {
        // Mostra modal de aviso
        setInsufficientIngredients(insufficient);
        setPendingGeneration(generationParams);
        setStockWarningOpen(true);
        return;
      }
    }

    // Se passou na validação ou não tem quantidades, gera direto
    try {
      generatePlan.mutate(generationParams);
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
    }
  };

  const handleContinueWithWarning = () => {
    setStockWarningOpen(false);
    if (pendingGeneration) {
      try {
        generatePlan.mutate(pendingGeneration);
      } catch (error) {
        console.error("Erro ao gerar plano:", error);
      }
    }
  };

  const handleAdjustStock = () => {
    setStockWarningOpen(false);
    setPendingGeneration(null);
    // Usuário volta para o formulário para ajustar
  };

  // Extrai ingredientes do texto para o modal de exclusões
  const availableIngredients = ingredients
    .replace(/(\d),(\d)/g, "$1·$2") // Protege vírgula decimal
    .split(/[,;\n]/)
    .map((i) => i.trim().replace(/·/g, ",")) // Restaura vírgula
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
            <Button
              className="w-full"
              onClick={() => {
                setAuthMode("login");
                setAuthModalOpen(true);
              }}
            >
              Fazer Login
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setAuthMode("register");
                setAuthModalOpen(true);
              }}
            >
              Criar Conta
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full">
                Voltar para Home
              </Button>
            </Link>
          </CardContent>
        </Card>

        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} defaultMode={authMode} />
      </div>
    );
  }

  return (
    <DashboardLayout>
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

      <OnboardingModal
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />

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
                {/* Seletor de Modo */}
                <div className="space-y-3">
                  <Label>Tipo de Plano</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPlanMode("weekly")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        planMode === "weekly"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold mb-1">📅 Plano Semanal</div>
                      <div className="text-sm text-muted-foreground">
                        Várias receitas para a semana toda
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanMode("single")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        planMode === "single"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold mb-1">🍽️ Receita do Dia</div>
                      <div className="text-sm text-muted-foreground">
                        Uma receita rápida para hoje
                      </div>
                    </button>
                  </div>
                </div>
                {/* Upload de Imagens */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Label>Detectar ingredientes por foto (opcional)</Label>
                    <InfoTooltip
                      content="Tire ou escolha fotos dos seus ingredientes. A IA vai identificar automaticamente!"
                      examples={[
                        "Tire fotos da geladeira, armário ou despensa",
                        "Ou escolha fotos da galeria",
                        "Até 3 fotos por vez",
                      ]}
                    />
                  </div>

                  {/* Botão de upload */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadedImages.length >= 3}
                      className="gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Adicionar foto ({uploadedImages.length}/3)
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {uploadedImages.length > 0 && (
                      <Button
                        type="button"
                        onClick={handleDetectIngredients}
                        disabled={isProcessingImages}
                        className="gap-2"
                      >
                        {isProcessingImages ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Detectando...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-4 h-4" />
                            Detectar Ingredientes
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Preview das imagens */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-border"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                            aria-label="Remover foto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ingredientes (texto) */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="ingredients">
                      O que você tem em casa? <span className="text-destructive">*</span>
                    </Label>
                    <InfoTooltip
                      content="Liste todos os ingredientes disponíveis. Pode informar quantidades para controle de estoque!"
                      examples={[
                        "Com quantidade: 2kg frango, 500g arroz, 10 ovos",
                        "Sem quantidade: frango, arroz, feijão, batata",
                        "Misto: 1kg frango, arroz, 500g queijo, tomate",
                      ]}
                    />
                  </div>
                  <Textarea
                    id="ingredients"
                    placeholder="Ex: 2kg frango, 500g arroz, 10 ovos, 1kg batata, tomate, cebola..."
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {uploadedImages.length > 0
                      ? "Clique em 'Detectar Ingredientes' para preencher automaticamente"
                      : "Digite manualmente ou use fotos para detecção automática"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    💡 Dica: Você pode usar vírgula ou ponto para decimais (ex: 1,5 kg ou 1.5 kg de frango)
                  </p>

                  {/* Preview de estoque parseado */}
                  {ingredients.trim() && (() => {
                    const parsed = ingredients
                      .replace(/(\d),(\d)/g, "$1·$2") // Protege vírgula decimal
                      .split(/[,;\n]/)
                      .map(item => item.trim().replace(/·/g, ",")) // Restaura vírgula
                      .filter(item => item.length > 0)
                      .map(item => {
                        // Tenta extrair quantidade: "2kg frango" -> { qty: 2, unit: "kg", name: "frango" }
                        const qtyMatch = item.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Zçãõéêíóú]+)?\s+(.*)$/);
                        if (qtyMatch) {
                          return {
                            original: item,
                            quantity: parseFloat(qtyMatch[1].replace(",", ".")),
                            unit: qtyMatch[2] || "",
                            name: qtyMatch[3],
                          };
                        }
                        return { original: item, name: item };
                      });

                    const withQty = parsed.filter(p => p.quantity !== undefined);
                    const withoutQty = parsed.filter(p => p.quantity === undefined);

                    if (withQty.length === 0) return null;

                    return (
                      <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                          📦 Estoque detectado ({withQty.length} com quantidade):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {withQty.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border border-orange-300 dark:border-orange-700"
                            >
                              <span className="font-semibold text-orange-600 dark:text-orange-400">
                                {item.quantity}{item.unit}
                              </span>
                              {" "}
                              <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                            </div>
                          ))}
                        </div>
                        {withoutQty.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            + {withoutQty.length} sem quantidade especificada
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Número de marmitas (apenas para plano semanal) */}
                {planMode === "weekly" && (
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
                )}

                {/* Número de variedades (apenas para plano semanal) */}
                {planMode === "weekly" && (
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
                )}

                {/* Nível de Sofisticação */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>Nível de sofisticação</Label>
                    <InfoTooltip
                      content="Escolha o estilo das receitas"
                      examples={[
                        "Simples: receitas práticas e descomplicadas",
                        "Gourmet: técnicas elaboradas e apresentação refinada",
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSophistication("simples")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        sophistication === "simples"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold mb-1">🍳 Simples</div>
                      <div className="text-sm text-muted-foreground">
                        Prático e descomplicado
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSophistication("gourmet")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        sophistication === "gourmet"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold mb-1">👨‍🍳 Gourmet</div>
                      <div className="text-sm text-muted-foreground">
                        Elaborado e refinado
                      </div>
                    </button>
                  </div>
                </div>

                {/* Limite Calórico */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>Limite de calorias por porção (opcional)</Label>
                    <InfoTooltip
                      content="Defina um limite máximo de calorias por porção. O sistema ajustará as receitas automaticamente."
                      examples={[
                        "400-600 kcal: refeição leve",
                        "600-800 kcal: refeição padrão",
                        "800+ kcal: refeição completa",
                      ]}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Ex: 600"
                      value={calorieLimit || ""}
                      onChange={(e) => setCalorieLimit(e.target.value ? parseInt(e.target.value) : null)}
                      min="200"
                      max="2000"
                      step="50"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">kcal</span>
                  </div>
                </div>

                {/* Nível de Experiência */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>Nível de experiência na cozinha</Label>
                    <InfoTooltip
                      content="Escolha seu nível para receitas adequadas à sua habilidade"
                      examples={[
                        "Iniciante: receitas simples, até 7 passos",
                        "Intermediário: receitas moderadas, até 10 passos",
                        "Avançado: receitas elaboradas, sem limite de passos",
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSkillLevel("beginner")}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        skillLevel === "beginner"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">👶 Iniciante</div>
                      <div className="text-xs text-muted-foreground">Até 7 passos</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkillLevel("intermediate")}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        skillLevel === "intermediate"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">👨‍🍳 Intermediário</div>
                      <div className="text-xs text-muted-foreground">Até 10 passos</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkillLevel("advanced")}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        skillLevel === "advanced"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">👨‍🍳 Avançado</div>
                      <div className="text-xs text-muted-foreground">Sem limites</div>
                    </button>
                  </div>
                </div>

                {/* Tempo Disponível */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>Tempo disponível para cozinhar (opcional)</Label>
                    <InfoTooltip
                      content="Informe quanto tempo você tem por dia para preparar suas marmitas"
                      examples={[
                        "1-2 horas: receitas rápidas",
                        "3-4 horas: receitas moderadas",
                        "5+ horas: receitas elaboradas",
                      ]}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Ex: 2"
                      value={availableTime || ""}
                      onChange={(e) => setAvailableTime(e.target.value ? parseInt(e.target.value) : null)}
                      min="1"
                      max="24"
                      step="1"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">horas/dia</span>
                  </div>
                </div>

                {/* Tipo de Dieta */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>Tipo de dieta (opcional)</Label>
                    <InfoTooltip
                      content="Informe se você segue alguma dieta específica"
                      examples={[
                        "Vegetariana, Vegana, Low-carb",
                        "Sem gluten, Sem lactose",
                        "Paleo, Cetogênica",
                      ]}
                    />
                  </div>
                  <Input
                    type="text"
                    placeholder="Ex: Vegetariana"
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                  />
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
                      onClick={() => setObjective("normal")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        objective === "normal"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                           <div className="font-semibold">🍽️ Modo Normal</div>
                      <div className="text-sm text-muted-foreground">
                        Receitas tradicionais e práticas
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setObjective("aproveitamento")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        objective === "aproveitamento"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold">♻️ Aproveitamento Total</div>
                      <div className="text-sm text-muted-foreground">
                        Aproveita cascas, talos, sobras e reduz desperdício
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

        {/* Modal de Upgrade */}
        <UpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          reason={upgradeReason}
        />

        {/* Modal de Aviso de Estoque */}
        <StockWarningModal
          open={stockWarningOpen}
          onClose={() => setStockWarningOpen(false)}
          insufficientIngredients={insufficientIngredients}
          onContinue={handleContinueWithWarning}
          onAdjust={handleAdjustStock}
        />
      </div>
    </DashboardLayout>
  );
}

