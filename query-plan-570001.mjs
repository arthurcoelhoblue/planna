import { drizzle } from "drizzle-orm/mysql2";
import { plans } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

const result = await db.select({
  id: plans.id,
  adjustmentReason: plans.adjustmentReason,
  requestedVarieties: plans.requestedVarieties,
  requestedServings: plans.requestedServings,
}).from(plans).where(eq(plans.id, 570001));

console.log("\n=== Plano 570001 ===");
if (result.length > 0) {
  const plan = result[0];
  console.log(`ID: ${plan.id}`);
  console.log(`Requested Varieties: ${plan.requestedVarieties}`);
  console.log(`Requested Servings: ${plan.requestedServings}`);
  console.log(`adjustmentReason: ${plan.adjustmentReason || "(null)"}`);
} else {
  console.log("Plano não encontrado");
}
