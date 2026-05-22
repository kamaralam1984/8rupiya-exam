import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const uid = user.id;
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") ?? "week") as "week" | "month" | "year";

    const now = new Date();

    let buckets: number;
    let bucketMs: number;
    let labelFn: (d: Date) => string;

    if (period === "week") {
      buckets = 7; bucketMs = 86400_000;
      labelFn = (d) => d.toLocaleDateString("en-IN", { weekday: "short" });
    } else if (period === "month") {
      buckets = 4; bucketMs = 7 * 86400_000;
      labelFn = (d) => `W${Math.ceil(d.getDate() / 7)}`;
    } else {
      buckets = 12; bucketMs = 30 * 86400_000;
      labelFn = (d) => d.toLocaleDateString("en-IN", { month: "short" });
    }

    const periodMs = buckets * bucketMs;
    const currentStart = new Date(now.getTime() - periodMs);
    const prevStart = new Date(now.getTime() - 2 * periodMs);

    const [currentAttempts, prevAttempts, subjects] = await Promise.all([
      db.attempt.findMany({
        where: { userId: uid, status: "SUBMITTED", submittedAt: { gte: currentStart } },
        select: { submittedAt: true, accuracy: true, score: true, meta: true },
        orderBy: { submittedAt: "asc" },
      }),
      db.attempt.findMany({
        where: { userId: uid, status: "SUBMITTED", submittedAt: { gte: prevStart, lt: currentStart } },
        select: { accuracy: true, score: true },
      }),
      db.$queryRaw<Array<{ subject_name: string; correct: bigint; total: bigint }>>`
        SELECT s.name AS subject_name,
               SUM(CASE WHEN aa."selectedIndex" = q."correctIndex" THEN 1 ELSE 0 END)::bigint AS correct,
               COUNT(*)::bigint AS total
        FROM "AttemptAnswer" aa
        JOIN "Attempt" a ON aa."attemptId" = a.id
        JOIN "Question" q ON aa."questionId" = q.id
        LEFT JOIN "Subject" s ON q."subjectId" = s.id
        WHERE a."userId" = ${uid}
          AND a.status = 'SUBMITTED'
          AND a."submittedAt" >= ${currentStart}
        GROUP BY s.name
        HAVING COUNT(*) >= 2
        ORDER BY total DESC
        LIMIT 8
      `.catch(() => [] as Array<{ subject_name: string; correct: bigint; total: bigint }>),
    ]);

    // Build time buckets
    const points: Array<{ label: string; accuracy: number; attempts: number; score: number }> = [];
    for (let i = buckets - 1; i >= 0; i--) {
      const bucketEnd = new Date(now.getTime() - i * bucketMs);
      const bucketStart = new Date(bucketEnd.getTime() - bucketMs);
      const inBucket = currentAttempts.filter(
        (a) => a.submittedAt && a.submittedAt >= bucketStart && a.submittedAt < bucketEnd
      );
      const avgAcc = inBucket.length
        ? inBucket.reduce((s, a) => s + (a.accuracy ?? 0), 0) / inBucket.length
        : 0;
      const avgScore = inBucket.length
        ? inBucket.reduce((s, a) => s + (a.score ?? 0), 0) / inBucket.length
        : 0;
      points.push({
        label: labelFn(bucketEnd),
        accuracy: Math.round(avgAcc * 100) / 100,
        attempts: inBucket.length,
        score: Math.round(avgScore * 100) / 100,
      });
    }

    const currentAcc = currentAttempts.length
      ? currentAttempts.reduce((s, a) => s + (a.accuracy ?? 0), 0) / currentAttempts.length
      : 0;
    const prevAcc = prevAttempts.length
      ? prevAttempts.reduce((s, a) => s + (a.accuracy ?? 0), 0) / prevAttempts.length
      : 0;
    const improvement = prevAcc > 0 ? ((currentAcc - prevAcc) / prevAcc) * 100 : 0;

    const subjectStats = (subjects as Array<{ subject_name: string; correct: bigint; total: bigint }>)
      .filter((r) => r.subject_name)
      .map((r) => ({
        name: r.subject_name,
        accuracy: Number(r.total) > 0 ? Number(r.correct) / Number(r.total) : 0,
        total: Number(r.total),
      }));

    return ok({
      period,
      points,
      current: {
        attempts: currentAttempts.length,
        accuracy: Math.round(currentAcc * 100) / 100,
      },
      previous: {
        attempts: prevAttempts.length,
        accuracy: Math.round(prevAcc * 100) / 100,
      },
      improvement: Math.round(improvement * 10) / 10,
      subjects: subjectStats,
      streak: user.streak,
      xp: user.xp,
    });
  } catch (e) {
    return handleError(e);
  }
}
