# Plano de Implementação Completo - Planna

## Objetivo
Deixar o sistema funcionando como um produto coeso, sem gambiarras.

---

## CHECKPOINT 1 - Autenticação e UX Base

### 1.1 Login 100% Separado da Manus
- [x] useAuth.ts: redirectPath default = "/" (já feito)
- [x] Planner.tsx: AuthModal ao invés de getLoginUrl() (já feito)
- [x] History.tsx: AuthModal ao invés de getLoginUrl() (já feito)
- [ ] PlanView.tsx: verificar se usa getLoginUrl() e substituir

### 1.2 DashboardLayout em Todas as Páginas Logadas
- [x] DashboardLayout existe e tem logout (já feito)
- [ ] Envolver Planner.tsx em <DashboardLayout>
- [ ] Envolver History.tsx em <DashboardLayout>
- [ ] Envolver PlanView.tsx em <DashboardLayout>

### 1.3 Menu e Logo
- [x] menuItems atualizado (Histórico, Planejador) (já feito)
- [x] Logo clicável para /history (já feito)
- [x] Logout visível (já feito)

### 1.4 Bug da Vírgula Decimal
- [ ] Planner.tsx: ajustar split de availableIngredients
  ```ts
  const availableIngredients = ingredients
    .replace(/(\d),(\d)/g, "$1·$2")
    .split(/[,;\n]/)
    .map(i => i.trim().replace(/·/g, ","))
    .filter(i => i.length > 0);
  ```
- [x] UI: nota sobre vírgula/ponto decimal (já feito)

---

## CHECKPOINT 2 - IA Sob Controle

### 2.1 Anti-Alucinação de Ingredientes
- [x] sanitizePlanIngredients existe (já feito)
- [ ] Confirmar que remove ingredientes não permitidos quando allowNewIngredients = false
- [ ] Confirmar que remove pratos vazios

### 2.2 Fotos - Filtro por Dicionário
- [x] image-detection.ts normaliza com dicionário (já feito)
- [x] Descarta ingredientes não mapeados (já feito)

### 2.3 Modo Normal vs Aproveitamento Total
- [ ] recipe-engine.ts: reforçar objectiveFocus no prompt
  - APROVEITAMENTO: usar cascas, talos, sobras
  - NORMAL: não usar cascas/talos como principais
- [ ] Testar com planos diferentes

### 2.4 Nível de Experiência (skillLevel)
- [ ] Atualizar skillLevelRule no recipe-engine.ts:
  - beginner: max 5-7 passos, sem parallel, +20% tempo
  - intermediate: 6-9 passos, parallel limitado
  - advanced: 10-12 passos, parallel livre, -15% tempo
- [ ] Implementar função enforceSkillLevel:
  - Limitar número de passos
  - Controlar paralelismo
  - Recalcular tempo total
- [ ] Chamar enforceSkillLevel em generateMealPlan
- [ ] Testar com 3 níveis diferentes

---

## CHECKPOINT 3 - Estoque, Limite e Upgrade

### 3.1 Uso Real de Estoque (Quantidades)
- [ ] routers.ts: passar ingredientsWithStock para generateMealPlan
  - { name, quantity, unit }
- [ ] Criar server/stock-check.ts com analyzeStock:
  - Entrada: plan + stock
  - Saída: { hasDeficit, deficits: [{ name, required, available, unit }] }
- [ ] mealPlan.generate: incluir stockStatus no retorno

### 3.2 Modal de Estoque Insuficiente
- [ ] Planner.tsx: onSuccess da mutation
  - Se stockStatus?.hasDeficit: abrir modal
  - Caso contrário: redirecionar
- [ ] Criar modal mostrando:
  - Ingredientes insuficientes
  - Opções: voltar para ajustar ou aumentar quantidades

### 3.3 Fluxo de Upgrade Clicável
- [ ] Planner.tsx: onError da mutation
  - Se erro de limite: abrir modal de upgrade
- [ ] Modal de upgrade:
  - Usar subscription.createCheckout
  - Redirecionar para checkout Stripe
- [ ] Testar com usuário free no limite

---

## Critérios de Conclusão

✅ Login não depende mais da Manus
✅ Escolhas do usuário são respeitadas (experiência, dieta, modo, allowNewIngredients, estoque, calorias)
✅ Upgrade de plano é acionável (não apenas mensagem)
✅ DashboardLayout usado em todas as páginas logadas
✅ Bug da vírgula decimal corrigido
✅ IA obedece regras rigorosamente

