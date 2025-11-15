/**
 * Serviço de cálculo de calorias
 * Integra com a base de ingredientes e calcula calorias em todos os níveis
 */

import { calculateIngredientCalories, findIngredient } from "./ingredients-database";
import type { Dish, Ingredient, MealPlan } from "./recipe-engine";

/**
 * Calcula calorias de um ingrediente e enriquece o objeto
 */
export function enrichIngredientWithCalories(ingredient: Ingredient): Ingredient {
  const { kcal, found, ingredient: foundIng } = calculateIngredientCalories(
    ingredient.name,
    ingredient.quantity,
    ingredient.unit
  );

  return {
    ...ingredient,
    kcal: found ? kcal : undefined,
    kcalPer100: foundIng?.kcalPer100,
  };
}

/**
 * Calcula calorias totais e por porção de um prato
 */
export function calculateDishCalories(dish: Dish): Dish {
  // Enriquecer ingredientes com calorias
  const enrichedIngredients = dish.ingredients.map(enrichIngredientWithCalories);

  // Calcular total (apenas ingredientes com kcal definido)
  const totalKcal = enrichedIngredients.reduce((sum, ing) => sum + (ing.kcal || 0), 0);

  // Calcular por porção
  const kcalPerServing = dish.servings > 0 ? Math.round(totalKcal / dish.servings) : 0;

  return {
    ...dish,
    ingredients: enrichedIngredients,
    totalKcal,
    kcalPerServing,
  };
}

/**
 * Calcula calorias totais do plano
 */
export function calculatePlanCalories(plan: MealPlan): MealPlan {
  // Enriquecer pratos com calorias
  const enrichedDishes = plan.dishes.map(calculateDishCalories);

  // Calcular total do plano
  const totalKcal = enrichedDishes.reduce((sum, dish) => sum + (dish.totalKcal || 0), 0);

  // Calcular média por porção
  const totalServings = enrichedDishes.reduce((sum, dish) => sum + dish.servings, 0);
  const avgKcalPerServing = totalServings > 0 ? Math.round(totalKcal / totalServings) : 0;

  return {
    ...plan,
    dishes: enrichedDishes,
    totalKcal,
    avgKcalPerServing,
  };
}

/**
 * Ajusta número de porções para respeitar limite calórico
 * Retorna o número ajustado de porções e mensagem explicativa
 */
export function adjustServingsForCalorieLimit(
  dish: Dish,
  maxKcalPerServing: number
): {
  adjustedServings: number;
  message: string | null;
  needsAdjustment: boolean;
} {
  if (!dish.totalKcal || dish.totalKcal === 0) {
    return {
      adjustedServings: dish.servings,
      message: null,
      needsAdjustment: false,
    };
  }

  const currentKcalPerServing = dish.totalKcal / dish.servings;

  if (currentKcalPerServing <= maxKcalPerServing) {
    // Já está dentro do limite
    return {
      adjustedServings: dish.servings,
      message: null,
      needsAdjustment: false,
    };
  }

  // Calcular novo número de porções
  const adjustedServings = Math.ceil(dish.totalKcal / maxKcalPerServing);

  return {
    adjustedServings,
    message: `Para manter até ${maxKcalPerServing} kcal por porção, ajustei "${dish.name}" para ${adjustedServings} porções (antes: ${dish.servings}).`,
    needsAdjustment: true,
  };
}

/**
 * Verifica se ingredientes têm informação calórica
 * Retorna lista de ingredientes sem informação
 */
export function getMissingCalorieInfo(dish: Dish): string[] {
  return dish.ingredients.filter((ing) => ing.kcal === undefined || ing.kcal === 0).map((ing) => ing.name);
}

