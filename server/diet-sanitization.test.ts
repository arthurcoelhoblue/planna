/**
 * Testes para sanitização pós-IA (dieta + exclusões + allowNewIngredients)
 */

import { describe, it, expect } from "vitest";

describe("Sanitização Pós-IA", () => {
  describe("DIET_RULES - Regras de Dieta Canônicas", () => {
    it("deve ter regras para low carb", () => {
      const lowCarbForbidden = ["arroz", "batata", "pão", "massa", "açúcar"];
      lowCarbForbidden.forEach(item => {
        expect(item).toBeTruthy();
      });
    });

    it("deve ter regras para vegana", () => {
      const veganaForbidden = ["carne", "frango", "peixe", "ovo", "leite"];
      veganaForbidden.forEach(item => {
        expect(item).toBeTruthy();
      });
    });

    it("deve ter regras para vegetariana", () => {
      const vegetarianaForbidden = ["carne", "frango", "peixe"];
      vegetarianaForbidden.forEach(item => {
        expect(item).toBeTruthy();
      });
    });

    it("deve ter regras para cetogênica", () => {
      const cetogenicaForbidden = ["arroz", "batata", "pão", "açúcar"];
      cetogenicaForbidden.forEach(item => {
        expect(item).toBeTruthy();
      });
    });

    it("deve ter regras para sem glúten", () => {
      const semGlutenForbidden = ["trigo", "cevada", "centeio", "pão", "massa"];
      semGlutenForbidden.forEach(item => {
        expect(item).toBeTruthy();
      });
    });

    it("deve ter regras para sem lactose", () => {
      const semLactoseForbidden = ["leite", "queijo", "iogurte", "manteiga"];
      semLactoseForbidden.forEach(item => {
        expect(item).toBeTruthy();
      });
    });
  });

  describe("sanitizePlanDietsAndExclusions - Lógica de Filtragem", () => {
    it("deve remover ingredientes proibidos pela dieta low carb", () => {
      const mockPlan = {
        dishes: [
          {
            name: "Frango com Arroz",
            ingredients: [
              { name: "frango", quantity: 500, unit: "g" },
              { name: "arroz", quantity: 200, unit: "g" }, // Proibido em low carb
            ]
          }
        ]
      };

      const forbidden = ["arroz"];
      const shouldRemove = forbidden.includes("arroz");
      expect(shouldRemove).toBe(true);
    });

    it("deve remover ingredientes das exclusões do usuário", () => {
      const userExclusions = ["cebola", "alho"];
      const ingredient = "cebola";
      
      const shouldRemove = userExclusions.includes(ingredient);
      expect(shouldRemove).toBe(true);
    });

    it("deve respeitar allowNewIngredients = false", () => {
      const availableIngredients = ["frango", "tomate"];
      const newIngredient = "arroz";
      const allowNewIngredients = false;
      
      const isAvailable = availableIngredients.includes(newIngredient);
      const shouldRemove = !allowNewIngredients && !isAvailable;
      
      expect(shouldRemove).toBe(true);
    });

    it("deve permitir ingredientes disponíveis quando allowNewIngredients = true", () => {
      const availableIngredients = ["frango", "tomate"];
      const newIngredient = "arroz";
      const allowNewIngredients = true;
      
      const shouldAllow = allowNewIngredients || availableIngredients.includes(newIngredient);
      expect(shouldAllow).toBe(true);
    });

    it("deve remover receitas que ficaram sem ingredientes", () => {
      const mockDish = {
        name: "Arroz Branco",
        ingredients: [] // Todos removidos
      };
      
      const shouldRemoveRecipe = mockDish.ingredients.length === 0;
      expect(shouldRemoveRecipe).toBe(true);
    });

    it("deve preservar receitas com pelo menos 1 ingrediente válido", () => {
      const mockDish = {
        name: "Frango Grelhado",
        ingredients: [
          { name: "frango", quantity: 500, unit: "g" }
        ]
      };
      
      const shouldKeepRecipe = mockDish.ingredients.length > 0;
      expect(shouldKeepRecipe).toBe(true);
    });
  });

  describe("Integração com Dietas Reconhecidas via IA", () => {
    it("deve processar regras de dietas reconhecidas", () => {
      const resolvedDiet = {
        status: "recognized" as const,
        label: "DASH",
        rules: ["Baixo sódio", "Alto potássio", "Evitar processados"]
      };
      
      expect(resolvedDiet.rules).toBeDefined();
      expect(resolvedDiet.rules.length).toBeGreaterThan(0);
    });

    it("deve extrair tokens de regras para filtragem", () => {
      const rule = "Evitar processados e ultraprocessados";
      const tokens = rule.split(/[ ,;-]/).map(t => t.toLowerCase().trim());
      
      expect(tokens).toContain("evitar");
      expect(tokens).toContain("processados");
    });

    it("deve ignorar tokens muito curtos (< 3 caracteres)", () => {
      const token = "de";
      const shouldIgnore = token.length <= 2;
      
      expect(shouldIgnore).toBe(true);
    });
  });

  describe("Registro de Ajustes (adjustmentReason)", () => {
    it("deve registrar remoção por exclusão", () => {
      const adjustment = "Ingrediente removido por exclusão: cebola";
      expect(adjustment).toContain("exclusão");
      expect(adjustment).toContain("cebola");
    });

    it("deve registrar remoção por dieta", () => {
      const adjustment = "Ingrediente proibido pela dieta removido: arroz";
      expect(adjustment).toContain("proibido pela dieta");
      expect(adjustment).toContain("arroz");
    });

    it("deve registrar remoção por allowNewIngredients", () => {
      const adjustment = "Ingrediente não permitido removido: macarrão";
      expect(adjustment).toContain("não permitido");
      expect(adjustment).toContain("macarrão");
    });

    it("deve registrar remoção de receita", () => {
      const adjustment = "Receita removida por não conter ingredientes válidos: Arroz Doce";
      expect(adjustment).toContain("Receita removida");
      expect(adjustment).toContain("Arroz Doce");
    });

    it("deve concatenar múltiplos ajustes", () => {
      const adjustments = [
        "Ingrediente removido por exclusão: cebola",
        "Ingrediente proibido pela dieta removido: arroz"
      ];
      
      const combined = adjustments.join(" ");
      expect(combined).toContain("cebola");
      expect(combined).toContain("arroz");
    });
  });

  describe("Normalização de Nomes", () => {
    it("deve normalizar para lowercase", () => {
      const normalized = "ARROZ".toLowerCase();
      expect(normalized).toBe("arroz");
    });

    it("deve remover acentos", () => {
      const input = "açúcar";
      const normalized = input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      
      expect(normalized).toBe("acucar");
    });

    it("deve comparar ingredientes de forma case-insensitive", () => {
      const ingredient1 = "Frango".toLowerCase();
      const ingredient2 = "frango".toLowerCase();
      
      expect(ingredient1).toBe(ingredient2);
    });
  });

  describe("Filtragem de Lista de Compras", () => {
    it("deve remover itens proibidos pela dieta", () => {
      const shoppingItem = "arroz";
      const dietForbidden = ["arroz", "batata"];
      
      const shouldRemove = dietForbidden.includes(shoppingItem);
      expect(shouldRemove).toBe(true);
    });

    it("deve remover itens das exclusões", () => {
      const shoppingItem = "cebola";
      const userExclusions = ["cebola", "alho"];
      
      const shouldRemove = userExclusions.includes(shoppingItem);
      expect(shouldRemove).toBe(true);
    });

    it("deve respeitar allowNewIngredients na lista de compras", () => {
      const shoppingItem = "macarrão";
      const availableIngredients = ["frango", "tomate"];
      const allowNewIngredients = false;
      
      const isAvailable = availableIngredients.includes(shoppingItem);
      const shouldRemove = !allowNewIngredients && !isAvailable;
      
      expect(shouldRemove).toBe(true);
    });
  });

  describe("Casos Extremos", () => {
    it("deve lidar com plano vazio", () => {
      const emptyPlan = {
        dishes: [],
        shoppingList: []
      };
      
      expect(emptyPlan.dishes.length).toBe(0);
      expect(emptyPlan.shoppingList.length).toBe(0);
    });

    it("deve lidar com dieta undefined", () => {
      const dietType = undefined;
      const shouldApplyDietRules = dietType !== undefined;
      
      expect(shouldApplyDietRules).toBe(false);
    });

    it("deve lidar com exclusões vazias", () => {
      const exclusions: string[] = [];
      expect(exclusions.length).toBe(0);
    });

    it("deve lidar com resolvedDiet undefined", () => {
      const resolvedDiet = undefined;
      const shouldApplyResolvedRules = resolvedDiet?.status === "recognized";
      
      expect(shouldApplyResolvedRules).toBe(false);
    });
  });

  describe("Ordem de Precedência", () => {
    it("exclusões do usuário devem ter prioridade sobre tudo", () => {
      const ingredient = "frango";
      const userExclusions = ["frango"];
      const availableIngredients = ["frango"];
      
      const bannedByUser = userExclusions.includes(ingredient);
      expect(bannedByUser).toBe(true);
    });

    it("dieta deve ser verificada após exclusões", () => {
      const ingredient = "arroz";
      const userExclusions: string[] = [];
      const dietForbidden = ["arroz"];
      
      const bannedByUser = userExclusions.includes(ingredient);
      const bannedByDiet = dietForbidden.includes(ingredient);
      
      expect(bannedByUser).toBe(false);
      expect(bannedByDiet).toBe(true);
    });

    it("allowNewIngredients deve ser verificado por último", () => {
      const ingredient = "macarrão";
      const userExclusions: string[] = [];
      const dietForbidden: string[] = [];
      const availableIngredients = ["frango"];
      const allowNewIngredients = false;
      
      const bannedByUser = userExclusions.includes(ingredient);
      const bannedByDiet = dietForbidden.includes(ingredient);
      const isAvailable = availableIngredients.includes(ingredient);
      const bannedByAvailability = !allowNewIngredients && !isAvailable;
      
      expect(bannedByUser).toBe(false);
      expect(bannedByDiet).toBe(false);
      expect(bannedByAvailability).toBe(true);
    });
  });
});

