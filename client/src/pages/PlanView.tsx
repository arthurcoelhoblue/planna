import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Check,
  ChefHat,
  ChevronDown,
  Clock,
  Download,
  Lightbulb,
  Loader2,
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

  // Agrupa lista de compras por categoria
  const groupedShopping = shoppingList.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

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
            <Link href="/planner">
              <Button variant="ghost">Novo Plano</Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost">Histórico</Button>
            </Link>
          </nav>
        </div>
      </header>

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
                        // Abre o HTML em uma nova janela para imprimir
                        const printWindow = window.open("", "_blank");
                        if (printWindow) {
                          printWindow.document.write(data.html);
                          printWindow.document.close();
                          printWindow.focus();
                          setTimeout(() => printWindow.print(), 500);
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
                Enviar para WhatsApp
              </Button>
            </div>
          </div>

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
    </div>
  );
}

