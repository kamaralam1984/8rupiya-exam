import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES = ["CREATED", "PAID", "REFUNDED", "FAILED"] as const;
type Status = (typeof STATUSES)[number];

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status");
    const q = (url.searchParams.get("q") ?? "").trim();
    const daysParam = url.searchParams.get("days");
    const days = daysParam && !isNaN(+daysParam) ? +daysParam : null;

    const where: Prisma.PaymentWhereInput = {};
    if (statusParam && STATUSES.includes(statusParam as Status)) {
      where.status = statusParam as Status;
    }
    if (days && days > 0) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: since };
    }
    if (q) {
      where.user = {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    const [payments, totals] = await Promise.all([
      db.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { user: { select: { id: true, email: true, phone: true, name: true } } },
      }),
      db.payment.groupBy({
        by: ["status"],
        _sum: { amountInPaise: true },
        _count: true,
        where: days && days > 0 ? { createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } } : undefined,
      }),
    ]);

    const byStatus = Object.fromEntries(totals.map((t) => [t.status, t]));
    const normalizedTotals = STATUSES.map((s) => ({
      status: s,
      _sum: { amountInPaise: byStatus[s]?._sum.amountInPaise ?? 0 },
      _count: byStatus[s]?._count ?? 0,
    }));

    return ok({ payments, totals: normalizedTotals });
  } catch (e) {
    return handleError(e);
  }
}
