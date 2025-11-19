import Stripe from "stripe";

async function testNewPrices() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const proPriceId = "price_1SVFrbASdTYHUTQIJPDdLCTy";
  const premiumPriceId = "price_1SVFryASdTYHUTQIh6jbn8K0";

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-11-20.acacia",
    typescript: true,
  });

  console.log("🧪 Testando novos Price IDs...\n");

  // Test Pro
  try {
    console.log("💰 Testando Pro Price ID:", proPriceId);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: "test@example.com",
      line_items: [{ price: proPriceId, quantity: 1 }],
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });
    console.log("✅ Pro checkout criado com sucesso!");
    console.log("   Session ID:", session.id);
    console.log("   URL:", session.url);
    console.log("");
  } catch (error) {
    console.error("❌ Erro no Pro:", error.message);
    console.log("");
  }

  // Test Premium
  try {
    console.log("💎 Testando Premium Price ID:", premiumPriceId);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: "test@example.com",
      line_items: [{ price: premiumPriceId, quantity: 1 }],
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });
    console.log("✅ Premium checkout criado com sucesso!");
    console.log("   Session ID:", session.id);
    console.log("   URL:", session.url);
    console.log("");
  } catch (error) {
    console.error("❌ Erro no Premium:", error.message);
    console.log("");
  }

  console.log("✨ Teste concluído!");
}

testNewPrices();
