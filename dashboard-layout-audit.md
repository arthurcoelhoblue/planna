# Auditoria do DashboardLayout

## Rotas Logadas Identificadas

### ✅ Usando DashboardLayout Corretamente
1. `/planner` - Planner.tsx ✅
2. `/plan/:id` - PlanView.tsx ✅
3. `/history` - History.tsx ✅
4. `/dashboard` - Dashboard.tsx ✅

### ❓ Rotas a Verificar
- `/profile` - Não existe no código
- `/payment-success` - Não existe como página separada
- `/payment-failed` - Não existe como página separada
- `/shared/:token` - SharedPlan.tsx (rota PÚBLICA, não precisa de DashboardLayout)

### 🔍 Páginas Não Logadas (OK não ter DashboardLayout)
- `/` - Home.tsx (landing page pública)
- `/reset-password` - ResetPassword.tsx (pública)
- `/404` - NotFound.tsx (pública)
- `/showcase` - ComponentShowcase.tsx (dev only)

## Problemas Identificados

### 1. Headers Duplicados
**Problema**: Planner.tsx, PlanView.tsx e History.tsx têm headers customizados DENTRO do DashboardLayout, o que causa duplicação visual.

**Código problemático** (exemplo do Planner.tsx linha 346-360):
```tsx
<DashboardLayout>
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
    {/* Header */}
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            {APP_TITLE}
          </h1>
        </Link>
        <Link href="/history">
          <Button variant="outline">Histórico</Button>
        </Link>
      </div>
    </header>
```

**Solução**: Remover esses headers customizados, pois o DashboardLayout já fornece um header com logo, navegação e botão de logout.

### 2. Verificar Botão de Logout
Preciso verificar se o botão de logout está aparecendo no DashboardLayout.

### 3. Verificar Rotas da Manus
Preciso procurar por referências a `/auth/login` ou `getLoginUrl()`.

## Próximos Passos
1. Ler DashboardLayout.tsx para entender sua estrutura
2. Remover headers duplicados das páginas
3. Verificar se botão de logout está visível
4. Procurar e remover referências a rotas da Manus
5. Testar no navegador

