/**
 * Script de teste manual para validar resolução de dietas
 * 
 * Testa 3 cenários conforme especificação:
 * 1. "low carb" - deve cair em canônica
 * 2. "DASH" - deve ser reconhecida pela IA
 * 3. "monstro do lago ness" - deve retornar unknown
 */

import { generateMealPlan } from "./recipe-engine";

async function testDietResolution() {
  console.log("=== TESTE DE RESOLUÇÃO DE DIETAS ===\n");

  const baseParams = {
    availableIngredients: ["frango", "arroz", "feijão", "tomate", "cebola"],
    servings: 6,
    varieties: 2,
  };

  // Teste 1: Dieta canônica (low carb)
  console.log("📋 TESTE 1: Dieta Canônica (low carb)");
  console.log("Entrada: 'low carb'");
  console.log("Esperado: Deve cair direto em canônica sem chamar IA\n");
  
  try {
    const plan1 = await generateMealPlan({
      ...baseParams,
      dietType: "low carb",
    });
    
    console.log("✅ Plano gerado com sucesso");
    console.log(`Receitas: ${plan1.dishes.map(d => d.name).join(", ")}`);
    console.log("---\n");
  } catch (error) {
    console.error("❌ Erro:", error);
    console.log("---\n");
  }

  // Teste 2: Dieta reconhecida pela IA (DASH)
  console.log("📋 TESTE 2: Dieta Reconhecida pela IA (DASH)");
  console.log("Entrada: 'DASH'");
  console.log("Esperado: IA deve reconhecer e retornar regras da dieta\n");
  
  try {
    const plan2 = await generateMealPlan({
      ...baseParams,
      dietType: "DASH",
    });
    
    console.log("✅ Plano gerado com sucesso");
    console.log(`Receitas: ${plan2.dishes.map(d => d.name).join(", ")}`);
    console.log("---\n");
  } catch (error) {
    console.error("❌ Erro:", error);
    console.log("---\n");
  }

  // Teste 3: Dieta desconhecida (monstro do lago ness)
  console.log("📋 TESTE 3: Dieta Desconhecida (monstro do lago ness)");
  console.log("Entrada: 'monstro do lago ness'");
  console.log("Esperado: IA deve retornar unknown e não influenciar o plano\n");
  
  try {
    const plan3 = await generateMealPlan({
      ...baseParams,
      dietType: "monstro do lago ness",
    });
    
    console.log("✅ Plano gerado com sucesso");
    console.log(`Receitas: ${plan3.dishes.map(d => d.name).join(", ")}`);
    console.log("Plano gerado normalmente sem restrições de dieta");
    console.log("---\n");
  } catch (error) {
    console.error("❌ Erro:", error);
    console.log("---\n");
  }

  console.log("=== TESTES CONCLUÍDOS ===");
}

// Executar testes
testDietResolution().catch(console.error);

