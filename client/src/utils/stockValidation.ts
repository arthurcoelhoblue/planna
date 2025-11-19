interface IngredientWithStock {
  name: string;
  quantity?: number | null;
  unit?: string | null;
}

interface InsufficientIngredient {
  name: string;
  available: number;
  needed: number;
  unit: string;
}

/**
 * Valida se o estoque informado é suficiente para o número de marmitas
 * @param ingredients Lista de ingredientes com quantidades
 * @param mealCount Número de marmitas
 * @returns Lista de ingredientes insuficientes (vazia se tudo OK)
 */
export function validateStock(
  ingredients: IngredientWithStock[],
  mealCount: number
): InsufficientIngredient[] {
  const insufficient: InsufficientIngredient[] = [];

  // Estimativa conservadora: cada marmita usa ~200-300g de proteína, ~150g de carboidrato, ~100g de legumes
  const proteinPerMeal = 0.25; // kg
  const carbPerMeal = 0.15; // kg
  const veggiePerMeal = 0.1; // kg

  for (const ing of ingredients) {
    if (!ing.quantity || !ing.unit) continue;

    // Normaliza unidade para kg
    let availableKg = ing.quantity;
    if (ing.unit.toLowerCase().includes('g') && !ing.unit.toLowerCase().includes('kg')) {
      availableKg = ing.quantity / 1000;
    }

    // Categoriza ingrediente (simplificado)
    const name = ing.name.toLowerCase();
    let estimatedNeededKg = 0;

    if (name.includes('frango') || name.includes('carne') || name.includes('peixe') || name.includes('ovo')) {
      estimatedNeededKg = proteinPerMeal * mealCount;
    } else if (name.includes('arroz') || name.includes('macarrão') || name.includes('batata')) {
      estimatedNeededKg = carbPerMeal * mealCount;
    } else {
      estimatedNeededKg = veggiePerMeal * mealCount;
    }

    // Se disponível é menos de 70% do estimado, alerta
    if (availableKg < estimatedNeededKg * 0.7) {
      insufficient.push({
        name: ing.name,
        available: ing.quantity,
        needed: Math.ceil(estimatedNeededKg * (ing.unit.toLowerCase().includes('kg') ? 1 : 1000)),
        unit: ing.unit,
      });
    }
  }

  return insufficient;
}

