import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Consultar os planos 510001 e 540001
const result = await connection.query(
  'SELECT id, adjustmentReason FROM mealPlans WHERE id IN (510001, 540001)'
);

console.log(JSON.stringify(result[0], null, 2));

await connection.end();
