/**
 * Serviço de detecção de ingredientes em imagens usando IA
 */

import { invokeLLM } from "./_core/llm";

export interface DetectedIngredient {
  name: string;
  confidence: number;
  location?: string; // geladeira, congelador, armário
}

/**
 * Detecta ingredientes em uma imagem usando visão computacional
 */
export async function detectIngredientsFromImage(params: {
  imageUrl: string;
  location?: "geladeira" | "congelador" | "armario";
}): Promise<DetectedIngredient[]> {
  const { imageUrl, location = "geladeira" } = params;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente especializado em identificar ingredientes alimentares em imagens.

INSTRUÇÕES:
1. Analise a imagem e identifique TODOS os ingredientes visíveis
2. Liste apenas itens comestíveis (ignore embalagens vazias, utensílios, etc)
3. Seja específico mas prático (ex: "frango" ao invés de "peito de frango congelado")
4. Inclua vegetais, frutas, proteínas, grãos, laticínios, temperos visíveis
5. Se não tiver certeza, inclua com confiança menor

FORMATO DE SAÍDA (JSON):
{
  "ingredients": [
    { "name": "frango", "confidence": 0.95 },
    { "name": "arroz", "confidence": 0.90 },
    ...
  ]
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise esta imagem de ${location} e liste todos os ingredientes que você consegue identificar.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ingredient_detection",
          strict: true,
          schema: {
            type: "object",
            properties: {
              ingredients: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    confidence: { type: "number" },
                  },
                  required: ["name", "confidence"],
                  additionalProperties: false,
                },
              },
            },
            required: ["ingredients"],
            additionalProperties: false,
          },
        },
      },
    });

    const message = response.choices[0]?.message;
    if (!message?.content) {
      throw new Error("Resposta vazia da IA");
    }

    const content = typeof message.content === "string" ? message.content : JSON.stringify(message.content);
    const result = JSON.parse(content);

    return result.ingredients.map((ing: any) => ({
      name: ing.name,
      confidence: ing.confidence,
      location,
    }));
  } catch (error) {
    console.error("Erro ao detectar ingredientes:", error);
    throw new Error("Não foi possível detectar ingredientes na imagem. Tente novamente.");
  }
}

/**
 * Processa múltiplas imagens e consolida os ingredientes detectados
 */
export async function detectIngredientsFromMultipleImages(
  images: Array<{ url: string; location: "geladeira" | "congelador" | "armario" }>
): Promise<string[]> {
  const allIngredients: DetectedIngredient[] = [];

  for (const image of images) {
    try {
      const detected = await detectIngredientsFromImage({ imageUrl: image.url, location: image.location });
      allIngredients.push(...detected);
    } catch (error) {
      console.error(`Erro ao processar imagem de ${image.location}:`, error);
      // Continua com as outras imagens
    }
  }

  // Remove duplicatas e mantém apenas ingredientes com confiança > 0.5
  const uniqueIngredients = new Map<string, DetectedIngredient>();
  
  for (const ing of allIngredients) {
    if (ing.confidence > 0.5) {
      const existing = uniqueIngredients.get(ing.name.toLowerCase());
      if (!existing || ing.confidence > existing.confidence) {
        uniqueIngredients.set(ing.name.toLowerCase(), ing);
      }
    }
  }

  // Retorna lista de nomes ordenada por confiança
  return Array.from(uniqueIngredients.values())
    .sort((a, b) => b.confidence - a.confidence)
    .map((ing) => ing.name);
}

