import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BarChart3, ChefHat, Clock, Package, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: subscription, isLoading: subLoading } = trpc.dashboard.subscription.useQuery();

  // Preferences form
  const [dietType, setDietType] = useState("");
  const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [maxKcal, setMaxKcal] = useState("");

  const updatePreferences = trpc.dashboard.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferências atualizadas com sucesso!");
      utils.dashboard.stats.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar preferências");
    },
  });

  const handleSavePreferences = () => {
    updatePreferences.mutate({
      dietType: dietType || undefined,
      skillLevel,
      maxKcalPerServing: maxKcal ? parseInt(maxKcal) : undefined,
    });
  };

  // Stripe portal
  const createPortalSession = trpc.subscription.createPortalSession.useMutation({
    onSuccess: (data: any) => {
      window.location.href = data.portalUrl;
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao abrir portal de assinatura");
    },
  });

  const handleManageSubscription = () => {
    createPortalSession.mutate();
  };

  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data: any) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar checkout");
    },
  });

  const handleUpgrade = (tier: "pro" | "premium") => {
    // Get priceId from pricing plans
    const { PRICING_PLANS } = require("../../../server/stripe-products");
    const plan = PRICING_PLANS.find((p: any) => p.id === tier);
    if (!plan || !plan.priceId) {
      toast.error("Plano não encontrado");
      return;
    }
    createCheckout.mutate({ priceId: plan.priceId });
  };

  if (statsLoading || subLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const tierLabels = {
    free: "Gratuito",
    pro: "Pro",
    premium: "Premium",
  };

  const tierColors = {
    free: "bg-gray-100 text-gray-800",
    pro: "bg-green-100 text-green-800",
    premium: "bg-purple-100 text-purple-800",
  };

  return (
    <DashboardLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo de volta, {user?.name}! Aqui está um resumo da sua atividade.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planos Este Mês</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.monthlyPlans || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalPlans || 0} planos no total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Economizado</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.timeSavedHours || 0}h</div>
              <p className="text-xs text-muted-foreground">
                ~2h por plano criado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingredientes Usados</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.topIngredients?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Ingredientes diferentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas Geradas</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.topRecipes?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Receitas únicas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Evolution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Evolução de Planos
            </CardTitle>
            <CardDescription>Últimos 6 meses de atividade</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.plansByMonth && stats.plansByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.plansByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    dot={{ fill: '#16a34a', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Planos Criados"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum dado de evolução ainda. Crie mais planos para ver o gráfico!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ingredientes Mais Usados
              </CardTitle>
              <CardDescription>Seus ingredientes favoritos</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.topIngredients && stats.topIngredients.length > 0 ? (
                <div className="space-y-3">
                  {stats.topIngredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <span className="capitalize">{ing.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{ing.count}x</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum ingrediente usado ainda. Crie seu primeiro plano!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Recipes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Receitas Mais Geradas
              </CardTitle>
              <CardDescription>Suas receitas favoritas</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.topRecipes && stats.topRecipes.length > 0 ? (
                <div className="space-y-3">
                  {stats.topRecipes.map((recipe, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <span className="capitalize">{recipe.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{recipe.count}x</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma receita gerada ainda. Crie seu primeiro plano!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subscription Section */}
        <Card>
          <CardHeader>
            <CardTitle>Minha Assinatura</CardTitle>
            <CardDescription>Gerencie sua assinatura e plano</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Plano Atual</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tierColors[subscription?.tier || "free"]
                    }`}
                  >
                    {tierLabels[subscription?.tier || "free"]}
                  </span>
                  {subscription?.subscription?.status && (
                    <span className="text-xs text-muted-foreground">
                      ({subscription.subscription.status})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {subscription?.tier === "free" ? (
                  <>
                    <Button onClick={() => handleUpgrade("pro")} variant="default">
                      Upgrade para Pro
                    </Button>
                    <Button onClick={() => handleUpgrade("premium")} variant="outline">
                      Upgrade para Premium
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleManageSubscription} variant="outline">
                    Gerenciar Assinatura
                  </Button>
                )}
              </div>
            </div>

            {subscription?.subscription?.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                Próxima renovação:{" "}
                {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Minhas Preferências</CardTitle>
            <CardDescription>
              Configure suas preferências padrão para facilitar a criação de planos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dietType">Tipo de Dieta</Label>
                <Input
                  id="dietType"
                  placeholder="Ex: Vegetariana, Vegana, Low Carb"
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skillLevel">Nível de Experiência</Label>
                <Select value={skillLevel} onValueChange={(v: any) => setSkillLevel(v)}>
                  <SelectTrigger id="skillLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">👶 Iniciante</SelectItem>
                    <SelectItem value="intermediate">👨‍🍳 Intermediário</SelectItem>
                    <SelectItem value="advanced">👨‍🍳 Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxKcal">Limite de Calorias por Porção</Label>
                <Input
                  id="maxKcal"
                  type="number"
                  placeholder="Ex: 600"
                  value={maxKcal}
                  onChange={(e) => setMaxKcal(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleSavePreferences} disabled={updatePreferences.isPending}>
              {updatePreferences.isPending ? "Salvando..." : "Salvar Preferências"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

