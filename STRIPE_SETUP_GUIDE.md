# 🔧 Guia de Configuração do Stripe - Planna

Este guia explica como configurar os produtos e preços no Stripe Dashboard para ativar os pagamentos reais no Planna.

---

## 📋 Pré-requisitos

- Conta Stripe criada (você já tem)
- Acesso ao Stripe Dashboard: https://dashboard.stripe.com
- Modo de teste ou produção (recomendamos começar em teste)

---

## 🎯 Passo 1: Acessar o Stripe Dashboard

1. Acesse: https://dashboard.stripe.com
2. Faça login com suas credenciais
3. Verifique se está no modo correto:
   - **Teste** (recomendado para começar): toggle no canto superior direito deve mostrar "Test mode"
   - **Produção** (para pagamentos reais): toggle deve estar em "Live mode"

---

## 💳 Passo 2: Criar Produto "Pro"

1. No menu lateral, clique em **"Products"** (Produtos)
2. Clique no botão **"+ Add product"** (Adicionar produto)
3. Preencha os campos:
   - **Name** (Nome): `Planna Pro`
   - **Description** (Descrição): `Plano Pro - 20 planos por mês, rastreamento de calorias, suporte a dietas especiais`
   - **Pricing model**: Selecione **"Standard pricing"**
   - **Price**: `29.90`
   - **Currency**: `BRL` (Real brasileiro)
   - **Billing period**: `Monthly` (Mensal)
   - **Payment type**: `Recurring` (Recorrente)
4. Clique em **"Save product"** (Salvar produto)
5. **IMPORTANTE**: Após salvar, copie o **Price ID** que aparece (formato: `price_xxxxxxxxxxxxx`)
   - Este ID será usado na variável de ambiente `STRIPE_PRICE_ID_PRO`

---

## 💎 Passo 3: Criar Produto "Premium"

1. Ainda na página **"Products"**, clique novamente em **"+ Add product"**
2. Preencha os campos:
   - **Name** (Nome): `Planna Premium`
   - **Description** (Descrição): `Plano Premium - Planos ilimitados, suporte prioritário, todos os recursos`
   - **Pricing model**: Selecione **"Standard pricing"**
   - **Price**: `49.90`
   - **Currency**: `BRL` (Real brasileiro)
   - **Billing period**: `Monthly` (Mensal)
   - **Payment type**: `Recurring` (Recorrente)
3. Clique em **"Save product"** (Salvar produto)
4. **IMPORTANTE**: Copie o **Price ID** que aparece (formato: `price_xxxxxxxxxxxxx`)
   - Este ID será usado na variável de ambiente `STRIPE_PRICE_ID_PREMIUM`

---

## 🔑 Passo 4: Configurar Variáveis de Ambiente

Agora você tem dois Price IDs. Vamos configurá-los no projeto:

### Opção A: Via Interface do Manus (Recomendado)

1. Acesse a interface do Manus
2. Vá em **Settings → Secrets** (Configurações → Segredos)
3. Adicione as seguintes variáveis:
   - **Nome**: `STRIPE_PRICE_ID_PRO`
   - **Valor**: Cole o Price ID do produto Pro (ex: `price_1AbCdEfGhIjKlMnO`)
   
   - **Nome**: `STRIPE_PRICE_ID_PREMIUM`
   - **Valor**: Cole o Price ID do produto Premium (ex: `price_1PqRsTuVwXyZaBcD`)

4. Salve as alterações
5. **Reinicie o servidor** para aplicar as novas variáveis

### Opção B: Via Arquivo .env (Desenvolvimento Local)

Se estiver rodando localmente, adicione ao arquivo `.env`:

```bash
STRIPE_PRICE_ID_PRO=price_1AbCdEfGhIjKlMnO
STRIPE_PRICE_ID_PREMIUM=price_1PqRsTuVwXyZaBcD
```

---

## ✅ Passo 5: Testar a Integração

### Teste em Modo Teste (Test Mode)

1. Acesse a landing page do Planna
2. Role até a seção de pricing
3. Clique em **"Assinar Pro"** ou **"Assinar Premium"**
4. Você será redirecionado para o Stripe Checkout
5. Use um cartão de teste do Stripe:
   - **Número**: `4242 4242 4242 4242`
   - **Data**: Qualquer data futura (ex: 12/25)
   - **CVC**: Qualquer 3 dígitos (ex: 123)
   - **CEP**: Qualquer CEP válido (ex: 01310-100)
6. Complete o pagamento
7. Você deve ser redirecionado de volta para `/planner?checkout=success`
8. Verifique no Stripe Dashboard se a assinatura foi criada

### Teste em Modo Produção (Live Mode)

⚠️ **ATENÇÃO**: Em modo produção, pagamentos são REAIS e cobram dinheiro de verdade!

1. Mude o toggle no Stripe Dashboard para **"Live mode"**
2. Repita os passos 2 e 3 para criar os produtos em modo produção
3. Atualize as variáveis de ambiente com os novos Price IDs de produção
4. Configure o webhook em produção (veja próxima seção)
5. Teste com um cartão real (será cobrado)

---

## 🔔 Passo 6: Configurar Webhook (Importante!)

O webhook é necessário para atualizar o status da assinatura no banco de dados quando:
- Um pagamento é confirmado
- Uma assinatura é cancelada
- Uma assinatura expira

### Configurar Webhook:

1. No Stripe Dashboard, vá em **"Developers → Webhooks"**
2. Clique em **"+ Add endpoint"**
3. Preencha:
   - **Endpoint URL**: `https://SEU_DOMINIO.manus.space/api/stripe/webhook`
   - **Description**: `Planna webhook handler`
   - **Events to send**: Selecione:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Clique em **"Add endpoint"**
5. **IMPORTANTE**: Copie o **Signing secret** (formato: `whsec_xxxxxxxxxxxxx`)
6. Adicione como variável de ambiente:
   - **Nome**: `STRIPE_WEBHOOK_SECRET`
   - **Valor**: Cole o signing secret

---

## 📊 Verificar Status das Assinaturas

### No Stripe Dashboard:

1. Vá em **"Customers"** (Clientes) para ver lista de usuários
2. Vá em **"Subscriptions"** (Assinaturas) para ver assinaturas ativas
3. Vá em **"Payments"** (Pagamentos) para ver histórico de transações

### No Banco de Dados do Planna:

Acesse a interface de gerenciamento do banco de dados e consulte:

```sql
-- Ver assinaturas ativas
SELECT u.email, u.subscriptionTier, s.status, s.currentPeriodEnd
FROM users u
LEFT JOIN subscriptions s ON u.id = s.userId
WHERE u.subscriptionTier != 'free';
```

---

## 🎉 Pronto!

Agora seu sistema de pagamentos está configurado e funcionando. Os usuários podem:

1. ✅ Assinar planos Pro e Premium
2. ✅ Fazer pagamentos via Stripe Checkout
3. ✅ Ter suas assinaturas gerenciadas automaticamente
4. ✅ Cancelar assinaturas via portal do cliente

---

## 🆘 Problemas Comuns

### "Invalid price ID"
- Verifique se os Price IDs foram copiados corretamente
- Certifique-se de que está usando o Price ID do modo correto (test vs live)
- Reinicie o servidor após adicionar as variáveis

### "Webhook signature verification failed"
- Verifique se o `STRIPE_WEBHOOK_SECRET` está correto
- Certifique-se de que o endpoint está acessível publicamente
- Teste o webhook no Stripe Dashboard usando "Send test webhook"

### "Subscription not updating in database"
- Verifique se o webhook está configurado corretamente
- Verifique os logs do servidor para erros
- Teste manualmente o endpoint `/api/stripe/webhook`

---

## 📚 Recursos Adicionais

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)

---

**Última atualização**: Novembro 2025

