/**
 * Motor de composição de receitas
 * Gera planos semanais baseados em ingredientes disponíveis
 */

import { invokeLLM } from "./_core/llm";

/**
 * Ingrediente com informação de estoque (usado na entrada do usuário)
 */
export interface IngredientWithStock {
  name: string;
  quantity?: number;
  unit?: string;
}

/**
 * Ingrediente em uma receita
 */
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  kcal?: number; // Calorias do ingrediente na quantidade especificada
  kcalPer100?: number; // Calorias por 100g/100ml (referência)
}

export interface Dish {
  name: string;
  category: "proteína" | "carboidrato" | "legume" | "completo";
  ingredients: Ingredient[];
  steps: string[];
  servings: number;
  prepTime: number; // em minutos
  variations?: string[]; // Sugestões de variação
  totalKcal?: number; // Calorias totais da receita
  kcalPerServing?: number; // Calorias por porção
  complexity: "simples" | "gourmet"; // Nível de sofisticação da receita
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
  totalKcal?: number; // Calorias totais do plano
  avgKcalPerServing?: number; // Média de calorias por porção
  adjustmentReason?: string; // Explicação quando o sistema não conseguiu cumprir exatamente o solicitado
  totalPlanTime?: number; // Tempo total estimado do plano em minutos (soma de prepTime das receitas)
  timeFits?: boolean; // Se o plano cabe no tempo disponível (com margem de 50%)
  availableTime?: number; // Tempo disponível informado pelo usuário em horas
}

/**
 * Tipos de dieta canônicos reconhecidos pelo sistema
 */
export type NormalizedDietType = 
  | "low carb"
  | "vegana"
  | "vegetariana"
  | "paleo"
  | "cetogênica"
  | "mediterrânea"
  | "sem glúten"
  | "sem lactose";

/**
 * Resultado da resolução de uma dieta informada pelo usuário
 */
export interface ResolvedDiet {
  status: "canonical" | "recognized" | "unknown";
  /** Nome normalizado de dieta canônica (low carb, vegana, etc.) */
  canonicalName?: NormalizedDietType;
  /** Nome livre da dieta, exatamente como o usuário ou o modelo descreveram */
  label?: string;
  /** Lista de regras/resumos da dieta, quando reconhecida via IA */
  rules?: string[];
}

/**
 * Normaliza um tipo de dieta informado pelo usuário para um dos tipos canônicos
 * Retorna undefined se não reconhecer como dieta canônica
 */
function normalizeDietType(raw: string | undefined): NormalizedDietType | undefined {
  if (!raw) return undefined;
  
  const normalized = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  
  // Mapeamento de variações para dietas canônicas
  const mapping: Record<string, NormalizedDietType> = {
    "low carb": "low carb",
    "lowcarb": "low carb",
    "low-carb": "low carb",
    "baixo carboidrato": "low carb",
    "vegana": "vegana",
    "vegan": "vegana",
    "vegetariana": "vegetariana",
    "vegetarian": "vegetariana",
    "paleo": "paleo",
    "paleolitica": "paleo",
    "cetogenica": "cetogênica",
    "keto": "cetogênica",
    "mediterranea": "mediterrânea",
    "mediterranean": "mediterrânea",
    "sem gluten": "sem glúten",
    "gluten free": "sem glúten",
    "sem lactose": "sem lactose",
    "lactose free": "sem lactose",
  };
  
  return mapping[normalized];
}

/**
 * Usa IA para tentar reconhecer uma dieta não canônica.
 * Só aceita se o modelo declarar explicitamente que é uma dieta conhecida
 * e retornar regras claras. Caso contrário, retorna "unknown".
 */
async function resolveDietWithLLM(raw: string): Promise<ResolvedDiet> {
  const input = raw.trim();
  if (!input) {
    return { status: "unknown" };
  }

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "Você é um nutricionista rigoroso. Sua tarefa é APENAS dizer se um nome é de uma dieta realmente conhecida e quais são as regras básicas dela. Se não tiver certeza, você deve responder que é desconhecida.",
      },
      {
        role: "user",
        content: `O usuário informou que segue a dieta: "${input}". 
Sua tarefa:
1. Dizer se essa é uma dieta reconhecida (ex.: low carb, mediterrânea, DASH, etc.) ou não.
2. Se for reconhecida, listar 3–6 regras/resumos que definem essa dieta.
3. Se você não tiver certeza, responda que é DESCONHECIDA.

Responda SOMENTE no JSON com o formato especificado no schema.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "resolved_diet",
        strict: true,
        schema: {
          type: "object",
          properties: {
            is_known: { type: "boolean" },
            normalized_label: { type: "string" },
            rules: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["is_known"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0]?.message;
  if (!message?.content) {
    return { status: "unknown" };
  }

  const content =
    typeof message.content === "string"
      ? message.content
      : JSON.stringify(message.content);

  try {
    const parsed = JSON.parse(content) as {
      is_known: boolean;
      normalized_label?: string;
      rules?: string[];
    };

    if (!parsed.is_known) {
      return { status: "unknown" };
    }

    const label = (parsed.normalized_label || input).trim();

    // Tenta mapear o nome reconhecido de volta para uma das dietas canônicas
    const maybeCanonical = normalizeDietType(label);

    if (maybeCanonical) {
      return {
        status: "canonical",
        canonicalName: maybeCanonical,
        label,
        rules: parsed.rules,
      };
    }

    return {
      status: "recognized",
      label,
      rules: parsed.rules || [],
    };
  } catch (err) {
    console.error("[Diet] Falha ao parsear resposta da IA:", err);
    return { status: "unknown" };
  }
}

/**
 * Normaliza nome de ingrediente para comparação case-insensitive e sem acentos
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Regras fixas de dietas canônicas (anti-alucinação)
 */
const DIET_RULES: Record<
  NormalizedDietType,
  { forbidden: string[]; notes?: string }
> = {
  "low carb": {
    forbidden: [
      "arroz",
      "arroz branco",
      "batata",
      "batata inglesa",
      "massa",
      "macarrão",
      "pão",
      "farinha",
      "açúcar",
      "doces",
    ],
    notes: "Low carb evita carboidratos simples e amidos.",
  },
  vegana: {
    forbidden: ["carne", "frango", "peixe", "ovo", "leite", "laticínios", "manteiga", "mel"],
    notes: "Veganos não consomem nenhum ingrediente de origem animal.",
  },
  vegetariana: {
    forbidden: ["carne", "frango", "peixe"],
    notes: "Vegetarianos evitam carnes, mas aceitam laticínios e ovos.",
  },
  cetogênica: {
    forbidden: [
      "arroz",
      "batata",
      "mandioca",
      "pão",
      "açúcar",
      "macarrão",
      "frutas ricas em açúcar"
    ],
    notes: "Cetogênica é muito baixa em carboidratos e rica em gordura.",
  },
  mediterrânea: {
    forbidden: ["ultraprocessado", "industrializado"],
    notes: "Mediterrânea evita alimentos ultraprocessados.",
  },
  paleo: {
    forbidden: ["grãos", "laticínios", "leguminosas", "açúcar", "processados"],
    notes: "Paleo evita alimentos não disponíveis no paleolítico.",
  },
  "sem glúten": {
    forbidden: ["trigo", "cevada", "centeio", "pão", "massa", "macarrão"],
    notes: "Sem glúten evita cereais que contêm glúten.",
  },
  "sem lactose": {
    forbidden: ["leite", "queijo", "iogurte", "manteiga", "creme de leite", "laticínios"],
    notes: "Sem lactose evita produtos lácteos.",
  },
};

/**
 * Sanitiza o plano gerado pela IA, removendo ingredientes não permitidos
 * quando allowNewIngredients = false
 */
function sanitizePlanIngredients(
  plan: MealPlan,
  availableIngredients: string[],
  allowNewIngredients: boolean
): MealPlan {
  // Se permite novos ingredientes, retorna o plano sem modificações
  if (allowNewIngredients) return plan;

  // Cria set de ingredientes permitidos (normalizados)
  const allowed = new Set(availableIngredients.map(normalizeName));

  // Filtra ingredientes de cada receita
  const sanitizedDishes = plan.dishes
    .map((dish) => {
      const filteredIngredients = dish.ingredients.filter((ing) => {
        const normalized = normalizeName(ing.name);
        const isAllowed = allowed.has(normalized);
        
        if (!isAllowed) {
          console.log(`[Sanitização] Ingrediente removido: "${ing.name}" da receita "${dish.name}"`);
        }
        
        return isAllowed;
      });

      return {
        ...dish,
        ingredients: filteredIngredients,
      };
    })
    // Descarta receitas que ficaram sem ingredientes
    .filter((dish) => {
      if (dish.ingredients.length === 0) {
        console.log(`[Sanitização] Receita removida: "${dish.name}" (sem ingredientes válidos)`);
        return false;
      }
      return true;
    });

  // Filtra lista de compras
  const sanitizedShoppingList = plan.shoppingList.filter((item) => {
    const normalized = normalizeName(item.item);
    const isAllowed = allowed.has(normalized);
    
    if (!isAllowed) {
      console.log(`[Sanitização] Item removido da lista de compras: "${item.item}"`);
    }
    
    return isAllowed;
  });

  return {
    ...plan,
    dishes: sanitizedDishes,
    shoppingList: sanitizedShoppingList,
  };
}

/**
 * Sanitiza o plano final considerando dieta, exclusões e allowNewIngredients.
 * Remove ingredientes proibidos, ajusta receitas e registra razões.
 */
function sanitizePlanDietsAndExclusions(
  plan: MealPlan,
  params: {
    dietType?: NormalizedDietType;
    resolvedDiet?: ResolvedDiet;
    exclusions: string[];
    allowNewIngredients: boolean;
    availableIngredients: string[]; // nomes normalizados vindos do usuário
  }
): MealPlan {
  const { dietType, resolvedDiet, exclusions, allowNewIngredients, availableIngredients } = params;

  const normalizedAvailable = new Set(availableIngredients.map(normalizeName));
  const bannedByUser = new Set(exclusions.map(normalizeName));

  // Ingredientes proibidos pela dieta
  const dietForbidden = new Set<string>();

  if (dietType && DIET_RULES[dietType]) {
    DIET_RULES[dietType].forbidden.forEach((item) =>
      dietForbidden.add(normalizeName(item))
    );
  }

  // Dietas reconhecidas via IA (não canônicas)
  if (resolvedDiet?.status === "recognized" && resolvedDiet.rules) {
    resolvedDiet.rules.forEach((r) => {
      const tokens = r.split(/[ ,;-]/).map((t) => normalizeName(t));
      tokens.forEach((t) => {
        if (t.length > 2) dietForbidden.add(t);
      });
    });
  }

  const adjustments: string[] = [];

  // Sanitização dos pratos
  const cleanedDishes = plan.dishes
    .map((dish) => {
      const newIngredients = dish.ingredients.filter((ing) => {
        const key = normalizeName(ing.name);

        // Exclusões do usuário
        if (bannedByUser.has(key)) {
          adjustments.push(`Ingrediente removido por exclusão: ${ing.name}`);
          return false;
        }

        // Dieta
        if (dietForbidden.has(key)) {
          adjustments.push(`Ingrediente proibido pela dieta removido: ${ing.name}`);
          return false;
        }

        // allowNewIngredients false → só aceita ingredientes disponíveis
        if (!allowNewIngredients && !normalizedAvailable.has(key)) {
          adjustments.push(`Ingrediente não permitido removido: ${ing.name}`);
          return false;
        }

        return true;
      });

      if (newIngredients.length === 0) {
        adjustments.push(`Receita removida por não conter ingredientes válidos: ${dish.name}`);
        return null;
      }

      return { ...dish, ingredients: newIngredients };
    })
    .filter(Boolean) as Dish[];

  // Sanitização da lista de compras
  const cleanedShopping = plan.shoppingList.filter((item) => {
    const key = normalizeName(item.item);

    if (bannedByUser.has(key)) return false;
    if (dietForbidden.has(key)) return false;
    if (!allowNewIngredients && !normalizedAvailable.has(key)) return false;

    return true;
  });

  const newPlan = {
    ...plan,
    dishes: cleanedDishes,
    shoppingList: cleanedShopping,
  };

  if (adjustments.length > 0) {
    newPlan.adjustmentReason = 
      (plan.adjustmentReason ? plan.adjustmentReason + " " : "") +
      adjustments.join(" ");
  }

  return newPlan;
}

/**
 * Calcula métricas de tempo do plano e verifica se cabe no tempo disponível
 */
function calculateTimeMetrics(plan: MealPlan, availableTime?: number): MealPlan {
  // Usa o totalPrepTime que já foi calculado pela IA (considera tarefas paralelas)
  const totalPlanTime = plan.totalPrepTime;
  
  // Se não há tempo disponível informado, retorna apenas com o tempo total
  if (!availableTime) {
    return {
      ...plan,
      totalPlanTime,
    };
  }
  
  // Converte tempo disponível de horas para minutos e aplica margem de 100%
  // (margem maior porque a IA tende a ser otimista com paralelismo)
  const maxAllowedTime = availableTime * 60 * 2;
  
  // Verifica se o plano cabe no tempo (com margem de 100%)
  const timeFits = totalPlanTime <= maxAllowedTime;
  
  console.log(`[Time Metrics] totalPrepTime: ${totalPlanTime}min, availableTime: ${availableTime}h (${availableTime * 60}min), maxAllowed (with 100% margin): ${maxAllowedTime}min, timeFits: ${timeFits}`);
  
  return {
    ...plan,
    totalPlanTime,
    timeFits,
    availableTime,
  };
}

/**
 * Garante que o plano respeita rigorosamente o número de misturas e porções solicitadas
 */
function enforceVarietiesAndServings(
  plan: MealPlan,
  requestedVarieties: number,
  requestedServings: number
): MealPlan {
  const adjustments: string[] = [];
  let dishes = [...plan.dishes];
  
  // 1. ENFORCEMENT DE MISTURAS (VARIEDADES)
  if (dishes.length < requestedVarieties) {
    console.log(`[Enforcement] IA gerou ${dishes.length} receitas, mas foram pedidas ${requestedVarieties}. Gerando receitas extras...`);
    adjustments.push(`O sistema gerou ${dishes.length} misturas inicialmente e criou ${requestedVarieties - dishes.length} variações adicionais para atingir as ${requestedVarieties} misturas solicitadas.`);
    
    // Gerar receitas extras duplicando as existentes com variações
    const missingCount = requestedVarieties - dishes.length;
    for (let i = 0; i < missingCount; i++) {
      const baseDish = dishes[i % dishes.length];
      const variation = baseDish.variations?.[0] || "tempero diferente";
      
      const newDish: Dish = {
        ...baseDish,
        name: `${baseDish.name} - Variação ${i + 1}`,
        servings: 0, // Será ajustado no próximo passo
        variations: baseDish.variations?.slice(1) || [],
      };
      
      dishes.push(newDish);
      console.log(`[Enforcement] Receita extra criada: "${newDish.name}" baseada em "${baseDish.name}"`);
    }
  } else if (dishes.length > requestedVarieties) {
    console.log(`[Enforcement] IA gerou ${dishes.length} receitas, mas foram pedidas ${requestedVarieties}. Removendo excesso...`);
    adjustments.push(`O sistema gerou ${dishes.length} misturas mas você pediu ${requestedVarieties}, então removemos o excesso.`);
    dishes = dishes.slice(0, requestedVarieties);
  }
  
  // 2. ENFORCEMENT DE PORÇÕES
  const currentTotalServings = dishes.reduce((sum, dish) => sum + dish.servings, 0);
  
  if (currentTotalServings < requestedServings) {
    console.log(`[Enforcement] Total de porções atual: ${currentTotalServings}, pedido: ${requestedServings}. Ajustando...`);
    adjustments.push(`O sistema ajustou a distribuição de porções para atingir as ${requestedServings} porções solicitadas.`);
    
    // Distribuir porções faltantes entre as receitas
    const servingsPerDish = Math.floor(requestedServings / dishes.length);
    const remainder = requestedServings % dishes.length;
    
    dishes = dishes.map((dish, index) => ({
      ...dish,
      servings: servingsPerDish + (index < remainder ? 1 : 0),
    }));
    
    const newTotal = dishes.reduce((sum, dish) => sum + dish.servings, 0);
    console.log(`[Enforcement] Porções ajustadas. Novo total: ${newTotal}`);
  } else if (currentTotalServings > requestedServings) {
    // Permitir arredondamento para cima (até +2 porções)
    const diff = currentTotalServings - requestedServings;
    if (diff > 2) {
      console.log(`[Enforcement] Total de porções muito alto: ${currentTotalServings}, pedido: ${requestedServings}. Reduzindo...`);
      
      // Redistribuir porções para atingir o solicitado
      const servingsPerDish = Math.floor(requestedServings / dishes.length);
      const remainder = requestedServings % dishes.length;
      
      dishes = dishes.map((dish, index) => ({
        ...dish,
        servings: servingsPerDish + (index < remainder ? 1 : 0),
      }));
    } else {
      console.log(`[Enforcement] Total de porções: ${currentTotalServings} (arredondamento aceitável para ${requestedServings})`);
    }
  }
  
  const adjustmentReason = adjustments.length > 0 
    ? adjustments.join(" ") 
    : undefined;

  return {
    ...plan,
    dishes,
    adjustmentReason,
  };
}

/**
 * Gera um plano de marmitas usando IA
 */
export async function generateMealPlan(params: {
  availableIngredients: Array<string | IngredientWithStock>;
  servings: number;
  exclusions?: string[];
  objective?: "normal" | "aproveitamento";
  userFavorites?: string[];
  userDislikes?: string[];
  varieties?: number;
  allowNewIngredients?: boolean;
  sophistication?: "simples" | "gourmet";
  skillLevel?: "beginner" | "intermediate" | "advanced";
  calorieLimit?: number;
  dietType?: string;
  availableTime?: number; // Tempo disponível em horas para cozinhar
}): Promise<MealPlan> {
  const {
    availableIngredients: rawIngredients,
    servings,
    exclusions = [],
    objective = "normal",
    userFavorites = [],
    userDislikes = [],
    varieties,
    allowNewIngredients = false,
    sophistication = "simples",
    skillLevel = "intermediate",
    calorieLimit,
    dietType,
    availableTime,
  } = params;

  // Normaliza ingredientes: separa nomes e quantidades
  const ingredientsWithStock: IngredientWithStock[] = rawIngredients.map(item => {
    if (typeof item === "string") {
      return { name: item };
    }
    return item;
  });

  // Lista de nomes para compatibilidade com código existente
  const availableIngredients = ingredientsWithStock.map(i => i.name);

  // Ingredientes com quantidade definida
  const stockLimits = ingredientsWithStock.filter(i => i.quantity !== undefined);

  // Calcula número de pratos base
  const numDishes = varieties || (servings <= 8 ? 3 : servings <= 12 ? 4 : 5);

  // Define o foco baseado no objetivo
  let objectiveFocus = "";
  if (objective === "aproveitamento") {
    objectiveFocus =
      "FOCO EM APROVEITAMENTO TOTAL: Aproveite cascas (ex: chips de casca de batata), talos (ex: talos de brócolis refogados), sobras e partes normalmente descartadas. Sugira receitas criativas de aproveitamento. Reduza desperdício ao máximo.";
  } else {
    // normal
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

  const calorieRule = calorieLimit
    ? `LIMITE CALÓRICO: Cada porção deve ter NO MÁXIMO ${calorieLimit} kcal. Ajuste as quantidades de ingredientes para respeitar este limite. Calcule e informe as calorias de cada receita e por porção.`
    : "";

  // Resolução de dieta com anti-alucinação
  let normalizedDietType = normalizeDietType(dietType);
  let resolvedDiet: ResolvedDiet | undefined;

  // Se não caiu em uma dieta canônica, tenta resolver com IA
  if (!normalizedDietType && dietType) {
    resolvedDiet = await resolveDietWithLLM(dietType);
    if (resolvedDiet.status === "canonical" && resolvedDiet.canonicalName) {
      normalizedDietType = resolvedDiet.canonicalName;
    }
  }

  // Monta dietRule baseado na resolução
  let dietRule = "";

  if (normalizedDietType) {
    dietRule = `DIETA ESPECIAL: O usuário segue a dieta "${normalizedDietType}". RESPEITE RIGOROSAMENTE as restrições alimentares desta dieta. Use APENAS ingredientes permitidos.`;
  } else if (resolvedDiet?.status === "recognized" && resolvedDiet.label) {
    const rulesText = (resolvedDiet.rules || []).join("; ");
    dietRule = `DIETA ESPECIAL: O usuário segue a dieta "${resolvedDiet.label}". Trate esta dieta como um padrão conhecido com as seguintes diretrizes: ${rulesText}. RESPEITE essas restrições com rigor. Se houver conflito com ingredientes disponíveis, ajuste o plano e mencione isso em note/adjustmentReason.`;
  }

  // Regra de estoque (se houver quantidades definidas)
  const stockRule = stockLimits.length > 0
    ? `LIMITES DE ESTOQUE: O usuário informou as seguintes quantidades disponíveis:\n${stockLimits.map(s => `- ${s.name}: ${s.quantity}${s.unit || ""}`).join("\n")}\n\nIMPORTANTE: NÃO planeje receitas que exijam MAIS do que essas quantidades. Se um ingrediente tem limite, respeite-o RIGOROSAMENTE. Ajuste as porções e receitas para caber no estoque disponível.`
    : "";

  // Regra de tempo disponível
  const timeRule = availableTime
    ? `TEMPO DISPONÍVEL: O usuário tem ${availableTime} hora(s) disponível(is) HOJE para cozinhar TODAS as marmitas desta sessão. O tempo total do plano (soma de prepTime de todas as receitas, considerando paralelismo) deve ser NO MÁXIMO ${Math.round(availableTime * 60)} minutos (SEM margem, pois o sistema já aplica margem de 100% na validação). Se necessário, simplifique receitas, reduza variedades ou ajuste porções para caber no tempo.`
    : "";

  // Monta o prompt para a IA
  const systemPrompt = `Você é um planejador de marmitas minimalista e prático.

REGRAS FIXAS (NÃO NEGOCIÁVEIS):
- NUNCA contradiga as regras de ingredientes e exclusões.
- NUNCA use ingredientes que não estão na lista disponível quando isso for proibido.
- Siga ESTRITAMENTE o nível de sofisticação:
  * Se SIMPLES: PROÍBA preparos longos (>45min), técnicas avançadas (sous-vide, flambar, reduzir molhos), ingredientes raros, e muitos passos (>6 passos por receita).
  * Se GOURMET: ACEITE preparos mais longos, técnicas elaboradas, ingredientes premium, apresentações refinadas e múltiplos componentes.

REGRAS IMPORTANTES:
1. Crie ${numDishes} pratos base diferentes para ${servings} marmitas
2. ${ingredientsRule}
3. NUNCA use estes ingredientes (exclusões): ${exclusions.join(", ") || "nenhum"}
4. Cada prato deve ter proteína + carboidrato + legumes (balanceamento simples)
5. Sugira 2 variações simples para cada prato (tempero diferente, montagem diferente)
6. ${objectiveFocus}
7. ${sophisticationRule}
8. ${skillLevelRule}
${calorieRule ? `9. ${calorieRule}` : ""}
${dietRule ? `10. ${dietRule}` : ""}
${stockRule ? `11. ${stockRule}` : ""}
${timeRule ? `12. ${timeRule}` : ""}
${stockRule || timeRule ? "13" : "11"}. CÁLCULO DE TEMPO: O totalPrepTime deve considerar tarefas paralelas. Se 2 tarefas de 30min cada são paralelas, contam como 30min (não 60min). Some apenas o tempo real necessário.
${stockRule || timeRule ? "14" : "12"}. Passos curtos e acionáveis no título, mas com detalhamento completo
${stockRule || timeRule ? "15" : "13"}. Tempo total de preparo deve ser otimizado (batch cooking)
${stockRule || timeRule ? "16" : "14"}. IMPORTANTE: Para cada passo do prepSchedule, inclua:
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
        {"name": "ingrediente", "quantity": 500, "unit": "g", "kcal": 685, "kcalPer100": 137}
      ],
      "steps": ["Passo 1", "Passo 2"],
      "servings": ${Math.ceil(servings / numDishes)},
      "prepTime": 30,
      "variations": ["Variação 1", "Variação 2"],
      "totalKcal": 2500,
      "kcalPerServing": 417
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
  "note": "Tempo calculado considerando tarefas em paralelo. Iniciantes podem precisar de mais tempo.",
  "totalKcal": 7500,
  "avgKcalPerServing": 417
}`;

  const userPrompt = `Crie um plano semanal de marmitas com os seguintes parâmetros:

Ingredientes disponíveis: ${availableIngredients.join(", ")}
Número de marmitas: ${servings}
Exclusões: ${exclusions.length > 0 ? exclusions.join(", ") : "nenhuma"}
Objetivo: ${objective}
${calorieLimit ? `Limite calórico por porção: ${calorieLimit} kcal` : ""}
${
  normalizedDietType
    ? `Dieta: ${normalizedDietType}`
    : resolvedDiet?.status === "recognized" && resolvedDiet.label
    ? `Dieta: ${resolvedDiet.label}`
    : ""
}

Gere o plano completo em JSON com informações nutricionais detalhadas.`;

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
                          kcal: { type: "number" },
                          kcalPer100: { type: "number" },
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
                    totalKcal: { type: "number" },
                    kcalPerServing: { type: "number" },
                    complexity: { type: "string", enum: ["simples", "gourmet"] },
                  },
                  required: ["name", "category", "ingredients", "steps", "servings", "prepTime", "complexity"],
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
              totalKcal: { type: "number" },
              avgKcalPerServing: { type: "number" },
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
    
    // Sanitiza o plano removendo ingredientes não permitidos
    const sanitizedPlan = sanitizePlanIngredients(
      plan,
      availableIngredients,
      allowNewIngredients
    );
    
    // Sanitização pós-IA (dieta + exclusões + allowNewIngredients)
    const dietSanitizedPlan = sanitizePlanDietsAndExclusions(sanitizedPlan, {
      dietType: normalizedDietType,
      resolvedDiet,
      exclusions,
      allowNewIngredients,
      availableIngredients,
    });
    
    // Enforcement rigoroso de misturas e porções
    const enforcedPlan = enforceVarietiesAndServings(dietSanitizedPlan, numDishes, servings);
    
    // Pós-processamento: calcular tempo total e verificar se cabe no tempo disponível
    const finalPlan = calculateTimeMetrics(enforcedPlan, availableTime);
    
    return finalPlan;
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
        complexity: "simples",
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
        complexity: "simples",
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
        complexity: "simples",
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

