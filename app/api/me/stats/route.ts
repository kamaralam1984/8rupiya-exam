import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();

    const [submittedCount, agg, rankRow] = await Promise.all([
      db.attempt.count({ where: { userId: user.id, status: "SUBMITTED" } }),
      db.attempt.aggregate({
        where: { userId: user.id, status: "SUBMITTED" },
        _avg: { accuracy: true },
        _sum: { score: true },
        _max: { score: true },
      }),
      db.user.count({ where: { xp: { gt: user.xp } } }),
    ]);

    return ok({
      xp: user.xp,
      streak: user.streak,
      rank: rankRow + 1,
      attempts: submittedCount,
      avgAccuracy: agg._avg.accuracy ?? 0,
      totalScore: agg._sum.score ?? 0,
      bestScore: agg._max.score ?? 0,
    });
  } catch (e) {
    return handleError(e);
  }
}
