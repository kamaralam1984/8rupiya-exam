import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { verifySignature } from "@/lib/razorpay";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});

/**
 * Confirm a plan purchase. On valid signature:
 *   1. mark Payment PAID
 *   2. deactivate existing active subscriptions
 *   3. create a new Subscription tied to the purchased Plan
 *   4. upgrade user.role to the plan's targetRole
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await req.json());

    if (!verifySignature(body)) return fail("Invalid signature", 400, "BAD_SIGNATURE");

    const payment = await db.payment.findUnique({ where: { razorpayOrderId: body.orderId } });
    if (!payment || payment.userId !== user.id) return fail("Order not found", 404, "NOT_FOUND");
    if (payment.status === "PAID") return ok({ alreadyPaid: true });

    const planId = (payment.meta as any)?.planId as string | undefined;
    if (!planId) return fail("Order missing plan reference", 500, "INVALID_ORDER");

    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) return fail("Plan no longer exists", 410, "PLAN_GONE");

    const endsAt = new Date(Date.now() + plan.durationDays * 86400 * 1000);

    await db.$transaction([
      db.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", razorpayPaymentId: body.paymentId },
      }),
      db.subscription.updateMany({
        where: { userId: user.id, active: true },
        data: { active: false },
      }),
      db.subscription.create({
        data: {
          userId: user.id,
          plan: plan.slug.toUpperCase(),
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

    return ok({ purchased: true, planSlug: plan.slug, role: plan.targetRole });
  } catch (e) {
    return handleError(e);
  }
}
