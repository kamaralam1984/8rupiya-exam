import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const BOT_NAMES = ["Aarav", "Diya", "Kabir", "Meera", "Riya", "Ishaan", "Aanya", "Vivaan"];
const BOT_AVATARS = ["🦊", "🐯", "🐼", "🐺", "🦁", "🐲", "🦅", "🐧"];

export async function POST(req: Request) {
  try {
    await requireUser();
    const url = new URL(req.url);
    const examSlug = url.searchParams.get("exam") ?? undefined;

    let questions = await db.question.findMany({
      where: {
        approved: true,
        ...(examSlug ? { examSlug } : {}),
      },
      select: { id: true, stem: true, options: true, correctIndex: true, topic: true },
      take: 60,
      orderBy: { createdAt: "desc" },
    });

    if (questions.length < 10) {
      questions = await db.question.findMany({
        where: { approved: true },
        select: { id: true, stem: true, options: true, correctIndex: true, topic: true },
        take: 60,
        orderBy: { createdAt: "desc" },
      });
    }

    if (questions.length < 5) {
      return fail("Not enough questions in pool. Try a different exam.", 404, "EMPTY_POOL");
    }

    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
    const mapped = shuffled.map((q) => ({
      id: q.id,
      stem: q.stem,
      options: Array.isArray(q.options) ? (q.options as string[]) : [],
      correctIndex: q.correctIndex,
      topic: q.topic ?? undefined,
    }));

    const i = Math.floor(Math.random() * BOT_NAMES.length);
    return ok({
      questions: mapped,
      opponentName: BOT_NAMES[i],
      opponentAvatar: BOT_AVATARS[i],
    });
  } catch (e) {
    return handleError(e);
  }
}
