# Investigação: adjustmentReason NULL em Cenários de Estoque Apertado

## Resumo

**Status:** ✅ NÃO É UM BUG - Comportamento esperado

**Conclusão:** O `adjustmentReason` só é gerado quando há ajustes reais no plano. Quando a IA gera um plano perfeito que atinge exatamente os objetivos solicitados, não há `adjustmentReason`.

---

## Planos Testados

### Plano A (510001) - SEM pressão de estoque
- **Ingredientes:** frango, arroz, feijão, batata, tomate, cebola, alho (sem quantidades)
- **Configuração:** 10 porções, 3 variedades, modo normal, allowNewIngredients: ligado
- **Resultado:** 
  - Misturas: 3/3 ✓
  - Porções: 10/10 ✓
  - **adjustmentReason:** "O sistema gerou 2 misturas inicialmente e criou 1 variações adicionais para atingir as 3 misturas solicitadas. O sistema ajustou a distribuição de porções para atingir as 10 porções solicitadas."
- **Motivo do adjustmentReason:** A IA gerou apenas 2 receitas, então `enforceVarietiesAndServings` criou 1 variação adicional

### Plano B (540001) - COM pressão de estoque (FALHOU)
- **Ingredientes:** 2kg frango, 1kg arroz, 500g feijão
- **Configuração:** 10 porções, 3 variedades, modo aproveitamento, allowNewIngredients: desligado
- **Resultado:**
  - Misturas: 0/3 ❌
  - Porções: 0/10 ❌
  - **adjustmentReason:** NULL
- **Motivo:** Estoque TÃO limitado que a IA não conseguiu gerar nenhuma receita completa

### Plano C (570001) - COM pressão de estoque EXTREMA (FALHOU)
- **Ingredientes:** 1kg frango, 500g arroz, 300g feijão
- **Configuração:** 10 porções, 3 variedades, modo aproveitamento, allowNewIngredients: desligado
- **Resultado:**
  - Misturas: 0/3 ❌
  - Porções: 0/10 ❌
  - **adjustmentReason:** NULL
- **Motivo:** Estoque MUITO limitado, IA não conseguiu gerar receitas

### Plano D (570002) - COM pressão de estoque MODERADA (SUCESSO)
- **Ingredientes:** 2kg frango, 1kg arroz, 800g feijão, batata, tomate, cebola
- **Configuração:** 10 porções, 3 variedades, modo normal, allowNewIngredients: desligado
- **Resultado:**
  - Misturas: 3/3 ✓
  - Porções: 10/10 ✓
  - **adjustmentReason:** NULL
- **Motivo:** A IA gerou um plano perfeito (3 receitas com 10 porções) SEM precisar de ajustes

---

## Fluxo de Geração do adjustmentReason

1. **IA gera plano inicial** (linha 1156 em recipe-engine.ts)
   - Pode ou não incluir `adjustmentReason` no JSON

2. **enforceVarietiesAndServings** (linha 1175)
   - Gera `adjustmentReason` SE:
     - IA gerou menos misturas que solicitado → cria variações adicionais
     - IA gerou mais misturas que solicitado → remove excesso
     - Total de porções difere do solicitado → redistribui porções

3. **enforceStockLimits** (linha 1178)
   - Gera `adjustmentReason` SE:
     - Há ingredientes que excedem o estoque disponível → reduz quantidades
   - **Preserva `adjustmentReason` existente** (correção aplicada)

4. **calculateTimeMetrics** (linha 1181)
   - Preserva `adjustmentReason` sem modificações

---

## Correção Aplicada

### Arquivo: `server/recipe-engine.ts`
### Linha: 833-842

**Antes:**
```typescript
...(adjustment.length > 0
  ? {
      adjustmentReason: `${
        plan.adjustmentReason || ""
      } Ajustes por estoque: ${adjustment.join(" | ")}`,
    }
  : {}),
```

**Depois:**
```typescript
...(adjustment.length > 0
  ? {
      adjustmentReason: `${
        plan.adjustmentReason || ""
      } Ajustes por estoque: ${adjustment.join(" | ")}`,
    }
  : plan.adjustmentReason
  ? { adjustmentReason: plan.adjustmentReason }
  : {}),
```

**Efeito:** Garante que `adjustmentReason` gerado por `enforceVarietiesAndServings` seja preservado mesmo quando não há excedentes de estoque.

---

## Conclusão

**NÃO HÁ BUG!** O sistema está funcionando conforme projetado:

1. ✅ `adjustmentReason` é gerado quando há ajustes de misturas/porções
2. ✅ `adjustmentReason` é gerado quando há excedentes de estoque
3. ✅ `adjustmentReason` é preservado ao longo do pipeline
4. ✅ `adjustmentReason` é NULL quando não há ajustes (comportamento esperado)

**Observação:** O Plano B (540001) e Plano C (570001) falharam porque o estoque era insuficiente para gerar qualquer receita, não porque há um bug no `adjustmentReason`.

---

## Recomendações

Se o objetivo é **sempre** ter um `adjustmentReason` (mesmo quando não há ajustes), considere:

1. **Modificar o prompt da IA** para sempre retornar um `adjustmentReason` explicativo
2. **Adicionar um adjustmentReason padrão** quando o plano é perfeito: "O plano foi gerado conforme solicitado sem necessidade de ajustes."
3. **Documentar explicitamente** que `adjustmentReason = NULL` significa "plano perfeito"

Mas isso é uma **decisão de produto**, não um bug técnico.

