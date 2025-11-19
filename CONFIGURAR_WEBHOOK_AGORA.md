# ⚡ Configurar Webhook do Stripe - Instruções Específicas

Seu projeto está publicado em: **https://plannameal-wdxbdcbk.manus.space**

Siga este guia passo a passo para configurar o webhook.

---

## 🎯 URL do Seu Webhook

```
https://plannameal-wdxbdcbk.manus.space/api/stripe/webhook
```

**Copie essa URL exata** - você vai precisar dela no Stripe Dashboard.

---

## 📋 Passo a Passo Rápido

### 1️⃣ Acesse o Stripe Dashboard

1. Vá para: https://dashboard.stripe.com/
2. Faça login
3. **IMPORTANTE**: Mude para **"Live mode"** (canto superior esquerdo)
   - Se estiver escrito "Test mode", clique para mudar para "Live mode"

---

### 2️⃣ Crie o Webhook

1. No menu lateral, clique em **"Developers"**
2. Clique em **"Webhooks"**
3. Clique no botão **"Add endpoint"** (azul, canto superior direito)

---

### 3️⃣ Preencha os Dados

**Endpoint URL:**
```
https://plannameal-wdxbdcbk.manus.space/api/stripe/webhook
```

**Description (opcional):**
```
Planna - Sincronização de Assinaturas
```

**Events to send:**

Clique em **"Select events"** e marque estes 6 eventos:

1. ✅ `checkout.session.completed`
2. ✅ `customer.subscription.created`
3. ✅ `customer.subscription.updated`
4. ✅ `customer.subscription.deleted`
5. ✅ `invoice.paid`
6. ✅ `invoice.payment_failed`

**Dica:** Use a busca para encontrar cada evento rapidamente.

---

### 4️⃣ Salve e Copie o Secret

1. Clique em **"Add endpoint"** no final da página
2. Na tela seguinte, procure a seção **"Signing secret"**
3. Clique em **"Reveal"** (ou "Click to reveal")
4. Copie o secret completo (começa com `whsec_`)

**Exemplo do formato:**
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 5️⃣ Adicione o Secret no Planna

Agora você tem 2 opções:

#### Opção A: Via Management UI (Recomendado)

1. Acesse: https://plannameal-wdxbdcbk.manus.space
2. Faça login como admin
3. Clique no ícone de **engrenagem** (Settings) no canto superior direito
4. No menu lateral, clique em **"Secrets"**
5. Clique em **"Add Secret"** ou **"+"**
6. Preencha:
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: Cole o secret que você copiou
7. Clique em **"Save"**

#### Opção B: Me envie o Secret

Se preferir, você pode me enviar o Webhook Secret aqui no chat e eu configuro para você.

**Formato:**
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 6️⃣ Teste o Webhook

Após adicionar o secret, teste se está funcionando:

**Teste Rápido no Stripe:**

1. Volte para o Stripe Dashboard → Developers → Webhooks
2. Clique no webhook que você criou
3. Role até **"Send test webhook"**
4. Selecione `checkout.session.completed`
5. Clique em **"Send test webhook"**

**Resultado esperado:**
- ✅ Status: `200`
- ✅ Response: `{"verified": true}`

Se você viu isso, **está funcionando perfeitamente!** 🎉

---

### 7️⃣ Teste Real (Opcional)

Para testar o fluxo completo de pagamento:

1. Acesse: https://plannameal-wdxbdcbk.manus.space
2. Faça login (ou crie uma conta de teste)
3. Clique em **"Assinar Pro"** (R$ 9,90/mês)
4. Use este cartão de teste:
   - **Número**: `4242 4242 4242 4242`
   - **Data**: `12/25` (ou qualquer data futura)
   - **CVC**: `123` (ou qualquer 3 dígitos)
   - **CEP**: `12345` (ou qualquer)
5. Complete o pagamento

**O que deve acontecer:**
1. Você é redirecionado de volta para o Planna
2. Sua assinatura aparece como **"Pro - Ativo"** no Dashboard
3. Você pode criar até 20 planos por mês
4. Features nutricionais estão desbloqueadas

---

## 🔍 Verificar se Funcionou

**No Stripe Dashboard:**
1. Vá em **Developers** → **Webhooks**
2. Clique no seu webhook
3. Clique na aba **"Events"**
4. Você deve ver os eventos sendo enviados (se já fez algum teste)

**No Planna:**
1. Faça login como admin
2. Vá em **Dashboard**
3. Seção **"Minha Assinatura"** deve mostrar o plano correto

---

## ❌ Problemas Comuns

### Erro 400: Bad Request

**Causa:** Signing secret incorreto

**Solução:**
1. Verifique se você copiou o secret completo
2. Certifique-se de que adicionou em `STRIPE_WEBHOOK_SECRET`
3. Reinicie o servidor (pode levar 1-2 minutos)

### Erro 404: Not Found

**Causa:** URL incorreta

**Solução:**
1. Verifique se a URL está exatamente assim:
   ```
   https://plannameal-wdxbdcbk.manus.space/api/stripe/webhook
   ```
2. Certifique-se de que o projeto está publicado

### Pagamento OK mas tier não atualiza

**Causa:** Webhook não configurado ou evento faltando

**Solução:**
1. Verifique se marcou todos os 6 eventos
2. Especialmente `checkout.session.completed`
3. Teste novamente enviando um evento de teste

---

## 📞 Precisa de Ajuda?

Se tiver qualquer problema, me envie:
1. Screenshot do erro (se houver)
2. O Webhook Secret (se precisar que eu configure)
3. Descrição do que aconteceu

Estou aqui para ajudar! 🚀

---

**Última atualização:** 18 de novembro de 2025  
**URL do projeto:** https://plannameal-wdxbdcbk.manus.space  
**Webhook endpoint:** https://plannameal-wdxbdcbk.manus.space/api/stripe/webhook

