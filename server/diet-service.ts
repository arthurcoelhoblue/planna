/**
 * Serviço de Dietas com IA
 * Implementa política anti-alucinação: retorna {status: "not_found"} quando não há informação confiável
 */

import { invokeLLM } from "./_core/llm";

export interface DietProfile {
  id: string;
  name: string;
  allowed: string[]; // Ingredientes/grupos permitidos
  restricted: string[]; // Ingredientes/grupos restritos
  guidelines: string[]; // Diretrizes gerais
  source?: string; // Fonte da informação (para transparência)
}

export type DietServiceResult =
  | { status: "found"; profile: DietProfile }
  | { status: "not_found"; message: string };

/**
 * Gera perfil de dieta usando IA com política anti-alucinação
 */
export async function generateDietProfile(dietName: string): Promise<DietServiceResult> {
  const prompt = `Você é um especialista em nutrição. Preciso de informações CONFIÁVEIS sobre a dieta: "${dietName}".

POLÍTICA ANTI-ALUCINAÇÃO (CRÍTICO):
- Se você NÃO tem informação confiável, científica ou amplamente reconhecida sobre essa dieta, retorne EXATAMENTE:
  {"status": "not_found"}
- NÃO invente diretrizes
- NÃO assuma similaridades com outras dietas
- NÃO crie regras sem fundamento

Se a dieta for reconhecida e você tem informação confiável, retorne:
{
  "status": "found",
  "profile": {
    "id": "nome-normalizado",
    "name": "Nome Oficial da Dieta",
    "allowed": ["lista de alimentos/grupos permitidos"],
    "restricted": ["lista de alimentos/grupos restritos"],
    "guidelines": ["diretrizes gerais da dieta"],
    "source": "fonte da informação (ex: literatura científica, consenso nutricional)"
  }
}

Exemplos de dietas reconhecidas: vegana, vegetariana, low-carb, cetogênica, mediterrânea, DASH, paleo, sem glúten, sem lactose.

IMPORTANTE: Seja conservador. Em caso de dúvida, retorne "not_found".`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em nutrição que NUNCA inventa informações. Se não sabe, admite explicitamente.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "diet_profile_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["found", "not_found"],
                description: 'Status da busca: "found" se encontrou informação confiável, "not_found" caso contrário',
              },
              profile: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  allowed: {
                    type: "array",
                    items: { type: "string" },
                  },
                  restricted: {
                    type: "array",
                    items: { type: "string" },
                  },
                  guidelines: {
                    type: "array",
                    items: { type: "string" },
                  },
                  source: { type: "string" },
                },
                required: ["id", "name", "allowed", "restricted", "guidelines"],
                additionalProperties: false,
              },
            },
            required: ["status"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        status: "not_found",
        message: "Não foi possível processar a resposta da IA.",
      };
    }

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const result = JSON.parse(contentStr);

    if (result.status === "not_found") {
      return {
        status: "not_found",
        message: `Não encontrei informações confiáveis sobre a dieta "${dietName}". Você pode escolher outra dieta, continuar sem dieta específica, ou descrever manualmente suas restrições alimentares.`,
      };
    }

    if (result.status === "found" && result.profile) {
      return {
        status: "found",
        profile: result.profile,
      };
    }

    // Fallback: resposta inesperada
    return {
      status: "not_found",
      message: "Resposta inesperada da IA. Por favor, tente novamente.",
    };
  } catch (error) {
    console.error("[DietService] Error generating diet profile:", error);
    return {
      status: "not_found",
      message: "Erro ao processar a dieta. Por favor, tente novamente.",
    };
  }
}

/**
 * Valida se um ingrediente é permitido na dieta
 */
export function isIngredientAllowed(ingredient: string, dietProfile: DietProfile): boolean {
  const normalized = ingredient.toLowerCase();

  // Verificar se está explicitamente restrito
  const isRestricted = dietProfile.restricted.some((r) => normalized.includes(r.toLowerCase()) || r.toLowerCase().includes(normalized));

  if (isRestricted) return false;

  // Verificar se está explicitamente permitido
  const isAllowed = dietProfile.allowed.some((a) => normalized.includes(a.toLowerCase()) || a.toLowerCase().includes(normalized));

  // Se não está nem permitido nem restrito, assumir permitido (conservador)
  return isAllowed || !isRestricted;
}

/**
 * Filtra ingredientes baseado na dieta
 */
export function filterIngredientsByDiet(ingredients: string[], dietProfile: DietProfile): {
  allowed: string[];
  restricted: string[];
} {
  const allowed: string[] = [];
  const restricted: string[] = [];

  for (const ing of ingredients) {
    if (isIngredientAllowed(ing, dietProfile)) {
      allowed.push(ing);
    } else {
      restricted.push(ing);
    }
  }

  return { allowed, restricted };
}

