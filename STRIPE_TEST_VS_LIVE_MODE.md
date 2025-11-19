# Stripe: Test Mode vs Live Mode - Guia Completo

## 🚨 Erro: "No such price"

Você recebeu este erro ao tentar fazer upgrade:

```
TRPCClientError: No such price: 'price_1SVAW1ASdTYHUTQI7C2avtHK'
```

**Causa:** Os Price IDs que você criou estão no **Test Mode** do Stripe, mas o sistema em produção está configurado para usar **Live Mode**.

---

## 📊 Test Mode vs Live Mode

O Stripe tem dois ambientes completamente separados:

| Aspecto | Test Mode | Live Mode |
|---------|-----------|-----------|
| **Propósito** | Desenvolvimento e testes | Produção (dinheiro real) |
| **Pagamentos** | Simulados (gratuitos) | Reais (cobrados de verdade) |
| **Cartões** | Cartões de teste (4242...) | Cartões reais |
| **Price IDs** | Começam com `price_` | Começam com `price_` |
| **Dados** | Separados do Live | Separados do Test |
| **API Keys** | `pk_test_...` / `sk_test_...` | `pk_live_...` / `sk_live_...` |

**IMPORTANTE:** Price IDs criados em Test Mode **NÃO funcionam** em Live Mode e vice-versa.

---

## 🔍 Como Identificar o Modo Atual

### No Stripe Dashboard

Olhe no canto superior esquerdo:
- Se estiver escrito **"Test mode"** com um toggle laranja → Você está em Test Mode
- Se **NÃO** houver o toggle → Você está em Live Mode

### No Código

As chaves de API indicam o modo:
- `pk_test_...` ou `sk_test_...` → Test Mode
- `pk_live_...` ou `sk_live_...` → Live Mode

---

## ✅ Solução: 2 Opções

Você tem duas opções para resolver o erro:

### Opção 1: Usar Test Mode (Recomendado para Testes)

**Vantagens:**
- ✅ Gratuito (sem cobranças reais)
- ✅ Pode testar à vontade
- ✅ Usa cartões de teste (4242 4242 4242 4242)
- ✅ Ideal para desenvolvimento

**Como fazer:**

1. **Verificar se os produtos já existem em Test Mode**
   - Acesse Stripe Dashboard
   - Certifique-se de estar em **Test mode** (toggle no canto superior esquerdo)
   - Vá em **Products**
   - Você deve ver "Planna Pro" e "Planna Premium"

2. **Os Price IDs que você já tem são de Test Mode**
   - Pro: `price_1SVAW1ASdTYHUTQI7C2avtHK`
   - Premium: `price_1SVAWvASdTYHUTQIPpNdIvaa`

3. **Esses Price IDs já estão configurados no código!**
   - Não precisa mudar nada no código
   - Eles já estão em `server/stripe-products.ts`

4. **O problema é que o sistema está usando chaves de Live Mode**
   - Você precisa mudar para chaves de Test Mode

5. **Como obter as chaves de Test Mode:**
   - Acesse Stripe Dashboard
   - Ative **Test mode** (toggle no canto superior esquerdo)
   - Vá em **Developers** → **API keys**
   - Copie:
     - **Publishable key** (começa com `pk_test_`)
     - **Secret key** (clique em "Reveal" e copie, começa com `sk_test_`)

6. **Adicionar as chaves no Planna:**
   - Management UI → Settings → Secrets
   - Adicione/atualize:
     - `STRIPE_PUBLISHABLE_KEY` = `pk_test_xxxxx`
     - `STRIPE_SECRET_KEY` = `sk_test_xxxxx`

7. **Webhook Secret também precisa ser de Test Mode:**
   - No Stripe Dashboard (Test mode ativado)
   - Vá em **Developers** → **Webhooks**
   - Se ainda não criou o webhook em Test mode, crie agora:
     - URL: `https://plannameal-wdxbdcbk.manus.space/api/stripe/webhook`
     - Eventos: os mesmos 6 que você configurou antes
   - Copie o **Signing secret** (começa com `whsec_`)
   - Atualize no Management UI → Settings → Secrets:
     - `STRIPE_WEBHOOK_SECRET` = `whsec_xxxxx` (do Test mode)

---

### Opção 2: Usar Live Mode (Produção - Dinheiro Real)

**Vantagens:**
- ✅ Aceita pagamentos reais
- ✅ Pronto para produção
- ✅ Usuários pagam de verdade

**Desvantagens:**
- ❌ Pagamentos são reais (você será cobrado pelas taxas do Stripe)
- ❌ Precisa criar produtos novamente em Live Mode
- ❌ Mais arriscado para testes

**Como fazer:**

1. **Criar produtos em Live Mode**
   - Acesse Stripe Dashboard
   - **DESATIVE** Test mode (clique no toggle para desligar)
   - Vá em **Products** → **Add product**
   - Crie "Planna Pro":
     - Nome: Planna Pro
     - Preço: R$ 9,90 (BRL)
     - Recorrente: Mensal
   - Crie "Planna Premium":
     - Nome: Planna Premium
     - Preço: R$ 14,99 (BRL)
     - Recorrente: Mensal

2. **Copiar os novos Price IDs de Live Mode**
   - Após criar, copie os Price IDs (começam com `price_`)
   - Eles serão DIFERENTES dos Price IDs de Test Mode

3. **Atualizar o código com os novos Price IDs**
   - Edite `server/stripe-products.ts`
   - Substitua os Price IDs antigos pelos novos de Live Mode

4. **Obter chaves de Live Mode:**
   - Stripe Dashboard (Test mode DESATIVADO)
   - **Developers** → **API keys**
   - Copie:
     - **Publishable key** (começa com `pk_live_`)
     - **Secret key** (começa com `sk_live_`)

5. **Adicionar as chaves no Planna:**
   - Management UI → Settings → Secrets
   - Adicione/atualize:
     - `STRIPE_PUBLISHABLE_KEY` = `pk_live_xxxxx`
     - `STRIPE_SECRET_KEY` = `sk_live_xxxxx`

6. **Criar webhook em Live Mode:**
   - Stripe Dashboard (Test mode DESATIVADO)
   - **Developers** → **Webhooks** → **Add endpoint**
   - URL: `https://plannameal-wdxbdcbk.manus.space/api/stripe/webhook`
   - Eventos: os mesmos 6
   - Copie o **Signing secret** de Live Mode
   - Atualize:
     - `STRIPE_WEBHOOK_SECRET` = `whsec_xxxxx` (do Live mode)

---

## 🎯 Recomendação

**Para testes e desenvolvimento:** Use **Opção 1 (Test Mode)**

Motivos:
- Gratuito
- Seguro (sem risco de cobranças reais)
- Pode testar quantas vezes quiser
- Price IDs já estão configurados no código

**Para produção (quando estiver pronto para aceitar pagamentos reais):** Use **Opção 2 (Live Mode)**

---

## 📝 Checklist - Opção 1 (Test Mode)

- [ ] Ativar Test mode no Stripe Dashboard
- [ ] Verificar que produtos Pro e Premium existem em Test mode
- [ ] Copiar Publishable key de Test mode (`pk_test_`)
- [ ] Copiar Secret key de Test mode (`sk_test_`)
- [ ] Criar/verificar webhook em Test mode
- [ ] Copiar Webhook Secret de Test mode (`whsec_`)
- [ ] Adicionar as 3 chaves no Management UI → Settings → Secrets:
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- [ ] Testar checkout com cartão de teste: `4242 4242 4242 4242`

---

## 📝 Checklist - Opção 2 (Live Mode)

- [ ] Desativar Test mode no Stripe Dashboard
- [ ] Criar produtos Pro (R$ 9,90) e Premium (R$ 14,99) em Live mode
- [ ] Copiar novos Price IDs de Live mode
- [ ] Atualizar `server/stripe-products.ts` com novos Price IDs
- [ ] Copiar Publishable key de Live mode (`pk_live_`)
- [ ] Copiar Secret key de Live mode (`sk_live_`)
- [ ] Criar webhook em Live mode
- [ ] Copiar Webhook Secret de Live mode (`whsec_`)
- [ ] Adicionar as 3 chaves no Management UI → Settings → Secrets
- [ ] Republicar projeto
- [ ] Testar com cartão real

---

## 🔒 Segurança

**NUNCA compartilhe:**
- ❌ Secret keys (`sk_test_` ou `sk_live_`)
- ❌ Webhook secrets (`whsec_`)

**Pode compartilhar:**
- ✅ Publishable keys (`pk_test_` ou `pk_live_`)
- ✅ Price IDs (`price_`)

---

## 🧪 Cartões de Teste (Test Mode)

Quando estiver em Test Mode, use estes cartões:

| Cartão | Resultado |
|--------|-----------|
| `4242 4242 4242 4242` | Pagamento aprovado |
| `4000 0000 0000 0002` | Cartão recusado |
| `4000 0000 0000 9995` | Fundos insuficientes |

**Data de validade:** Qualquer data futura (ex: 12/25)  
**CVC:** Qualquer 3 dígitos (ex: 123)  
**CEP:** Qualquer (ex: 12345)

---

## ❓ FAQ

### P: Posso usar os mesmos Price IDs em Test e Live?
**R:** Não. Price IDs são únicos para cada modo.

### P: Se eu mudar de Test para Live, perco os dados?
**R:** Não. Os dados são separados. Test mode tem seus próprios dados, Live mode tem os seus.

### P: Qual modo devo usar agora?
**R:** Use Test Mode para testar o sistema. Quando estiver tudo funcionando e você quiser aceitar pagamentos reais, mude para Live Mode.

### P: Como sei se estou em Test ou Live mode?
**R:** Olhe as chaves de API:
- `pk_test_` / `sk_test_` = Test Mode
- `pk_live_` / `sk_live_` = Live Mode

### P: O webhook precisa ser criado nos dois modos?
**R:** Sim. Se você usa Test mode, crie webhook em Test mode. Se usa Live mode, crie em Live mode.

---

## 🚀 Próximos Passos

1. **Escolha qual opção usar** (Test Mode ou Live Mode)
2. **Siga o checklist** da opção escolhida
3. **Teste o checkout** após configurar
4. **Me avise se der algum erro**

---

**Última atualização:** 18 de novembro de 2025  
**Autor:** Manus AI  
**Versão:** 1.0

