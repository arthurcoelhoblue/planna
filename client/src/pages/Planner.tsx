import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ChefHat, Loader2, Camera, AlertCircle, X, ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { InfoTooltip } from "@/components/InfoTooltip";
import { ExclusionsModal } from "@/components/ExclusionsModal";
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
  const [planMode, setPlanMode] = useState<"weekly" | "single">("weekly");
  const [varieties, setVarieties] = useState([3]);
  const [allowNewIngredients, setAllowNewIngredients] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [shouldReplaceIngredients, setShouldReplaceIngredients] = useState<boolean | null>(null);

  const generatePlan = trpc.mealPlan.generate.useMutation({
    onSuccess: (data) => {
      setLocation(`/plan/${data.planId}`);
    },
  });

  const detectFromMultipleImages = trpc.ingredients.detectFromMultipleImages.useMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limita a 3 fotos
    if (uploadedImages.length >= 3) {
      alert("Você pode enviar no máximo 3 fotos");
      return;
    }

    const preview = URL.createObjectURL(file);
    const newImage: UploadedImage = {
      file,
      preview,
    };

    setUploadedImages([...uploadedImages, newImage]);
    
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
          const existing = ingredients.split(",").map(i => i.trim()).filter(Boolean);
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

    try {
      generatePlan.mutate({
        ingredients: ingredients.trim(),
        servings: planMode === "single" ? 1 : servings[0],
        exclusions,
        objective,
        varieties: planMode === "single" ? 1 : varieties[0],
        allowNewIngredients,
        sophistication,
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
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  />
                  <p className="text-sm text-muted-foreground">
                    {uploadedImages.length > 0
                      ? "Clique em 'Detectar Ingredientes' para preencher automaticamente"
                      : "Digite manualmente ou use fotos para detecção automática"}
                  </p>
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
    </div>
  );
}

