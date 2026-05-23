import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, handleError } from "@/lib/api";
import { isDue, newCard, type SrsState } from "@/lib/srs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const examSlug = url.searchParams.get("exam") ?? undefined;
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));

    const bookmarks = await db.bookmark.findMany({
      where: { userId: user.id, kind: "srs" },
      orderBy: { createdAt: "asc" },
      take: 500,
    });

    const dueCardIds: string[] = [];
    const stateById = new Map<string, SrsState>();
    for (const b of bookmarks) {
      const s = b.payload as unknown as SrsState;
      if (!s?.questionId) continue;
      stateById.set(s.questionId, s);
      if (isDue(s)) dueCardIds.push(s.questionId);
    }

    let cards: any[] = [];
    if (dueCardIds.length > 0) {
      cards = await db.question.findMany({
        where: { id: { in: dueCardIds.slice(0, limit) } },
        select: { id: true, stem: true, options: true, correctIndex: true, explanation: true, topic: true },
      });
    }

    if (cards.length < limit) {
      const already = new Set(stateById.keys());
      const fresh = await db.question.findMany({
        where: {
          approved: true,
          ...(examSlug ? { examSlug } : {}),
          id: { notIn: Array.from(already) },
        },
        orderBy: { createdAt: "desc" },
        take: limit - cards.length,
        select: { id: true, stem: true, options: true, correctIndex: true, explanation: true, topic: true },
      });
      cards = [...cards, ...fresh];
    }

    const mapped = cards.map((q) => ({
      id: q.id,
      stem: q.stem,
      options: Array.isArray(q.options) ? (q.options as string[]) : [],
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? "",
      topic: q.topic ?? undefined,
      state: stateById.get(q.id) ?? newCard(q.id),
    }));

    return ok({
      cards: mapped,
      stats: {
        total: bookmarks.length,
        due: dueCardIds.length,
        added: bookmarks.length - dueCardIds.length,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
