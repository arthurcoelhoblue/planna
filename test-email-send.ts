import { sendVerificationEmail } from "./server/_core/email";

async function testEmail() {
  console.log("=== TESTE DE ENVIO DE EMAIL ===\n");
  
  const testEmail = "zzkjcbg536@cmhvzylmfc.com";
  const testCode = "123456";
  const testName = "Teste";
  
  console.log(`Enviando para: ${testEmail}`);
  console.log(`Código: ${testCode}\n`);
  
  const result = await sendVerificationEmail(testEmail, testCode, testName);
  
  console.log("\n=== RESULTADO ===");
  console.log("Email enviado:", result ? "SIM ✅" : "NÃO ❌");
  
  if (!result) {
    console.log("\n⚠️ FALHA NO ENVIO");
    console.log("Verifique os logs acima para detalhes do erro");
  }
}

testEmail().catch(console.error);

