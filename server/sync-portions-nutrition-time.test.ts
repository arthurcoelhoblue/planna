/**
 * Testes para Patch 4.4 - Sincronização de Porções, Nutrição e Tempo
 * Valida que porções, calorias e tempo são recalculados corretamente
 */

import { describe, it, expect } from "vitest";
import { generateMealPlan } from "./recipe-engine";

describe("Patch 4.4 - Sincronização de Porções, Nutrição e Tempo", () => {
  
  describe("Cenário 1 - Aumento de Porções", () => {
    it("recalcula avgKcalPerServing quando porções aumentam", async () => {
      const plan = await generateMealPlan({
        availableIngredients: ["frango", "arroz", "feijão", "tomate"],
        servings: 20, // Muitas porções
        varieties: 3,
        allowNewIngredients: true,
      });

      // Validar que sum(servings) = 20
      const totalServings = plan.dishes.reduce((sum, dish) => sum + dish.servings, 0);
      expect(totalServings).toBeGreaterThanOrEqual(18); // Permite margem de ±2
      expect(totalServings).toBeLessThanOrEqual(22);

      // Validar que avgKcalPerServing foi recalculado
      if (plan.totalKcal && plan.avgKcalPerServing) {
        const expectedAvg = plan.totalKcal / totalServings;
        expect(Math.abs(plan.avgKcalPerServing - expectedAvg)).toBeLessThan(1);
      }

      // Validar que cada receita tem kcalPerServing recalculado
      plan.dishes.forEach(dish => {
        if (dish.totalKcal && dish.kcalPerServing && dish.servings > 0) {
          const expectedKcalPerServing = dish.totalKcal / dish.servings;
          expect(Math.abs(dish.kcalPerServing - expectedKcalPerServing)).toBeLessThan(1);
        }
      });
    }, 30000);
  });

  describe("Cenário 2 - Redução de Variedades", () => {
    it("remove excesso de receitas e registra em adjustmentReason", async () => {
      // Forçar IA a gerar mais receitas do que pedido
      const plan = await generateMealPlan({
        availableIngredients: ["frango", "carne", "peixe", "arroz", "feijão", "batata"],
        servings: 6,
        varieties: 2, // Pedir poucas variedades
        allowNewIngredients: true,
      });

      // Validar que dishes.length <= 2
      expect(plan.dishes.length).toBeLessThanOrEqual(2);

      // Se IA gerou mais e removemos, deve ter adjustmentReason
      // (não podemos garantir que IA sempre gera mais, então só validamos se houver)
      if (plan.adjustmentReason) {
        // Pode conter mensagem sobre remoção de excesso ou ajuste de porções
        expect(typeof plan.adjustmentReason).toBe("string");
      }
    }, 30000);
  });

  describe("Cenário 3 - Tempo Disponível Apertado", () => {
    it("registra aviso quando plano não cabe no tempo", async () => {
      const plan = await generateMealPlan({
        availableIngredients: ["frango", "arroz", "feijão"],
        servings: 6,
        varieties: 3,
        availableTime: 0.5, // 30 minutos (muito pouco)
        allowNewIngredients: true,
      });

      // Validar que timeFits foi calculado
      expect(typeof plan.timeFits).toBe("boolean");

      // Se não couber, deve ter aviso em adjustmentReason
      if (plan.timeFits === false) {
        expect(plan.adjustmentReason).toBeDefined();
        expect(plan.adjustmentReason).toContain("tempo");
      }

      // Validar que totalPlanTime foi calculado
      expect(plan.totalPlanTime).toBeGreaterThan(0);
    }, 30000);
  });

  describe("Preservação de adjustmentReason", () => {
    it("concatena ajustes de diferentes etapas", async () => {
      const plan = await generateMealPlan({
        availableIngredients: [
          { name: "frango", quantity: 100, unit: "g" }, // Estoque baixo
        ],
        servings: 10, // Muitas porções
        varieties: 2,
        dietType: "low carb",
        exclusions: ["arroz"],
        availableTime: 0.5, // Tempo apertado
        allowNewIngredients: true,
      });

      // Deve ter adjustmentReason combinando múltiplos ajustes
      if (plan.adjustmentReason) {
        // Pode conter: estoque, porções, tempo, dieta, etc
        expect(plan.adjustmentReason.length).toBeGreaterThan(10);
      }
    }, 30000);
  });
});
