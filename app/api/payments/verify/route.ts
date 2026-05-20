import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { verifySignature } from "@/lib/razorpay";
import { verifyPaymentSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = verifyPaymentSchema.parse(await req.json());

    const okSig = verifySignature({
      orderId: body.orderId,
      paymentId: body.paymentId,
      signature: body.signature,
    });
    if (!okSig) return fail("Invalid signature", 400, "BAD_SIGNATURE");

    const payment = await db.payment.findUnique({ where: { razorpayOrderId: body.orderId } });
    if (!payment || payment.userId !== user.id) return fail("Order not found", 404, "NOT_FOUND");
    if (payment.status === "PAID") return ok({ alreadyPaid: true });

    if (payment.purpose === "WALLET_TOPUP") {
      await db.$transaction([
        db.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", razorpayPaymentId: body.paymentId },
        }),
        db.wallet.upsert({
          where: { userId: user.id },
          create: { userId: user.id, balance: payment.amountInPaise },
          update: { balance: { increment: payment.amountInPaise } },
        }),
        db.walletTxn.create({
          data: {
            userId: user.id, kind: "CREDIT", amount: payment.amountInPaise,
            reason: "Razorpay top-up", meta: { paymentId: payment.id },
          },
        }),
      ]);
      return ok({ topup: true, amount: payment.amountInPaise });
    }

    const testSetId = (payment.meta as any)?.testSetId as string | undefined;
    if (!testSetId) return fail("Order missing test reference", 500, "INVALID_ORDER");

    await db.$transaction([
      db.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", razorpayPaymentId: body.paymentId },
      }),
      db.unlock.upsert({
        where: { userId_testSetId: { userId: user.id, testSetId } },
        create: { userId: user.id, testSetId, paymentId: payment.id },
        update: {},
      }),
      // Auto-upgrade FREE → PREMIUM on first paid unlock. Leaves ADMIN/FAMILY untouched.
      db.user.updateMany({
        where: { id: user.id, role: "FREE" },
        data: { role: "PREMIUM" },
      }),
    ]);

    // referral first-purchase bonus
    if (user.referredById) {
      const isFirstUnlock = await db.unlock.count({ where: { userId: user.id } });
      if (isFirstUnlock === 1) {
        await db.$transaction([
          db.wallet.upsert({
            where: { userId: user.referredById },
            create: { userId: user.referredById, balance: 500 },
            update: { balance: { increment: 500 } },
          }),
          db.walletTxn.create({
            data: {
              userId: user.referredById, kind: "CREDIT", amount: 500,
              reason: "Referral bonus",
              meta: { referredId: user.id },
            },
          }),
        ]);
      }
    }

    return ok({ unlocked: true, testSetSlug: (payment.meta as any)?.testSetSlug });
  } catch (e) {
    return handleError(e);
  }
}
