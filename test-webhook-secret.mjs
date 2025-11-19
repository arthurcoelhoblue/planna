import { ENV } from "./server/_core/env.ts";

console.log("=== WEBHOOK SECRET DEBUG ===");
console.log("Secret configured:", !!ENV.stripeWebhookSecret);
console.log("Secret length:", ENV.stripeWebhookSecret?.length);
console.log("Secret starts with whsec_:", ENV.stripeWebhookSecret?.startsWith("whsec_"));
console.log("First 20 chars:", ENV.stripeWebhookSecret?.substring(0, 20));
console.log("Last 20 chars:", ENV.stripeWebhookSecret?.substring(ENV.stripeWebhookSecret.length - 20));
