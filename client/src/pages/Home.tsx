import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { ChefHat, Clock, ShoppingCart, Sparkles, Star, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";

const testimonials = [
  {
    name: "Ana Paula Silva",
    role: "Mãe de 2 filhos",
    avatar: "👩‍💼",
    rating: 5,
    text: "Economizei 4 horas por semana! Antes eu passava o domingo inteiro pensando no que fazer. Agora em 10 minutos já tenho tudo planejado.",
  },
  {
    name: "Carlos Mendes",
    role: "Profissional autônomo",
    avatar: "👨‍💻",
    rating: 5,
    text: "Reduzi meu desperdício em 70%. O Planna me mostrou como usar TUDO que eu tinha na geladeira. Nunca mais joguei comida fora!",
  },
  {
    name: "Juliana Costa",
    role: "Estudante universitária",
    avatar: "👩‍🎓",
    rating: 5,
    text: "Perfeito para quem não sabe cozinhar! As instruções são tão detalhadas que até eu consegui. Agora como comida de verdade todo dia.",
  },
];

const stats = [
  { icon: Users, value: "12.5k+", label: "Usuários ativos" },
  { icon: Clock, value: "4h/sem", label: "Tempo economizado" },
  { icon: TrendingUp, value: "70%", label: "Menos desperdício" },
];

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">{APP_TITLE}</span>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
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
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Planejamento automático com IA
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Monte sua semana de marmitas
          <br />
          <span className="text-primary">em 3 cliques</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Sem pensar em cardápio. Sem desperdício. Sem complicação. Apenas
          diga o que tem na geladeira e deixe a IA criar seu plano semanal
          completo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/planner">
            <Button size="lg" className="text-lg px-8 py-6">
              Começar Agora
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6">
            Ver Como Funciona
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Como funciona o Planna</h2>
            <p className="text-lg text-muted-foreground">
              Simples, rápido e inteligente
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Diga o que tem</h3>
              <p className="text-muted-foreground">
                Digite os ingredientes da sua geladeira. Pode ser texto livre, a IA entende.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. IA cria o plano</h3>
              <p className="text-muted-foreground">
                Receitas balanceadas, lista de compras consolidada e roteiro de preparo otimizado.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Cozinhe em lote</h3>
              <p className="text-muted-foreground">
                Siga o roteiro de batch cooking e prepare tudo em cerca de 90 minutos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Planna */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Por que usar o Planna?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    ⏱️
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Economize tempo</h3>
                    <p className="text-muted-foreground">
                      Pare de perder horas pensando "o que vou comer?". O Planna decide por você em segundos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    ♻️
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Reduza desperdício</h3>
                    <p className="text-muted-foreground">
                      Use que já tem em casa. Compre apenas o necessário. Gaste menos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    🍽️
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Coma melhor</h3>
                    <p className="text-muted-foreground">
                      Receitas balanceadas com proteína, carboidrato e legumes. Sem monotonia.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    📱
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Leve para qualquer lugar</h3>
                    <p className="text-muted-foreground">
                      Exporte em PDF ou envie para o WhatsApp. Acesse na hora de comprar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">O que dizem nossos usuários</h2>
            <p className="text-lg text-muted-foreground">
              Milhares de pessoas já simplificaram suas semanas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para simplificar sua semana?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Comece grátis agora. Sem cartão de crédito. Sem complicação.
          </p>
          <Link href="/planner">
            <Button size="lg" className="text-lg px-12 py-6">
              Criar Meu Primeiro Plano
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 {APP_TITLE} - Planejador de Marmitas. Planejamento inteligente de marmitas.
        </div>
      </footer>
    </div>
  );
}

