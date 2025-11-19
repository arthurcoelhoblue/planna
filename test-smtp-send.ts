import { sendVerificationEmail } from "./server/_core/email";

async function testSmtpSend() {
  console.log("=== TESTE DE ENVIO DE EMAIL VIA SMTP ===\n");
  
  // Usar o email do owner para teste
  const testEmail = "arthurcsantos@gmail.com";
  const testCode = "654321";
  const testName = "Arthur (Teste SMTP)";
  
  console.log(`Enviando para: ${testEmail}`);
  console.log(`Código: ${testCode}`);
  console.log(`Nome: ${testName}\n`);
  
  const result = await sendVerificationEmail(testEmail, testCode, testName);
  
  console.log("\n=== RESULTADO ===");
  console.log("Email enviado:", result ? "SIM ✅" : "NÃO ❌");
  
  if (result) {
    console.log("\n✅ SUCESSO!");
    console.log("O email foi enviado diretamente para:", testEmail);
    console.log("Verifique a caixa de entrada (ou spam) do email acima.");
    console.log("\nRemetente:", process.env.EMAIL_FROM);
  } else {
    console.log("\n❌ FALHA!");
    console.log("Verifique os logs acima para detalhes do erro.");
  }
}

testSmtpSend().catch(console.error);

