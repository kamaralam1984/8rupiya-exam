import Razorpay from "razorpay";
import crypto from "node:crypto";

declare global {
  // eslint-disable-next-line no-var
  var __razorpay: Razorpay | undefined;
}

function getClient(): Razorpay {
  if (global.__razorpay) return global.__razorpay;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not configured");
  }
  const client = new Razorpay({ key_id, key_secret });
  if (process.env.NODE_ENV !== "production") global.__razorpay = client;
  return client;
}

export async function createOrder(args: {
  amountInPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const client = getClient();
  return client.orders.create({
    amount: args.amountInPaise,
    currency: "INR",
    receipt: args.receipt,
    notes: args.notes,
  });
}

export function verifySignature(args: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET missing");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${args.orderId}|${args.paymentId}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(args.signature));
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET missing");
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
