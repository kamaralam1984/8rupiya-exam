import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const now = new Date();
    const since30 = new Date(now); since30.setDate(now.getDate() - 30);
    const since90 = new Date(now); since90.setDate(now.getDate() - 90);

    const [paidAll, paid30, paid90, refunded30, failed30, activeSubs, dailyRows] = await Promise.all([
      db.payment.aggregate({ _sum: { amountInPaise: true }, _count: true, where: { status: "PAID" } }),
      db.payment.aggregate({ _sum: { amountInPaise: true }, _count: true, where: { status: "PAID", createdAt: { gte: since30 } } }),
      db.payment.aggregate({ _sum: { amountInPaise: true }, _count: true, where: { status: "PAID", createdAt: { gte: since90 } } }),
      db.payment.aggregate({ _sum: { amountInPaise: true }, _count: true, where: { status: "REFUNDED", createdAt: { gte: since30 } } }),
      db.payment.count({ where: { status: "FAILED", createdAt: { gte: since30 } } }),
      db.subscription.count({ where: { active: true, endsAt: { gt: now } } }),
      db.$queryRaw<{ day: Date; revenue: bigint; count: bigint }[]>`
        SELECT DATE_TRUNC('day', "createdAt") AS day,
               COALESCE(SUM("amountInPaise"), 0)::bigint AS revenue,
               COUNT(*)::bigint AS count
          FROM "Payment"
         WHERE "status" = 'PAID' AND "createdAt" >= ${since30}
         GROUP BY 1
         ORDER BY 1 ASC
      `,
    ]);

    const purposeBreakdown = await db.payment.groupBy({
      by: ["purpose"],
      where: { status: "PAID", createdAt: { gte: since30 } },
      _sum: { amountInPaise: true },
      _count: true,
    });

    const daily = dailyRows.map((r) => ({
      day: r.day.toISOString().slice(0, 10),
      revenue: Number(r.revenue),
      count: Number(r.count),
    }));

    // Rough MRR = sum of monthly-equivalent of currently active subscriptions.
    const activeSubList = await db.subscription.findMany({
      where: { active: true, endsAt: { gt: now } },
      select: { plan: true, planRecord: { select: { priceInPaise: true, durationDays: true } } },
    });
    const mrr = activeSubList.reduce((acc, s) => {
      const price = s.planRecord?.priceInPaise ?? 0;
      const days = s.planRecord?.durationDays ?? 30;
      if (!days) return acc;
      return acc + Math.round((price * 30) / days);
    }, 0);

    return ok({
      totals: {
        lifetimeRevenue: paidAll._sum.amountInPaise ?? 0,
        lifetimePayments: paidAll._count,
        last30Revenue: paid30._sum.amountInPaise ?? 0,
        last30Payments: paid30._count,
        last90Revenue: paid90._sum.amountInPaise ?? 0,
        refunded30: refunded30._sum.amountInPaise ?? 0,
        failed30: failed30,
        activeSubs,
        mrr,
      },
      daily,
      purposeBreakdown: purposeBreakdown.map((p) => ({
        purpose: p.purpose,
        revenue: p._sum.amountInPaise ?? 0,
        count: p._count,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
