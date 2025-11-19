/**
 * Stripe Webhook Handler
 * Processa eventos do Stripe (pagamentos, cancelamentos, etc)
 */

import { Request, Response } from "express";
import Stripe from "stripe";
import stripe from "./_core/stripe";
import { ENV } from "./_core/env";
import { upsertSubscription, updateUserTier } from "./subscription-service";
import { getUserByOpenId } from "./db";

/**
 * Mapeia Price ID para tier
 */
function getTierFromPriceId(priceId: string): "free" | "pro" | "premium" {
  // Price IDs reais do Stripe (modo teste)
  if (priceId === "price_1SUPvOKHYuEw9LKlDGmXKmjD") return "pro"; // Planna Pro
  if (priceId === "price_1SVInaKHYuEw9LKlKEAg3pps") return "premium"; // Planna Premium
  
  // Fallback para identificação por nome (caso Price ID mude)
  if (priceId.includes("pro")) return "pro";
  if (priceId.includes("premium")) return "premium";
  
  return "free";
}

/**
 * Handler principal do webhook
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  console.log("[Webhook] Received request");
  console.log("[Webhook] Signature present:", !!sig);
  console.log("[Webhook] Body type:", typeof req.body);
  console.log("[Webhook] Body is Buffer:", Buffer.isBuffer(req.body));
  console.log("[Webhook] Webhook secret configured:", !!ENV.stripeWebhookSecret);
  console.log("[Webhook] Webhook secret length:", ENV.stripeWebhookSecret?.length || 0);

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    return res.status(400).send("Missing signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, ENV.stripeWebhookSecret);
    console.log("[Webhook] Signature verified successfully");
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    console.error("[Webhook] Error details:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // CRÍTICO: Detectar eventos de teste e retornar resposta de verificação
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  console.log(`[Webhook] Processing event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

/**
 * Processa checkout completado
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[Webhook] Checkout completed:", session.id);

  const userId = parseInt(session.metadata?.user_id || "0");
  if (!userId) {
    console.error("[Webhook] Missing user_id in metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.error("[Webhook] Missing subscription ID");
    return;
  }

  // Buscar detalhes da subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error("[Webhook] Missing price ID");
    return;
  }

  const tier = getTierFromPriceId(priceId);

  // Salvar no banco
  await upsertSubscription({
    userId,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
    status: "active",
    currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
  });

  // Atualizar tier do usuário
  await updateUserTier(userId, tier);

  console.log(`[Webhook] User ${userId} upgraded to ${tier}`);
}

/**
 * Processa atualização de subscription
 */
async function handleSubscriptionUpdated(subscription: any) {
  console.log("[Webhook] Subscription updated:", subscription.id);

  const userId = parseInt(subscription.metadata?.user_id || "0");
  if (!userId) {
    console.error("[Webhook] Missing user_id in metadata");
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    console.error("[Webhook] Missing price ID");
    return;
  }

  const tier = getTierFromPriceId(priceId);
  const status = subscription.status as "active" | "canceled" | "past_due" | "trialing";

  await upsertSubscription({
    userId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    status,
    currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
  });

  // Se status mudou para canceled ou past_due, downgrade para free
  if (status === "canceled" || status === "past_due") {
    await updateUserTier(userId, "free");
    console.log(`[Webhook] User ${userId} downgraded to free (status: ${status})`);
  } else {
    await updateUserTier(userId, tier);
    console.log(`[Webhook] User ${userId} tier updated to ${tier}`);
  }
}

/**
 * Processa cancelamento de subscription
 */
async function handleSubscriptionDeleted(subscription: any) {
  console.log("[Webhook] Subscription deleted:", subscription.id);

  const userId = parseInt(subscription.metadata?.user_id || "0");
  if (!userId) {
    console.error("[Webhook] Missing user_id in metadata");
    return;
  }

  const priceId = subscription.items.data[0]?.price.id || "";

  await upsertSubscription({
    userId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    status: "canceled",
    currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
  });

  await updateUserTier(userId, "free");
  console.log(`[Webhook] User ${userId} subscription canceled, downgraded to free`);
}

/**
 * Processa pagamento de invoice
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log("[Webhook] Invoice paid:", invoice.id);
  // Já processado pelo subscription.updated
}

/**
 * Processa falha de pagamento
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log("[Webhook] Invoice payment failed:", invoice.id);

  const subscriptionId = (invoice as any).subscription as string | undefined;
  if (!subscriptionId) return;

  // Buscar subscription para pegar userId
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
  const userId = parseInt(subscription.metadata?.user_id || "0");

  if (!userId) {
    console.error("[Webhook] Missing user_id in metadata");
    return;
  }

  // Atualizar status para past_due
  const priceId = subscription.items.data[0]?.price.id || "";
  await upsertSubscription({
    userId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
    status: "past_due",
    currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
  });

  console.log(`[Webhook] User ${userId} subscription marked as past_due`);
}

