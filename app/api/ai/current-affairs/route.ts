import { db } from "@/lib/db";
import { ok, handleError } from "@/lib/api";
import { completeJson } from "@/lib/ai/llm";

export const dynamic = "force-dynamic";

const SYSTEM = `You generate factual, educational current-affairs MCQs covering recent Indian and world events relevant to competitive exam aspirants.

Hard rules:
- All facts must be plausible to a knowledgeable observer; do not fabricate specific named persons or recent dates you are unsure of.
- Prefer evergreen topical themes (e.g., government schemes, awards categories, sports tournaments, science missions) over fragile fresh facts.
- Output strict JSON, no prose outside JSON.

Schema:
{
  "date": "YYYY-MM-DD",
  "questions": [
    { "stem": "...", "options": ["...","...","...","..."], "correctIndex": 0, "explanation": "...", "topic": "..." }
  ]
}`;

type Resp = {
  date: string;
  questions: { stem: string; options: string[]; correctIndex: number; explanation: string; topic: string }[];
};

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const cached = await db.dailyAffairsQuiz.findUnique({ where: { date: today } });
    if (cached) return ok({ date: today, questions: cached.questions, cached: true });

    const out = await completeJson<Resp>({
      system: SYSTEM,
      user: `Generate exactly 8 current-affairs MCQs for date ${today}. Mix India + world events themes. Return only JSON.`,
      maxTokens: 2500,
    });

    const saved = await db.dailyAffairsQuiz.create({
      data: { date: today, questions: out.questions as any },
    });
    return ok({ date: today, questions: saved.questions, cached: false });
  } catch (e) {
    return handleError(e);
  }
}
