import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [rows] = await conn.query(
    'SELECT id, adjustmentReason FROM plans WHERE id IN (?, ?) ORDER BY id',
    [510001, 540001]
  );
  
  console.log('\n=== ADJUSTMENT REASON COMPARISON ===\n');
  for (const row of rows) {
    console.log(`Plan ID: ${row.id}`);
    console.log(`adjustmentReason: ${row.adjustmentReason || '(null)'}`);
    console.log('---');
  }
} finally {
  await conn.end();
}
