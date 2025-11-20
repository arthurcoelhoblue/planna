import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [rows] = await connection.execute(
  'SELECT id, adjustmentReason, requestedVarieties, requestedServings FROM plans WHERE id IN (510001, 570002) ORDER BY id'
);

console.log('\n=== Comparação de Planos ===\n');
rows.forEach(plan => {
  console.log(`Plano ID: ${plan.id}`);
  console.log(`  Varieties: ${plan.requestedVarieties}`);
  console.log(`  Servings: ${plan.requestedServings}`);
  console.log(`  adjustmentReason: ${plan.adjustmentReason ? `"${plan.adjustmentReason}"` : '(null)'}`);
  console.log('');
});

await connection.end();
