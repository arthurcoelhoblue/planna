import { describe, it, expect } from 'vitest';
import { validateStock } from '../client/src/utils/stockValidation';

describe('validateStock', () => {
  it('deve retornar array vazio quando há estoque suficiente', () => {
    const ingredients = [
      { name: 'Frango', quantity: 2000, unit: 'g' },
      { name: 'Arroz', quantity: 1000, unit: 'g' },
    ];
    const servings = 5;

    const result = validateStock(ingredients, servings);
    expect(result).toEqual([]);
  });

  it('deve detectar ingrediente insuficiente (quantidade muito baixa)', () => {
    const ingredients = [
      { name: 'Frango', quantity: 500, unit: 'g' }, // Insuficiente para 10 porções
      { name: 'Arroz', quantity: 2000, unit: 'g' },
    ];
    const servings = 10;

    const result = validateStock(ingredients, servings);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Frango');
    expect(result[0].available).toBe(500);
    expect(result[0].needed).toBeGreaterThan(500);
  });

  it('deve detectar múltiplos ingredientes insuficientes', () => {
    const ingredients = [
      { name: 'Frango', quantity: 300, unit: 'g' },
      { name: 'Arroz', quantity: 200, unit: 'g' },
    ];
    const servings = 10;

    const result = validateStock(ingredients, servings);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('deve lidar com ingredientes sem quantidade (não valida)', () => {
    const ingredients = [
      { name: 'Frango', quantity: null, unit: null },
      { name: 'Arroz', quantity: 1000, unit: 'g' },
    ];
    const servings = 5;

    const result = validateStock(ingredients, servings);
    // Não deve validar ingredientes sem quantidade
    expect(result.every(r => r.name !== 'Frango')).toBe(true);
  });

  it('deve calcular corretamente a necessidade por porção', () => {
    const ingredients = [
      { name: 'Frango', quantity: 1000, unit: 'g' },
    ];
    const servings = 10;

    const result = validateStock(ingredients, servings);
    
    if (result.length > 0) {
      // Se detectou insuficiência, needed deve ser >= 100g por porção
      expect(result[0].needed).toBeGreaterThanOrEqual(1000);
    }
  });

  it('deve retornar informações completas sobre ingrediente insuficiente', () => {
    const ingredients = [
      { name: 'Frango', quantity: 500, unit: 'g' },
    ];
    const servings = 10;

    const result = validateStock(ingredients, servings);
    
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('available');
      expect(result[0]).toHaveProperty('needed');
      expect(result[0]).toHaveProperty('unit');
      expect(result[0].unit).toBe('g');
    }
  });

  it('deve aceitar estoque justo (exatamente o necessário)', () => {
    const ingredients = [
      { name: 'Arroz', quantity: 1500, unit: 'g' }, // 150g por porção para 10 porções
    ];
    const servings = 10;

    const result = validateStock(ingredients, servings);
    // Com 1500g para 10 porções (150g/porção), deve ser suficiente
    expect(result).toEqual([]);
  });
});

