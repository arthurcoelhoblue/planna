/**
 * Testes de Integração End-to-End - Dietas e Sanitização
 * Valida criação de receitas com todas as regras implementadas
 */

import { describe, it, expect } from "vitest";
import { generateMealPlan } from "./recipe-engine";

describe("Integração E2E - Todas as Dietas", () => {
  
  describe("1. Low Carb", () => {
    it("remove arroz, batata, pão", async () => {
      const plan = await generateMealPlan({
        availableIngredients: ["frango", "arroz", "batata", "pão", "tomate"],
        servings: 6,
        varieties: 2,
        dietType: "low carb",
        allowNewIngredients: true,
      });

      plan.dishes.forEach(dish => {
        dish.ingredients.forEach(ing => {
          const nome = ing.name.toLowerCase();
          expect(nome).not.toContain("arroz");
          expect(nome).not.toContain("batata");
          expect(nome).not.toContain("pão");
        });
      });
    }, 30000);
  });

  describe("2. Vegana", () => {
    it("remove carne, frango, ovo, leite (exceto substitutos veganos)", async () => {
      const plan = await generateMealPlan({
        availableIngredients: ["carne", "frango", "ovo", "leite", "arroz", "feijão"],
        servings: 6,
        varieties: 2,
        dietType: "vegana",
        allowNewIngredients: true,
      });

      plan.dishes.forEach(dish => {
        dish.ingredients.forEach(ing => {
          const nome = ing.name.toLowerCase();
          
          // Ignora substitutos veganos (ex: "leite vegetal", "creme de leite vegetal")
          const isVeganSubstitute = nome.includes("vegetal") || nome.includes("vegano") || 
                                     nome.includes("soja") || nome.includes("aveia");
          
          if (!isVeganSubstitute) {
            expect(nome).not.toContain("carne");
            expect(nome).not.toContain("frango");
            expect(nome).not.toContain("ovo");
            expect(nome).not.toContain("leite");
          }
        });
      });
    }, 30000);
  });

  describe("3. Vegetariana", () => {
    it("remove carne, frango, peixe", async () => {
      const plan = await generateMealPlan({
        availableIngredients: ["carne", "frango", "peixe", "ovo", "leite", "arroz"],
        servings: 6,
        varieties: 2,
        dietType: "vegetariana",
        allowNewIngredients: true,
      });

      plan.dishes.forEach(dish => {
        dish.ingredients.forEach(ing => {
          const nome = ing.name.toLowerCase();
          expect(nome).not.toContain("carne");
          expect(nome).not.toContain("frango");
          expect(nome).not.toContain("peixe");
        });
      });
    }, 30000);
  });

  describe("4. Cetogênica", () => {
    it("remove arroz, batata, açúcar", async () => {
      const plan = await generateMealPlan({
        availableIngredients: ["carne", "arroz", "batata", "açúcar", "brócolis"],
        servings: 6,
        varieties: 2,
        dietType: "cetogênica",
        allowNewIngredients: true,
      });

      plan.dishes.forEach(dish => {
        dish.ingredients.forEach(ing => {
          const nome = ing.name.toLowerCase();
          expect(nome).not.toContain("arroz");
          expect(nome).not.toContain("batata");
          expect(nome).not.toContain("açúcar");
        });
      });
    }, 30000);
  });

  describe("5. Sem Glúten", () => {
    it("remove trigo, pão, massa", async () => {
      const plan = await generateMealPlan({
        availableIngredients: ["trigo", "pão", "macarrão", "arroz", "frango"],
        servings: 6,
        varieties: 2,
        dietType: "sem glúten",
        allowNewIngredients: true,
      });

      plan.dishes.forEach(dish => {
        dish.ingredients.forEach(ing => {
          const nome = ing.name.toLowerCase();
          expect(nome).not.toContain("trigo");
          expect(nome).not.toContain("pão");
          expect(nome).not.toContain("macarrão");
        });
      });
    }, 30000);
  });

  describe("6. Sem Lactose", () => {
    it("remove leite, queijo, manteiga (exceto substitutos sem lactose)", async () => {
      const plan = await generateMealPlan({
        availableIngredients: ["leite", "queijo", "manteiga", "frango", "arroz"],
        servings: 6,
        varieties: 2,
        dietType: "sem lactose",
        allowNewIngredients: true,
      });

      plan.dishes.forEach(dish => {
        dish.ingredients.forEach(ing => {
          const nome = ing.name.toLowerCase();
          
          // Ignora substitutos sem lactose (ex: "substituto da manteiga", "azeite")
          const isSubstitute = nome.includes("substituto") || nome.includes("azeite") || 
                               nome.includes("óleo") || nome.includes("vegetal");
          
          if (!isSubstitute) {
            expect(nome).not.toContain("leite");
            expect(nome).not.toContain("queijo");
            expect(nome).not.toContain("manteiga");
          }
        });
      });
    }, 30000);
  });

  describe("7. Combinações", () => {
    it("respeita dieta + exclusões", async () => {
      const plan = await generateMealPlan({
        availableIngredients: ["frango", "arroz", "tomate", "cebola"],
        servings: 6,
        varieties: 2,
        dietType: "low carb",
        exclusions: ["tomate"],
        allowNewIngredients: true,
      });

      plan.dishes.forEach(dish => {
        dish.ingredients.forEach(ing => {
          const nome = ing.name.toLowerCase();
          expect(nome).not.toContain("arroz");
          expect(nome).not.toContain("tomate");
        });
      });
    }, 30000);

    it("respeita dieta + allowNewIngredients=false", async () => {
      const plan = await generateMealPlan({
        availableIngredients: ["frango", "tomate", "cebola"],
        servings: 6,
        varieties: 2,
        dietType: "low carb",
        allowNewIngredients: false,
      });

      plan.dishes.forEach(dish => {
        dish.ingredients.forEach(ing => {
          const nome = ing.name.toLowerCase();
          expect(nome).not.toContain("arroz");
          expect(nome).not.toContain("batata");
        });
      });
    }, 30000);
  });
});
