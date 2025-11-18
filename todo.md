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
- [x] Implementar webhook de eventos Stripe
- [x] Criar portal do cliente (gerenciar assinatura)
- [x] Implementar paywall (limitar acesso free vs premium)
- [ ] Adicionar seção de pricing na LP
- [ ] Integrar calorias e dietas no frontend



### 9. Integração Frontend (Calorias + Dietas + Pricing)
- [x] Adicionar campo de tipo de dieta no OnboardingModal
- [x] Adicionar campo de limite calórico no Planner
- [ ] Integrar cálculo de calorias no backend do generateMealPlan
- [ ] Exibir calorias por ingrediente no PlanView
- [ ] Exibir calorias totais e por porção no PlanView
- [ ] Exibir perfil de dieta no PlanView (se aplicável)
- [ ] Criar seção de pricing na Landing Page com tabela comparativa
- [ ] Criar modal de upgrade quando atingir limite
- [ ] Adicionar banner de upgrade para usuários free
- [ ] Preparar variáveis de ambiente para Price IDs
- [ ] Documentar configuração de webhook no README





### 10. Autenticação Local (Email/Senha)

#### Backend
- [x] Adicionar campo passwordHash na tabela users
- [x] Criar funções hashPassword e verifyPassword (bcrypt)
- [x] Implementar endpoint registerLocal
- [x] Implementar endpoint loginLocal
- [x] Criar sistema de tokens de recuperação de senha
- [x] Implementar endpoint requestPasswordReset
- [x] Implementar endpoint resetPassword
- [x] Adicionar tabela password_reset_tokens
- [ ] Adicionar validação de email com token (opcional)

#### Frontend
- [x] Criar modal de Login/Registro (AuthModal.tsx)
- [x] Criar formulário de cadastro (nome, email, senha)
- [x] Criar formulário de login (email, senha)
- [x] Criar fluxo de recuperação de senha
- [x] Criar página de reset de senha (/reset-password)
- [x] Integrar com onboarding após registro
- [x] Atualizar links de login na Home
- [x] Adicionar AuthModal na Home
- [x] Remover dependência de getLoginUrl()

#### Testes
- [ ] Testar registro de novo usuário
- [ ] Testar login com credenciais corretas
- [ ] Testar login com credenciais incorretas
- [ ] Testar recuperação de senha
- [ ] Testar validação de email

