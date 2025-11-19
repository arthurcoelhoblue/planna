/**
 * Stripe client instance
 */

import Stripe from "stripe";
import { ENV } from "./env";

if (!ENV.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2024-11-20.acacia" as any,
  typescript: true,
});

export default stripe;

