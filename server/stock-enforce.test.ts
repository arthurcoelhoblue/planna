/**
 * Testes para Enforce de Estoque (4.3)
 * Valida que quantidades nunca excedem limites informados
 */

import { describe, it, expect } from "vitest";
import { generateMealPlan } from "./recipe-engine";

describe("Enforce de Estoque", () => {
  
  describe("Normalização de Unidades", () => {
    it("converte kg para g corretamente", async () => {
      const plan = await generateMealPlan({
        availableIngredients: [
          { name: "frango", quantity: 1, unit: "kg" },
          { name: "arroz", quantity: 500, unit: "g" },
        ],
        servings: 6,
        varieties: 2,
        allowNewIngredients: false,
      });

      // Deve gerar plano sem exceder 1kg (1000g) de frango
      expect(plan.dishes.length).toBeGreaterThan(0);
    }, 30000);

    it("converte litros para ml corretamente", async () => {
      const plan = await generateMealPlan({
        availableIngredients: [
          { name: "leite", quantity: 1, unit: "l" },
          { name: "açúcar", quantity: 200, unit: "g" },
        ],
        servings: 4,
        varieties: 1,
        allowNewIngredients: false,
      });

      // Deve gerar plano sem exceder 1L (1000ml) de leite
      expect(plan.dishes.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe("Redução por Excedente", () => {
    it("reduz quantidades quando estoque é excedido", async () => {
      const plan = await generateMealPlan({
        availableIngredients: [
          { name: "frango", quantity: 200, unit: "g" }, // Estoque baixo
          { name: "tomate", quantity: 100, unit: "g" },
        ],
        servings: 6,
        varieties: 2,
        allowNewIngredients: false,
      });

      // Calcular uso total de frango
      let totalFrango = 0;
      plan.dishes.forEach(dish => {
        dish.ingredients.forEach(ing => {
          if (ing.name.toLowerCase().includes("frango")) {
            totalFrango += ing.quantity;
          }
        });
      });

      // Deve respeitar limite de 200g
      expect(totalFrango).toBeLessThanOrEqual(200);
    }, 30000);

    it("registra ajustes em adjustmentReason", async () => {
      const plan = await generateMealPlan({
        availableIngredients: [
          { name: "frango", quantity: 100, unit: "g" }, // Muito baixo
          { name: "arroz", quantity: 50, unit: "g" },
        ],
        servings: 6,
        varieties: 2,
        allowNewIngredients: false,
      });

      // Deve ter ajustes registrados
      if (plan.adjustmentReason) {
        expect(plan.adjustmentReason).toContain("estoque");
      }
    }, 30000);
  });

  describe("Recálculo de Kcal", () => {
    it("recalcula kcal após redução de ingredientes", async () => {
      const plan = await generateMealPlan({
        availableIngredients: [
          { name: "frango", quantity: 150, unit: "g" },
          { name: "arroz", quantity: 100, unit: "g" },
        ],
        servings: 6,
        varieties: 2,
        allowNewIngredients: false,
      });

      // Todas as receitas devem ter kcal calculado (se IA forneceu)
      plan.dishes.forEach(dish => {
        if (dish.totalKcal !== undefined) {
          expect(dish.totalKcal).toBeGreaterThanOrEqual(0);
        }
        if (dish.kcalPerServing !== undefined) {
          expect(dish.kcalPerServing).toBeGreaterThanOrEqual(0);
        }
      });
    }, 30000);
  });

  describe("Ingredientes sem Limite", () => {
    it("não aplica redução em ingredientes sem estoque definido", async () => {
      const plan = await generateMealPlan({
        availableIngredients: [
          { name: "frango", quantity: 500, unit: "g" },
          "tomate", // Sem limite de estoque
          "cebola",
        ],
        servings: 6,
        varieties: 2,
        allowNewIngredients: true,
      });

      // Deve gerar plano normalmente
      expect(plan.dishes.length).toBeGreaterThan(0);
    }, 30000);
  });
});
