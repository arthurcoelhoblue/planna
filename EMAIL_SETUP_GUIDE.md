# 📧 Guia de Configuração de Email SMTP - Planna

Este guia explica como configurar um serviço de email SMTP para enviar emails de verificação (2FA) e recuperação de senha no Planna.

---

## 🎯 Visão Geral

O Planna suporta dois métodos de envio de email:

1. **API de Notificação do Manus** (padrão, já configurado)
   - Funciona out-of-the-box
   - Limitado ao ambiente Manus
   - Ideal para desenvolvimento e testes

2. **SMTP Dedicado** (recomendado para produção)
   - Gmail, SendGrid, Amazon SES, Mailgun, etc.
   - Maior controle e confiabilidade
   - Melhor deliverability (taxa de entrega)
   - Suporta domínio personalizado

O sistema tenta SMTP primeiro (se configurado) e faz fallback para a API do Manus automaticamente.

---

## 📋 Opções de Serviço SMTP

### 1. Gmail (Mais Simples)

**Prós:**
- Gratuito para uso pessoal
- Fácil de configurar
- Confiável

**Contras:**
- Limite de 500 emails/dia
- Requer senha de aplicativo
- Não ideal para produção em larga escala

**Configuração:**

1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Vá em "Senhas de app" (App passwords)
4. Crie uma senha para "Mail"
5. Copie a senha gerada (16 caracteres)

**Variáveis de ambiente:**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # Senha de app (16 caracteres)
EMAIL_FROM=Planna <seu-email@gmail.com>
```

---

### 2. SendGrid (Recomendado para Produção)

**Prós:**
- 100 emails/dia grátis
- Excelente deliverability
- Analytics e logs detalhados
- Suporte a domínio personalizado

**Contras:**
- Requer cadastro e verificação
- Configuração um pouco mais complexa

**Configuração:**

1. Crie conta em: https://sendgrid.com
2. Vá em Settings → API Keys
3. Crie uma nova API Key com permissão "Mail Send"
4. Copie a API Key (começa com `SG.`)

**Variáveis de ambiente:**
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=apikey  # Literalmente "apikey"
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Planna <noreply@seudominio.com>
```

**Verificar domínio (opcional mas recomendado):**
1. Vá em Settings → Sender Authentication
2. Adicione seu domínio
3. Configure registros DNS (SPF, DKIM)
4. Aguarde verificação

---

### 3. Amazon SES (Melhor Custo-Benefício)

**Prós:**
- Extremamente barato ($0.10 por 1000 emails)
- Altamente escalável
- Integração com AWS

**Contras:**
- Configuração mais técnica
- Requer conta AWS
- Modo sandbox inicial (precisa solicitar produção)

**Configuração:**

1. Acesse AWS Console: https://console.aws.amazon.com/ses
2. Verifique seu domínio ou email
3. Crie credenciais SMTP:
   - Vá em "SMTP Settings"
   - Clique em "Create My SMTP Credentials"
   - Copie username e password
4. Solicite saída do sandbox (se necessário):
   - Vá em "Account Dashboard"
   - Clique em "Request Production Access"

**Variáveis de ambiente:**
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com  # Mude região se necessário
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=AKIAXXXXXXXXXXXXXXXX  # SMTP username
EMAIL_PASS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # SMTP password
EMAIL_FROM=Planna <noreply@seudominio.com>
```

---

### 4. Mailgun

**Prós:**
- 5.000 emails/mês grátis (3 meses)
- API simples
- Bom suporte

**Contras:**
- Requer cartão de crédito
- Plano grátis limitado

**Configuração:**

1. Crie conta em: https://mailgun.com
2. Vá em Sending → Domain Settings → SMTP credentials
3. Copie as credenciais

**Variáveis de ambiente:**
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=postmaster@seudominio.mailgun.org
EMAIL_PASS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Planna <noreply@seudominio.com>
```

---

## 🔧 Como Configurar no Projeto

### Opção A: Via Interface do Manus (Recomendado)

1. Acesse a interface do Manus
2. Vá em **Settings → Secrets** (Configurações → Segredos)
3. Adicione as seguintes variáveis:

| Nome | Valor | Exemplo |
|------|-------|---------|
| `EMAIL_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `EMAIL_PORT` | Porta SMTP | `465` |
| `EMAIL_SECURE` | Usar SSL/TLS | `true` |
| `EMAIL_USER` | Usuário/email | `seu-email@gmail.com` |
| `EMAIL_PASS` | Senha/API key | `xxxx xxxx xxxx xxxx` |
| `EMAIL_FROM` | Remetente | `Planna <noreply@planna.app>` |

4. Salve as alterações
5. **Reinicie o servidor** para aplicar

### Opção B: Via Arquivo .env (Desenvolvimento Local)

Adicione ao arquivo `.env`:

```bash
# Email SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=Planna <seu-email@gmail.com>
```

---

## ✅ Testar Configuração

### 1. Teste de Registro (2FA)

1. Acesse a landing page do Planna
2. Clique em "Começar Agora" ou "Entrar"
3. Clique em "Cadastre-se"
4. Preencha nome, email e senha
5. Clique em "Criar Conta"
6. **Verifique sua caixa de entrada** (e spam)
7. Você deve receber um email com código de 6 dígitos
8. Insira o código para ativar a conta

### 2. Teste de Recuperação de Senha

1. Na tela de login, clique em "Esqueci minha senha"
2. Digite seu email
3. Clique em "Enviar"
4. **Verifique sua caixa de entrada** (e spam)
5. Você deve receber um email com link de redefinição
6. Clique no link e crie uma nova senha

### 3. Verificar Logs

Verifique os logs do servidor para confirmar o método usado:

```bash
# Se SMTP funcionou:
[Email] Sent via SMTP to usuario@example.com

# Se usou fallback:
[Email] SMTP failed, trying Manus API fallback...
[Email] Sent via Manus API to usuario@example.com
```

---

## 🔍 Troubleshooting

### "Failed to send email"

**Possíveis causas:**
1. Credenciais incorretas
2. Porta bloqueada pelo firewall
3. Autenticação de dois fatores não configurada (Gmail)
4. Domínio não verificado (SendGrid, SES)

**Soluções:**
1. Verifique se todas as variáveis estão corretas
2. Teste com porta 587 ao invés de 465
3. Crie senha de aplicativo (Gmail)
4. Verifique domínio no serviço SMTP

### Emails caindo no spam

**Soluções:**
1. Configure SPF, DKIM e DMARC no seu domínio
2. Use um domínio verificado
3. Evite palavras spam no assunto
4. Use SendGrid ou SES (melhor reputação)

### "SMTP not configured, using fallback"

Isso é normal se você não configurou SMTP. O sistema usa a API do Manus como fallback.

Para usar SMTP, adicione todas as 6 variáveis de ambiente listadas acima.

---

## 📊 Comparação de Serviços

| Serviço | Grátis | Limite | Deliverability | Complexidade | Recomendado Para |
|---------|--------|--------|----------------|--------------|------------------|
| Gmail | ✅ | 500/dia | ⭐⭐⭐ | ⭐ | Desenvolvimento |
| SendGrid | ✅ | 100/dia | ⭐⭐⭐⭐⭐ | ⭐⭐ | Produção pequena/média |
| Amazon SES | ❌ | Ilimitado | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Produção grande |
| Mailgun | ⏰ | 5k/mês | ⭐⭐⭐⭐ | ⭐⭐ | Produção média |
| Manus API | ✅ | ? | ⭐⭐⭐ | ⭐ | Desenvolvimento |

---

## 🎯 Recomendação

**Para desenvolvimento/testes:**
- Use a API do Manus (já configurada, sem setup adicional)

**Para produção pequena (< 100 usuários/dia):**
- Use **SendGrid** (100 emails/dia grátis, excelente deliverability)

**Para produção média/grande:**
- Use **Amazon SES** (custo baixíssimo, altamente escalável)

**Para setup rápido:**
- Use **Gmail** com senha de aplicativo (limite de 500/dia)

---

## 📚 Recursos Adicionais

- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid SMTP Guide](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Amazon SES SMTP Guide](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Email Deliverability Best Practices](https://sendgrid.com/blog/email-deliverability-best-practices/)

---

**Última atualização**: Novembro 2025

