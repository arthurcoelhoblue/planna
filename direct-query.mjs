import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [rows] = await connection.execute(
  'SELECT id, adjustmentReason, requestedVarieties, requestedServings FROM plans WHERE id = 570001'
);

console.log('\n=== Plano 570001 ===');
if (rows.length > 0) {
  const plan = rows[0];
  console.log(`ID: ${plan.id}`);
  console.log(`Requested Varieties: ${plan.requestedVarieties}`);
  console.log(`Requested Servings: ${plan.requestedServings}`);
  console.log(`adjustmentReason: "${plan.adjustmentReason || '(null)'}"`);
  console.log(`\nLength: ${plan.adjustmentReason ? plan.adjustmentReason.length : 0} chars`);
} else {
  console.log('Plano não encontrado');
}

await connection.end();
