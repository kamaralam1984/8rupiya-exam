import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Aggregated dashboard payload — one request returns everything the
 * student dashboard widgets need. Keeps the existing /api/me/stats and
 * /api/me/attempts endpoints intact for back-compat.
 */
export async function GET() {
  try {
    const user = await requireUser();
    const userId = user.id;

    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);
    const eightWeeksAgo = new Date(now.getTime() - 56 * 86400_000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400_000);

    const [
      submittedCount,
      agg,
      rankAhead,
      activeSub,
      wallet,
      doneToday,
      streakRows,
      weeklyRows,
      subjectRows,
      inProgress,
      recommendedRaw,
    ] = await Promise.all([
      db.attempt.count({ where: { userId, status: "SUBMITTED" } }),
      db.attempt.aggregate({
        where: { userId, status: "SUBMITTED" },
        _avg: { accuracy: true },
        _sum: { score: true },
        _max: { score: true },
      }),
      db.user.count({ where: { xp: { gt: user.xp } } }),
      db.subscription.findFirst({
        where: { userId, active: true, endsAt: { gt: now } },
        orderBy: { endsAt: "desc" },
        include: { planRecord: { select: { name: true, slug: true, durationDays: true } } },
      }),
      db.wallet.findUnique({ where: { userId }, select: { balance: true, currency: true } }),
      db.attempt.count({
        where: { userId, status: "SUBMITTED", submittedAt: { gte: startOfDay } },
      }),
      // Last-30-days activity heatmap — group by day on startedAt.
      db.$queryRaw<Array<{ day: Date; count: bigint }>>`
        SELECT date_trunc('day', "startedAt") AS day, COUNT(*)::bigint AS count
        FROM "Attempt"
        WHERE "userId" = ${userId} AND "startedAt" >= ${thirtyDaysAgo}
        GROUP BY day
        ORDER BY day ASC
      `,
      // Weekly score trend — last 8 weeks of submitted attempts.
      db.$queryRaw<Array<{ week: Date; avg_score: number | null; tests: bigint }>>`
        SELECT date_trunc('week', "submittedAt") AS week,
               AVG("score") AS avg_score,
               COUNT(*)::bigint AS tests
        FROM "Attempt"
        WHERE "userId" = ${userId}
          AND "status" = 'SUBMITTED'
          AND "submittedAt" IS NOT NULL
          AND "submittedAt" >= ${eightWeeksAgo}
        GROUP BY week
        ORDER BY week ASC
      `,
      // Subject-wise accuracy from answered questions — last 90 days, top by volume.
      db.$queryRaw<Array<{ subject_id: string | null; subject_name: string | null; total: bigint; correct: bigint }>>`
        SELECT q."subjectId" AS subject_id,
               s."name"      AS subject_name,
               COUNT(*)::bigint AS total,
               SUM(CASE WHEN a."isCorrect" THEN 1 ELSE 0 END)::bigint AS correct
        FROM "Answer" a
        JOIN "Question" q ON q."id" = a."questionId"
        JOIN "Attempt" at ON at."id" = a."attemptId"
        LEFT JOIN "Subject" s ON s."id" = q."subjectId"
        WHERE at."userId" = ${userId}
          AND at."status" = 'SUBMITTED'
          AND at."submittedAt" >= ${ninetyDaysAgo}
          AND q."subjectId" IS NOT NULL
        GROUP BY q."subjectId", s."name"
        ORDER BY total DESC
        LIMIT 6
      `,
      db.attempt.findFirst({
        where: { userId, status: "IN_PROGRESS" },
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          startedAt: true,
          testSet: { select: { slug: true, title: true, exam: { select: { name: true, slug: true } } } },
        },
      }),
      // Recommend up to 4 unattempted, published test sets from the user's exam track.
      (async () => {
        const examTrack = user.examTrack;
        if (!examTrack) {
          return db.testSet.findMany({
            where: { isPublished: true },
            take: 4,
            orderBy: { createdAt: "desc" },
            select: {
              slug: true, title: true, durationMin: true, isPremium: true,
              exam: { select: { name: true, slug: true } },
              _count: { select: { questions: true } },
            },
          });
        }
        const exam = await db.exam.findUnique({ where: { slug: examTrack }, select: { id: true } });
        if (!exam) return [];
        const attempted = await db.attempt.findMany({
          where: { userId, testSet: { examId: exam.id } },
          select: { testSetId: true },
          distinct: ["testSetId"],
        });
        const attemptedIds = attempted.map((a) => a.testSetId);
        return db.testSet.findMany({
          where: {
            examId: exam.id,
            isPublished: true,
            id: attemptedIds.length ? { notIn: attemptedIds } : undefined,
          },
          take: 4,
          orderBy: { createdAt: "desc" },
          select: {
            slug: true, title: true, durationMin: true, isPremium: true,
            exam: { select: { name: true, slug: true } },
            _count: { select: { questions: true } },
          },
        });
      })(),
    ]);

    // Build day-by-day streak history with zero-fills for missing days.
    const streakMap = new Map<string, number>();
    for (const row of streakRows) {
      const key = row.day.toISOString().slice(0, 10);
      streakMap.set(key, Number(row.count));
    }
    const streakHistory: Array<{ date: string; count: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400_000);
      const key = d.toISOString().slice(0, 10);
      streakHistory.push({ date: key, count: streakMap.get(key) ?? 0 });
    }

    const weeklyTrend = weeklyRows.map((r) => ({
      weekStart: r.week.toISOString().slice(0, 10),
      avgScore: Number(r.avg_score ?? 0),
      tests: Number(r.tests),
    }));

    const subjects = subjectRows
      .filter((r) => r.subject_name)
      .map((r) => ({
        name: r.subject_name as string,
        accuracy: Number(r.total) > 0 ? Number(r.correct) / Number(r.total) : 0,
        count: Number(r.total),
      }));

    const daysRemaining = activeSub
      ? Math.max(0, Math.ceil((activeSub.endsAt.getTime() - now.getTime()) / 86400_000))
      : null;
    const planName = activeSub?.planRecord?.name ?? (activeSub?.plan ? activeSub.plan : "Free");
    const isPaid = user.role !== "FREE";

    return ok({
      stats: {
        xp: user.xp,
        streak: user.streak,
        rank: rankAhead + 1,
        attempts: submittedCount,
        avgAccuracy: agg._avg.accuracy ?? 0,
        totalScore: agg._sum.score ?? 0,
        bestScore: agg._max.score ?? 0,
      },
      dailyGoal: { target: 1, done: doneToday },
      streakHistory,
      performance: { weeklyTrend, subjects },
      recommendations: {
        inProgress: inProgress
          ? {
              id: inProgress.id,
              startedAt: inProgress.startedAt.toISOString(),
              testSetSlug: inProgress.testSet.slug,
              testSetTitle: inProgress.testSet.title,
              examName: inProgress.testSet.exam.name,
              examSlug: inProgress.testSet.exam.slug,
            }
          : null,
        suggested: recommendedRaw.map((t) => ({
          slug: t.slug,
          title: t.title,
          examName: t.exam.name,
          examSlug: t.exam.slug,
          durationMin: t.durationMin,
          questionCount: t._count.questions,
          isPremium: t.isPremium,
        })),
      },
      plan: {
        name: planName,
        role: user.role,
        daysRemaining,
        endsAt: activeSub?.endsAt.toISOString() ?? null,
        isPaid,
      },
      wallet: {
        balance: wallet?.balance ?? 0,
        currency: wallet?.currency ?? "INR",
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
