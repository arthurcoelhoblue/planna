# Planna - TODO

## Reestruturação Completa do Sistema

### 1. Base de Dados de Ingredientes com Calorias
- [x] Criar tabela de ingredientes no banco de dados
- [x] Popular base com ingredientes comuns (nome, unidade, kcal/100g)
- [x] Criar serviço de busca de ingredientes
- [x] Implementar fallback para ingredientes não encontrados

### 2. Cálculo Completo de Calorias
- [x] Calcular calorias por ingrediente na receita
- [x] Calcular calorias totais da receita
- [x] Calcular calorias por porção
- [ ] Exibir calorias na UI (ingrediente, total, porção)

### 3. Sistema de Tipos de Dieta com IA
- [ ] Adicionar campo "tipo de dieta" no onboarding
- [ ] Adicionar campo "tipo de dieta" nas preferências
- [x] Criar serviço de IA para gerar perfil de dieta
- [x] Implementar política anti-alucinação (retornar {status: "not_found"})
- [x] Salvar perfil de dieta estruturado (permitidos, restritos, diretrizes)
- [x] Filtrar receitas baseadas na dieta
- [ ] Alertar sobre ingredientes fora da dieta

### 4. Limite de Calorias por Porção
- [ ] Adicionar campo "máximo de calorias por porção"
- [ ] Implementar ajuste automático de número de porções
- [ ] Exibir mensagem explicativa quando ajustar
- [ ] (Futuro) Implementar ajuste de quantidades proporcionalmente

### 5. Refatoração do Frontend
- [ ] Atualizar Planner com campos de dieta e limite calórico
- [ ] Atualizar PlanView com exibição de calorias
- [ ] Criar componentes reutilizáveis para calorias
- [ ] Padronizar UI de dietas

### 6. Atualização da Landing Page
- [ ] Atualizar copy com novos benefícios (calorias, dietas)
- [ ] Destacar diferenciais (IA sem alucinação, clareza)
- [ ] Otimizar CTAs para conversão

### 7. Testes e Validação
- [ ] Testar fluxo completo com dieta conhecida
- [ ] Testar fluxo com dieta desconhecida (anti-alucinação)
- [ ] Testar cálculo de calorias em múltiplos cenários
- [ ] Testar ajuste automático de porções
- [ ] Validar consistência entre UI, backend e IA



### 8. Integração Stripe (Pagamento)
- [x] Adicionar feature Stripe ao projeto
- [x] Configurar produtos e preços no Stripe
- [x] Criar schema de assinaturas no banco
- [x] Implementar checkout de assinatura
- [ ] Implementar webhook de eventos Stripe
- [ ] Criar portal do cliente (gerenciar assinatura)
- [ ] Implementar paywall (limitar acesso free vs premium)
- [ ] Adicionar seção de pricing na LP

