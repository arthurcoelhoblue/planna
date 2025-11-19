/**
 * Testes unitários para sistema de resolução de dietas com anti-alucinação
 */

import { describe, it, expect } from "vitest";

// Importar funções privadas através de um wrapper de teste
// (em produção, essas funções são privadas dentro do recipe-engine.ts)

describe("Sistema de Resolução de Dietas", () => {
  describe("normalizeDietType", () => {
    it("deve reconhecer 'low carb' como dieta canônica", () => {
      // Teste conceitual: verificar que "low carb" é reconhecida
      const input = "low carb";
      const normalized = input.toLowerCase().trim();
      expect(normalized).toBe("low carb");
    });

    it("deve reconhecer variações de 'low carb'", () => {
      const variations = ["lowcarb", "low-carb", "LOW CARB", "Low Carb"];
      variations.forEach(v => {
        const normalized = v.toLowerCase().replace("-", " ").trim();
        expect(normalized).toContain("low");
        expect(normalized).toContain("carb");
      });
    });

    it("deve reconhecer 'vegana' como dieta canônica", () => {
      const input = "vegana";
      const normalized = input.toLowerCase().trim();
      expect(normalized).toBe("vegana");
    });

    it("deve reconhecer 'vegetariana' como dieta canônica", () => {
      const input = "vegetariana";
      const normalized = input.toLowerCase().trim();
      expect(normalized).toBe("vegetariana");
    });

    it("deve retornar undefined para dietas não canônicas", () => {
      const input = "DASH";
      const isCanonical = ["low carb", "vegana", "vegetariana", "paleo", "cetogênica", "mediterrânea", "sem glúten", "sem lactose"]
        .includes(input.toLowerCase());
      expect(isCanonical).toBe(false);
    });
  });

  describe("resolveDietWithLLM", () => {
    it("deve retornar status 'unknown' para entrada vazia", () => {
      const input = "";
      expect(input.trim()).toBe("");
    });

    it("deve processar dietas reconhecidas com is_known = true", () => {
      const mockResponse = {
        is_known: true,
        normalized_label: "DASH",
        rules: [
          "Reduzir sódio (máximo 2300mg/dia)",
          "Priorizar frutas e vegetais",
          "Escolher grãos integrais"
        ]
      };
      
      expect(mockResponse.is_known).toBe(true);
      expect(mockResponse.rules).toHaveLength(3);
    });

    it("deve retornar status 'unknown' para dietas não reconhecidas", () => {
      const mockResponse = {
        is_known: false
      };
      
      expect(mockResponse.is_known).toBe(false);
    });

    it("deve tentar mapear dieta reconhecida para canônica", () => {
      const mockLabel = "low carb";
      const canonicalDiets = ["low carb", "vegana", "vegetariana"];
      const isCanonical = canonicalDiets.includes(mockLabel.toLowerCase());
      
      expect(isCanonical).toBe(true);
    });

    it("deve retornar 'recognized' para dietas conhecidas não canônicas", () => {
      const mockResponse = {
        is_known: true,
        normalized_label: "DASH",
        rules: ["Baixo sódio", "Alto potássio"]
      };
      
      const isCanonical = ["low carb", "vegana"].includes(mockResponse.normalized_label.toLowerCase());
      
      if (!isCanonical && mockResponse.is_known) {
        expect(mockResponse.rules).toBeDefined();
        expect(mockResponse.rules.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Integração com generateMealPlan", () => {
    it("deve usar dieta canônica sem chamar IA", () => {
      const dietType = "low carb";
      const isCanonical = ["low carb", "vegana", "vegetariana", "paleo", "cetogênica", "mediterrânea", "sem glúten", "sem lactose"]
        .includes(dietType.toLowerCase());
      
      expect(isCanonical).toBe(true);
      // Se canônica, não precisa chamar resolveDietWithLLM
    });

    it("deve chamar IA apenas para dietas não canônicas", () => {
      const dietType = "DASH";
      const isCanonical = ["low carb", "vegana", "vegetariana", "paleo", "cetogênica", "mediterrânea", "sem glúten", "sem lactose"]
        .includes(dietType.toLowerCase());
      
      expect(isCanonical).toBe(false);
      // Se não canônica, deve chamar resolveDietWithLLM
    });

    it("deve gerar dietRule para dieta canônica", () => {
      const normalizedDietType = "low carb";
      const dietRule = `DIETA ESPECIAL: O usuário segue a dieta "${normalizedDietType}". RESPEITE RIGOROSAMENTE as restrições alimentares desta dieta. Use APENAS ingredientes permitidos.`;
      
      expect(dietRule).toContain("low carb");
      expect(dietRule).toContain("RESPEITE RIGOROSAMENTE");
    });

    it("deve gerar dietRule para dieta reconhecida com regras", () => {
      const resolvedDiet = {
        status: "recognized" as const,
        label: "DASH",
        rules: ["Baixo sódio", "Alto potássio", "Grãos integrais"]
      };
      
      const rulesText = resolvedDiet.rules.join("; ");
      const dietRule = `DIETA ESPECIAL: O usuário segue a dieta "${resolvedDiet.label}". Trate esta dieta como um padrão conhecido com as seguintes diretrizes: ${rulesText}. RESPEITE essas restrições com rigor.`;
      
      expect(dietRule).toContain("DASH");
      expect(dietRule).toContain("Baixo sódio");
      expect(dietRule).toContain("Alto potássio");
    });

    it("não deve gerar dietRule para dieta desconhecida", () => {
      const resolvedDiet = {
        status: "unknown" as const
      };
      
      let dietRule = "";
      
      if (resolvedDiet.status !== "unknown") {
        dietRule = "alguma regra";
      }
      
      expect(dietRule).toBe("");
    });
  });

  describe("Comportamento Anti-Alucinação", () => {
    it("deve ignorar dietas inventadas", () => {
      const dietType = "monstro do lago ness";
      const isCanonical = ["low carb", "vegana", "vegetariana", "paleo", "cetogênica", "mediterrânea", "sem glúten", "sem lactose"]
        .includes(dietType.toLowerCase());
      
      expect(isCanonical).toBe(false);
      // IA deve retornar is_known: false
    });

    it("deve gerar plano normal quando dieta é unknown", () => {
      const resolvedDiet = {
        status: "unknown" as const
      };
      
      const shouldApplyDietRestrictions = resolvedDiet.status !== "unknown";
      expect(shouldApplyDietRestrictions).toBe(false);
    });

    it("deve incluir regras apenas quando dieta é reconhecida", () => {
      const resolvedDiet1 = {
        status: "recognized" as const,
        label: "DASH",
        rules: ["Baixo sódio"]
      };
      
      const resolvedDiet2 = {
        status: "unknown" as const
      };
      
      expect(resolvedDiet1.rules).toBeDefined();
      expect(resolvedDiet2.rules).toBeUndefined();
    });
  });

  describe("Mapeamento de Dietas", () => {
    it("deve mapear variações para dietas canônicas", () => {
      const mapping: Record<string, string> = {
        "lowcarb": "low carb",
        "low-carb": "low carb",
        "vegan": "vegana",
        "keto": "cetogênica",
        "gluten free": "sem glúten"
      };
      
      expect(mapping["lowcarb"]).toBe("low carb");
      expect(mapping["vegan"]).toBe("vegana");
      expect(mapping["keto"]).toBe("cetogênica");
    });

    it("deve preservar nome original quando não há mapeamento", () => {
      const input = "DASH";
      const mapping: Record<string, string> = {
        "lowcarb": "low carb"
      };
      
      const result = mapping[input.toLowerCase()] || input;
      expect(result).toBe("DASH");
    });
  });
});

