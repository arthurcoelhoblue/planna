import { sendVerificationEmailViaResend } from "./server/_core/resend-email";

async function testResendEmail() {
  console.log("=== TESTE DE ENVIO DE EMAIL VIA RESEND ===\n");
  
  const testEmail = "zzkjcbg536@cmhvzylmfc.com";
  const testCode = "789012";
  const testName = "Teste Resend";
  
  console.log(`Enviando para: ${testEmail}`);
  console.log(`Código: ${testCode}`);
  console.log(`Nome: ${testName}\n`);
  
  const result = await sendVerificationEmailViaResend(testEmail, testCode, testName);
  
  console.log("\n=== RESULTADO ===");
  console.log("Email enviado:", result ? "SIM ✅" : "NÃO ❌");
  
  if (result) {
    console.log("\n✅ SUCESSO!");
    console.log("O email foi enviado diretamente para:", testEmail);
    console.log("Verifique a caixa de entrada (ou spam) do email acima.");
  } else {
    console.log("\n❌ FALHA!");
    console.log("Verifique os logs acima para detalhes do erro.");
  }
}

testResendEmail().catch(console.error);

