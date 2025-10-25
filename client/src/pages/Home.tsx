import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_TITLE, getLoginUrl } from "@/const";
import { ChefHat, Clock, ShoppingCart, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">{APP_TITLE}</span>
          </div>
          <nav className="flex items-center gap-4">
            {loading ? null : isAuthenticated ? (
              <>
                <Link href="/planner">
                  <Button variant="ghost">Meu Planejador</Button>
                </Link>
                <Link href="/history">
                  <Button variant="ghost">Histórico</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="outline">Entrar</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-accent/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Planejamento automático com IA
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Monte sua semana de marmitas em{" "}
              <span className="text-primary">3 cliques</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sem pensar em cardápio. Sem desperdício. Sem complicação. Apenas diga o que tem na
              geladeira e deixe a IA criar seu plano semanal completo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {isAuthenticated ? (
                <Link href="/planner">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Começar Agora
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="text-lg px-8 py-6">
                    Testar Grátis
                  </Button>
                </a>
              )}
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Ver Como Funciona
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">90min</div>
                <div className="text-sm text-muted-foreground">Tempo de preparo</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">3-5</div>
                <div className="text-sm text-muted-foreground">Pratos diferentes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Personalizado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Como funciona o Planna
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">1. Diga o que tem</h3>
                <p className="text-muted-foreground">
                  Digite os ingredientes da sua geladeira. Pode ser texto livre, a IA entende.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">2. IA cria o plano</h3>
                <p className="text-muted-foreground">
                  Receitas balanceadas, lista de compras consolidada e roteiro de preparo otimizado.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">3. Cozinhe em lote</h3>
                <p className="text-muted-foreground">
                  Siga o roteiro de batch cooking e prepare tudo em cerca de 90 minutos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Por que usar o Planna?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-2">⏱️ Economize tempo</h3>
                <p className="text-muted-foreground">
                  Pare de perder horas pensando "o que vou comer?". O Planna decide por você em
                  segundos.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-2">💰 Reduza desperdício</h3>
                <p className="text-muted-foreground">
                  Use o que já tem na geladeira. Compre apenas o necessário. Gaste menos.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-2">🥗 Coma melhor</h3>
                <p className="text-muted-foreground">
                  Receitas balanceadas com proteína, carboidrato e legumes. Sem monotonia.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-2">📱 Leve para qualquer lugar</h3>
                <p className="text-muted-foreground">
                  Exporte em PDF ou envie para o WhatsApp. Acesse na hora das compras.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">
              Pronto para simplificar sua semana?
            </h2>
            <p className="text-xl opacity-90">
              Comece grátis agora. Sem cartão de crédito. Sem complicação.
            </p>
            {isAuthenticated ? (
              <Link href="/planner">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
                >
                  Criar Meu Primeiro Plano
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
                >
                  Começar Grátis
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 {APP_TITLE}. Planejamento inteligente de marmitas.</p>
        </div>
      </footer>
    </div>
  );
}

