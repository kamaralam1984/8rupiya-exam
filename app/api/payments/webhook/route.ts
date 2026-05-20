import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("x-razorpay-signature");
  if (!sig) return fail("Missing signature", 400, "BAD_SIGNATURE");
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, sig)) return fail("Bad signature", 400, "BAD_SIGNATURE");

  const evt = JSON.parse(raw) as { event: string; payload: any };
  if (evt.event === "payment.captured") {
    const orderId = evt.payload?.payment?.entity?.order_id as string | undefined;
    const paymentId = evt.payload?.payment?.entity?.id as string | undefined;
    if (orderId && paymentId) {
      const payment = await db.payment.findUnique({ where: { razorpayOrderId: orderId } });
      if (payment && payment.status !== "PAID") {
        const testSetId = (payment.meta as any)?.testSetId as string | undefined;
        await db.$transaction([
          db.payment.update({
            where: { id: payment.id },
            data: { status: "PAID", razorpayPaymentId: paymentId },
          }),
          ...(testSetId
            ? [db.unlock.upsert({
                where: { userId_testSetId: { userId: payment.userId, testSetId } },
                create: { userId: payment.userId, testSetId, paymentId: payment.id },
                update: {},
              })]
            : []),
          // Any successful Razorpay payment auto-upgrades a FREE user to PREMIUM.
          db.user.updateMany({
            where: { id: payment.userId, role: "FREE" },
            data: { role: "PREMIUM" },
          }),
        ]);
      }
    }
  } else if (evt.event === "payment.failed") {
    const orderId = evt.payload?.payment?.entity?.order_id as string | undefined;
    if (orderId) {
      await db.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: "FAILED" },
      });
    }
  }
  return ok({ received: true });
}
