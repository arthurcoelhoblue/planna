/**
 * Stripe client instance
 */

import Stripe from "stripe";
import { ENV } from "./env";

if (!ENV.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
  typescript: true,
});

export default stripe;

