import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { translateMcqBatch, type BatchInput } from "@/lib/ai/translate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  questionIds: z.array(z.string().min(1)).min(1).max(60),
  targetLang: z.enum(["en", "hi"]),
});

type Out = {
  questionId: string;
  language: string;
  stem: string;
  options: string[];
  cached: boolean;
};

const CHUNK = 8; // translate up to 8 MCQs per OpenAI call

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimit(`xlate-batch:${user.id}:${clientKey(req.headers)}`, 30, 60);
    if (!rl.ok) return fail("Too many translation requests", 429, "RATE_LIMITED");

    const { questionIds, targetLang } = bodySchema.parse(await req.json());

    const questions = await db.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, stem: true, options: true, explanation: true, language: true },
    });

    const existing = await db.questionTranslation.findMany({
      where: { questionId: { in: questionIds }, language: targetLang },
    });
    const cacheById = new Map(existing.map((t) => [t.questionId, t]));

    const results: Out[] = [];
    const needTranslation: BatchInput[] = [];

    for (const q of questions) {
      // already in target — return original
      if (q.language === targetLang) {
        results.push({
          questionId: q.id,
          language: targetLang,
          stem: q.stem,
          options: q.options as string[],
          cached: true,
        });
        continue;
      }
      const c = cacheById.get(q.id);
      if (c) {
        results.push({
          questionId: q.id,
          language: targetLang,
          stem: c.stem,
          options: c.options as string[],
          cached: true,
        });
        continue;
      }
      needTranslation.push({
        id: q.id,
        stem: q.stem,
        options: q.options as string[],
        explanation: q.explanation ?? undefined,
      });
    }

    if (needTranslation.length > 0) {
      const batches = chunk(needTranslation, CHUNK);
      const settled = await Promise.allSettled(
        batches.map((items) => translateMcqBatch({ items, targetLang }))
      );

      for (const res of settled) {
        if (res.status !== "fulfilled") continue;
        for (const t of res.value) {
          const orig = needTranslation.find((n) => n.id === t.id);
          if (!orig) continue;
          if (!Array.isArray(t.options) || t.options.length !== orig.options.length) continue;
          await db.questionTranslation.upsert({
            where: { questionId_language: { questionId: t.id, language: targetLang } },
            create: {
              questionId: t.id,
              language: targetLang,
              stem: t.stem,
              options: t.options,
              explanation: t.explanation ?? null,
            },
            update: {
              stem: t.stem,
              options: t.options,
              explanation: t.explanation ?? null,
            },
          });
          results.push({
            questionId: t.id,
            language: targetLang,
            stem: t.stem,
            options: t.options,
            cached: false,
          });
        }
      }
    }

    return ok({ items: results, targetLang });
  } catch (e) {
    return handleError(e);
  }
}
