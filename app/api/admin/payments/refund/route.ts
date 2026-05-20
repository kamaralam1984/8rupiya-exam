import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({ paymentId: z.string() });

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const { paymentId } = schema.parse(await req.json());
    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return fail("Not found", 404, "NOT_FOUND");
    if (payment.status !== "PAID") return fail("Not refundable", 400, "NOT_PAID");

    // Razorpay refund call would go here in production.
    // For now we mark refunded and reverse the unlock / wallet credit.
    await db.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } });
      const testSetId = (payment.meta as any)?.testSetId as string | undefined;
      if (testSetId) {
        await tx.unlock.deleteMany({ where: { userId: payment.userId, testSetId } });
      }
      if (payment.purpose === "WALLET_TOPUP") {
        await tx.wallet.update({
          where: { userId: payment.userId },
          data: { balance: { decrement: payment.amountInPaise } },
        });
        await tx.walletTxn.create({
          data: {
            userId: payment.userId, kind: "DEBIT", amount: payment.amountInPaise,
            reason: "Refund reversal", meta: { paymentId: payment.id },
          },
        });
      }
      await tx.auditLog.create({
        data: { userId: admin.id, action: "PAYMENT_REFUNDED", target: payment.id, meta: { amount: payment.amountInPaise } },
      });
    });
    return ok({ refunded: true });
  } catch (e) {
    return handleError(e);
  }
}
