import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { translateMcq } from "@/lib/ai/translate";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const bodySchema = z.object({
  questionId: z.string().min(1),
  targetLang: z.enum(["en", "hi"]),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimit(`xlate:${user.id}:${clientKey(req.headers)}`, 60, 60);
    if (!rl.ok) return fail("Too many translation requests", 429, "RATE_LIMITED");

    const { questionId, targetLang } = bodySchema.parse(await req.json());

    const q = await db.question.findUnique({
      where: { id: questionId },
      select: { id: true, stem: true, options: true, explanation: true, language: true },
    });
    if (!q) return fail("Question not found", 404, "NOT_FOUND");

    // already in target language — return original
    if (q.language === targetLang) {
      return ok({
        questionId: q.id,
        language: targetLang,
        stem: q.stem,
        options: q.options as string[],
        explanation: q.explanation ?? null,
        cached: true,
      });
    }

    // cache hit
    const cached = await db.questionTranslation.findUnique({
      where: { questionId_language: { questionId: q.id, language: targetLang } },
    });
    if (cached) {
      return ok({
        questionId: q.id,
        language: targetLang,
        stem: cached.stem,
        options: cached.options as string[],
        explanation: cached.explanation ?? null,
        cached: true,
      });
    }

    const options = Array.isArray(q.options) ? (q.options as string[]) : [];
    const translated = await translateMcq({
      stem: q.stem,
      options,
      explanation: q.explanation ?? undefined,
      targetLang,
    });

    await db.questionTranslation.upsert({
      where: { questionId_language: { questionId: q.id, language: targetLang } },
      create: {
        questionId: q.id,
        language: targetLang,
        stem: translated.stem,
        options: translated.options,
        explanation: translated.explanation ?? null,
      },
      update: {
        stem: translated.stem,
        options: translated.options,
        explanation: translated.explanation ?? null,
      },
    });

    return ok({
      questionId: q.id,
      language: targetLang,
      stem: translated.stem,
      options: translated.options,
      explanation: translated.explanation ?? null,
      cached: false,
    });
  } catch (e) {
    return handleError(e);
  }
}
