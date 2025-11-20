import { generateMealPlan } from "./recipe-engine";

async function testSync() {
  console.log("=== TESTE DE SINCRONIZAÇÃO ===\n");
  
  const plan = await generateMealPlan({
    availableIngredients: ["frango", "arroz", "feijão", "tomate"],
    servings: 20,
    varieties: 3,
    allowNewIngredients: false,
  });

  console.log("Dishes:", plan.dishes.length);
  console.log("\nPorções por receita:");
  plan.dishes.forEach((dish, i) => {
    console.log(`  ${i + 1}. ${dish.name}: ${dish.servings} porções`);
    console.log(`     totalKcal: ${dish.totalKcal}, kcalPerServing: ${dish.kcalPerServing}`);
  });

  const totalServings = plan.dishes.reduce((sum, dish) => sum + dish.servings, 0);
  console.log(`\nTotal de porções: ${totalServings}`);
  console.log(`Total de calorias: ${plan.totalKcal}`);
  console.log(`Média por porção: ${plan.avgKcalPerServing}`);
  console.log(`\nadjustmentReason: ${plan.adjustmentReason}`);
}

testSync().catch(console.error);
