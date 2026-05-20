import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { submitAttemptSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { bumpStreak, awardBadges } from "@/lib/streak";
import { z } from "zod";

export const dynamic = "force-dynamic";

const wrapped = z.object({ attemptId: z.string() }).and(submitAttemptSchema);

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = wrapped.parse(await req.json());

    const attempt = await db.attempt.findUnique({
      where: { id: body.attemptId },
      include: {
        testSet: {
          include: {
            questions: { include: { question: { include: { subject: true, chapter: true } } } },
          },
        },
      },
    });
    if (!attempt || attempt.userId !== user.id) return fail("Attempt not found", 404, "NOT_FOUND");
    if (attempt.status !== "IN_PROGRESS") return fail("Attempt already finalized", 409, "ALREADY_DONE");

    const byId = new Map(attempt.testSet.questions.map((tq) => [tq.questionId, tq]));
    let score = 0;
    let correct = 0;
    let attempted = 0;
    const subjectStats: Record<string, { total: number; correct: number; name: string }> = {};
    const chapterStats: Record<string, { total: number; correct: number; name: string; subject: string }> = {};

    const answerRows = body.answers.map((a) => {
      const tq = byId.get(a.questionId);
      if (!tq) return null;
      const q = tq.question;
      const subjectKey = q.subjectId ?? "_uncat";
      subjectStats[subjectKey] ??= { total: 0, correct: 0, name: q.subject?.name ?? "Uncategorized" };
      subjectStats[subjectKey].total += 1;
      if (q.chapterId) {
        chapterStats[q.chapterId] ??= {
          total: 0, correct: 0,
          name: q.chapter?.name ?? "—",
          subject: q.subject?.name ?? "—",
        };
        chapterStats[q.chapterId].total += 1;
      }

      const sel = a.selectedIndex;
      const skipped = sel < 0;
      let isCorrect: boolean | null = null;
      if (!skipped) {
        attempted += 1;
        isCorrect = sel === q.correctIndex;
        if (isCorrect) {
          correct += 1;
          score += tq.marksRight;
          subjectStats[subjectKey].correct += 1;
          if (q.chapterId) chapterStats[q.chapterId].correct += 1;
        } else {
          score += tq.marksWrong;
        }
      }
      return {
        attemptId: attempt.id,
        questionId: a.questionId,
        selectedIndex: skipped ? null : sel,
        isCorrect,
        timeSpentMs: a.timeSpentMs ?? null,
        flagged: a.flagged ?? false,
        guessed: a.guessed ?? false,
      };
    }).filter(Boolean) as Array<{ attemptId: string; questionId: string; selectedIndex: number | null; isCorrect: boolean | null; timeSpentMs: number | null; flagged: boolean; guessed: boolean; }>;

    const totalQ = attempt.testSet.questions.length;
    const accuracy = attempted > 0 ? correct / attempted : 0;
    const submittedAt = new Date();
    const durationSec = Math.floor((submittedAt.getTime() - attempt.startedAt.getTime()) / 1000);

    await db.$transaction([
      db.answer.deleteMany({ where: { attemptId: attempt.id } }),
      db.answer.createMany({ data: answerRows }),
      db.attempt.update({
        where: { id: attempt.id },
        data: {
          status: "SUBMITTED",
          submittedAt,
          durationSec,
          score,
          accuracy,
          meta: { totalQ, attempted, correct, subjectStats, chapterStats, violations: body.violations ?? [] },
        },
      }),
      db.user.update({
        where: { id: user.id },
        data: { xp: { increment: Math.max(0, Math.floor(score * 5)) } },
      }),
    ]);

    const streakInfo = await bumpStreak(user.id);
    const attemptsCount = await db.attempt.count({ where: { userId: user.id, status: "SUBMITTED" } });
    const badges = await awardBadges({
      userId: user.id,
      accuracy,
      durationSec,
      durationMin: attempt.testSet.durationMin,
      attemptsCount,
      streak: streakInfo.streak,
    });

    return ok({
      attemptId: attempt.id,
      score,
      accuracy,
      attempted,
      correct,
      totalQ,
      streak: streakInfo.streak,
      badgesEarned: badges,
      durationSec,
      stats: { subjects: subjectStats, chapters: chapterStats },
    });
  } catch (e) {
    return handleError(e);
  }
}
