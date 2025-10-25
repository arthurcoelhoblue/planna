/**
 * Exportador de planos para PDF
 * Gera PDFs formatados com cardápio, lista de compras e roteiro
 */

import { MealPlan } from "./recipe-engine";

/**
 * Gera HTML formatado do plano de marmitas
 */
export function generatePlanHTML(plan: MealPlan): string {
  const dishesHTML = plan.dishes
    .map(
      (dish, index) => `
    <div class="dish">
      <h2>${index + 1}. ${dish.name}</h2>
      <p class="dish-info">${dish.servings} porções • ${dish.prepTime} minutos</p>
      
      <div class="dish-content">
        <div class="ingredients">
          <h3>Ingredientes:</h3>
          <ul>
            ${dish.ingredients.map((ing) => `<li>${ing.name}: ${ing.quantity} ${ing.unit}</li>`).join("")}
          </ul>
        </div>
        
        <div class="steps">
          <h3>Modo de preparo:</h3>
          <ol>
            ${dish.steps.map((step) => `<li>${step}</li>`).join("")}
          </ol>
        </div>
      </div>
      
      ${
        dish.variations && dish.variations.length > 0
          ? `
      <div class="variations">
        <h3>💡 Variações:</h3>
        <ul>
          ${dish.variations.map((v) => `<li>${v}</li>`).join("")}
        </ul>
      </div>
      `
          : ""
      }
    </div>
  `
    )
    .join("");

  // Agrupa lista de compras por categoria
  const groupedShopping = plan.shoppingList.reduce((acc: any, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const shoppingHTML = Object.entries(groupedShopping)
    .map(
      ([category, items]: [string, any]) => `
    <div class="shopping-category">
      <h3>${category}</h3>
      <ul class="checklist">
        ${items.map((item: any) => `<li><span class="checkbox">☐</span> ${item.item} - ${item.quantity} ${item.unit}</li>`).join("")}
      </ul>
    </div>
  `
    )
    .join("");

  const prepScheduleHTML = plan.prepSchedule
    .sort((a, b) => a.order - b.order)
    .map(
      (step) => `
    <div class="prep-step">
      <div class="step-number">${step.order}</div>
      <div class="step-content">
        <p class="step-action">${step.action}</p>
        <p class="step-info">${step.duration} min${step.parallel ? " • Pode fazer em paralelo" : ""}</p>
      </div>
    </div>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Plano Semanal de Marmitas - Planna</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #4ade80;
    }
    
    .header h1 {
      font-size: 32px;
      color: #16a34a;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 16px;
      color: #666;
    }
    
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 24px;
      color: #16a34a;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .dish {
      margin-bottom: 30px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    
    .dish h2 {
      font-size: 20px;
      color: #1a1a1a;
      margin-bottom: 5px;
    }
    
    .dish-info {
      font-size: 14px;
      color: #666;
      margin-bottom: 15px;
    }
    
    .dish-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 15px;
    }
    
    .ingredients h3,
    .steps h3,
    .variations h3 {
      font-size: 16px;
      color: #16a34a;
      margin-bottom: 10px;
    }
    
    .ingredients ul,
    .variations ul {
      list-style: none;
      padding-left: 0;
    }
    
    .ingredients li,
    .variations li {
      padding: 4px 0;
      font-size: 14px;
    }
    
    .ingredients li::before {
      content: "• ";
      color: #16a34a;
      font-weight: bold;
    }
    
    .variations li::before {
      content: "→ ";
      color: #f59e0b;
    }
    
    .steps ol {
      padding-left: 20px;
    }
    
    .steps li {
      padding: 4px 0;
      font-size: 14px;
    }
    
    .variations {
      background: #fef3c7;
      padding: 15px;
      border-radius: 6px;
      margin-top: 15px;
    }
    
    .shopping-category {
      margin-bottom: 20px;
    }
    
    .shopping-category h3 {
      font-size: 18px;
      color: #16a34a;
      margin-bottom: 10px;
    }
    
    .checklist {
      list-style: none;
      padding-left: 0;
    }
    
    .checklist li {
      padding: 6px 0;
      font-size: 14px;
      display: flex;
      align-items: center;
    }
    
    .checkbox {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid #16a34a;
      border-radius: 4px;
      margin-right: 10px;
      text-align: center;
      line-height: 16px;
      font-size: 16px;
    }
    
    .prep-step {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
    }
    
    .step-number {
      width: 40px;
      height: 40px;
      background: #16a34a;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }
    
    .step-content {
      flex: 1;
    }
    
    .step-action {
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .step-info {
      font-size: 13px;
      color: #666;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .dish,
      .prep-step,
      .shopping-category {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍱 Plano Semanal de Marmitas</h1>
    <p>Gerado por Planna • ${new Date().toLocaleDateString("pt-BR")}</p>
  </div>
  
  <div class="section">
    <h2 class="section-title">📋 Cardápio da Semana</h2>
    ${dishesHTML}
  </div>
  
  <div class="section">
    <h2 class="section-title">🛒 Lista de Compras</h2>
    ${shoppingHTML}
  </div>
  
  <div class="section">
    <h2 class="section-title">⏱️ Roteiro de Preparo Otimizado</h2>
    <p style="margin-bottom: 20px; color: #666;">Tempo total estimado: ${plan.totalPrepTime} minutos</p>
    ${prepScheduleHTML}
  </div>
  
  <div class="footer">
    <p>© 2025 Planna - Planejamento inteligente de marmitas</p>
  </div>
</body>
</html>
  `;
}

