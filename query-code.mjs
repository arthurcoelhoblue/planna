import { drizzle } from "drizzle-orm/mysql2";
import { eq, desc } from "drizzle-orm";
import { users, emailVerificationCodes } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const user = await db.select().from(users).where(eq(users.email, "teste.manus.2fa@example.com")).limit(1);
if (user.length === 0) {
  console.log("Usuário não encontrado");
  process.exit(1);
}

const codes = await db.select().from(emailVerificationCodes).where(eq(emailVerificationCodes.userId, user[0].id)).orderBy(desc(emailVerificationCodes.createdAt)).limit(1);
if (codes.length === 0) {
  console.log("Código não encontrado");
  process.exit(1);
}

console.log("Código:", codes[0].code);
console.log("Expira em:", codes[0].expiresAt);
console.log("Verificado:", codes[0].verified);
