import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { completeJson } from "@/lib/ai/llm";

export const dynamic = "force-dynamic";

const SYSTEM = `You generate factual current-affairs MCQs for Indian competitive exam aspirants.
Hard rules: no fabricated specific names/dates; prefer evergreen themes; JSON only.
Schema: { "questions": [ { "stem": "...", "options": ["..."], "correctIndex": 0, "explanation": "...", "topic": "..." } ] }`;

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const secret = process.env.CRON_SECRET ?? "";
    const vercelCron = req.headers.get("x-vercel-cron");
    if (!vercelCron && (!secret || auth !== `Bearer ${secret}`)) {
      return fail("Forbidden", 403, "FORBIDDEN");
    }
    const today = new Date().toISOString().slice(0, 10);
    const existing = await db.dailyAffairsQuiz.findUnique({ where: { date: today } });
    if (existing) return ok({ skipped: true, date: today });
    const out = await completeJson<{ questions: any[] }>({
      system: SYSTEM,
      user: `Generate exactly 8 current-affairs MCQs for ${today}. Mix India + world topical themes. Return only JSON.`,
      maxTokens: 2500,
    });
    await db.dailyAffairsQuiz.create({ data: { date: today, questions: out.questions as any } });
    return ok({ created: true, date: today, count: out.questions.length });
  } catch (e) {
    return handleError(e);
  }
}
