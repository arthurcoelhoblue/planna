import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ChefHat, Clock, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function History() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: sessions, isLoading } = trpc.mealPlan.getHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

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
            <CardDescription>Você precisa estar logado para ver seu histórico</CardDescription>
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
            <Link href="/planner">
              <Button variant="ghost">Novo Plano</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">Histórico de Planos</h1>
            <p className="text-lg text-muted-foreground">
              Todos os seus planos de marmitas anteriores
            </p>
          </div>

          {!sessions || sessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum plano ainda</h3>
                <p className="text-muted-foreground mb-6">
                  Você ainda não criou nenhum plano de marmitas
                </p>
                <Link href="/planner">
                  <Button size="lg">Criar Meu Primeiro Plano</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Plano de {new Date(session.createdAt).toLocaleDateString("pt-BR")}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {session.servings} marmitas • Objetivo: {session.objective}
                        </CardDescription>
                      </div>
                      <Link href={`/plan/${session.id}`}>
                        <Button>Ver Plano</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Ingredientes usados:</span>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {session.inputText}
                        </p>
                      </div>
                      {session.exclusions && JSON.parse(session.exclusions).length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Exclusões:</span>
                          <p className="text-sm text-muted-foreground">
                            {JSON.parse(session.exclusions).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

