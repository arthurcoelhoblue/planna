import { drizzle } from "drizzle-orm/mysql2";
import { desc, eq } from "drizzle-orm";
import { users, emailVerificationCodes } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const result = await db
  .select({
    code: emailVerificationCodes.code,
    expiresAt: emailVerificationCodes.expiresAt
  })
  .from(emailVerificationCodes)
  .innerJoin(users, eq(users.id, emailVerificationCodes.userId))
  .where(eq(users.email, 'zzkjcbg536@cmhvzylmfc.com'))
  .orderBy(desc(emailVerificationCodes.createdAt))
  .limit(1);

if (result.length > 0) {
  console.log("Código:", result[0].code);
  console.log("Expira em:", result[0].expiresAt);
} else {
  console.log("Nenhum código encontrado");
}
