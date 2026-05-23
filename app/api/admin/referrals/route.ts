import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const now = new Date();
    const since30 = new Date(now); since30.setDate(now.getDate() - 30);

    const [totalReferred, last30Referred, topReferrers] = await Promise.all([
      db.user.count({ where: { referredById: { not: null } } }),
      db.user.count({ where: { referredById: { not: null }, createdAt: { gte: since30 } } }),
      db.$queryRaw<{ referrerId: string; name: string | null; email: string | null; referralCode: string | null; count: bigint }[]>`
        SELECT r.id AS "referrerId", r.name, r.email, r."referralCode", COUNT(u.id)::bigint AS count
          FROM "User" r
          JOIN "User" u ON u."referredById" = r.id
         GROUP BY r.id
         ORDER BY count DESC
         LIMIT 25
      `,
    ]);

    // Conversion: referred users who later made a payment
    const paidReferred = await db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT u.id)::bigint AS count
        FROM "User" u
        JOIN "Payment" p ON p."userId" = u.id AND p.status = 'PAID'
       WHERE u."referredById" IS NOT NULL
    `;
    const paidCount = Number(paidReferred[0]?.count ?? 0);
    const conversionRate = totalReferred > 0 ? Math.round((paidCount / totalReferred) * 100) : 0;

    return ok({
      totals: {
        totalReferred,
        last30Referred,
        paidReferred: paidCount,
        conversionRate,
        uniqueReferrers: topReferrers.length,
      },
      topReferrers: topReferrers.map((r) => ({
        referrerId: r.referrerId,
        name: r.name ?? "—",
        email: r.email ?? "—",
        code: r.referralCode ?? "",
        count: Number(r.count),
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
