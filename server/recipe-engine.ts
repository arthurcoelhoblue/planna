/**
 * Motor de composição de receitas
 * Gera planos semanais baseados em ingredientes disponíveis
 */

import { invokeLLM } from "./_core/llm";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Dish {
  name: string;
  category: "proteína" | "carboidrato" | "legume" | "completo";
  ingredients: Ingredient[];
  steps: string[];
  servings: number;
  prepTime: number; // em minutos
  variations?: string[]; // Sugestões de variação
}

export interface ShoppingItem {
  category: string;
  item: string;
  quantity: number;
  unit: string;
}

export interface PrepStep {
  order: number;
  action: string;
  duration: number; // em minutos
  parallel: boolean; // pode ser feito em paralelo com outros
  details?: string[]; // Passos detalhados para iniciantes
  tips?: string; // Dicas práticas
}

export interface MealPlan {
  dishes: Dish[];
  shoppingList: ShoppingItem[];
  prepSchedule: PrepStep[];
  estimatedCost: "baixo" | "médio" | "alto";
  totalPrepTime: number;
}

/**
 * Gera um plano de marmitas usando IA
 */
export async function generateMealPlan(params: {
  availableIngredients: string[];
  servings: number;
  exclusions?: string[];
  objective?: "praticidade" | "economia" | "normal" | "aproveitamento" | "desperdicio" | "custo";
  userFavorites?: string[];
  userDislikes?: string[];
  varieties?: number;
  allowNewIngredients?: boolean;
  sophistication?: "simples" | "gourmet";
  skillLevel?: "beginner" | "intermediate" | "advanced";
}): Promise<MealPlan> {
  const {
    availableIngredients,
    servings,
    exclusions = [],
    objective = "normal",
    userFavorites = [],
    userDislikes = [],
    varieties,
    allowNewIngredients = false,
    sophistication = "simples",
    skillLevel = "intermediate",
  } = params;

  // Calcula número de pratos base
  const numDishes = varieties || (servings <= 8 ? 3 : servings <= 12 ? 4 : 5);

  // Define o foco baseado no objetivo
  let objectiveFocus = "";
  if (objective === "aproveitamento" || objective === "desperdicio") {
    objectiveFocus =
      "FOCO EM APROVEITAMENTO TOTAL: Aproveite cascas (ex: chips de casca de batata), talos (ex: talos de brócolis refogados), sobras e partes normalmente descartadas. Sugira receitas criativas de aproveitamento. Reduza desperdício ao máximo.";
  } else if (objective === "economia") {
    objectiveFocus = "FOCO EM ECONOMIA: Aproveitamento máximo dos ingredientes e menor custo.";
  } else if (objective === "praticidade") {
    objectiveFocus = "FOCO EM PRATICIDADE: Preparo rápido e simples, sem complicação.";
  } else {
    // normal ou custo
    objectiveFocus = "MODO NORMAL: Receitas tradicionais, práticas e balanceadas.";
  }

  const ingredientsRule = allowNewIngredients
    ? `Use PREFERENCIALMENTE os ingredientes disponíveis: ${availableIngredients.join(", ")}. Você PODE sugerir até 3 ingredientes adicionais por receita se forem essenciais e valerem a pena comprar.`
    : `Use APENAS os ingredientes disponíveis: ${availableIngredients.join(", ")}`;

  const sophisticationRule = sophistication === "gourmet"
    ? "NÍVEL GOURMET: Use técnicas culinárias mais elaboradas, temperos especiais, apresentação refinada. Pode incluir ingredientes premium se permitido."
    : "NÍVEL SIMPLES: Receitas práticas e descomplicadas, ingredientes básicos, preparo direto sem firulas.";

  const skillLevelRule = skillLevel === "beginner"
    ? "NÍVEL INICIANTE: Passos muito detalhados (8-10 sub-passos), evite tarefas em paralelo (parallel: false na maioria), adicione 20% ao tempo estimado."
    : skillLevel === "advanced"
    ? "NÍVEL AVANÇADO: Maximize tarefas em paralelo (parallel: true quando possível), reduza 15% do tempo estimado, pode assumir conhecimento de técnicas."
    : "NÍVEL INTERMEDIÁRIO: Equilíbrio entre detalhamento e eficiência, algumas tarefas em paralelo quando lógico.";

  // Monta o prompt para a IA
  const systemPrompt = `Você é um planejador de marmitas minimalista e prático.

REGRAS IMPORTANTES:
1. Crie ${numDishes} pratos base diferentes para ${servings} marmitas
2. ${ingredientsRule}
3. NUNCA use estes ingredientes (exclusões): ${exclusions.join(", ") || "nenhum"}
4. Cada prato deve ter proteína + carboidrato + legumes (balanceamento simples)
5. Sugira 2 variações simples para cada prato (tempero diferente, montagem diferente)
6. ${objectiveFocus}
7. ${sophisticationRule}
8. ${skillLevelRule}
9. CÁLCULO DE TEMPO: O totalPrepTime deve considerar tarefas paralelas. Se 2 tarefas de 30min cada são paralelas, contam como 30min (não 60min). Some apenas o tempo real necessário.
8. Passos curtos e acionáveis no título, mas com detalhamento completo
9. Tempo total de preparo deve ser otimizado (batch cooking)
10. IMPORTANTE: Para cada passo do prepSchedule, inclua:
    - action: Título resumido (ex: "Cozinhar arroz")
    - details: Array com passos MUITO DETALHADOS para iniciantes (ex: ["Lave 2 xícaras de arroz em água corrente até a água sair limpa", "Coloque 4 xícaras de água em uma panela média", "Adicione 1 colher de sopa de óleo e 1 colher de chá de sal", "Ligue o fogo alto e espere ferver", "Quando ferver, adicione o arroz lavado", "Mexa uma vez e abaixe o fogo para médio-baixo", "Tampe a panela e deixe cozinhar por 15-18 minutos", "Não mexa durante o cozimento", "Desligue o fogo quando a água secar completamente", "Deixe descansar tampado por 5 minutos antes de servir"])
    - tips: Dica prática (ex: "Se o arroz grudar no fundo, adicione um fio de óleo e mexa delicadamente")

${userFavorites.length > 0 ? `PREFERÊNCIAS DO USUÁRIO (priorize): ${userFavorites.join(", ")}` : ""}
${userDislikes.length > 0 ? `EVITE (usuário não gosta): ${userDislikes.join(", ")}` : ""}

FORMATO DE SAÍDA (JSON):
{
  "dishes": [
    {
      "name": "Nome do Prato",
      "category": "completo",
      "ingredients": [
        {"name": "ingrediente", "quantity": 500, "unit": "g"}
      ],
      "steps": ["Passo 1", "Passo 2"],
      "servings": ${Math.ceil(servings / numDishes)},
      "prepTime": 30,
      "variations": ["Variação 1", "Variação 2"]
    }
  ],
  "shoppingList": [
    {"category": "Hortifruti", "item": "cenoura", "quantity": 1, "unit": "kg"}
  ],
  "prepSchedule": [
    {
      "order": 1,
      "action": "Cozinhar arroz",
      "duration": 25,
      "parallel": false,
      "details": [
        "Lave 2 xícaras de arroz em água corrente até a água sair limpa",
        "Coloque 4 xícaras de água em uma panela média",
        "Adicione 1 colher de sopa de óleo e 1 colher de chá de sal",
        "Ligue o fogo alto e espere ferver",
        "Quando ferver, adicione o arroz lavado",
        "Mexa uma vez e abaixe o fogo para médio-baixo",
        "Tampe a panela e deixe cozinhar por 15-18 minutos",
        "Desligue quando a água secar completamente"
      ],
      "tips": "Não mexa o arroz durante o cozimento para não grudar. Se grudar no fundo, adicione um fio de óleo."
    }
  ],
  "estimatedCost": "baixo",
  "totalPrepTime": 90,
  "note": "Tempo calculado considerando tarefas em paralelo. Iniciantes podem precisar de mais tempo."
}`;

  const userPrompt = `Crie um plano semanal de marmitas com os seguintes parâmetros:

Ingredientes disponíveis: ${availableIngredients.join(", ")}
Número de marmitas: ${servings}
Exclusões: ${exclusions.length > 0 ? exclusions.join(", ") : "nenhuma"}
Objetivo: ${objective}

Gere o plano completo em JSON.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "meal_plan",
          strict: true,
          schema: {
            type: "object",
            properties: {
              dishes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    category: { type: "string", enum: ["proteína", "carboidrato", "legume", "completo"] },
                    ingredients: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          quantity: { type: "number" },
                          unit: { type: "string" },
                        },
                        required: ["name", "quantity", "unit"],
                        additionalProperties: false,
                      },
                    },
                    steps: {
                      type: "array",
                      items: { type: "string" },
                    },
                    servings: { type: "number" },
                    prepTime: { type: "number" },
                    variations: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["name", "category", "ingredients", "steps", "servings", "prepTime"],
                  additionalProperties: false,
                },
              },
              shoppingList: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    item: { type: "string" },
                    quantity: { type: "number" },
                    unit: { type: "string" },
                  },
                  required: ["category", "item", "quantity", "unit"],
                  additionalProperties: false,
                },
              },
              prepSchedule: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    order: { type: "number" },
                    action: { type: "string" },
                    duration: { type: "number" },
                    parallel: { type: "boolean" },
                    details: {
                      type: "array",
                      items: { type: "string" },
                    },
                    tips: { type: "string" },
                  },
                  required: ["order", "action", "duration", "parallel"],
                  additionalProperties: false,
                },
              },
              estimatedCost: { type: "string", enum: ["baixo", "médio", "alto"] },
              totalPrepTime: { type: "number" },
              note: { type: "string" },
            },
            required: ["dishes", "shoppingList", "prepSchedule", "estimatedCost", "totalPrepTime"],
            additionalProperties: false,
          },
        },
      },
    });

    const message = response.choices[0]?.message;
    if (!message?.content) {
      throw new Error("Resposta vazia da IA");
    }

    const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
    const plan: MealPlan = JSON.parse(content);
    return plan;
  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    // Fallback: retorna plano básico seguro
    return getFallbackPlan(servings);
  }
}

/**
 * Plano de fallback caso a IA falhe
 */
function getFallbackPlan(servings: number): MealPlan {
  return {
    dishes: [
      {
        name: "Frango Grelhado com Arroz e Legumes",
        category: "completo",
        ingredients: [
          { name: "frango", quantity: 1, unit: "kg" },
          { name: "arroz", quantity: 500, unit: "g" },
          { name: "cenoura", quantity: 300, unit: "g" },
          { name: "brócolis", quantity: 300, unit: "g" },
        ],
        steps: [
          "Tempere o frango com sal e alho",
          "Grelhe o frango por 15 minutos de cada lado",
          "Cozinhe o arroz",
          "Cozinhe os legumes no vapor",
        ],
        servings: Math.ceil(servings / 3),
        prepTime: 40,
        variations: ["Adicione limão ao frango", "Use tempero de ervas"],
      },
      {
        name: "Carne Moída com Batata",
        category: "completo",
        ingredients: [
          { name: "carne moída", quantity: 800, unit: "g" },
          { name: "batata", quantity: 1, unit: "kg" },
          { name: "cebola", quantity: 200, unit: "g" },
          { name: "tomate", quantity: 300, unit: "g" },
        ],
        steps: [
          "Refogue a cebola e o alho",
          "Adicione a carne moída e refogue",
          "Adicione tomate picado",
          "Cozinhe as batatas em cubos",
        ],
        servings: Math.ceil(servings / 3),
        prepTime: 35,
        variations: ["Adicione pimentão", "Use batata-doce"],
      },
      {
        name: "Ovo Mexido com Legumes",
        category: "completo",
        ingredients: [
          { name: "ovo", quantity: 12, unit: "unidade" },
          { name: "tomate", quantity: 200, unit: "g" },
          { name: "cebola", quantity: 100, unit: "g" },
        ],
        steps: [
          "Pique os legumes",
          "Refogue os legumes",
          "Adicione os ovos batidos",
          "Mexa até cozinhar",
        ],
        servings: Math.ceil(servings / 3),
        prepTime: 15,
        variations: ["Adicione queijo", "Use espinafre"],
      },
    ],
    shoppingList: [
      { category: "Açougue", item: "frango", quantity: 1, unit: "kg" },
      { category: "Açougue", item: "carne moída", quantity: 800, unit: "g" },
      { category: "Frios e Laticínios", item: "ovo", quantity: 12, unit: "unidade" },
      { category: "Mercearia", item: "arroz", quantity: 500, unit: "g" },
      { category: "Hortifruti", item: "cenoura", quantity: 300, unit: "g" },
      { category: "Hortifruti", item: "brócolis", quantity: 300, unit: "g" },
      { category: "Hortifruti", item: "batata", quantity: 1, unit: "kg" },
      { category: "Hortifruti", item: "cebola", quantity: 300, unit: "g" },
      { category: "Hortifruti", item: "tomate", quantity: 500, unit: "g" },
    ],
    prepSchedule: [
      { order: 1, action: "Separar e lavar todos os ingredientes", duration: 10, parallel: false },
      { order: 2, action: "Temperar o frango", duration: 5, parallel: false },
      { order: 3, action: "Cozinhar arroz e batatas", duration: 25, parallel: true },
      { order: 4, action: "Grelhar frango", duration: 30, parallel: true },
      { order: 5, action: "Refogar carne moída", duration: 20, parallel: false },
      { order: 6, action: "Preparar ovos mexidos", duration: 15, parallel: false },
      { order: 7, action: "Montar marmitas", duration: 15, parallel: false },
    ],
    estimatedCost: "baixo",
    totalPrepTime: 90,
  };
}

