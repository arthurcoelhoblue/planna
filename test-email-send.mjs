import { sendVerificationEmail } from "./server/_core/emailVerification.js";

const testEmail = "teste@example.com";
const testCode = "123456";
const testName = "Teste";

console.log("[Test] Tentando enviar email de verificação...");
console.log("[Test] Para:", testEmail);
console.log("[Test] Código:", testCode);
console.log("[Test] BUILT_IN_FORGE_API_URL:", process.env.BUILT_IN_FORGE_API_URL || "NOT SET");
console.log("[Test] BUILT_IN_FORGE_API_KEY:", process.env.BUILT_IN_FORGE_API_KEY ? "SET (***" + process.env.BUILT_IN_FORGE_API_KEY.slice(-4) + ")" : "NOT SET");

const result = await sendVerificationEmail(testEmail, testCode, testName);

console.log("[Test] Resultado:", result ? "✅ SUCESSO" : "❌ FALHOU");
