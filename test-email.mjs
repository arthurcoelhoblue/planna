import { sendVerificationEmail } from "./server/_core/email.js";

console.log("=== TESTE DE ENVIO DE EMAIL ===");
console.log("Tentando enviar email de teste...\n");

const testEmail = "zzkjcbg536@cmhvzylmfc.com";
const testCode = "123456";
const testName = "Teste";

const result = await sendVerificationEmail(testEmail, testCode, testName);

console.log("\n=== RESULTADO ===");
console.log("Email enviado:", result ? "SIM ✅" : "NÃO ❌");

if (!result) {
  console.log("\n⚠️ FALHA NO ENVIO");
  console.log("Verifique os logs acima para detalhes do erro");
}
