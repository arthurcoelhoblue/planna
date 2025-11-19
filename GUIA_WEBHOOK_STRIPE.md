# Guia Completo: Configurar Webhook do Stripe em Produção

Este guia te ajudará a configurar o webhook do Stripe para sincronizar automaticamente as assinaturas dos usuários do Planna.

---

## 🎯 O Que é o Webhook?

O webhook é um endpoint que o Stripe chama automaticamente quando eventos importantes acontecem (pagamento aprovado, assinatura cancelada, etc). Sem ele, o sistema não saberá quando um usuário fez upgrade ou cancelou a assinatura.

**Endpoint já implementado no Planna:**
```
POST /api/stripe/webhook
```

**Localização no código:** `server/_core/index.ts` (linha 36-39)

---

## 📋 Pré-requisitos

Antes de começar, você precisa:

1. ✅ Ter criado os produtos Pro e Premium no Stripe (já feito!)
2. ✅ Ter os Price IDs configurados no código (já feito!)
3. 🔲 Ter o projeto publicado em produção (domínio público acessível)
4. 🔲 Ter a chave secreta do webhook (vamos gerar agora)

---

## 🚀 Passo a Passo

### Passo 1: Publicar o Projeto

Antes de configurar o webhook, você precisa publicar o projeto para ter uma URL pública.

**No Planna Dashboard (Management UI):**
1. Clique no botão **"Publish"** no canto superior direito
2. Aguarde o deploy ser concluído
3. Anote a URL de produção (ex: `https://planna.manus.space` ou seu domínio customizado)

**Sua URL de webhook será:**
```
https://SEU-DOMINIO/api/stripe/webhook
```

---

### Passo 2: Acessar o Stripe Dashboard

1. Acesse https://dashboard.stripe.com/
2. Faça login com sua conta
3. **IMPORTANTE**: Certifique-se de estar no modo **"Live"** (não "Test")
   - No canto superior esquerdo, você verá um toggle "Test mode" / "Live mode"
   - Mude para **Live mode** (produção)

---

### Passo 3: Criar o Webhook Endpoint

1. No menu lateral esquerdo, clique em **"Developers"**
2. Clique em **"Webhooks"**
3. Clique no botão **"Add endpoint"** (ou "+ Add an endpoint")

---

### Passo 4: Configurar o Endpoint

Na tela de criação do webhook, preencha:

#### 4.1 Endpoint URL
```
https://SEU-DOMINIO/api/stripe/webhook
```

**Exemplo:**
- Se seu domínio é `planna.manus.space`: `https://planna.manus.space/api/stripe/webhook`
- Se você tem domínio customizado `meusite.com.br`: `https://meusite.com.br/api/stripe/webhook`

#### 4.2 Description (Opcional)
```
Planna - Sincronização de Assinaturas
```

#### 4.3 Events to Send

Clique em **"Select events"** e marque os seguintes eventos:

**Eventos Obrigatórios:**

| Evento | Descrição | Quando Acontece |
|--------|-----------|-----------------|
| `checkout.session.completed` | Checkout finalizado | Usuário completou pagamento |
| `customer.subscription.created` | Assinatura criada | Nova assinatura ativada |
| `customer.subscription.updated` | Assinatura atualizada | Upgrade/downgrade de plano |
| `customer.subscription.deleted` | Assinatura cancelada | Usuário cancelou assinatura |
| `invoice.paid` | Fatura paga | Renovação mensal bem-sucedida |
| `invoice.payment_failed` | Pagamento falhou | Cartão recusado na renovação |

**Como selecionar:**
1. Na busca, digite o nome do evento (ex: "checkout.session")
2. Marque o checkbox do evento
3. Repita para todos os 6 eventos acima

#### 4.4 API Version

Deixe a versão padrão (geralmente a mais recente, ex: "2024-11-20")

---

### Passo 5: Salvar e Copiar o Signing Secret

1. Clique no botão **"Add endpoint"** no final da página
2. O webhook será criado e você verá a tela de detalhes
3. Na seção **"Signing secret"**, clique em **"Reveal"**
4. Copie o secret (formato: `whsec_xxxxxxxxxxxxxxxxxxxxx`)

**⚠️ IMPORTANTE:** Este secret é sensível! Não compartilhe publicamente.

---

### Passo 6: Adicionar o Secret no Planna

Agora você precisa adicionar o Webhook Secret no sistema.

**No Planna Management UI:**

1. Acesse o **Dashboard** do projeto
2. Vá em **Settings** (ícone de engrenagem)
3. Clique em **"Secrets"** no menu lateral
4. Clique em **"Add Secret"**
5. Preencha:
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: Cole o secret que você copiou (ex: `whsec_xxxxxxxxxxxxxxxxxxxxx`)
6. Clique em **"Save"**

**Ou via linha de comando (se preferir):**
```bash
# Adicionar variável de ambiente
export STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxx"
```

---

### Passo 7: Testar o Webhook

Após configurar, é hora de testar!

#### 7.1 Teste Automático do Stripe

1. Volte para o Stripe Dashboard → Developers → Webhooks
2. Clique no webhook que você acabou de criar
3. Role até a seção **"Send test webhook"**
4. Selecione o evento `checkout.session.completed`
5. Clique em **"Send test webhook"**

**Resultado esperado:**
- Status: `200 OK`
- Resposta: `{"verified": true}`

Se você viu isso, **parabéns! O webhook está funcionando!** ✅

#### 7.2 Teste Real (Pagamento de Teste)

Para testar o fluxo completo:

1. Acesse seu site publicado
2. Faça login com uma conta de teste
3. Clique em **"Assinar Pro"**
4. Use um cartão de teste do Stripe:
   - Número: `4242 4242 4242 4242`
   - Data: Qualquer data futura (ex: 12/25)
   - CVC: Qualquer 3 dígitos (ex: 123)
   - CEP: Qualquer (ex: 12345)
5. Complete o pagamento

**O que deve acontecer:**
1. Você é redirecionado de volta para o Planna
2. O webhook é chamado automaticamente pelo Stripe
3. Sua assinatura é ativada no banco de dados
4. Você tem acesso às features do plano Pro

**Como verificar:**
- Vá no Dashboard do Planna
- Seção "Minha Assinatura" deve mostrar "Pro - Ativo"
- Você pode criar até 20 planos por mês

---

## 🔍 Troubleshooting (Solução de Problemas)

### Problema 1: Webhook retorna erro 400

**Causa:** Signing secret incorreto ou não configurado

**Solução:**
1. Verifique se você adicionou `STRIPE_WEBHOOK_SECRET` nas variáveis de ambiente
2. Certifique-se de copiar o secret completo (começa com `whsec_`)
3. Reinicie o servidor após adicionar o secret

### Problema 2: Webhook retorna erro 404

**Causa:** URL do endpoint incorreta

**Solução:**
1. Verifique se a URL está correta: `https://SEU-DOMINIO/api/stripe/webhook`
2. Certifique-se de que o projeto está publicado e acessível
3. Teste acessar `https://SEU-DOMINIO` no navegador (deve abrir o site)

### Problema 3: Webhook retorna erro 500

**Causa:** Erro no código do handler

**Solução:**
1. Verifique os logs do servidor
2. Acesse Management UI → Dashboard → Logs
3. Procure por erros relacionados a `[Webhook]`
4. Se necessário, entre em contato com suporte

### Problema 4: Pagamento aprovado mas tier não atualiza

**Causa:** Webhook não está sendo chamado ou evento não está configurado

**Solução:**
1. Verifique se o evento `checkout.session.completed` está marcado no webhook
2. Vá no Stripe Dashboard → Developers → Webhooks → Seu webhook
3. Clique na aba **"Events"** para ver se o Stripe está enviando eventos
4. Se não houver eventos, o webhook não está sendo chamado

---

## 📊 Monitoramento

Após configurar, você pode monitorar os eventos do webhook:

**No Stripe Dashboard:**
1. Vá em **Developers** → **Webhooks**
2. Clique no seu webhook
3. Aba **"Events"**: Veja todos os eventos enviados
4. Aba **"Attempts"**: Veja tentativas de entrega (sucesso/falha)

**No Planna:**
1. Acesse Management UI → Dashboard → Logs
2. Filtre por `[Webhook]` para ver logs do webhook
3. Cada evento processado aparecerá aqui

---

## 🔒 Segurança

O webhook do Planna já implementa as melhores práticas de segurança:

✅ **Verificação de assinatura**: Valida que o evento veio realmente do Stripe  
✅ **Raw body parsing**: Necessário para verificar a assinatura criptográfica  
✅ **Idempotência**: Eventos duplicados são tratados corretamente  
✅ **Logging**: Todos os eventos são registrados para auditoria  

**Nunca:**
- ❌ Desabilite a verificação de assinatura
- ❌ Exponha o webhook secret publicamente
- ❌ Confie em eventos sem verificar a assinatura

---

## 📝 Checklist Final

Antes de considerar a configuração completa, verifique:

- [ ] Projeto publicado em produção
- [ ] Webhook criado no Stripe Dashboard (modo Live)
- [ ] URL do endpoint correta (`https://SEU-DOMINIO/api/stripe/webhook`)
- [ ] 6 eventos configurados (checkout, subscription, invoice)
- [ ] Signing secret copiado e adicionado em `STRIPE_WEBHOOK_SECRET`
- [ ] Teste automático do Stripe passou (200 OK)
- [ ] Teste real com cartão de teste funcionou
- [ ] Tier atualizado no banco de dados após pagamento
- [ ] Features do plano desbloqueadas

---

## 🎉 Pronto!

Se você completou todos os passos acima, seu webhook está configurado e funcionando! 

**O que acontece agora:**
- Usuários podem fazer upgrade diretamente no site
- Pagamentos são processados pelo Stripe
- Assinaturas são sincronizadas automaticamente
- Cancelamentos são detectados e processados
- Renovações mensais funcionam sem intervenção manual

---

## 📞 Suporte

**Dúvidas sobre o Stripe:**
- Documentação: https://stripe.com/docs/webhooks
- Suporte: https://support.stripe.com

**Dúvidas sobre o Planna:**
- Logs do servidor: Management UI → Dashboard → Logs
- Status do webhook: Stripe Dashboard → Developers → Webhooks

---

**Última atualização:** 18 de novembro de 2025  
**Autor:** Manus AI  
**Versão:** 1.0

