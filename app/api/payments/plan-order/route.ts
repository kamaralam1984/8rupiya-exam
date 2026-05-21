import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createOrder } from "@/lib/razorpay";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

const schema = z.object({
  planSlug: z.string().min(1),
});

/**
 * Create a Razorpay order for a subscription plan purchase.
 * Free plans (priceInPaise === 0) short-circuit and grant immediately.
 */
export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`plan-order:${clientKey(req.headers)}`, 10, 600);
    if (!rl.ok) return fail("Too many requests", 429, "RATE_LIMITED");
    const user = await requireUser();
    const body = schema.parse(await req.json());

    const plan = await db.plan.findUnique({ where: { slug: body.planSlug } });
    if (!plan || !plan.isActive) return fail("Plan not available", 404, "NOT_FOUND");

    // Free plan — no payment, just stamp a subscription + role + return
    if (plan.priceInPaise === 0) {
      const endsAt = new Date(Date.now() + plan.durationDays * 86400 * 1000);
      await db.$transaction([
        db.subscription.updateMany({
          where: { userId: user.id, active: true },
          data: { active: false },
        }),
        db.subscription.create({
          data: {
            userId: user.id,
            plan: "FREE_PLAN",
            planId: plan.id,
            startsAt: new Date(),
            endsAt,
            active: true,
          },
        }),
        db.user.update({
          where: { id: user.id },
          data: { role: plan.targetRole },
        }),
      ]);
      return ok({ free: true, planSlug: plan.slug });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return fail(
        "Payment gateway not configured. Ask admin to set Razorpay keys.",
        503,
        "PAYMENT_GATEWAY_UNAVAILABLE",
      );
    }

    const receipt = `pl_${nanoid(12)}`;
    const order = await createOrder({
      amountInPaise: plan.priceInPaise,
      receipt,
      notes: { planSlug: plan.slug, userId: user.id },
    });

    await db.payment.create({
      data: {
        userId: user.id,
        amountInPaise: plan.priceInPaise,
        currency: "INR",
        status: "CREATED",
        razorpayOrderId: order.id,
        purpose: "PLAN_PURCHASE",
        meta: { planId: plan.id, planSlug: plan.slug, durationDays: plan.durationDays },
      },
    });

    return ok({
      orderId: order.id,
      amount: plan.priceInPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      planSlug: plan.slug,
      planName: plan.name,
    });
  } catch (e) {
    return handleError(e);
  }
}
