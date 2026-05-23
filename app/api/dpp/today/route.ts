import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Deterministic daily set: same 10 questions per (date, examSlug) so the user
 * sees the same DPP across devices for the day.
 */
function dailySeed(dateStr: string, exam: string): number {
  let h = 2166136261;
  const s = `${dateStr}|${exam}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export async function GET(req: Request) {
  try {
    const session = await readSession();
    const url = new URL(req.url);
    const exam = url.searchParams.get("exam") ?? "neet";
    const todayISO = new Date().toISOString().slice(0, 10);

    const pool = await db.question.findMany({
      where: { approved: true, examSlug: exam },
      select: { id: true, stem: true, options: true, correctIndex: true, explanation: true, topic: true, difficulty: true },
      take: 200,
    });

    if (pool.length < 5) {
      return fail("Not enough questions yet for this exam. Try a different one.", 404, "EMPTY_POOL");
    }

    const seed = dailySeed(todayISO, exam);
    const shuffled = [...pool]
      .map((q, i) => ({ q, k: (seed * (i + 1)) % 100003 }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.q)
      .slice(0, 10);

    return ok({
      date: todayISO,
      examSlug: exam,
      authed: !!session,
      questions: shuffled.map((q) => ({
        id: q.id,
        stem: q.stem,
        options: Array.isArray(q.options) ? (q.options as string[]) : [],
        correctIndex: q.correctIndex,
        explanation: q.explanation ?? "",
        topic: q.topic ?? undefined,
        difficulty: q.difficulty,
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
