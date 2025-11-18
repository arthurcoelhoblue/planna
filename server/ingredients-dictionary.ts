/**
 * Dicionário normalizado de ingredientes com sinônimos
 * Usado pelo normalizador para interpretar entrada livre do usuário
 */

export interface IngredientEntry {
  canonical: string; // Nome normalizado
  category: string; // Categoria para lista de compras
  unit: string; // Unidade padrão
  synonyms: string[]; // Variações e sinônimos
}

export const INGREDIENTS_DICTIONARY: IngredientEntry[] = [
  // Proteínas
  {
    canonical: "frango",
    category: "Açougue",
    unit: "kg",
    synonyms: ["peito de frango", "coxa de frango", "sobrecoxa", "frango inteiro", "file de frango"],
  },
  {
    canonical: "carne moída",
    category: "Açougue",
    unit: "kg",
    synonyms: ["moída", "carne picada", "patinho moído", "alcatra moída"],
  },
  {
    canonical: "carne bovina",
    category: "Açougue",
    unit: "kg",
    synonyms: ["carne", "bife", "alcatra", "patinho", "músculo", "acém"],
  },
  {
    canonical: "peixe",
    category: "Açougue",
    unit: "kg",
    synonyms: ["tilápia", "salmão", "pescada", "merluza", "file de peixe"],
  },
  {
    canonical: "ovo",
    category: "Frios e Laticínios",
    unit: "unidade",
    synonyms: ["ovos", "ovo de galinha"],
  },
  {
    canonical: "linguiça",
    category: "Açougue",
    unit: "kg",
    synonyms: ["linguica", "calabresa", "toscana", "paio"],
  },

  // Carboidratos
  {
    canonical: "arroz",
    category: "Mercearia",
    unit: "kg",
    synonyms: ["arroz branco", "arroz integral", "arroz parboilizado"],
  },
  {
    canonical: "macarrão",
    category: "Mercearia",
    unit: "kg",
    synonyms: ["massa", "espaguete", "penne", "parafuso", "talharim", "macarrao"],
  },
  {
    canonical: "batata",
    category: "Hortifruti",
    unit: "kg",
    synonyms: ["batata inglesa", "batata branca"],
  },
  {
    canonical: "batata-doce",
    category: "Hortifruti",
    unit: "kg",
    synonyms: ["batata doce"],
  },
  {
    canonical: "mandioca",
    category: "Hortifruti",
    unit: "kg",
    synonyms: ["aipim", "macaxeira"],
  },
  {
    canonical: "feijão",
    category: "Mercearia",
    unit: "kg",
    synonyms: ["feijao", "feijão preto", "feijão carioca"],
  },

  // Legumes
  {
    canonical: "brócolis",
    category: "Hortifruti",
    unit: "kg",
    synonyms: ["brocolis"],
  },
  {
    canonical: "cenoura",
    category: "Hortifruti",
    unit: "kg",
    synonyms: [],
  },
  {
    canonical: "tomate",
    category: "Hortifruti",
    unit: "kg",
    synonyms: ["tomates"],
  },
  {
    canonical: "cebola",
    category: "Hortifruti",
    unit: "kg",
    synonyms: ["cebolas"],
  },
  {
    canonical: "alho",
    category: "Hortifruti",
    unit: "g",
    synonyms: ["alho picado", "dente de alho"],
  },
  {
    canonical: "pimentão",
    category: "Hortifruti",
    unit: "unidade",
    synonyms: ["pimentao", "pimentão verde", "pimentão vermelho", "pimentão amarelo"],
  },
  {
    canonical: "abobrinha",
    category: "Hortifruti",
    unit: "kg",
    synonyms: ["abóbora italiana"],
  },
  {
    canonical: "berinjela",
    category: "Hortifruti",
    unit: "kg",
    synonyms: [],
  },
  {
    canonical: "couve",
    category: "Hortifruti",
    unit: "maço",
    synonyms: ["couve-manteiga", "couve refogada"],
  },
  {
    canonical: "espinafre",
    category: "Hortifruti",
    unit: "maço",
    synonyms: [],
  },
  {
    canonical: "alface",
    category: "Hortifruti",
    unit: "unidade",
    synonyms: ["alface americana", "alface crespa"],
  },
  {
    canonical: "repolho",
    category: "Hortifruti",
    unit: "kg",
    synonyms: ["repolho roxo", "repolho verde"],
  },
  {
    canonical: "vagem",
    category: "Hortifruti",
    unit: "kg",
    synonyms: ["vagens"],
  },
  {
    canonical: "milho",
    category: "Hortifruti",
    unit: "unidade",
    synonyms: ["milho verde", "espiga de milho", "milho em lata"],
  },
  {
    canonical: "ervilha",
    category: "Mercearia",
    unit: "lata",
    synonyms: ["ervilha em lata", "ervilha fresca"],
  },

  // Temperos e Condimentos
  {
    canonical: "sal",
    category: "Mercearia",
    unit: "kg",
    synonyms: ["sal refinado", "sal grosso"],
  },
  {
    canonical: "óleo",
    category: "Mercearia",
    unit: "litro",
    synonyms: ["oleo", "óleo de soja", "óleo vegetal"],
  },
  {
    canonical: "azeite",
    category: "Mercearia",
    unit: "ml",
    synonyms: ["azeite de oliva", "azeite extra virgem"],
  },
  {
    canonical: "vinagre",
    category: "Mercearia",
    unit: "ml",
    synonyms: ["vinagre de álcool", "vinagre de vinho"],
  },
  {
    canonical: "molho de tomate",
    category: "Mercearia",
    unit: "unidade",
    synonyms: ["molho", "extrato de tomate", "polpa de tomate"],
  },
  {
    canonical: "shoyu",
    category: "Mercearia",
    unit: "ml",
    synonyms: ["molho shoyu", "molho de soja"],
  },
  {
    canonical: "limão",
    category: "Hortifruti",
    unit: "unidade",
    synonyms: ["limao", "limão taiti"],
  },
  {
    canonical: "coentro",
    category: "Hortifruti",
    unit: "maço",
    synonyms: [],
  },
  {
    canonical: "salsinha",
    category: "Hortifruti",
    unit: "maço",
    synonyms: ["salsa", "cheiro verde"],
  },
  {
    canonical: "cebolinha",
    category: "Hortifruti",
    unit: "maço",
    synonyms: ["cebolinha verde"],
  },

  // Laticínios
  {
    canonical: "queijo",
    category: "Frios e Laticínios",
    unit: "kg",
    synonyms: ["queijo mussarela", "queijo prato", "queijo minas"],
  },
  {
    canonical: "leite",
    category: "Frios e Laticínios",
    unit: "litro",
    synonyms: ["leite integral", "leite desnatado"],
  },
  {
    canonical: "manteiga",
    category: "Frios e Laticínios",
    unit: "g",
    synonyms: [],
  },
  {
    canonical: "requeijão",
    category: "Frios e Laticínios",
    unit: "g",
    synonyms: ["requeijao"],
  },
];

/**
 * Normaliza uma string de ingrediente para o formato canônico
 */
export function normalizeIngredient(input: string): {
  canonical: string;
  category: string;
  unit: string;
  confidence: "high" | "medium" | "low";
} | null {
  const normalized = input.toLowerCase().trim();

  // Busca exata no canônico
  const exactMatch = INGREDIENTS_DICTIONARY.find(entry => entry.canonical === normalized);
  if (exactMatch) {
    return {
      canonical: exactMatch.canonical,
      category: exactMatch.category,
      unit: exactMatch.unit,
      confidence: "high",
    };
  }

  // Busca em sinônimos
  const synonymMatch = INGREDIENTS_DICTIONARY.find(entry =>
    entry.synonyms.some(syn => syn === normalized)
  );
  if (synonymMatch) {
    return {
      canonical: synonymMatch.canonical,
      category: synonymMatch.category,
      unit: synonymMatch.unit,
      confidence: "high",
    };
  }

  // Busca parcial (contém)
  const partialMatch = INGREDIENTS_DICTIONARY.find(
    entry =>
      entry.canonical.includes(normalized) ||
      normalized.includes(entry.canonical) ||
      entry.synonyms.some(syn => syn.includes(normalized) || normalized.includes(syn))
  );
  if (partialMatch) {
    return {
      canonical: partialMatch.canonical,
      category: partialMatch.category,
      unit: partialMatch.unit,
      confidence: "medium",
    };
  }

  // Não encontrado
  return null;
}

/**
 * Processa entrada livre de ingredientes e retorna lista normalizada
 * Suporta sintaxe com quantidade: "2kg frango", "500g arroz", "10 ovos"
 */
export function parseIngredients(input: string): Array<{
  original: string;
  canonical: string | null;
  category: string | null;
  unit: string | null;
  confidence: "high" | "medium" | "low" | "unknown";
  quantity?: number | null;
  inputUnit?: string | null;
}> {
  // PASSO 1: Normalizar pontos decimais para vírgulas (2.5 -> 2,5)
  let normalized = input.replace(/(\d)\.(\d)/g, "$1,$2");

  // PASSO 2: Proteger vírgulas decimais (2,5 -> 2·5)
  normalized = normalized.replace(/(\d),(\d)/g, "$1·$2");

  // PASSO 3: Tentar separar por vírgula primeiro
  let items = normalized.split(/[,;\n]/).map(item => item.trim()).filter(item => item.length > 0);

  // PASSO 4: Se houver apenas 1 item, tentar heurística de separação sem vírgulas
  if (items.length === 1) {
    // Detectar padrões: "2kg frango 1kg arroz 500g feijão" OU "frango 2kg arroz 1kg feijão 500g"
    // Estratégia: usar regex para capturar padrões completos
    const text = items[0];
    
    // Padrão 1: quantidade no início (2kg frango) - captura até próximo número ou fim
    const pattern1 = /(\d+(?:·\d+)?)\s*([a-zA-Zçãõéêíóú]+)?\s+([a-zA-Zçãõéêíóú\s]+?)(?=\s*\d|$)/g;
    const matches1 = Array.from(text.matchAll(pattern1));
    
    // Padrão 2: quantidade no final (frango 2kg) - captura até próximo padrão ou fim
    const pattern2 = /([a-zA-Zçãõéêíóú]+)\s+(\d+(?:·\d+)?)\s*([a-zA-Zçãõéêíóú]+)?(?=\s+[a-zA-Zçãõéêíóú]+\s+\d|$)/g;
    const matches2 = Array.from(text.matchAll(pattern2));
    
    // Usar o padrão que encontrou mais matches
    const matches = matches1.length >= matches2.length ? matches1 : matches2;
    
    if (matches.length > 1) {
      // Múltiplos ingredientes detectados!
      items = matches.map(m => m[0].trim());
    }
  }

  // PASSO 5: Restaurar vírgulas decimais em todos os items
  items = items.map(item => item.replace(/·/g, ","));

  // PASSO 6: Parsear cada item individualmente
  return items.map(item => {
    let quantity: number | null = null;
    let inputUnit: string | null = null;
    let namePart = item;

    // Tentar padrão: "2,5 kg frango" (quantidade no início)
    let qtyMatch = item.match(/^(\d+(?:,\d+)?)\s*([a-zA-Zçãõéêíóú]+)?\s+(.+)$/);
    
    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1].replace(",", "."));
      inputUnit = qtyMatch[2] ? qtyMatch[2].toLowerCase() : null;
      namePart = qtyMatch[3];
    } else {
      // Tentar padrão: "frango 2,5 kg" (quantidade no final)
      qtyMatch = item.match(/^(.+?)\s+(\d+(?:,\d+)?)\s*([a-zA-Zçãõéêíóú]+)?$/);
      if (qtyMatch) {
        namePart = qtyMatch[1];
        quantity = parseFloat(qtyMatch[2].replace(",", "."));
        inputUnit = qtyMatch[3] ? qtyMatch[3].toLowerCase() : null;
      }
    }

    const normalized = normalizeIngredient(namePart);
    if (normalized) {
      return {
        original: item,
        name: namePart,
        canonical: normalized.canonical,
        category: normalized.category,
        unit: normalized.unit,
        confidence: normalized.confidence,
        quantity,
        inputUnit,
      };
    }
    return {
      original: item,
      name: namePart,
      canonical: null,
      category: null,
      unit: null,
      confidence: "unknown" as const,
      quantity,
      inputUnit,
    };
  });
}

/**
 * Retorna sugestões de autocomplete baseadas em input parcial
 */
export function getSuggestions(partial: string, limit: number = 5): string[] {
  const normalized = partial.toLowerCase().trim();
  if (normalized.length < 2) return [];

  const matches = INGREDIENTS_DICTIONARY.filter(
    entry =>
      entry.canonical.startsWith(normalized) ||
      entry.synonyms.some(syn => syn.startsWith(normalized))
  )
    .map(entry => entry.canonical)
    .slice(0, limit);

  return matches;
}

