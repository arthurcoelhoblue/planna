# Guia do Sistema VIP/Admin

## 📋 Visão Geral

O sistema VIP foi implementado para remover **todas as limitações** do Planna para usuários específicos (como o email de testes `arthurcsantos@gmail.com`). Usuários VIP têm acesso ilimitado a todas as funcionalidades sem restrições de tier ou paywall.

---

## ✅ Benefícios VIP

Usuários VIP possuem os seguintes privilégios:

### 1. **Planos Ilimitados**
- ✅ Criar quantos planos quiser por mês (sem limite)
- ✅ Não aparece modal de upgrade/paywall
- ✅ Funciona independente do tier (free/pro/premium)

### 2. **Acesso Total a Features**
- ✅ Informações nutricionais (calorias, macros)
- ✅ Dietas especiais personalizadas
- ✅ Features avançadas (IA, personalização)
- ✅ Exportar PDF
- ✅ Compartilhar via WhatsApp
- ✅ Todas as features futuras

### 3. **Sem Restrições**
- ✅ Não precisa fazer upgrade
- ✅ Não precisa adicionar cartão de crédito
- ✅ Acesso permanente e vitalício

---

## 🔧 Implementação Técnica

### Arquivo: `server/paywall.ts`

```typescript
// Lista de emails VIP (case-insensitive)
const VIP_EMAILS = [
  "arthurcsantos@gmail.com",
  // Adicione mais emails aqui se necessário
];

// Função de verificação
export function isVIPEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return VIP_EMAILS.includes(email.toLowerCase());
}
```

### Funções Modificadas

**1. `hasReachedMonthlyLimit(userId, tier, userEmail)`**
- Retorna `false` imediatamente se `isVIPEmail(userEmail) === true`
- VIPs nunca atingem limite mensal

**2. `canAccess(tier, feature, userEmail)`**
- Retorna `true` para todas as features se `isVIPEmail(userEmail) === true`
- VIPs têm acesso a tudo, independente do tier

---

## 🧪 Como Testar

### Teste 1: Login com Email VIP

1. Acesse o Planna
2. Faça login com: `arthurcsantos@gmail.com`
3. Verifique que você está logado com sucesso

### Teste 2: Criar Planos Ilimitados

1. Acesse `/planner`
2. Crie um plano (qualquer configuração)
3. Repita quantas vezes quiser
4. ✅ **Esperado:** Nenhum modal de paywall deve aparecer

### Teste 3: Acessar Features Premium

1. Acesse um plano criado
2. Tente exportar PDF
3. Verifique informações nutricionais
4. ✅ **Esperado:** Todas as features funcionam sem restrição

### Teste 4: Dashboard

1. Acesse `/dashboard`
2. Verifique seção "Minha Assinatura"
3. ✅ **Esperado:** Mostra tier atual (pode ser "free"), mas sem limitações reais

---

## 🔍 Verificação de Status VIP

Para verificar se um usuário é VIP, você pode:

### No Backend (TypeScript)

```typescript
import { isVIPEmail } from "./server/paywall";

const userEmail = "arthurcsantos@gmail.com";
console.log(isVIPEmail(userEmail)); // true
```

### Testes Automatizados

Execute os testes VIP:

```bash
pnpm test vip-system
```

**Resultado esperado:** 17 testes passando (100%)

---

## 📝 Adicionar Novos VIPs

Para adicionar mais emails VIP:

1. Abra `server/paywall.ts`
2. Adicione o email na lista `VIP_EMAILS`:

```typescript
const VIP_EMAILS = [
  "arthurcsantos@gmail.com",
  "novoemail@example.com",  // ← Adicione aqui
  "outroemail@example.com",
];
```

3. Salve o arquivo
4. O servidor reiniciará automaticamente (hot reload)
5. Pronto! O novo email já é VIP

---

## ⚠️ Observações Importantes

### Case-Insensitive
- Emails são comparados em lowercase
- `ARTHURCSANTOS@GMAIL.COM` = `arthurcsantos@gmail.com` = `ArthurCSantos@Gmail.com`

### Backward Compatibility
- Funções mantêm compatibilidade com código antigo
- Se `userEmail` não for passado, funciona normalmente (sem VIP)

### Segurança
- Lista de VIPs está no código do servidor (não exposta ao cliente)
- Impossível manipular via frontend
- Verificação acontece sempre no backend

---

## 🧪 Testes Unitários

### Cobertura de Testes

✅ **17 testes implementados:**

1. **isVIPEmail (7 testes)**
   - Reconhece email VIP (lowercase, uppercase, mixed case)
   - Rejeita emails não-VIP
   - Trata null, undefined e string vazia

2. **canAccess - VIP Override (3 testes)**
   - VIP acessa todas as features (tier free)
   - Não-VIP respeita limites normais
   - Backward compatibility (sem email)

3. **hasReachedMonthlyLimit - VIP Override (3 testes)**
   - VIP nunca atinge limite
   - Não-VIP verifica limites normalmente
   - Backward compatibility

4. **VIP Email List (2 testes)**
   - Pelo menos um VIP configurado
   - Case-insensitive

5. **VIP Benefits (2 testes)**
   - Lista todos os benefícios
   - Bypass de todas as restrições de tier

### Executar Testes

```bash
# Todos os testes
pnpm test

# Apenas testes VIP
pnpm test vip-system

# Apenas testes de paywall
pnpm test paywall
```

---

## 📊 Estatísticas

- **Emails VIP configurados:** 1 (`arthurcsantos@gmail.com`)
- **Features desbloqueadas:** Todas (100%)
- **Limite de planos:** Ilimitado (∞)
- **Testes passando:** 17/17 (100%)

---

## 🚀 Próximos Passos (Opcional)

### Badge VIP no Dashboard

Você pode adicionar um badge visual "VIP" ou "Admin" no dashboard:

```tsx
// client/src/pages/Dashboard.tsx
{isVIPEmail(user?.email) && (
  <Badge variant="premium" className="ml-2">
    VIP
  </Badge>
)}
```

### Logs de Auditoria

Para rastrear uso de privilégios VIP:

```typescript
if (isVIPEmail(userEmail)) {
  console.log(`[VIP] ${userEmail} bypassed limit check`);
}
```

---

## 📞 Suporte

Se precisar adicionar/remover VIPs ou modificar privilégios, edite:

- **Arquivo:** `server/paywall.ts`
- **Constante:** `VIP_EMAILS`
- **Testes:** `server/vip-system.test.ts`

---

**Última atualização:** 18/11/2025  
**Versão:** 1.0.0  
**Status:** ✅ Implementado e testado

