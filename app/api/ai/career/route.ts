import { requireUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimitUser } from "@/lib/ratelimit";
import { completeJson } from "@/lib/ai/llm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  klass: z.string().min(2).max(40),
  interests: z.array(z.string().min(1).max(40)).min(1).max(8),
  strength: z.string().max(280).optional(),
  budget: z.enum(["low", "medium", "high"]),
});

type Career = {
  title: string;
  fitScore: number;
  why: string;
  exams: string[];
  salaryRange: string;
  roadmap: string[];
};

type Resp = { careers: Career[]; topPick: string };

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await rateLimitUser(user, "career", 8, 3600);
    if (!rl.ok) return fail("Hourly limit reached", 429, "RATE_LIMITED");
    const body = schema.parse(await req.json());

    const res = await completeJson<Resp>({
      system:
        "You are an honest Indian career counsellor. Recommend ONLY realistic, India-specific paths matching the student's budget and stage. Hinglish tone. Always return JSON.",
      user: JSON.stringify({
        input: body,
        task: "Suggest exactly 3 careers ranked by fit. Be conservative.",
        schema: {
          careers: [
            {
              title: "string",
              fitScore: "0-100 integer",
              why: "1-2 sentences why this fits, Hinglish, under 30 words",
              exams: "array of Indian exam names (e.g., 'JEE Main', 'NEET UG', 'UPSC CSE', 'IBPS PO', 'CUET')",
              salaryRange: "Indian INR range, e.g., '₹4-12 LPA (start) → ₹25+ LPA (5 yrs)'",
              roadmap: "exactly 6 monthly milestones, each under 14 words, concrete actions",
            },
          ],
          topPick: "the title of the highest-fit career",
        },
        rules: [
          "Match budget honestly — low budget => prefer SSC/Banking/Railway/govt + state colleges; high budget => can include private B.Tech, MBBS abroad, etc.",
          "Never recommend MBBS unless interests include Biology or Medicine.",
          "Never recommend coding unless interests include Maths, Coding, or strength mentions tech.",
          "Salary ranges must be realistic Indian numbers (no inflated figures).",
        ],
      }),
      maxTokens: 1400,
      prefer: "quality",
      operation: "doubt",
    });

    if (!Array.isArray(res?.careers) || res.careers.length === 0) {
      return fail("AI returned no careers, try again.", 502, "AI_EMPTY");
    }
    res.careers = res.careers.slice(0, 3).map((c) => ({
      ...c,
      fitScore: Math.max(1, Math.min(100, Math.round(Number(c.fitScore) || 50))),
    }));
    return ok(res);
  } catch (e) {
    return handleError(e);
  }
}
