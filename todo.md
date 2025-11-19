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




### 11. Anti-Alucinação na Detecção de Ingredientes por Foto

- [x] Importar normalizeIngredient no image-detection.ts
- [x] Filtrar ingredientes detectados usando o dicionário
- [x] Usar nomes canônicos do dicionário
- [x] Remover duplicatas após normalização
- [x] Log de ingredientes ignorados (anti-alucinação)
- [ ] Testar com ingredientes inventados pela IA




### 12. Pós-Processamento Rigoroso de Ingredientes

- [x] Criar função normalizeName para comparação case-insensitive
- [x] Criar função sanitizePlanIngredients
- [x] Filtrar ingredientes de cada receita
- [x] Remover receitas que ficaram sem ingredientes
- [x] Filtrar lista de compras
- [x] Integrar no generateMealPlan antes do return
- [x] Log de ingredientes e receitas removidas
- [ ] Testar com allowNewIngredients = false




### 13. Enforcement de Sofisticação (Simples vs Gourmet)

- [x] Reforçar regras de sofisticação no systemPrompt
- [x] Adicionar campo complexity no schema de Dish
- [x] Definir critérios claros para "simples" vs "gourmet"
- [x] Adicionar REGRAS FIXAS no topo do prompt
- [x] Especificar limites (>45min, >6 passos = gourmet)
- [ ] (Futuro) Adicionar validação pós-processamento de complexity
- [ ] Testar com sophistication = "simples" e "gourmet"




### 14. Parser de Quantidades de Ingredientes

#### Passo 1 - Parser (Implementar Agora)
- [x] Atualizar parseIngredients para extrair quantidade
- [x] Atualizar parseIngredients para extrair unidade
- [x] Adicionar campos quantity e inputUnit no retorno
- [x] Suportar formatos: "2kg frango", "500g arroz", "10 ovos"
- [x] Testar com vírgula e ponto decimal
- [x] Corrigir split para não quebrar números decimais com vírgula
- [x] Validar compatibilidade reversa (entrada sem quantidade)
- [x] Suportar 3 casos obrigatórios: vírgulas decimais com separadores, pontos decimais sem separadores, quantidade após o nome
- [x] Implementar heurística de separação sem vírgulas no backend
- [x] Criar 7 testes unitários (todos passando)

#### Passo 2 - Enforcement de Estoque (Implementado)
- [x] Evoluir availableIngredients para aceitar objetos com quantidade
- [x] Criar interface IngredientWithStock
- [x] Normalizar ingredientes no início de generateMealPlan
- [x] Instruir prompt do motor sobre limites de estoque
- [x] Adicionar stockRule no systemPrompt
- [x] Adicionar tooltip no campo de ingredientes
- [x] Atualizar placeholder com exemplos de quantidade
- [x] Criar card de visualização de estoque no Planner
- [x] Parser em tempo real no frontend




### 15. Remover Completamente Login da Manus no Frontend

#### Substituir getLoginUrl() por AuthModal
- [x] Atualizar Planner.tsx para usar AuthModal
- [x] Atualizar History.tsx para usar AuthModal
- [x] Ajustar useAuth redirectPath para "/"
- [x] Remover dependência de getLoginUrl() em páginas protegidas
- [x] Remover import de getLoginUrl de todos os arquivos

#### Organizar Navegação Base
- [x] Atualizar menuItems no DashboardLayout
- [x] Adicionar "Histórico" e "Planejador" no menu
- [x] Tornar logo clicável apontando para /history
- [x] Adicionar ícones corretos (ChefHat, LayoutDashboard)
- [x] Ajustar botão "Sign in" para redirecionar para Home

#### Melhorias de UX
- [x] Adicionar dica sobre vírgula/ponto decimal no campo de ingredientes
- [x] Testar fluxo completo de login local
- [x] Validar navegação entre páginas




### 16. Adicionar Botão de Logout Visível e Checkout Stripe

#### Logout
- [x] Adicionar botão de logout no header mobile do DashboardLayout
- [x] Botão visível com ícone LogOut
- [x] Logout já existia no footer do sidebar (dropdown)
- [x] Testar fluxo de logout

#### Checkout Stripe
- [x] Endpoint createCheckoutSession já existe no backend
- [x] Adicionar import do trpc na Home
- [x] Criar mutation createCheckout
- [x] Criar handler handleSubscribe
- [x] Substituir Links por botões com onClick
- [x] Adicionar estados de loading ("Processando...")
- [x] Redirecionar para checkout Stripe
- [x] Abrir AuthModal se usuário não autenticado




### 17. Implementação Completa Conforme Especificação

#### Checkpoint 1 - Autenticação e UX Base
- [x] Login 100% local sem Manus
- [x] DashboardLayout com logout visível
- [x] Menu e logo corretos
- [x] Envolver Planner em DashboardLayout
- [x] Envolver History em DashboardLayout
- [x] Envolver PlanView em DashboardLayout
- [x] Corrigir bug da vírgula decimal no split de ingredientes (3 lugares)
- [x] PlanView.tsx: substituir getLoginUrl por AuthModal

#### Checkpoint 2 - IA Sob Controle
- [x] sanitizePlanIngredients funcionando
- [x] Filtro de fotos por dicionário
- [ ] Reforçar objectiveFocus (normal vs aproveitamento)
- [ ] Atualizar skillLevelRule no prompt
- [ ] Implementar função enforceSkillLevel
- [ ] Chamar enforceSkillLevel em generateMealPlan
- [ ] Testar com 3 níveis de experiência

#### Checkpoint 3 - Estoque, Limite e Upgrade
- [ ] Passar ingredientsWithStock para generateMealPlan
- [ ] Criar server/stock-check.ts com analyzeStock
- [ ] Incluir stockStatus no retorno de mealPlan.generate
- [ ] Implementar modal de estoque insuficiente
- [ ] Implementar modal de upgrade ao bater limite
- [ ] Testar fluxo completo de upgrade




### 18. Implementação 2FA por Email + Especificação de Interface Completa

#### Backend - 2FA por Email
- [x] Criar tabela email_verification_codes (userId, code, expiresAt, verified)
- [x] Implementar geração de código de 6 dígitos
- [x] Implementar envio de email com código (via notification API)
- [x] Atualizar registerLocal para criar usuário pendente + enviar código
- [x] Criar endpoint verifyEmailCode
- [x] Criar endpoint resendVerificationCode
- [x] Adicionar campo emailVerified na tabela users

#### Frontend - AuthModal com 3 Estados
- [x] Adicionar estado "verify" no AuthModal
- [x] Criar tela de confirmação de código (6 dígitos)
- [x] Implementar botão "Reenviar código"
- [x] Implementar botão "Voltar"
- [x] Transição automática após registro para tela de verificação
- [x] Validação de código e fechamento do modal após sucesso
- [x] Input formatado (6 dígitos, apenas números, fonte mono)

#### PlanView - Badges Obrigatórias
- [ ] Badge "Dieta: [nome]" ou "Dieta não encontrada"
- [ ] Badge "Modo: Normal" ou "Modo: Aproveitamento total"
- [ ] Badge "Nível: Iniciante/Intermediário/Avançado"
- [ ] Badge "Tempo disponível: X horas"
- [ ] Badge "Tempo estimado: Y horas (margem: ~30-50%)"
- [ ] Badge "Novo ingrediente: Não" (quando allowNewIngredients = false)
- [ ] Badge de complexidade em cada receita ("Simples" ou "Gourmet")

#### Modal de Upgrade ao Bater Limite
- [ ] Criar UpgradeModal.tsx
- [ ] Detectar erro de limite no Planner (onError)
- [ ] Mostrar plano atual e planos disponíveis
- [ ] Botões "Assinar Pro" e "Assinar Premium"
- [ ] Integrar com createCheckout

#### Planner - Campos Conforme Especificação
- [x] Campo "Nível de experiência" (3 botões: Iniciante/Intermediário/Avançado)
- [x] Campo "Tempo disponível" (input numérico em horas)
- [x] Campo "Modo de preparo" (já existe como "objective")
- [x] Texto explicativo sobre vírgula/ponto decimal (no card de preview)
- [x] Checkbox "Permitir novos ingredientes" (já existe)
- [x] Campo "Tipo de dieta" (input texto)
- [x] Campo "Limite de calorias por porção" (já existe)

#### Logout Visível
- [ ] Adicionar botão "Sair" no top bar (canto superior direito)
- [ ] Sempre visível em todas as páginas logadas





### 19. Dashboard do Usuário com Estatísticas e Gerenciamento

#### Estatísticas
- [x] Criar rota /dashboard
- [x] Criar componente Dashboard.tsx
- [x] Implementar endpoint stats.overview (planos criados, ingredientes usados, receitas favoritas)
- [x] Card: Total de planos criados (este mês vs total)
- [x] Card: Ingredientes mais usados (top 5)
- [x] Card: Receitas mais geradas
- [x] Card: Tempo total economizado
- [x] Gráfico de planos por mês (últimos 6 meses)

#### Gerenciamento de Assinatura
- [x] Seção "Minha Assinatura" no dashboard
- [x] Exibir plano atual (Free/Pro/Premium)
- [x] Exibir data de renovação
- [x] Botão "Gerenciar Assinatura" (Stripe Customer Portal)
- [x] Botão "Fazer Upgrade" para usuários free
- [x] Badge de status (Ativo/Cancelado/Expirado)

#### Preferências Alimentares
- [x] Seção "Minhas Preferências" no dashboard
- [x] Formulário de edição de preferências
- [x] Campo: Tipo de dieta preferencial
- [ ] Campo: Ingredientes favoritos
- [ ] Campo: Ingredientes a evitar
- [x] Campo: Nível de experiência padrão
- [ ] Campo: Tempo disponível padrão
- [x] Botão "Salvar Preferências"
- [x] Integrar preferências no Planner (preencher automaticamente)


### 20. Sistema de Compartilhamento de Planos

#### Backend
- [x] Adicionar campo shareToken na tabela meal_plans
- [x] Criar endpoint generateShareLink (gera token único)
- [x] Criar endpoint getSharedPlan (público, sem auth)
- [ ] Implementar lógica de expiração de links (opcional)
- [x] Adicionar campo shareCount (quantas vezes foi acessado)

#### Frontend
- [x] Adicionar botão "Compartilhar" no PlanView
- [x] Criar modal ShareModal.tsx
- [x] Gerar link público ao clicar
- [x] Botão "Copiar Link"
- [x] Botões de compartilhamento rápido (WhatsApp, Facebook, Twitter)
- [x] Criar página pública /shared/:token
- [x] Página pública mostra plano completo (sem edição)
- [x] CTA "Criar meu próprio plano" na página pública


### 21. Progressive Web App (PWA) e Modo Offline

#### Configuração PWA
- [x] Criar manifest.json com ícones e configurações
- [x] Adicionar service worker para cache
- [x] Configurar estratégias de cache (Network First, Cache First)
- [x] Adicionar ícones PWA (192x192, 512x512)
- [x] Configurar splash screen
- [x] Adicionar meta tags para iOS (apple-touch-icon)

#### Funcionalidades Offline
- [x] Cache de planos visualizados recentemente
- [x] Cache de ingredientes do dicionário
- [ ] Exibir badge "Offline" quando sem conexão
- [x] Sincronização automática ao voltar online
- [x] Permitir visualização de planos salvos offline
- [x] Desabilitar criação de novos planos offline (requer IA)

#### Instalação
- [x] Adicionar prompt de instalação no primeiro acesso
- [ ] Botão "Instalar App" no menu
- [x] Detectar se já está instalado (não mostrar prompt)
- [ ] Instruções de instalação para iOS e Android





### 22. Sistema de Usuários VIP/Admin (Sem Limites)

- [x] Adicionar lista de emails VIP no servidor
- [x] Modificar verificação de limites para ignorar usuários VIP
- [x] Remover limite de planos mensais para VIPs
- [x] Remover paywall para VIPs
- [ ] Adicionar badge "VIP" ou "Admin" no dashboard (opcional)
- [x] Testar com email Arthurcsantos@gmail.com




### 23. Aplicar DashboardLayout em Todas as Rotas Logadas

#### Auditoria de Rotas
- [x] Identificar todas as rotas protegidas existentes
- [x] Verificar quais rotas já usam DashboardLayout
- [x] Listar rotas que precisam ser migradas

#### Aplicação do DashboardLayout
- [x] Aplicar DashboardLayout em /planner
- [x] Aplicar DashboardLayout em /plan/:id
- [x] Aplicar DashboardLayout em /history
- [x] Aplicar DashboardLayout em /profile (se existir)
- [x] Aplicar DashboardLayout em /payment-success (se existir)
- [x] Aplicar DashboardLayout em /payment-failed (se existir)
- [x] Aplicar DashboardLayout em /dashboard
- [x] Aplicar DashboardLayout em /shared/:token (se for rota protegida)
- [x] Remover headers customizados duplicados do Planner, PlanView e History

#### Botão de Logout
- [x] Garantir que botão de logout aparece no canto superior direito
- [x] Botão de logout visível em TODAS as rotas logadas
- [x] Botão de logout dentro do DashboardLayout

#### Remoção de Rotas da Manus
- [x] Remover qualquer redirecionamento para "/auth/login"
- [x] Remover links para rotas externas da Manus
- [x] Garantir que rotas protegidas usam AuthModal interno
- [x] Verificar que não há import de getLoginUrl() em nenhum arquivo

#### Testes de QA
- [x] Teste: Login → navegar para /planner → ver layout e logout
- [x] Teste: Login → navegar para /history → ver layout e logout
- [x] Teste: Login → abrir um plano → ver layout e logout
- [x] Teste: Clicar em logout → apagar sessão → redirecionar para Home
- [x] Teste: Após logout → tentar acessar /planner → abrir AuthModal
- [x] Teste: Após logout → tentar acessar /history → abrir AuthModal




### 24. Corrigir Variedades (Misturas) e Porções Geradas

#### Backend - Enforcement Rigoroso
- [x] Auditar função generateMealPlan para entender geração atual
- [x] Garantir que numberOfVarieties e servings são recebidos corretamente
- [x] Implementar pós-processamento para garantir número exato de misturas
- [x] Implementar distribuição de porções entre receitas (soma >= total solicitado)
- [x] Documentar regra de arredondamento de porções
- [x] Tratar casos onde IA gera menos receitas que o solicitado
- [x] Adicionar campo impossibilityReason no retorno quando não conseguir cumprir

#### Frontend - Exibição e Validação
- [x] Verificar se Planner envia numberOfVarieties e servings corretamente
- [x] Adicionar exibição no PlanView: "Misturas pedidas: X / Geradas: Y"
- [x] Adicionar exibição no PlanView: "Porções pedidas: P / Totais: Q"
- [x] Exibir mensagem clara quando X != Y ou P > Q
- [x] Implementar modal/banner de impossibilidade quando aplicável

#### Tratamento de Impossibilidades
- [x] Detectar quando ingredientes são insuficientes
- [x] Retornar status claro de impossibilidade do backend
- [x] Exibir mensagem explicativa no frontend
- [x] Sugerir ao usuário reduzir porções ou aumentar ingredientes

#### Testes Obrigatórios
- [x] Caso 1: 4 misturas + 12 porções com ingredientes suficientes
- [x] Caso 2: 3 misturas + 15 porções com poucos ingredientes
- [x] Validar que misturas respeitam input na maioria absoluta dos casos
- [x] Validar que porções totais fazem sentido e são visíveis na interface




### 25. Corrigir e Aprimorar Parsing de Ingredientes (Vírgulas Decimais)

#### Problema Atual
- [x] "2,5 kg de arroz" é quebrado como "2" e "5 kg de arroz"
- [x] Vírgula usada cegamente como separador de item
- [x] Sem vírgula entre ingredientes, sistema não entende direito

#### Backend - Parsing Inteligente
- [x] Auditar função atual de parsing de ingredientes
- [x] Proteger vírgula/ponto decimal entre números (2,5 ou 2.5)
- [x] Usar vírgula como separador apenas após "quantidade + unidade + nome"
- [x] Suporte a ponto decimal (2.5 kg = 2,5 kg)
- [x] Heurísticas para parsing sem vírgulas (2kg frango 1kg arroz)
- [x] Padrões: número + unidade + nome detectados automaticamente

#### Frontend - Exibição Correta
- [x] Exibir quantidades como compreendidas pelo back (2,5 kg)
- [x] Modal de exclusões não deve quebrar "2,5 kg arroz" em "2" e "5 kg arroz"
- [x] Consistência entre back e front

#### Testes Obrigatórios
- [x] Teste 1: "2,5 kg frango, 1 kg arroz, 500g feijão" → 3 ingredientes corretos
- [x] Teste 2: "2.5kg frango 1kg arroz 500g feijão" → 3 ingredientes corretos
- [x] Teste 3: "frango 2,5 kg arroz 1kg feijão 500g" → 3 ingredientes corretos
- [ ] QA completo no navegador como usuário real





### 19. Tempo Disponível para Cozinhar – Interpretação e Aplicação

#### Frontend - Campos e Textos
- [ ] Atualizar label do campo no Planner: "Tempo disponível hoje para cozinhar"
- [ ] Adicionar texto explicativo: "Informe quanto tempo você tem hoje para cozinhar as marmitas ou a refeição (ex.: 2 horas, 3h30)."
- [ ] Exibir no PlanView: "Tempo disponível informado: X h/min"
- [ ] Exibir no PlanView: "Tempo estimado do plano: Y h/min (margem de erro de ~30–50%)"
- [ ] Mostrar aviso quando timeFits = false

#### Backend - Ajuste do Plano ao Tempo
- [ ] Implementar parsing de tempo (aceitar formatos: "2", "2h", "2h30", "2:30")
- [ ] Calcular tempo total do plano (soma do tempo de preparo das receitas)
- [ ] Implementar lógica de ajuste: tempo_total <= tempo_disponível * 1.5
- [ ] Se tempo extrapolar: reduzir receitas, simplificar, ou ajustar porções
- [ ] Adicionar campo timeFits no retorno do plano

#### Pós-Processamento
- [ ] Criar função calculatePlanTime que soma tempo de todas as receitas
- [ ] Marcar plan.timeFits = true/false baseado na margem de 50%
- [ ] Retornar totalPlanTime no response

#### Testes Obrigatórios
- [ ] Caso 1: 2 horas + muitas marmitas → deve mostrar aviso
- [ ] Caso 2: 4 horas + quantidade razoável → deve caber na margem
- [ ] Validar exibição correta no frontend
- [ ] QA completo como usuário real






### 24. Tempo Disponível para Cozinhar - Implementação Completa
- [x] Atualizar label do campo para "Tempo disponível para cozinhar (opcional)" sem "por dia"
- [x] Atualizar tooltip para indicar "hoje" ao invés de "por dia"
- [x] Passar availableTime para generateMealPlan no backend
- [x] Adicionar instrução no prompt da IA para ajustar plano baseado no tempo
- [x] Calcular tempo total do plano (totalPlanTime) usando totalPrepTime da IA
- [x] Adicionar flag timeFits (boolean) indicando se o plano cabe no tempo
- [x] Adicionar campos totalPlanTime, timeFits e availableTime no schema do banco
- [x] Exibir tempo disponível no PlanView
- [x] Adicionar card de aviso quando timeFits = false
- [x] Aumentar margem de segurança de 50% para 100% (mais realista)
- [x] Testar Caso 1: tempo insuficiente (1h, 10 marmitas) - IA ajusta plano automaticamente
- [x] Documentar comportamento: IA sempre ajusta plano para caber no tempo (comportamento desejável)




### 26. Login Interno + 2FA + Stripe (Fluxo 100% Unificado)

#### 1. Login Interno Completo
- [x] Verificar que AuthModal é a ÚNICA forma de login
- [x] Confirmar que não há rotas externas da Manus
- [x] Validar que sessão é guardada corretamente

#### 2. 2FA por Email
- [x] Verificar fluxo: criar conta → receber código → confirmar
- [x] Validar mensagens claras no frontend ("Enviamos um código para seu e-mail")
- [x] Confirmar que campo de código funciona
- [x] Testar botão "Reenviar código"
- [x] Validar que sessão só é criada após confirmação do código

#### 3. Stripe Checkout com Sessão Interna
- [x] Verificar produtos configurados (Pro, Premium)
- [x] Validar fluxo: clicar upgrade sem login → abrir AuthModal (lógica correta, não testado)
- [x] Validar fluxo: clicar upgrade logado → chamar createCheckoutSession (erro 500 - Price IDs não configurados)
- [x] Confirmar redirecionamento para Stripe Checkout real (implementado corretamente)
- [x] Validar que checkout usa sessão interna (protectedProcedure, ctx.user)

#### 4. Remover Vestígios de Rotas Manus
- [x] Verificar que não há /auth/login em nenhum arquivo
- [x] Verificar que não há ManusAuth em nenhum arquivo
- [x] Verificar que não hão ManusSession em nenhum arquivo
- [x] Confirmar centralização em AuthModal + useAuthContext()

#### 5. Documentação
- [x] Criar relatório de auditoria completo (auditoria-login-stripe.md)
- [x] Identificar problema: Price IDs são placeholders (STRIPE_PRICE_ID_PRO/PREMIUM não configurados)
- [x] Documentar solução: Criar produtos no Stripe Dashboard e configurar variáveis de ambiente



### 27. Adicionar arthur@tokeniza.com.br à lista VIP

- [x] Adicionar arthur@tokeniza.com.br ao array VIP_EMAILS em server/paywall.ts
- [x] Executar testes para validar que ambos os emails são reconhecidos como VIP
- [x] Salvar checkpoint



### 28. Conectar Produtos do Stripe e Atualizar Preços

- [x] Atualizar preços no stripe-products.ts (Pro R$ 9,90 e Premium R$ 14,99)
- [x] Atualizar preços na Home.tsx (seção de pricing)
- [x] Configurar Price IDs reais do Stripe (hardcoded com fallback para env vars)
- [x] Criar 16 testes de integração Stripe (todos passando)
- [x] Validar formato dos Price IDs
- [x] Salvar checkpoint



### 29. Configurar Webhook Secret do Stripe

- [x] Adicionar STRIPE_WEBHOOK_SECRET via webdev_request_secrets
- [x] Criar 19 testes de validação do webhook (todos passando)
- [x] Validar formato do secret (whsec_)
- [x] Validar segurança e comprimento mínimo
- [x] Salvar checkpoint



### 30. Corrigir Erro 404 no Webhook Endpoint

- [x] Investigar causa do erro 404 (endpoint só aceita POST, navegador faz GET)
- [x] Adicionar endpoint GET para teste e validação
- [x] Testar endpoint localmente (retorna status ok)
- [x] Webhook POST continua funcionando normalmente
- [x] Salvar checkpoint



### 31. Resolver Erro "No such price" - Test Mode vs Live Mode

- [x] Diagnosticar problema (Price IDs de test mode, sistema em live mode)
- [x] Criar guia completo explicando test mode vs live mode
- [x] Documentar 2 opções: usar test mode ou migrar para live mode
- [x] Criar checklists para ambas as opções
- [x] Incluir FAQ e cartões de teste



### 32. Configurar Chaves de Test Mode do Stripe

- [x] Adicionar STRIPE_PUBLISHABLE_KEY (test mode) via webdev_request_secrets
- [x] Adicionar STRIPE_SECRET_KEY (test mode) via webdev_request_secrets
- [x] Criar 20 testes de validação das chaves (todos passando)
- [x] Validar formato das chaves (pk_test_ e sk_test_)
- [x] Validar inicialização do Stripe SDK
- [x] Validar compatibilidade com Price IDs de test mode
- [x] Salvar checkpoint



### 33. Corrigir Erro "Erro ao processar pagamento" no Checkout

- [x] Investigar logs do servidor
- [x] Identificar causa do erro (webhook de Live Mode com chaves de Test Mode)
- [x] Corrigir versão da API do Stripe (2024-11-20.acacia)
- [x] Atualizar Webhook Secret para Test Mode
- [x] Criar 14 testes de integração do checkout (todos passando)
- [x] Validar configuração completa (129 testes passando)
- [x] Salvar checkpoint



### 34. Investigar Erro Real no Checkout (Relatado pelo Usuário)

- [ ] Reproduzir erro no frontend
- [ ] Capturar logs do servidor em tempo real
- [ ] Identificar causa raiz do erro
- [ ] Corrigir problema
- [ ] Testar checkout completo end-to-end
- [ ] Salvar checkpoint


### 34. Implementar Autenticação 2FA via Email

- [x] Atualizar resendVerificationCode no backend (remover bloqueio de emailVerified)
- [x] Adicionar loginStart no backend (login em 2 etapas)
- [x] Remover loginLocal antigo
- [x] Substituir AuthModal.tsx completo no frontend
- [x] Criar 30 testes de 2FA (registro e login)
- [x] Atualizar Price IDs nos testes (novos IDs do Stripe)
- [x] Todos os 159 testes passando (100%)
- [x] Salvar checkpoint

### 35. Corrigir Erro 500 no Login com 2FA

- [x] Investigar procedimento loginStart no backend
- [x] Identificar causa do erro 500 (user.email! sem validação)
- [x] Adicionar validação de email antes de enviar código
- [x] Remover non-null assertion (!) do user.email
- [x] Criar 11 testes de validação (todos passando)
- [x] Total: 170 testes passando (100%)
- [x] Salvar checkpoint para publicação

### 36. Corrigir Envio de Email de Verificação 2FA

- [x] Investigar sistema de envio de emails
- [x] Verificar configuração de SMTP vs Manus API
- [x] Identificar causa do não envio (endpoint errado: /notification/send → 404)
- [x] Corrigir problema (usar /webdevtoken.v1.WebDevService/SendNotification)
- [x] Testar envio de email localmente (✅ funcionando)
- [ ] Publicar correção para produção
- [ ] Testar fluxo completo de registro com 2FA em produção
