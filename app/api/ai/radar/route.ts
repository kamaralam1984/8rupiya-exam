import { db } from "@/lib/db";
import { ok, fail, handleError } from "@/lib/api";
import { completeJson } from "@/lib/ai/llm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({ examSlug: z.string() });

const SYSTEM = `You analyze publicly known exam patterns and produce a "trending topics" radar for an Indian competitive exam.

Hard rules:
- Output is an educational signal of historical frequency, not a leaked paper.
- Use plain factual language. No marketing hype.
- Return JSON only.

Schema:
{
  "exam": "...",
  "asOf": "YYYY-MM-DD",
  "topics": [
    { "name": "...", "subject": "...", "trend": "up|stable|down", "frequency": 0.0-1.0, "rationale": "..." }
  ],
  "advice": ["...", "..."]
}`;

type Resp = {
  exam: string;
  asOf: string;
  topics: { name: string; subject: string; trend: "up" | "stable" | "down"; frequency: number; rationale: string }[];
  advice: string[];
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = schema.safeParse({ examSlug: url.searchParams.get("examSlug") });
    if (!parsed.success) return fail("examSlug required", 400);
    const exam = await db.exam.findUnique({
      where: { slug: parsed.data.examSlug },
      include: { subjects: true },
    });
    if (!exam) return fail("Exam not found", 404, "NOT_FOUND");

    const today = new Date().toISOString().slice(0, 10);
    const out = await completeJson<Resp>({
      system: SYSTEM,
      user: `Exam: ${exam.name} (${exam.short})
Subjects: ${exam.subjects.map((s) => s.name).join(", ")}
Today: ${today}

Identify exactly 12 trending topics with frequency 0.0-1.0 (relative weightage in past papers) and short rationales. Return only JSON.`,
      maxTokens: 2500,
    });
    return ok(out);
  } catch (e) {
    return handleError(e);
  }
}
