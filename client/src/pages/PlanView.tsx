import { useAuth } from "@/_core/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import ShareModal from "@/components/ShareModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/DashboardLayout";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  Check,
  ChefHat,
  ChevronDown,
  Clock,
  Download,
  Lightbulb,
  Loader2,
  Share2,
  ShoppingCart,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";

export default function PlanView() {
  const { planId } = useParams<{ planId: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const { data: plan, isLoading } = trpc.mealPlan.getById.useQuery(
    { planId: parseInt(planId || "0") },
    { enabled: !!planId && isAuthenticated }
  );

  const submitFeedback = trpc.feedback.submit.useMutation();
  const exportPDF = trpc.mealPlan.exportPDF.useMutation();
  const { data: whatsappData } = trpc.mealPlan.getWhatsAppText.useQuery(
    { planId: parseInt(planId || "0") },
    { enabled: !!planId && isAuthenticated }
  );

  const handleFeedback = (dishName: string, rating: "liked" | "disliked") => {
    if (!planId) return;
    submitFeedback.mutate({
      planId: parseInt(planId),
      dishName,
      rating,
    });
  };

  const toggleCheck = (item: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(item)) {
      newChecked.delete(item);
    } else {
      newChecked.add(item);
    }
    setCheckedItems(newChecked);
  };

  const toggleStep = (order: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(order)) {
      newExpanded.delete(order);
    } else {
      newExpanded.add(order);
    }
    setExpandedSteps(newExpanded);
  };

  if (authLoading || isLoading) {
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
            <CardDescription>Você precisa estar logado para ver este plano</CardDescription>
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
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Plano não encontrado</CardTitle>
            <CardDescription>Este plano não existe ou você não tem acesso a ele</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/planner">
              <Button className="w-full">Criar Novo Plano</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse com tratamento de erro (dados podem vir como string ou objeto)
  const dishes = typeof plan.dishes === 'string' ? JSON.parse(plan.dishes) : plan.dishes;
  const shoppingList = typeof plan.shoppingList === 'string' ? JSON.parse(plan.shoppingList) : plan.shoppingList;
  const prepSchedule = typeof plan.prepSchedule === 'string' ? JSON.parse(plan.prepSchedule) : plan.prepSchedule;
  
  // Dados nutricionais (podem não existir em planos antigos)
  const planData = {
    totalKcal: plan.totalKcal,
    avgKcalPerServing: plan.avgKcalPerServing,
  };

  // Agrupa lista de compras por categoria
  const groupedShopping = shoppingList.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header do Plano */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Seu Plano Semanal</h1>
            <p className="text-lg text-muted-foreground">
              Plano criado em {new Date(plan.createdAt).toLocaleDateString("pt-BR")}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => {
                  if (!planId) return;
                  exportPDF.mutate(
                    { planId: parseInt(planId) },
                    {
                      onSuccess: (data) => {
                        // Cria um blob com o HTML e faz download
                        const blob = new Blob([data.html], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `plano-marmitas-${planId}.html`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        // Também abre em nova janela para impressão
                        const printWindow = window.open("", "_blank");
                        if (printWindow) {
                          printWindow.document.write(data.html);
                          printWindow.document.close();
                          printWindow.focus();
                        }
                      },
                    }
                  );
                }}
                disabled={exportPDF.isPending}
              >
                {exportPDF.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                Baixar PDF
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  if (whatsappData?.text) {
                    const encodedText = encodeURIComponent(whatsappData.text);
                    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
                  }
                }}
                disabled={!whatsappData}
              >
                <ShoppingCart className="w-5 h-5" />
                Enviar Tudo para WhatsApp
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  // Exportar apenas lista de compras
                  const shoppingText = `*🛍️ Lista de Compras - Planna*\n\n${shoppingList.map((cat: any) => 
                    `*${cat.category}*\n${cat.items.map((item: any) => `• ${item.quantity} ${item.unit} de ${item.item}`).join('\n')}`
                  ).join('\n\n')}`;
                  const encodedText = encodeURIComponent(shoppingText);
                  window.open(`https://wa.me/?text=${encodedText}`, "_blank");
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                Lista de Compras (WhatsApp)
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2 className="w-5 h-5" />
                Compartilhar
              </Button>
            </div>
          </div>

          {/* Misturas e Porções - Pedidas vs Geradas */}
          {(plan.requestedVarieties || plan.requestedServings) && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  🎯 Resumo do Plano
                </CardTitle>
                <CardDescription>
                  Comparação entre o que foi pedido e o que foi gerado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Misturas */}
                  {plan.requestedVarieties && (
                    <div className="bg-white/60 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Misturas (Variedades)</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-700">
                          {dishes.length}
                        </span>
                        <span className="text-sm text-muted-foreground">/</span>
                        <span className="text-lg text-muted-foreground">
                          {plan.requestedVarieties} pedidas
                        </span>
                      </div>
                      {dishes.length !== plan.requestedVarieties && (
                        <p className="text-xs text-amber-600 mt-2">
                          ⚠️ O sistema ajustou o número de misturas
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Porções */}
                  {plan.requestedServings && (
                    <div className="bg-white/60 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Porções Totais</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-700">
                          {dishes.reduce((sum: number, dish: any) => sum + dish.servings, 0)}
                        </span>
                        <span className="text-sm text-muted-foreground">/</span>
                        <span className="text-lg text-muted-foreground">
                          {plan.requestedServings} pedidas
                        </span>
                      </div>
                      {dishes.reduce((sum: number, dish: any) => sum + dish.servings, 0) < plan.requestedServings && (
                        <p className="text-xs text-amber-600 mt-2">
                          ⚠️ O sistema gerou menos porções que o solicitado
                        </p>
                      )}
                    </div>
                  )}
                </div>
                

              </CardContent>
            </Card>
          )}

          {/* Ajustes Automáticos */}
          {plan.adjustmentReason && plan.adjustmentReason.trim().length > 0 ? (
            <div className="border rounded-xl bg-yellow-50 border-yellow-300 p-4 mt-6">
              <h2 className="text-lg font-semibold text-yellow-700 mb-1">
                ⚠️ Ajustes automáticos
              </h2>
              <p className="text-sm text-yellow-800 leading-relaxed whitespace-pre-line">
                {plan.adjustmentReason}
              </p>
            </div>
          ) : (
            <div className="border rounded-xl bg-gray-50 border-gray-200 p-4 mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-1">
                ℹ️ Ajustes do Plano
              </h2>
              <p className="text-sm text-gray-600">
                Plano gerado conforme solicitado, sem ajustes automáticos.
              </p>
            </div>
          )}

          {/* Parâmetros do Plano */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚙️ Parâmetros do Plano
              </CardTitle>
              <CardDescription>
                Configurações usadas para gerar este plano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {/* Badge de Dieta */}
                <Badge variant="outline" className="text-sm">
                  🥗 Dieta: {plan.dietType || "Não especificada"}
                </Badge>
                
                {/* Badge de Modo */}
                <Badge variant="outline" className="text-sm">
                  🔄 Modo: {plan.mode === "aproveitamento" ? "Aproveitamento total" : "Normal"}
                </Badge>
                
                {/* Badge de Nível */}
                <Badge variant="outline" className="text-sm">
                  👨‍🍳 Nível: {plan.skillLevel === "beginner" ? "Iniciante" : plan.skillLevel === "intermediate" ? "Intermediário" : "Avançado"}
                </Badge>
                
                {/* Badge de Tempo Disponível */}
                {plan.availableTime && (
                  <Badge variant="outline" className="text-sm">
                    ⏰ Tempo disponível: {plan.availableTime}h
                  </Badge>
                )}
                
                {/* Badge de Tempo Estimado */}
                {plan.totalPlanTime && (
                  <Badge variant="outline" className="text-sm">
                    ⏱️ Tempo estimado: {Math.round(plan.totalPlanTime / 60)}h{plan.totalPlanTime % 60 > 0 ? `${plan.totalPlanTime % 60}min` : ''} (margem: ~30-50%)
                  </Badge>
                )}
                
                {/* Badge de Novos Ingredientes */}
                {plan.allowNewIngredients === false && (
                  <Badge variant="secondary" className="text-sm">
                    🚫 Novos ingredientes: Não
                  </Badge>
                )}
                
                {/* Badge de Limite Calórico */}
                {plan.maxKcalPerServing && (
                  <Badge variant="outline" className="text-sm">
                    🔥 Limite: {plan.maxKcalPerServing} kcal/porção
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumo Nutricional */}
          {(planData.totalKcal || planData.avgKcalPerServing) && (
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  🍎 Informações Nutricionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {planData.totalKcal && (
                    <div className="bg-white/60 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Calorias Totais do Plano</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {Math.round(planData.totalKcal).toLocaleString()} kcal
                      </p>
                    </div>
                  )}
                  {planData.avgKcalPerServing && (
                    <div className="bg-white/60 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Média por Porção</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {Math.round(planData.avgKcalPerServing)} kcal
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aviso de Tempo Insuficiente */}
          {plan.timeFits === false && plan.availableTime && plan.totalPlanTime && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>⚠️ Atenção: Tempo Apertado</strong>
                <p className="mt-2">
                  Com o tempo que você informou ({plan.availableTime}h), este plano pode ficar apertado. 
                  O tempo estimado é de <strong>{Math.round(plan.totalPlanTime / 60)}h{plan.totalPlanTime % 60 > 0 ? `${plan.totalPlanTime % 60}min` : ''}</strong>.
                </p>
                <p className="mt-2">
                  <strong>Considere:</strong>
                </p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Reduzir o número de marmitas</li>
                  <li>Simplificar as receitas</li>
                  <li>Cozinhar em mais de uma sessão</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Cardápio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-6 h-6" />
                Cardápio da Semana
              </CardTitle>
              <CardDescription>
                {dishes.length} pratos base para suas marmitas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {dishes.map((dish: any, index: number) => (
                <div key={index} className="border-b last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold">{dish.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dish.servings} porções • {dish.prepTime} min
                        {dish.kcalPerServing && (
                          <span className="ml-2 font-medium text-orange-600">
                            • {Math.round(dish.kcalPerServing)} kcal/porção
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFeedback(dish.name, "liked")}
                        className="gap-1"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFeedback(dish.name, "disliked")}
                        className="gap-1"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Ingredientes:</h4>
                       <ul className="text-sm space-y-1 text-muted-foreground">
                        {dish.ingredients.map((ing: any, i: number) => (
                          <li key={i}>
                            • {ing.name}: {ing.quantity} {ing.unit}
                            {ing.kcal && (
                              <span className="text-xs text-orange-600 ml-1">
                                ({Math.round(ing.kcal)} kcal)
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Modo de preparo:</h4>
                      <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                        {dish.steps.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {dish.variations && dish.variations.length > 0 && (
                    <div className="mt-3 bg-accent/10 p-3 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">💡 Variações:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        {dish.variations.map((variation: string, i: number) => (
                          <li key={i}>• {variation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Lista de Compras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Lista de Compras
              </CardTitle>
              <CardDescription>
                Tudo que você precisa comprar, organizado por seção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(groupedShopping).map(([category, items]: [string, any]) => (
                  <div key={category}>
                    <h3 className="font-semibold mb-3 text-primary">{category}</h3>
                    <ul className="space-y-2">
                      {items.map((item: any, index: number) => {
                        const itemKey = `${category}-${item.item}-${index}`;
                        const isChecked = checkedItems.has(itemKey);
                        return (
                          <li key={index}>
                            <button
                              onClick={() => toggleCheck(itemKey)}
                              className={`flex items-center gap-3 w-full text-left p-2 rounded hover:bg-muted/50 transition-colors ${
                                isChecked ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isChecked
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 text-primary-foreground" />}
                              </div>
                              <span className="flex-1">
                                {item.item} - {item.quantity} {item.unit}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Roteiro de Preparo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Roteiro de Preparo Otimizado
              </CardTitle>
              <CardDescription>
                Siga esta ordem para preparar tudo de forma eficiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prepSchedule
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((step: any, index: number) => {
                    const isExpanded = expandedSteps.has(step.order);
                    const hasDetails = step.details && step.details.length > 0;
                    return (
                      <div
                        key={index}
                        className="bg-muted/30 rounded-lg overflow-hidden border border-border/50"
                      >
                        <button
                          onClick={() => hasDetails && toggleStep(step.order)}
                          className={`flex items-start gap-4 p-4 w-full text-left transition-colors ${
                            hasDetails ? "hover:bg-muted/50 cursor-pointer" : "cursor-default"
                          }`}
                        >
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                            {step.order}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{step.action}</p>
                            <p className="text-sm text-muted-foreground">
                              {step.duration} min
                              {step.parallel && " • Pode fazer em paralelo"}
                            </p>
                            {hasDetails && (
                              <p className="text-xs text-primary mt-1">
                                Clique para ver detalhes →
                              </p>
                            )}
                          </div>
                          {hasDetails && (
                            <ChevronDown
                              className={`w-5 h-5 text-muted-foreground transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </button>

                        {hasDetails && isExpanded && (
                          <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-4 bg-background/50">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                👨‍🍳 Passo a passo detalhado:
                              </h4>
                              <ol className="space-y-2 text-sm">
                                {step.details.map((detail: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="font-semibold text-primary min-w-[1.5rem]">
                                      {i + 1}.
                                    </span>
                                    <span className="text-muted-foreground">{detail}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {step.tips && (
                              <div className="bg-accent/20 p-3 rounded-lg">
                                <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                                  Dica:
                                </h4>
                                <p className="text-sm text-muted-foreground">{step.tips}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center py-8">
            <Link href="/planner">
              <Button size="lg">Criar Outro Plano</Button>
            </Link>
          </div>
        </div>
        </main>
        <AuthModal
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          defaultMode={authMode}
        />
        <ShareModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          planId={parseInt(planId || "0")}
        />
      </div>
    </DashboardLayout>
  );
}

