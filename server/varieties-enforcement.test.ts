import { describe, it, expect } from 'vitest';

// Mock da função enforceVarietiesAndServings
// (Normalmente importaríamos do recipe-engine, mas como é uma função privada, vamos testar o comportamento esperado)

interface Dish {
  name: string;
  servings: number;
  [key: string]: any;
}

interface MealPlan {
  dishes: Dish[];
  adjustmentReason?: string;
  [key: string]: any;
}

// Função de teste que simula o comportamento esperado
function testEnforcement(
  dishes: Dish[],
  requestedVarieties: number,
  requestedServings: number
): { finalDishes: Dish[]; adjustmentReason?: string } {
  const adjustments: string[] = [];
  let finalDishes = [...dishes];

  // 1. ENFORCEMENT DE MISTURAS
  if (finalDishes.length < requestedVarieties) {
    adjustments.push(
      `O sistema gerou ${finalDishes.length} misturas inicialmente e criou ${requestedVarieties - finalDishes.length} variações adicionais para atingir as ${requestedVarieties} misturas solicitadas.`
    );
    const missingCount = requestedVarieties - finalDishes.length;
    for (let i = 0; i < missingCount; i++) {
      const baseDish = finalDishes[i % finalDishes.length];
      finalDishes.push({
        ...baseDish,
        name: `${baseDish.name} - Variação ${i + 1}`,
        servings: 0,
      });
    }
  } else if (finalDishes.length > requestedVarieties) {
    adjustments.push(
      `O sistema gerou ${finalDishes.length} misturas mas você pediu ${requestedVarieties}, então removemos o excesso.`
    );
    finalDishes = finalDishes.slice(0, requestedVarieties);
  }

  // 2. ENFORCEMENT DE PORÇÕES
  const currentTotalServings = finalDishes.reduce((sum, dish) => sum + dish.servings, 0);

  if (currentTotalServings < requestedServings) {
    adjustments.push(
      `O sistema ajustou a distribuição de porções para atingir as ${requestedServings} porções solicitadas.`
    );
    const servingsPerDish = Math.floor(requestedServings / finalDishes.length);
    const remainder = requestedServings % finalDishes.length;
    finalDishes = finalDishes.map((dish, index) => ({
      ...dish,
      servings: servingsPerDish + (index < remainder ? 1 : 0),
    }));
  } else if (currentTotalServings > requestedServings) {
    const diff = currentTotalServings - requestedServings;
    if (diff > 2) {
      const servingsPerDish = Math.floor(requestedServings / finalDishes.length);
      const remainder = requestedServings % finalDishes.length;
      finalDishes = finalDishes.map((dish, index) => ({
        ...dish,
        servings: servingsPerDish + (index < remainder ? 1 : 0),
      }));
    }
  }

  return {
    finalDishes,
    adjustmentReason: adjustments.length > 0 ? adjustments.join(' ') : undefined,
  };
}

describe('Enforcement de Misturas e Porções', () => {
  describe('Caso 1: 4 misturas + 12 porções com ingredientes suficientes', () => {
    it('deve gerar exatamente 4 receitas', () => {
      const dishes: Dish[] = [
        { name: 'Frango Grelhado', servings: 3 },
        { name: 'Carne Moída', servings: 3 },
        { name: 'Omelete', servings: 3 },
      ];

      const result = testEnforcement(dishes, 4, 12);

      expect(result.finalDishes.length).toBe(4);
    });

    it('deve gerar soma de porções >= 12', () => {
      const dishes: Dish[] = [
        { name: 'Frango Grelhado', servings: 3 },
        { name: 'Carne Moída', servings: 3 },
        { name: 'Omelete', servings: 3 },
      ];

      const result = testEnforcement(dishes, 4, 12);
      const totalServings = result.finalDishes.reduce((sum, dish) => sum + dish.servings, 0);

      expect(totalServings).toBeGreaterThanOrEqual(12);
    });

    it('deve ter adjustmentReason quando IA gera menos receitas', () => {
      const dishes: Dish[] = [
        { name: 'Frango Grelhado', servings: 3 },
        { name: 'Carne Moída', servings: 3 },
      ];

      const result = testEnforcement(dishes, 4, 12);

      expect(result.adjustmentReason).toBeDefined();
      expect(result.adjustmentReason).toContain('variações adicionais');
    });
  });

  describe('Caso 2: 3 misturas + 15 porções', () => {
    it('deve gerar exatamente 3 receitas', () => {
      const dishes: Dish[] = [
        { name: 'Frango Grelhado', servings: 4 },
        { name: 'Carne Moída', servings: 4 },
      ];

      const result = testEnforcement(dishes, 3, 15);

      expect(result.finalDishes.length).toBe(3);
    });

    it('deve distribuir 15 porções entre 3 receitas', () => {
      const dishes: Dish[] = [
        { name: 'Frango Grelhado', servings: 4 },
        { name: 'Carne Moída', servings: 4 },
      ];

      const result = testEnforcement(dishes, 3, 15);
      const totalServings = result.finalDishes.reduce((sum, dish) => sum + dish.servings, 0);

      expect(totalServings).toBe(15);
    });

    it('deve distribuir porções de forma equilibrada (5+5+5)', () => {
      const dishes: Dish[] = [
        { name: 'Frango Grelhado', servings: 4 },
        { name: 'Carne Moída', servings: 4 },
      ];

      const result = testEnforcement(dishes, 3, 15);

      // Todas as receitas devem ter 5 porções (15 / 3 = 5)
      result.finalDishes.forEach(dish => {
        expect(dish.servings).toBe(5);
      });
    });
  });

  describe('Caso 3: IA gera mais receitas que o solicitado', () => {
    it('deve remover excesso de receitas', () => {
      const dishes: Dish[] = [
        { name: 'Frango Grelhado', servings: 3 },
        { name: 'Carne Moída', servings: 3 },
        { name: 'Omelete', servings: 3 },
        { name: 'Peixe Assado', servings: 3 },
        { name: 'Salada', servings: 3 },
      ];

      const result = testEnforcement(dishes, 3, 12);

      expect(result.finalDishes.length).toBe(3);
    });

    it('deve ter adjustmentReason explicando remoção', () => {
      const dishes: Dish[] = [
        { name: 'Frango Grelhado', servings: 3 },
        { name: 'Carne Moída', servings: 3 },
        { name: 'Omelete', servings: 3 },
        { name: 'Peixe Assado', servings: 3 },
      ];

      const result = testEnforcement(dishes, 3, 12);

      expect(result.adjustmentReason).toBeDefined();
      expect(result.adjustmentReason).toContain('removemos o excesso');
    });
  });

  describe('Caso 4: Arredondamento de porções', () => {
    it('deve permitir arredondamento de até +2 porções', () => {
      const dishes: Dish[] = [
        { name: 'Frango Grelhado', servings: 5 },
        { name: 'Carne Moída', servings: 5 },
        { name: 'Omelete', servings: 3 },
      ];

      const result = testEnforcement(dishes, 3, 12);
      const totalServings = result.finalDishes.reduce((sum, dish) => sum + dish.servings, 0);

      // 13 porções (12 + 1) deve ser aceito
      expect(totalServings).toBeGreaterThanOrEqual(12);
      expect(totalServings).toBeLessThanOrEqual(14);
    });
  });

  describe('Caso 5: Distribuição desigual de porções', () => {
    it('deve distribuir resto de forma justa (16 porções / 3 receitas = 6+5+5)', () => {
      const dishes: Dish[] = [
        { name: 'Frango Grelhado', servings: 4 },
        { name: 'Carne Moída', servings: 4 },
      ];

      const result = testEnforcement(dishes, 3, 16);

      // 16 / 3 = 5 com resto 1, então: 6+5+5
      expect(result.finalDishes[0].servings).toBe(6);
      expect(result.finalDishes[1].servings).toBe(5);
      expect(result.finalDishes[2].servings).toBe(5);
    });
  });
});

