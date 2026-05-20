import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createOrder } from "@/lib/razorpay";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { z } from "zod";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

const schema = z.object({ amountInPaise: z.number().int().min(800).max(500000) });

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimit(`wtopup:${user.id}`, 20, 600);
    if (!rl.ok) return fail("Too many requests", 429, "RATE_LIMITED");
    const body = schema.parse(await req.json());

    const order = await createOrder({
      amountInPaise: body.amountInPaise,
      receipt: `w_${nanoid(12)}`,
      notes: { userId: user.id, purpose: "WALLET_TOPUP" },
    });
    await db.payment.create({
      data: {
        userId: user.id,
        razorpayOrderId: order.id,
        amountInPaise: body.amountInPaise,
        purpose: "WALLET_TOPUP",
        meta: {},
      },
    });
    return ok({
      orderId: order.id,
      amount: body.amountInPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (e) {
    return handleError(e);
  }
}
