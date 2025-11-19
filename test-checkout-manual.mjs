import Stripe from "stripe";

// Simular criação de checkout session
async function testCheckout() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = "price_1SVAW1ASdTYHUTQI7C2avtHK";

  console.log("🔑 Stripe Secret Key:", stripeSecretKey?.substring(0, 20) + "...");
  console.log("💰 Price ID:", priceId);
  console.log("");

  if (!stripeSecretKey) {
    console.error("❌ STRIPE_SECRET_KEY não configurada!");
    process.exit(1);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-11-20.acacia",
    typescript: true,
  });

  console.log("✅ Stripe client inicializado");
  console.log("");

  try {
    console.log("🔍 Tentando criar checkout session...");
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: "arthur@tokeniza.com.br",
      client_reference_id: "123",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: "https://plannameal-wdxbdcbk.manus.space/planner?checkout=success",
      cancel_url: "https://plannameal-wdxbdcbk.manus.space/?checkout=canceled",
      allow_promotion_codes: true,
      metadata: {
        user_id: "123",
        customer_email: "arthur@tokeniza.com.br",
        customer_name: "Arthur Test",
      },
    });

    console.log("✅ Checkout session criada com sucesso!");
    console.log("📋 Session ID:", session.id);
    console.log("🔗 Checkout URL:", session.url);
    console.log("");
    console.log("✨ SUCESSO! O checkout está funcionando corretamente.");
  } catch (error) {
    console.error("❌ ERRO ao criar checkout session:");
    console.error("");
    console.error("Tipo:", error.constructor.name);
    console.error("Código:", error.code);
    console.error("Mensagem:", error.message);
    console.error("");
    console.error("Detalhes completos:");
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

testCheckout();

