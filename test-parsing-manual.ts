import { parseIngredients } from "./server/ingredients-dictionary";

const testCases = [
  "2,5 kg frango, 1 kg arroz, 500g feijão",
  "2.5kg frango 1kg arroz 500g feijão",
  "frango 2,5 kg arroz 1kg feijão 500g",
];

testCases.forEach((input, idx) => {
  console.log(`\n=== Caso ${idx + 1}: "${input}" ===`);
  const result = parseIngredients(input);
  console.log(`Resultado: ${result.length} ingredientes`);
  result.forEach((ing, i) => {
    console.log(`  ${i + 1}. ${ing.quantity || "sem qty"}${ing.inputUnit || ""} ${ing.name}`);
  });
});

