import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ChefHat, Clock, ShoppingCart, Sparkles, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function SharedPlan() {
  const [location] = useLocation();
  const token = location.split("/shared/")[1];

  const { data, isLoading, error } = trpc.share.getSharedPlan.useQuery(
    { token },
    { enabled: !!token }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando plano compartilhado...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Plano não encontrado</CardTitle>
            <CardDescription>
              Este link pode ter expirado ou sido revogado pelo criador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/")} className="w-full">
              Criar Meu Próprio Plano
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { plan, session } = data;
  const dishes = JSON.parse(plan.dishes);
  const shoppingList = JSON.parse(plan.shoppingList);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt="Logo" className="h-8" />
            <span className="font-bold text-lg">{APP_TITLE}</span>
          </div>
          <Button onClick={() => (window.location.href = "/")} variant="default">
            Criar Meu Plano
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Plano Compartilhado</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Plano de Marmitas</h1>
          <p className="text-xl text-green-50 max-w-2xl mx-auto">
            {session.servings} marmitas • {dishes.length} receitas • Modo{" "}
            {session.objective === "aproveitamento" ? "Aproveitamento Total" : "Normal"}
          </p>
        </div>
      </section>

      <div className="container py-8 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marmitas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session.servings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dishes.length}</div>
            </CardContent>
          </Card>

          {plan.totalKcal && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calorias Totais</CardTitle>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{plan.totalKcal}</div>
                <p className="text-xs text-muted-foreground">
                  ~{plan.avgKcalPerServing} kcal/porção
                </p>
              </CardContent>
            </Card>
          )}

          {plan.estimatedTime && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Estimado</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{plan.estimatedTime}h</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recipes */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            Receitas
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {dishes.map((dish: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{dish.name}</CardTitle>
                  <CardDescription>
                    {dish.servings} porções • {dish.prepTime} min
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Ingredientes:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {dish.ingredients?.map((ing: any, i: number) => (
                        <li key={i}>{ing.item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Modo de Preparo:</h4>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      {dish.steps?.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Shopping List */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Lista de Compras
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {shoppingList.map((category: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items?.map((item: any, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{item.item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Gostou deste plano?</h3>
            <p className="text-green-50 mb-4">
              Crie seus próprios planos personalizados com IA em segundos!
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="secondary"
              size="lg"
            >
              Começar Agora - É Grátis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

