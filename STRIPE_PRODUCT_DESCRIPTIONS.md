# Descrições dos Planos para o Stripe Dashboard

Este documento contém as descrições profissionais e persuasivas para configurar os produtos **Pro** e **Premium** no Stripe Dashboard.

---

## 📋 Como Usar Este Documento

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá em **Products** → **Add Product**
3. Copie e cole as informações abaixo em cada campo correspondente

---

## 🟢 Plano Pro - R$ 29,90/mês

### Nome do Produto
```
Planna Pro
```

### Descrição do Produto (Product Description)
```
Plano ideal para quem quer economizar tempo e reduzir desperdício. Crie até 20 planos de marmitas por mês com suporte a dietas personalizadas, rastreamento de calorias e receitas avançadas. Perfeito para profissionais ocupados e famílias que buscam praticidade sem abrir mão da qualidade.
```

### Descrição Curta (Statement Descriptor - aparece na fatura do cartão)
```
PLANNA PRO MENSAL
```

### Features (Recursos) - Para exibir no checkout
```
✓ 20 planos de marmitas por mês
✓ Rastreamento completo de calorias
✓ Suporte a dietas personalizadas (vegana, vegetariana, low-carb, etc)
✓ Receitas avançadas com técnicas elaboradas
✓ Exportação para PDF
✓ Compartilhamento via WhatsApp
✓ Sincronização em todos os dispositivos
✓ Acesso ao aplicativo PWA (funciona offline)
```

### Metadata (Metadados) - Opcional, para organização interna
```
tier: pro
plan_type: subscription
max_plans_per_month: 20
features: calories,diet,advanced_recipes,pdf_export,whatsapp
```

---

## 🟣 Plano Premium - R$ 49,90/mês

### Nome do Produto
```
Planna Premium
```

### Descrição do Produto (Product Description)
```
Acesso ilimitado e completo ao Planna. Crie quantos planos quiser por mês, com suporte prioritário e todas as funcionalidades premium desbloqueadas. Ideal para nutricionistas, personal chefs, famílias grandes ou quem busca máxima flexibilidade no planejamento alimentar semanal.
```

### Descrição Curta (Statement Descriptor - aparece na fatura do cartão)
```
PLANNA PREMIUM MENSAL
```

### Features (Recursos) - Para exibir no checkout
```
✓ Planos ilimitados por mês (crie quantos quiser!)
✓ Rastreamento completo de calorias e macros
✓ Suporte a todas as dietas personalizadas
✓ Receitas avançadas e técnicas gourmet
✓ Suporte prioritário (resposta em até 24h)
✓ Exportação ilimitada para PDF
✓ Compartilhamento via WhatsApp, Facebook e Twitter
✓ Sincronização em todos os dispositivos
✓ Acesso antecipado a novas funcionalidades
✓ Histórico completo de todos os planos criados
✓ Dashboard com estatísticas e insights
```

### Metadata (Metadados) - Opcional, para organização interna
```
tier: premium
plan_type: subscription
max_plans_per_month: unlimited
features: calories,diet,advanced_recipes,pdf_export,whatsapp,priority_support,analytics
```

---

## 🎯 Dicas de Configuração no Stripe

### 1. Preço e Cobrança
- **Pro**: R$ 29,90 (BRL) - Recorrente mensal
- **Premium**: R$ 49,90 (BRL) - Recorrente mensal
- Marque como **Recurring** (Recorrente)
- Billing period: **Monthly** (Mensal)

### 2. Trial Period (Período de Teste) - Opcional
Considere adicionar um período de teste gratuito para aumentar conversões:
- **Pro**: 7 dias grátis
- **Premium**: 14 dias grátis

### 3. Tax Behavior (Comportamento Fiscal)
- Selecione **Exclusive** (preço não inclui impostos)
- Configure impostos brasileiros se necessário (ISS, PIS/COFINS)

### 4. Customer Portal (Portal do Cliente)
Certifique-se de habilitar no Stripe:
- ✅ Permitir cancelamento de assinatura
- ✅ Permitir atualização de método de pagamento
- ✅ Permitir visualização de faturas
- ✅ Permitir upgrade/downgrade entre planos

### 5. Webhooks
Configure o webhook endpoint para sincronizar assinaturas:
```
https://seu-dominio.com/api/stripe/webhook
```

Eventos obrigatórios:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## 📝 Após Criar os Produtos

1. **Copie os Price IDs** gerados pelo Stripe (formato: `price_xxxxxxxxxxxxx`)

2. **Adicione as variáveis de ambiente** no seu projeto:
   ```bash
   STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxx
   STRIPE_PRICE_ID_PREMIUM=price_xxxxxxxxxxxxx
   ```

3. **Teste em modo Test** antes de ativar em produção:
   - Use cartões de teste do Stripe
   - Valide fluxo completo: checkout → webhook → ativação

4. **Ative o modo Live** quando estiver pronto:
   - Troque as chaves de API (test → live)
   - Atualize os Price IDs para os IDs de produção
   - Configure webhook de produção

---

## 💡 Sugestões de Marketing

### Posicionamento dos Planos

**Plano Pro** → "Para quem leva a sério"
- Foco: Profissionais ocupados, famílias pequenas (2-4 pessoas)
- Benefício principal: Economia de tempo + controle nutricional
- CTA: "Economize 4 horas por semana"

**Plano Premium** → "Tudo ilimitado"
- Foco: Famílias grandes, nutricionistas, entusiastas de culinária
- Benefício principal: Flexibilidade total + suporte prioritário
- CTA: "Crie quantos planos quiser"

### Estratégias de Conversão

1. **Destaque o Plano Pro** como "Mais Popular" (badge verde)
2. **Ofereça desconto anual**: 20% off para pagamento anual (R$ 287/ano Pro, R$ 479/ano Premium)
3. **Trial gratuito**: 7-14 dias para testar sem compromisso
4. **Garantia de reembolso**: 30 dias para aumentar confiança
5. **Social proof**: Exiba número de assinantes ativos

---

## 🔒 Segurança e Compliance

- ✅ Pagamentos processados via Stripe (PCI-DSS compliant)
- ✅ Dados criptografados em trânsito (HTTPS/TLS)
- ✅ Cancelamento a qualquer momento (sem multas)
- ✅ Reembolso proporcional em caso de cancelamento
- ✅ Política de privacidade e termos de uso claros

---

## 📞 Suporte

Para dúvidas sobre configuração do Stripe:
- Documentação oficial: https://stripe.com/docs
- Suporte Stripe: https://support.stripe.com

---

**Última atualização**: 18 de novembro de 2025  
**Autor**: Manus AI  
**Versão**: 1.0

