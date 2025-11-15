/**
 * Base de dados de ingredientes com informações nutricionais
 * Fonte: TACO (Tabela Brasileira de Composição de Alimentos) e USDA
 */

export interface IngredientNutrition {
  name: string;
  category: string;
  unit: "g" | "ml" | "unidade";
  kcalPer100: number; // Calorias por 100g/100ml/unidade
  commonPortions?: {
    // Porções comuns para facilitar UX
    description: string;
    grams: number;
  }[];
}

/**
 * Base de ingredientes comuns brasileiros
 */
export const INGREDIENTS_DATABASE: IngredientNutrition[] = [
  // Proteínas
  {
    name: "frango",
    category: "proteína",
    unit: "g",
    kcalPer100: 165,
    commonPortions: [
      { description: "peito (100g)", grams: 100 },
      { description: "coxa (150g)", grams: 150 },
    ],
  },
  {
    name: "carne bovina",
    category: "proteína",
    unit: "g",
    kcalPer100: 250,
    commonPortions: [{ description: "bife (120g)", grams: 120 }],
  },
  {
    name: "peixe",
    category: "proteína",
    unit: "g",
    kcalPer100: 96,
    commonPortions: [{ description: "filé (150g)", grams: 150 }],
  },
  {
    name: "ovo",
    category: "proteína",
    unit: "unidade",
    kcalPer100: 70, // Por unidade (50g)
  },
  {
    name: "feijão",
    category: "proteína",
    unit: "g",
    kcalPer100: 77,
    commonPortions: [{ description: "concha (100g)", grams: 100 }],
  },

  // Carboidratos
  {
    name: "arroz",
    category: "carboidrato",
    unit: "g",
    kcalPer100: 130,
    commonPortions: [{ description: "escumadeira (100g)", grams: 100 }],
  },
  {
    name: "macarrão",
    category: "carboidrato",
    unit: "g",
    kcalPer100: 131,
  },
  {
    name: "batata",
    category: "carboidrato",
    unit: "g",
    kcalPer100: 77,
    commonPortions: [{ description: "média (150g)", grams: 150 }],
  },
  {
    name: "pão",
    category: "carboidrato",
    unit: "g",
    kcalPer100: 265,
    commonPortions: [{ description: "fatia (50g)", grams: 50 }],
  },
  {
    name: "mandioca",
    category: "carboidrato",
    unit: "g",
    kcalPer100: 125,
  },

  // Vegetais
  {
    name: "tomate",
    category: "vegetal",
    unit: "g",
    kcalPer100: 18,
    commonPortions: [{ description: "médio (100g)", grams: 100 }],
  },
  {
    name: "cebola",
    category: "vegetal",
    unit: "g",
    kcalPer100: 40,
    commonPortions: [{ description: "média (100g)", grams: 100 }],
  },
  {
    name: "alho",
    category: "vegetal",
    unit: "g",
    kcalPer100: 149,
    commonPortions: [{ description: "dente (3g)", grams: 3 }],
  },
  {
    name: "cenoura",
    category: "vegetal",
    unit: "g",
    kcalPer100: 41,
    commonPortions: [{ description: "média (100g)", grams: 100 }],
  },
  {
    name: "brócolis",
    category: "vegetal",
    unit: "g",
    kcalPer100: 34,
  },
  {
    name: "couve",
    category: "vegetal",
    unit: "g",
    kcalPer100: 27,
  },
  {
    name: "alface",
    category: "vegetal",
    unit: "g",
    kcalPer100: 15,
  },

  // Laticínios
  {
    name: "leite",
    category: "laticínio",
    unit: "ml",
    kcalPer100: 61,
    commonPortions: [{ description: "copo (200ml)", grams: 200 }],
  },
  {
    name: "queijo",
    category: "laticínio",
    unit: "g",
    kcalPer100: 353,
    commonPortions: [{ description: "fatia (30g)", grams: 30 }],
  },
  {
    name: "iogurte",
    category: "laticínio",
    unit: "g",
    kcalPer100: 51,
    commonPortions: [{ description: "pote (170g)", grams: 170 }],
  },
  {
    name: "manteiga",
    category: "laticínio",
    unit: "g",
    kcalPer100: 717,
    commonPortions: [{ description: "colher de chá (5g)", grams: 5 }],
  },

  // Óleos e gorduras
  {
    name: "azeite",
    category: "gordura",
    unit: "ml",
    kcalPer100: 884,
    commonPortions: [{ description: "colher de sopa (15ml)", grams: 15 }],
  },
  {
    name: "óleo",
    category: "gordura",
    unit: "ml",
    kcalPer100: 884,
    commonPortions: [{ description: "colher de sopa (15ml)", grams: 15 }],
  },

  // Temperos e condimentos
  {
    name: "sal",
    category: "tempero",
    unit: "g",
    kcalPer100: 0,
  },
  {
    name: "açúcar",
    category: "tempero",
    unit: "g",
    kcalPer100: 387,
    commonPortions: [{ description: "colher de sopa (15g)", grams: 15 }],
  },
  {
    name: "molho de tomate",
    category: "tempero",
    unit: "g",
    kcalPer100: 24,
  },
];

/**
 * Busca ingrediente na base de dados (case-insensitive, com normalização)
 */
export function findIngredient(name: string): IngredientNutrition | null {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    INGREDIENTS_DATABASE.find((ing) => {
      const ingNormalized = ing.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return ingNormalized.includes(normalized) || normalized.includes(ingNormalized);
    }) || null
  );
}

/**
 * Calcula calorias de um ingrediente
 */
export function calculateIngredientCalories(
  ingredientName: string,
  quantity: number,
  unit: string
): { kcal: number; found: boolean; ingredient?: IngredientNutrition } {
  const ingredient = findIngredient(ingredientName);

  if (!ingredient) {
    return { kcal: 0, found: false };
  }

  // Converter para base 100g/100ml
  let kcal = 0;
  if (ingredient.unit === "unidade") {
    // Para unidades, kcalPer100 já é por unidade
    kcal = ingredient.kcalPer100 * quantity;
  } else {
    // Para g/ml, calcular proporcionalmente
    kcal = (ingredient.kcalPer100 * quantity) / 100;
  }

  return { kcal: Math.round(kcal), found: true, ingredient };
}

/**
 * Sugere ingredientes similares quando não encontrado
 */
export function suggestSimilarIngredients(name: string, limit: number = 3): IngredientNutrition[] {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return INGREDIENTS_DATABASE.filter((ing) => {
    const ingNormalized = ing.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    // Busca por substring parcial
    return ingNormalized.includes(normalized.substring(0, 3)) || normalized.includes(ingNormalized.substring(0, 3));
  }).slice(0, limit);
}

