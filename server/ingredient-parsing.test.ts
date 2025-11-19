import { describe, expect, it } from "vitest";
import { parseIngredients } from "./ingredients-dictionary";

describe("Parsing de Ingredientes com Vírgulas Decimais", () => {
  describe("Teste 1: Vírgulas decimais com separação por vírgula", () => {
    it('deve parsear "2,5 kg frango, 1 kg arroz, 500g feijão" corretamente', () => {
      const result = parseIngredients("2,5 kg frango, 1 kg arroz, 500g feijão");

      expect(result).toHaveLength(3);

      // Ingrediente 1: 2,5 kg frango
      expect(result[0].quantity).toBe(2.5);
      expect(result[0].inputUnit).toBe("kg");
      expect(result[0].canonical).toBe("frango");

      // Ingrediente 2: 1 kg arroz
      expect(result[1].quantity).toBe(1);
      expect(result[1].inputUnit).toBe("kg");
      expect(result[1].canonical).toBe("arroz");

      // Ingrediente 3: 500g feijão
      expect(result[2].quantity).toBe(500);
      expect(result[2].inputUnit).toBe("g");
      expect(result[2].canonical).toBe("feijão");
    });
  });

  describe("Teste 2: Pontos decimais sem vírgulas entre ingredientes", () => {
    it('deve parsear "2.5kg frango 1kg arroz 500g feijão" corretamente', () => {
      const result = parseIngredients("2.5kg frango 1kg arroz 500g feijão");

      expect(result).toHaveLength(3);

      // Ingrediente 1: 2.5kg frango (ponto convertido para vírgula)
      expect(result[0].quantity).toBe(2.5);
      expect(result[0].inputUnit).toBe("kg");
      expect(result[0].canonical).toBe("frango");

      // Ingrediente 2: 1kg arroz
      expect(result[1].quantity).toBe(1);
      expect(result[1].inputUnit).toBe("kg");
      expect(result[1].canonical).toBe("arroz");

      // Ingrediente 3: 500g feijão
      expect(result[2].quantity).toBe(500);
      expect(result[2].inputUnit).toBe("g");
      expect(result[2].canonical).toBe("feijão");
    });
  });

  describe("Teste 3: Quantidade depois do nome", () => {
    it('deve parsear "frango 2,5 kg arroz 1kg feijão 500g" corretamente', () => {
      const result = parseIngredients("frango 2,5 kg arroz 1kg feijão 500g");

      expect(result).toHaveLength(3);

      // Ingrediente 1: frango 2,5 kg
      expect(result[0].quantity).toBe(2.5);
      expect(result[0].inputUnit).toBe("kg");
      expect(result[0].canonical).toBe("frango");

      // Ingrediente 2: arroz 1kg
      expect(result[1].quantity).toBe(1);
      expect(result[1].inputUnit).toBe("kg");
      expect(result[1].canonical).toBe("arroz");

      // Ingrediente 3: feijão 500g
      expect(result[2].quantity).toBe(500);
      expect(result[2].inputUnit).toBe("g");
      expect(result[2].canonical).toBe("feijão");
    });
  });

  describe("Casos adicionais", () => {
    it("deve proteger vírgulas decimais ao separar por vírgula", () => {
      const result = parseIngredients("3,5 kg batata, 2,5 kg cebola");
      
      expect(result).toHaveLength(2);
      expect(result[0].quantity).toBe(3.5);
      expect(result[1].quantity).toBe(2.5);
    });

    it("deve suportar ingredientes sem quantidade", () => {
      const result = parseIngredients("frango, arroz, feijão");
      
      expect(result).toHaveLength(3);
      expect(result[0].quantity).toBeNull();
      expect(result[1].quantity).toBeNull();
      expect(result[2].quantity).toBeNull();
    });

    it("deve suportar mix de ingredientes com e sem quantidade", () => {
      const result = parseIngredients("2kg frango, arroz, 500g feijão");
      
      expect(result).toHaveLength(3);
      expect(result[0].quantity).toBe(2);
      expect(result[1].quantity).toBeNull();
      expect(result[2].quantity).toBe(500);
    });

    it("deve normalizar pontos decimais para vírgulas", () => {
      const result = parseIngredients("1.5 kg frango, 0.5 kg arroz");
      
      expect(result).toHaveLength(2);
      expect(result[0].quantity).toBe(1.5);
      expect(result[1].quantity).toBe(0.5);
    });
  });
});

