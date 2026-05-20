import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createOrder } from "@/lib/razorpay";
import { createOrderSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimit(`pay:${user.id}`, 20, 600);
    if (!rl.ok) return fail("Too many requests", 429, "RATE_LIMITED");

    const body = createOrderSchema.parse(await req.json());
    const testSet = await db.testSet.findUnique({ where: { slug: body.testSetSlug } });
    if (!testSet || !testSet.isPublished) return fail("Test set not found", 404, "NOT_FOUND");
    if (!testSet.isPremium) return fail("Test set is free", 400, "NOT_PREMIUM");

    const existing = await db.unlock.findUnique({
      where: { userId_testSetId: { userId: user.id, testSetId: testSet.id } },
    });
    if (existing) return ok({ alreadyUnlocked: true });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return fail(
        "Payment gateway not configured. Admin needs to set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET. Admins can grant a free unlock from /admin for testing.",
        503,
        "PAYMENT_GATEWAY_UNAVAILABLE",
      );
    }

    const receipt = `r_${nanoid(12)}`;
    const order = await createOrder({
      amountInPaise: testSet.priceInPaise,
      receipt,
      notes: { userId: user.id, testSetId: testSet.id, purpose: "TEST_UNLOCK" },
    });

    await db.payment.create({
      data: {
        userId: user.id,
        razorpayOrderId: order.id,
        amountInPaise: testSet.priceInPaise,
        purpose: "TEST_UNLOCK",
        meta: { testSetId: testSet.id, testSetSlug: testSet.slug },
      },
    });

    return ok({
      orderId: order.id,
      amount: testSet.priceInPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      testSetSlug: testSet.slug,
    });
  } catch (e) {
    return handleError(e);
  }
}
